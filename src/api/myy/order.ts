import { defHttp,initGid} from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';

// 机构订单列表
export function OrderList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Order/List`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 机构订单详情
export function OrderDetail(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Order/Detail`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 机构订单确认收款
export function PayOrder(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Order/PayOrder`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 机构订单线上支付参数
export function PrepareOnlinePay(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Order/PrepareOnlinePay`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 取消机构订单
export function OrderCancel(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Order/Cancel`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 关闭待收款订单
export function CloseOrder(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Order/CloseOrder`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 申请售后退款
export function ApplyRefund(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Order/ApplyRefund`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 首页处方记录摘要
export function PrescriptSummaryList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Order/PrescriptSummaryList`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 查看物流
export function Logistics(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Order/Logistics`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

export let OrderApiCtrl={
  OrderList,
  OrderDetail,
  PayOrder,
  PrepareOnlinePay,
  OrderCancel,
  CloseOrder,
  ApplyRefund,
  PrescriptSummaryList,
  Logistics
}
