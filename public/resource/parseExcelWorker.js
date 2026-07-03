self.importScripts('https://sph.yimahulian.com/Scripts/xlsx.js')
self.addEventListener('message', function(e) {
    parseExcel(e.data)
}, false)


function shapeWorkSheel(sheet, range) {
    let str = ' ',
        char = 65,
        customWorkSheet = {
            t: 's',
            v: str,
            r: '<t> </t><phoneticPr fontId="1" type="noConversion"/>',
            h: str,
            w: str,
        };
    if (!sheet || !sheet['!ref']) return [];
    let c = 0,
        r = 1;
    while (c < range.e.c + 1) {
        while (r < range.e.r + 1) {
            if (!sheet[String.fromCharCode(char) + r]) {
                sheet[String.fromCharCode(char) + r] = customWorkSheet;
            }
            r++;
        }
        r = 1;
        str += ' ';
        customWorkSheet = {
            t: 's',
            v: str,
            r: '<t> </t><phoneticPr fontId="1" type="noConversion"/>',
            h: str,
            w: str,
        };
        c++;
        char++;
    }
}

function getHeaderRow(sheet) {
    if (!sheet || !sheet['!ref']) return [];
    const headers = [];
    // A3:B7=>{s:{c:0, r:2}, e:{c:1, r:6}}
    const range = XLSX.utils.decode_range(sheet['!ref']);
    shapeWorkSheel(sheet, range);
    const R = range.s.r;
    /* start in the first row */
    for (let C = range.s.c; C <= range.e.c; ++C) {
        /* walk every column in the range */
        const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })];
        /* find the cell in the first row */
        let hdr = 'UNKNOWN ' + C; // <-- replace with your desired default
        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell);
        headers.push(hdr);
    }
    return headers;
}

function getExcelData(workbook) {
    const excelData = [];
    for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const header = getHeaderRow(worksheet);
        let results = XLSX.utils.sheet_to_json(worksheet, {
            raw: true,
            dateNF: 'YYYY-MM-DD', //Not worked
        });

        let ajaxResults = []
        if (results.length) {
            results = results.filter(el => {
                let truly
                try {
                    truly = el['姓名'].toString().replace(/\s/g, "") && el['手机号'].toString().replace(/\s/g, "")
                    if (ajaxResults.some(item => item.Phone == el['手机号'])) {
                        truly = false
                    }
                } catch (error) {
                    truly = false
                }
                if (truly) {
                    el['姓名'] = el['姓名'].toString().slice(0, 8)
                    let GroupNames = []
                    Object.keys(el).forEach(key => {
                        if (key != '姓名' && key != '手机号' && el[key].toString().replace(/\s/g, "")) {
                            GroupNames.push(el[key])
                        }
                    })
                    ajaxResults.push({
                        Name: el['姓名'],
                        Phone: el['手机号'],
                        GroupNames
                    })
                }
                return truly
            })
        }

        excelData.push({
            header,
            results,
            ajaxResults,
            meta: {
                sheetName,
            },
        });
    }
    return excelData;
}

function parseExcel(rawFile) {
    try {
        const reader = new FileReader();
        reader.onerror = (e) => {
            postMessage(e)
            self.close()
        };

        reader.onload = async(e) => {
            try {
                const data = e.target && e.target.result;
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                /* DO SOMETHING WITH workbook HERE */
                // return 
                const excelData = getExcelData(workbook);
                postMessage(excelData)
                self.close()
            } catch (error) {
                postMessage(error)
                self.close()
            }
        };
        reader.readAsArrayBuffer(rawFile);
    } catch (error) {
        postMessage(error)
        self.close()
    }
    // 4. works处理完数据 发送回主页面
    //self.close() // 5.记得要关闭哦
}