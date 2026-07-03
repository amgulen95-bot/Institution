export const DEFAULTEMPTYIMAGEURL = '/content/images/empty-image.png'
export const UNKONWNFILEICONURL = '/content/images/media-empty.png'

import { toRaw } from 'vue'

export const parseUrl = (url) => {
  return url.startsWith('http')||url.startsWith('https')? url : import.meta.env.VITE_PUBLIC_ORIGIN + url
}

export const commonRegex = {
  phone: /^1[1-9][0-9]\d{8}$/,
  password: /^[\S]{6,12}$/,
  code: /^[A-Za-z0-9_-]+$/,
  idCard: /^\d{6}\d{4}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|[xX])$/,
  decimal: /^\d+(\.\d+)?$/,
  video: /\.(flv|3gp|rmvb|rm|swf|mp4|mkv|avi|mov|wmv|mpg)/i,
  audio: /\.(mp3|wma|ape|flac|aac|amr|m4a|m4r|ogg|wav)/i,
  image: /\.(jpg|jpeg|png|ico|bmp|gif|tif|tga)/i,
  zip: /\.(zip|rar|7z|iso|cab|dmg|img|jar)/i,
  pdf: /\.(pdf)/i,
  excel: /\.(xls|xlsx)/i,
  ppt: /\.(ppt|pptx)/i,
  word: /\.(doc|docx)/i,
  email: /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/,
  url: /^(http|https):\/\/.+/,
}

export const validators = {
  regex: async (rule, value) => {
    const fieldText = rule.fieldText || '该项'
    const regex = rule.regex
    if ((value === undefined || value === '') && rule.required) {
      return Promise.reject(`${fieldText}必须填写`)
    }

    if (!regex.test(value)) {
      return Promise.reject(`${fieldText}格式有误`)
    }

    return Promise.resolve()
  },
  positiveNumber: async (rule, value) => {
    const fieldText = rule.fieldText || '该项'
    const noZero = rule.noZero
    if ((value === undefined || value === '') && rule.required) {
      return Promise.reject(`${fieldText}必须填写`)
    }
    const val = Number(value)

    if (noZero && val == 0) {
      return Promise.reject(`${fieldText}不能为0`)
    }
    if (val < 0) {
      return Promise.reject(`${fieldText}不能为负数`)
    }
    return Promise.resolve()
  },
  rate: async (rule, value) => {
    const fieldText = rule.fieldText || '该项'
    if (value === '' && rule.required) {
      return Promise.reject(`${fieldText}必须填写`)
    }
    const val = Number(value)
    if (val < 0 || val > 1) {
      return Promise.reject(`${fieldText}取值在0-1之间`)
    }
    return Promise.resolve()
  },
  datetime: async (rule, value) => {
    const fieldText = rule.fieldText || '该项'
    const mt = toRaw(value);
    if (!mt) {
      return Promise.reject(`请选择${fieldText}的时间`);
    }
    return Promise.resolve();
  }
}

const fileIconConfig = [{
  icon: DEFAULTEMPTYIMAGEURL,
  name: commonRegex.image
}, {
  name: commonRegex.zip,
  icon: '/content/images/zip.png'
}, {
  name: commonRegex.pdf,
  value: '/content/images/pdf.png'
}, {
  name: commonRegex.word,
  value: '/content/images/word.png'
}, {
  name: commonRegex.excel,
  icon: '/content/images/excel.png'
}, {
  name: commonRegex.ppt,
  icon: '/content/images/ppt.png'
}, {
  name: commonRegex.audio,
  icon: '/content/images/audio.png'
}, {
  name: commonRegex.video,
  icon: '/content/images/video.png'
}]

