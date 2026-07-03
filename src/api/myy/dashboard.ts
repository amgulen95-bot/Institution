import { defHttp,initGid} from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';

// 经营概览汇总
export function Summary(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Dashboard/Summary`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 医生经营报表
export function DoctorBusinessReport(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Dashboard/DoctorBusinessReport`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 导出医生经营报表
export function ExportDoctorBusinessReport(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Dashboard/ExportDoctorBusinessReport`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}
export let DashboardApiCtrl={
  Summary,
  DoctorBusinessReport,
  ExportDoctorBusinessReport
}
