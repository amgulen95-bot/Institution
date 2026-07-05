import { defHttp,initGid} from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';
/**
 * @description: user login api
 */
export function loginApi(params: {
  gid: number,
  phone: string,
  password: string
}, mode: ErrorMessageMode = 'modal') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Account/Login`,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

export function loginBySmsApi(params: {
  phone: string,
  code: string
}, mode: ErrorMessageMode = 'modal') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Account/LoginByVerifyCode`,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: getUserInfo
 */
export function getUserInfo() {
  return defHttp.get({ url: `/Myy/Clinic/${initGid}/Account/Profile`, }, { errorMessageMode: 'none' });
}

export function doLogout() {
  return defHttp.post({ url: '/web/access/logout' });
}

export function usersList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: '/Web/AccessControl/GetUsersList',
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

export function rolesList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: '/Web/AccessControl/GetRolesList',
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

export function addUser(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: '/Web/AccessControl/AddUser',
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}
export function deleteUser(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: '/Web/AccessControl/DeleteUser',
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}
export function switchUserStatus(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: '/Web/AccessControl/SwitchUserStatus',
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

export function vbenMenus(mode: ErrorMessageMode = 'message') {  
  return defHttp.get(
    {
      url: '/Web/AccessControl/GetVbenMenus',
    },
    {
      errorMessageMode: mode,
    },
  );
}

export function deleteRole(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: '/Web/AccessControl/DeleteRole',
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

export function saveRole(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: '/Web/AccessControl/SaveRole',
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}
