import * as xlsx from 'xlsx';
const xlsxUtil = {
    getHeaderRow: function (sheet) {
        if (!sheet || !sheet['!ref']) return [];
        const headers = [];
        // A3:B7=>{s:{c:0, r:2}, e:{c:1, r:6}}
        const range = xlsx.utils.decode_range(sheet['!ref']);

        const R = range.s.r;
        /* start in the first row */
        for (let C = range.s.c; C <= range.e.c; ++C) {
            /* walk every column in the range */
            const cell = sheet[xlsx.utils.encode_cell({ c: C, r: R })];
            /* find the cell in the first row */
            let hdr = 'UNKNOWN ' + C; // <-- replace with your desired default
            if (cell && cell.t) hdr = xlsx.utils.format_cell(cell);
            headers.push(hdr);
        }
        return headers;
    },
    loadExcelFile: function (file) {
        return new Promise((ok, err) => {
            const reader = new FileReader()
            reader.onload = async (e) => {
                try {
                    const data = e.target && e.target.result;
                    const workbook = xlsx.read(data, { type: 'array' });
                    const excelData = xlsxUtil.getExcelDataForFile(workbook, { range: 0 })
                    if (excelData.length) {
                        ok(excelData)
                    } else {
                        err('所导入文件没有任何数据')
                    }

                } catch (error) {
                    err(error.message)
                }
            }
            reader.readAsArrayBuffer(file)
        })

    },
    getExcelDataForFile: function (workbook, startRange) {
        if (!startRange) {
            startRange = { range: 0 }
        }
        const excelData = [];
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const results = xlsx.utils.sheet_to_json(worksheet, startRange);
            const header = []
            const firstRow = results[0]
            if (firstRow) {
                for (let p in firstRow) {
                    header.push(p)
                }
            }
            excelData.push({
                header,
                results,
                meta: {
                    sheetName,
                },
            });
        }
        return excelData;
    },
    getCellWidth: function (value) {
        // 判断是否为null或undefined
        if (value == null) {
            return 10
        } else if (/.*[\u4e00-\u9fa5]+.*$/.test(value)) {
            // 判断是否包含中文
            return value.toString().length * 2.1
        } else {
            return value.toString().length * 1.1
            /* 另一种方案
            value = value.toString()
            return value.replace(/[\u0391-\uFFE5]/g, 'aa').length
            */
        }
    },
    createSheetByJson: function (options) {
        const arrData = [...options.data];
        if (options.header) {
            arrData.unshift(header);
            options.json2sheetOpts.skipHeader = true;
        }

        const worksheet = xlsx.utils.json_to_sheet(arrData, options.json2sheetOpts);

        if (options.autoWidth) {
            let colWidths = [], colNames = Object.keys(arrData[0]) // 所有列的名称数组
            arrData.forEach(row => {
                let index = 0
                for (const key in row) {
                    if (colWidths[index] == null) colWidths[index] = []

                    switch (typeof row[key]) {
                        case 'string':
                        case 'number':
                        case 'boolean':
                            colWidths[index].push(xlsxUtil.getCellWidth(row[key]))
                            break
                        case 'object':
                        case 'function':
                            colWidths[index].push(0)
                            break
                    }
                    index++
                }
            })

            worksheet['!cols'] = []
            // 每一列取最大值最为列宽
            colWidths.forEach((widths, index) => {
                // 计算列头的宽度
                widths.push(xlsxUtil.getCellWidth(colNames[index]))
                // 设置最大值为列宽
                worksheet['!cols'].push({ wch: Math.max(...widths) })
            })
        }

        /* add worksheet to workbook */
        return {
            name: options.filename,
            data: worksheet,
        };
    },
    combineSheetsAndDownload: function (sheets,
        filename,
        write2excelOpts = { bookType: 'xlsx' }) {
        /* add worksheet to workbook */
        let sheetObj = {}
        sheets.forEach(i => {
            sheetObj[i.name] = i.data
        })
        const workbook = {
            SheetNames: sheets.map(p => p.name),
            Sheets: sheetObj,
        };
        /* output format determined by filename */
        xlsx.writeFile(workbook, filename, write2excelOpts);
    }
}

export default xlsxUtil