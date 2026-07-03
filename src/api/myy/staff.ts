import { defHttp,initGid} from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';

// 机构角色列表
export function RoleList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Staff/RoleList`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 保存角色权限
export function SaveRole(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Staff/SaveRole`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 删除角色权限
export function DeleteRole(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Staff/DeleteRole`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 机构人员列表
export function StaffList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Staff/List`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 保存机构人员
export function StaffSave(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Staff/Save`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 启用/禁用机构人员
export function StaffToggle(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Staff/Toggle`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

export let StaffApiCtrl={
  RoleList,
  SaveRole,
  DeleteRole,
  StaffList,
  StaffSave,
  StaffToggle
}
