import { defineApplicationConfig } from '@vben/vite-config';

let proxy = {}
let proxyList = [
  ["/SuperWeb","https://w.yunyaofang.cn/SuperWeb"],
  ["/Wisdom","https://w.yunyaofang.cn/Wisdom"],
  ["/wisdom","https://w.yunyaofang.cn/wisdom"],
  ["/WechatMiniProgram","https://w.yunyaofang.cn/WechatMiniProgram"],
  ["/wxthirdpartyplatform","https://w.yunyaofang.cn/WXThirdPartyPlatform"],
  ["/WXThirdPartyPlatform","https://w.yunyaofang.cn/WXThirdPartyPlatform"],
  ["/doudianplatform","https://w.yunyaofang.cn/doudianplatform"],
  ["/common","https://w.yunyaofang.cn/common"],
  ["/Content","https://w.yunyaofang.cn/content"],
  ["/content","https://w.yunyaofang.cn/content"],
  ["/Uploads","https://w.yunyaofang.cn/uploads"],
  ["/Uploadfiles","https://w.yunyaofang.cn/uploadfiles"],
  ["/Areas","https://w.yunyaofang.cn/areas"],
  ["/Plugins","https://w.yunyaofang.cn/plugins"],
  ["/plugins","https://w.yunyaofang.cn/plugins"],
  ["/web","https://w.yunyaofang.cn/web"],
  ["/Web","https://w.yunyaofang.cn/web"],
  ["/Platform","https://w.yunyaofang.cn/platform"],
  ["/Scripts","https://w.yunyaofang.cn/scripts"],
  ["/areas","https://w.yunyaofang.cn/areas"],
  ["/TMap","https://apis.map.qq.com"],
  ["/system","https://w.yunyaofang.cn/system"],
  ["/serverfile","https://w.yunyaofang.cn/serverfile"],
  ["/platform","https://w.yunyaofang.cn/platform"],
  ["/Myy","https://w.yunyaofang.cn/Myy"],
  ["/address-master","https://uni.qishangke.com/address-master"],
]

proxyList.forEach(el => {
  proxy[el[0]] = {
    target: el[1],
    changeOrigin: true,
    ws: true,
    rewrite: (path) => path.replace(el[0], ''),
  }
})



export default defineApplicationConfig({
  overrides: {
    optimizeDeps: {
      include: [
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/renderers',
        'qrcode',
        '@iconify/iconify',
        'ant-design-vue/es/locale/zh_CN',
        'ant-design-vue/es/locale/en_US',
      ],
    },
    server: {
      proxy: proxy
      // {
      //   '/basic-api': {
      //     target: 'http://localhost:3000',
      //     changeOrigin: true,
      //     ws: true,
      //     rewrite: (path) => path.replace(new RegExp(`^/basic-api`), ''),
      //     // only https
      //     // secure: false
      //   },
      //   '/upload': {
      //     target: 'http://localhost:3300/upload',
      //     changeOrigin: true,
      //     ws: true,
      //     rewrite: (path) => path.replace(new RegExp(`^/upload`), ''),
      //   },
      // },
    },
  },
});
