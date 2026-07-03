import { defHttp ,initGid} from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';

export function GetBankChannel(params,mode: ErrorMessageMode = 'message') {
  
  return defHttp.get(
    {
      url: `/Plugins/JoinPay/${initGid}/Account/GetBankChannel`,
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}

export function DiagnosisSearch(params,mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Plugins/Peach/${initGid}/App/Diagnosis/Search`,
      params
    },
    {
      errorMessageMode: mode,
    },
  );
}