self.addEventListener('message', function (e) {
  getTotal(e.data)
}, false)

function getTotal(data) {
  try {
    if (Array.isArray(data)) {
      let newArr = []
      for (let i = 0; i < data.length; i++) {
        if (data[i]['姓名'].replace(/\s/g, "") || data[i]['手机号'].replace(/\s/g, "")) {
          let GroupNames = []
          Object.keys(data[i]).forEach(key => {
            if (key !== '姓名' && key !== '手机号' && data[i][key].replace(/\s/g, "")) {
              GroupNames.push(data[i][key])
            }
          })
          newArr.push({
            Name:data[i]['姓名'],
            Phone:data[i]['手机号'],
            GroupNames
          })
        }
      }
      postMessage(newArr) 
    } else {
      postMessage([]) 
    }
  } catch (error) {
    postMessage([]) 
  }
  // 4. works处理完数据 发送回主页面
  self.close() // 5.记得要关闭哦
}
