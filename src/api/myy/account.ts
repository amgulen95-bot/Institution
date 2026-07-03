import { defHttp,initGid} from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';

// 医生下拉选择
export function DoctorOptions(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Account/DoctorOptions`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 发送账号安全验证码
export function SendVerifyCode(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Account/SendVerifyCode`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 验证原手机号
export function VerifyCurrentPhone(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Account/VerifyCurrentPhone`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 换绑手机号
export function ChangePhone(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Account/ChangePhone`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 修改密码
export function ChangePassword(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Account/ChangePassword`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

export let AccountApiCtrl={
  DoctorOptions,
  SendVerifyCode,
  VerifyCurrentPhone,
  ChangePhone,
  ChangePassword
}
