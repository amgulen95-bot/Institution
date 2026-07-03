import { defHttp,initGid} from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';

// 机构患者列表
export function PatientList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Patient/List`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 机构患者详情
export function PatientDetail(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Patient/Detail`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 保存患者
export function SavePatient(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Patient/Save`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 机构患者地址列表
export function AddressList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Patient/AddressList`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 保存机构患者地址
export function SaveAddress(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Patient/SaveAddress`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 删除机构患者地址
export function DeleteAddress(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Patient/DeleteAddress`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 就诊记录列表
export function VisitList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Patient/VisitList`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

export let PatientApiCtrl={
  PatientList,
  PatientDetail,
  SavePatient,
  AddressList,
  SaveAddress,
  DeleteAddress,
  VisitList
}
