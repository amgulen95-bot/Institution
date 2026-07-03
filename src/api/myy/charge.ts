import { defHttp,initGid} from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';

// 收费汇总
export function ChargeSummary(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Charge/Summary`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 收费列表
export function ChargeList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Charge/List`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 收费详情
export function ChargeDetail(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Charge/Detail`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 收费页收款确认
export function ChargePayOrder(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Charge/PayOrder`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 收费页线上支付参数
export function PrepareOnlinePay(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Charge/PrepareOnlinePay`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 收费页关闭订单
export function CloseOrder(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Charge/CloseOrder`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 收费页申请退款
export function ApplyRefund(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Charge/ApplyRefund`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

export let ChargeApiCtrl={
  ChargeSummary,
  ChargeList,
  ChargeDetail,
  ChargePayOrder,
  PrepareOnlinePay,
  CloseOrder,
  ApplyRefund
}
