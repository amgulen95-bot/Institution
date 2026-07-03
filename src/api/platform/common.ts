import { defHttp , defUploadHttp ,defHttp2,initGid} from '/@/utils/http/axios';

import { ErrorMessageMode } from '/#/axios';

// 获取枚举
export function basicEnum(params: { name: string }, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: '/web/common/BasicEnum',
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 获取平台设置
export function PlatformSetting(params: { name: string }, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: '/platform/Common/PlatformSetting',
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 保存平台设置
export function SavePlatformSetting(params: { name: string }, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: '/platform/Common/SavePlatformSetting',
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: 更新分类
 */
export function updateCategory(params: { id: string, name: string }, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: '/serverfile/updatecategory',
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

/**
 * @description: 移除分类
 */
export function removeCategory(params: { id: string }, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: '/serverfile/removecategory',
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

/**
 * @description: 新建分类
 */
export function addCategory(params: { name: string }, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: '/serverfile/newimagecategory',
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

/**
 * @description: 移除资源
 */
export function remove(params, silent: boolean = true, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: '/serverfile/mutildelete',
      params,
      silent,
    },
    {
      errorMessageMode: mode,
    }
  );
}

export function GetSTSToken(params = {},mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: '/Web/Sts/GetToken',
      params,
    },
    {
      errorMessageMode: mode,
    }
  );
}

/**
 * @description: 上传资源
 */
export function upload(params, uploadProgress, silent: boolean = true, mode: ErrorMessageMode = 'message') {
  return defUploadHttp.post(
    {
      url: '/serverfile/adminuploadimage',
      params,
      onUploadProgress: uploadProgress,
      silent,
    },
    {
      errorMessageMode: mode,
    }
  )
}
/**
 * @description: 上传敏感资源,如支付证书等等
 */
export function uploadSecret(params, uploadProgress,silent: boolean = true, mode: ErrorMessageMode = 'message') {

  params.append('secret', true)
  return defUploadHttp.post(
    {
      url: '/serverfile/adminuploadimage',
      params,
      onUploadProgress: uploadProgress,
    },
    {
      errorMessageMode: mode,
    }
  );
}

/**
 * @description: 根据分类id分页获取媒体列表
 */
export function mediaList(params: { category: number | string, page: number, limit: number, search: string },
  mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: '/serverfile/medialist',
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: 获取媒体资源分组
 */
export function getMediaGroups(mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: '/serverfile/getmediagroups',
    },
    {
      errorMessageMode: mode,
    },
  );
}

export function AddCategory(params,mode: ErrorMessageMode = 'message') {
  return defHttp2.post(
    {
      url: '/Web/HelpManual/AddCategory',
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 获取省市区三级联动
export function Cities(mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: '/Web/Common/cities',
    },
    {
      errorMessageMode: mode,
    },
  );
}

// 识别地址
export function AddressAnalysis(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/WechatMiniProgram/App/${initGid}/Address/Analysis`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

export function banksDropdown(mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: '/web/common/BanksDropdown',
    },
    {
      errorMessageMode: mode,
    },
  );
}