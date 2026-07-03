import { defHttp,initGid} from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';

// 机构设置详情
export function SettingDetail(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Setting/Detail`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 机构账户概览
export function SettingAccount(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Setting/Account`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 保存机构信息和证照资质
export function SaveInstitutionInfo(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Setting/SaveInstitutionInfo`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 保存云药房策略
export function SaveCloudPharmacyStrategy(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Setting/SaveCloudPharmacyStrategy`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 保存默认收货配置
export function SaveDefaultReceiver(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Setting/SaveDefaultReceiver`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

export let SettingApiCtrl={
  SettingDetail,
  SettingAccount,
  SaveInstitutionInfo,
  SaveCloudPharmacyStrategy,
  SaveDefaultReceiver,
}