const utils = {
  formatFileSize: function (size, pointLength) {
    let unit = ''
    const units = ['B', 'K', 'M', 'G', 'TB']
    while ((unit = units.shift()) && size > 1024) {
      size = size / 1024
    }
    return (unit === 'B' ? size : size.toFixed(pointLength === undefined ? 2 : pointLength)) + unit
  },
  randomRange: (min: number, max: number) => {
    return min + Math.round(Math.random() * (max - min))
  },
  // 使用指定key对数组去重, 不传key 则array按照简单数组处理
  uniqueArray: (array, key = '') => {
    if (!array || array.length == 0) {
      return array
    }
    if (key) {
      return array.reduce((prev, cur) => prev.map(a => a[key]).includes(cur[key]) ? prev : [...prev, cur], []);
    }
    return array.reduce((prev, cur) => prev.includes(cur) ? prev : [...prev, cur], []);
  },
  convertToJson: (json, type = 'object') => {
    try {
      let result = json ? JSON.parse(json) : (type == 'object' ? {} : [])
      if (typeof result === 'string') {
        return utils.convertToJson(result, type)
      }
      return result
    } catch (e) {
      return type == 'object' ? {} : []
    }
  },
  overflow: (value, max = 100) => {
    if (!value) {
      return ''
    }
    if (value.length > max) {
      value = value.substring(0, max) + '...'
    }
    return value
  },
  clearHtml: (html) => {
    if (!html) {
      return ''
    }
    return html.replace(/&nbsp;/g, " ")
      .replace(/<p\/?[^>]*>/g, "\r\n")
      .replace(/<div\/?[^>]*>/g, "\r\n")
      .replace(/<image\/?[^>]*>/g, "")
      .replace(/<video\/?[^>]*>/g, "")
      .replace(/<audio\/?[^>]*>/g, "")
      .replace(/<\/?[^>]*>/g, "")
      .replace(/^\s+|\s+$/g, '')
  },
  computeFileIcon: (file) => {
    if (commonRegex.image.test(file.Extension)) {
      return file.Url
    }
    const config = fileIconConfig.find(p => p.name.test(file.Extension))
    if (config) {
      return config.icon
    }
    return UNKONWNFILEICONURL
  },
  computeFileExt: (url) => {
    return url.substring(url.lastIndexOf("."), url.length);
  },
  computeFileName: (url) => {
    return url.substring(url.lastIndexOf("/") + 1, url.length);
  },
  convertHeadImage: function (value, needDefault) {
    try {
      const url = JSON.parse(value).Url
      if (url) {
        return url
      }
      return needDefault ? '/content/images/male.png' : ''
    } catch (e) {
      return needDefault ? '/content/images/male.png' : ''
    }
  },
  regionDataToCascader: function (sources, regionJsonString) {
    const array = [];
    if (!regionJsonString) {
      return array
    }
    // 四个直辖市可能要单独处理
    const theFour = ["北京市", "上海市", "重庆市", "天津市"]
    try {
      const regionArray = JSON.parse(regionJsonString)
      if (regionArray.length == 0) {
        return array
      }
      if (regionArray[0] && regionArray[0].Name) {

        // 省
        let pdata = sources.find(p => p.name == regionArray[0].Name)

        if (pdata) {
          array.push(pdata.code)
          // 如果有四个直辖市
          let inTheFour = theFour.findIndex(p => p == regionArray[0].Name) != -1

          if (inTheFour) {
            array.push(pdata.children[0].code)

            if (regionArray[1] && regionArray[1].Name) {

              let cname = regionArray[2] && regionArray[2].Name
                ? regionArray[2].Name : ''
              // 区域
              let adata = pdata.children[0]
                .children.find(p => p.name == regionArray[1].Name || p.name == cname)
              if (adata) {
                array.push(adata.code)
              }
            }

          } else {
            // 市
            if (regionArray[1] && regionArray[1].Name) {
              let cdata = pdata.children.find(p => p.name == regionArray[1].Name)
              if (cdata) {
                array.push(cdata.code)
                // 区
                if (regionArray[2] && regionArray[2].Name) {
                  let adata = cdata.children
                    .find(p => p.name == regionArray[2].Name)
                  if (adata) {
                    array.push(adata.code)
                  }
                }
              }
            }
          }
        }
      }
      return array
    } catch (e) {
      return array
    }
  },
  cascaderToRegionData: function (sources, cascaderArray) {
    const regionData = [];
    let pCode = cascaderArray[0];

    if (pCode) {

      const p = sources.find(p => p.code == pCode);

      regionData.push({
        Code: p.code,
        Name: p.name
      });

      if (p.children && p.children.length > 0) {

        let cCode = cascaderArray[1];

        if (cCode) {

          const c = p.children.find(p => p.code == cCode);

          regionData.push({
            Code: c.code,
            Name: c.name
          });

          if (c.children && c.children.length > 0) {

            let aCode = cascaderArray[2];

            if (aCode) {

              const a = c.children.find(p => p.code == aCode);

              regionData.push({
                Code: a.code,
                Name: a.name
              });
            }
          }
        }
      }
    }
    return regionData;
  },
  validators,
  commonRegex,
  buildShortUUID: function (prefix = '') {
      let unique = utils.getRandom(1990, 21480306);
      const time = Date.now();
      const random = Math.floor(Math.random() * 1000000000);
      unique++;
      return prefix + '_' + random + unique + String(time);
  },
  getRandom: function (minNum, maxNum) {
      switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
            break;
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            break;
        default:
            return 0;
            break;
      }
  },
  decodeHTML: function (htmlStr) {
      let div = document.createElement('div');
      div.innerHTML = htmlStr;
      return div.innerText || div.textContent;
  },
  encodeHTML: function (html) {
      let temp = document.createElement('div');
      temp.appendChild(document.createTextNode(html));
      return temp.innerHTML
  },
  arrayGroupBy: function (list, key, keyName = 'key', groupName = 'group') {
      var groupObj = list.reduce((obj, item) => {
          if (!obj[item[key]]) {
              obj[item[key]] = []
              obj[item[key]].push(item)
          } else {
              obj[item[key]].push(item)
          }
          return obj
      }, {});

      const array = [];

      for (let p in groupObj) {
          let obj = {};
          obj[keyName] = p
          obj[groupName] = groupObj[p]
          array.push(obj)
      }
      return array;
  },

  //
  isAudioURL:function(url) {
    const regex = /\.(mp3|wav|ogg|flac)$/i;
    return regex.test(url);
  },
  isVideoURL:function(url) {
    const regex = /\.(mp4|avi|mov|wmv|flv|mkv)$/i;
    return regex.test(url);
  },
  isImageURL:function(url) {
    const regex = /\.(jpeg|jpg|gif|png|svg)$/i;
    return regex.test(url);
  }
}

export default utils
