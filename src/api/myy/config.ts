import { defHttp,initGid} from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';

// 支付方式
export function PayChannels(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Config/PayChannels`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

export let ConfigApiCtrl={
  PayChannels,
}
