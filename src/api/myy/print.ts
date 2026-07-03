import { defHttp,initGid} from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';

// 打印模板配置
export function PrintConfig(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Print/Config`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 保存打印模板
export function SaveTemplate(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Print/SaveTemplate`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 恢复打印模板默认值
export function ResetTemplate(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Print/ResetTemplate`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}
export let PrintApiCtrl={
  PrintConfig,
  SaveTemplate,
  ResetTemplate,
}
