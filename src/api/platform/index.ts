import { defHttp ,initGid} from '/@/utils/http/axios';
import { useUserStore } from '@/store/modules/user';

import { ErrorMessageMode } from '/#/axios';
const userStore = useUserStore()

/**
 * @description: 使用手机号,验证码和密钥注册
 */
export function registerByPhone(params: {
  phone: string,
  code: string,
  secret: string
}, mode: ErrorMessageMode = 'message') {
  
  return defHttp.post(
    {
      url: '/platform/RegisterByPhone',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: 发送验证码到指定手机号
 */
export function sendVerifyCode(params: {
  phone: string,
}, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: '/platform/SendVerifyCode',
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: 获取套餐设置
 */
export function getSets(mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: '/platform/sets',
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: 设置套餐(模式)
 */
export function confirmSet(params: {
  token: string,
  name: string,
  id: number
}, mode: ErrorMessageMode = 'message') {

  
  return defHttp.post(
    {
      url: '/platform/confirmSet',
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}


/**
 * @description: 创建账户/角色
 */
export function createAdmAccount(params: {
  token: string
}, mode: ErrorMessageMode = 'message') {
  
  return defHttp.post(
    {
      url: '/platform/createAdmAccount',
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: 创建品牌/级别
 */
export function createBrandLevel(params: {
  token: string,
  name: string
}, mode: ErrorMessageMode = 'message') {
  
  return defHttp.post(
    {
      url: '/platform/createBrandLevel',
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: 配置基本信息(运费模板和webconfig)
 */
export function createWebConfig(params: {
  token: string,
  name: string
}, mode: ErrorMessageMode = 'message') {
  
  return defHttp.post(
    {
      url: '/platform/createWebConfig',
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: 代理配置/其他配置
 */
export function createAgentConfig(params: {
  token: string,
  name: string
}, mode: ErrorMessageMode = 'message') {
  
  return defHttp.post(
    {
      url: '/platform/CreateAgentConfig',
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}



//文章,手册
//分类
export function GetArticleClassify(params, mode: ErrorMessageMode = 'message') {
  
  return defHttp.get(
    {
      url: '/SuperWeb/Super/GetArticleClassify',
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}
//列表
export function GetArticles(params, mode: ErrorMessageMode = 'message') {
  
  return defHttp.get(
    {
      url: '/SuperWeb/Super/GetArticles',
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}
//列表无正文
export function GetArticlesTitle(params, mode: ErrorMessageMode = 'message') {
  
  return defHttp.get(
    {
      url: '/SuperWeb/Super/GetArticlesTitle',
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}
//详情
export function GetArticle(params, mode: ErrorMessageMode = 'message') {
  
  return defHttp.get(
    {
      url: '/SuperWeb/Super/GetArticle',
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}

//详情
export function ArticleRecord(params, mode: ErrorMessageMode = 'message') {
  
  return defHttp.post(
    {
      url: '/SuperWeb/Super/ArticleRecord',
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}

//首页首页数据概况
export function DataSummary(params, mode: ErrorMessageMode = 'message') {
  
  return defHttp.get(
    {
      url: `/Plugins/WXSPH/${initGid}/Shop/DataSummary`,
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}

//首页待办事项
export function TodoSummary(mode: ErrorMessageMode = 'message') {
  
  return defHttp.get(
    {
      url: `/Plugins/WXSPH/${initGid}/Shop/TodoSummary`,
    },
    {
      errorMessageMode: mode,
    },
  );
}

//首页系统数据
export function SystemSummary(mode: ErrorMessageMode = 'message') {
  
  return defHttp.get(
    {
      url: `/Plugins/WXSPH/${initGid}/Shop/SystemSummary`,
    },
    {
      errorMessageMode: mode,
    },
  );
}
