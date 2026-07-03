import { defHttp,initGid} from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';

// 快速接诊
export function QuickVisit(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Prescript/QuickVisit`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 开方页搜索患者
export function SearchPatient(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Prescript/SearchPatient`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 开方页保存患者
export function SavePatient(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Prescript/SavePatient`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 就诊记录详情
export function VisitDetail(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Prescript/VisitDetail`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 保存病历/就诊记录
export function SaveVisit(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Prescript/SaveVisit`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 完成接诊
export function FinishVisit(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Prescript/FinishVisit`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 取消接诊
export function CancelVisit(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Prescript/CancelVisit`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 药材库存列表
export function MaterialList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Prescript/MaterialList`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 费用试算
export function CalculateFee(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Prescript/CalculateFee`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 创建机构订单
export function CreateOrder(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Prescript/CreateOrder`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 确认订单
export function ConfirmOrder(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Prescript/ConfirmOrder`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 整单金额调整
export function AdjustTotalAmount(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Prescript/AdjustTotalAmount`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 保存收货信息
export function SaveReceiver(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Prescript/SaveReceiver`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 智能审方提示确认
export function ConfirmAuditSign(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Prescript/ConfirmAuditSign`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 今日接诊列表
export function TodayVisitList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Prescript/TodayVisitList`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

export let PrescriptApiCtrl  = {
  SearchPatient,
  SavePatient,
  VisitDetail,
  QuickVisit,
  SaveVisit,
  FinishVisit,
  CancelVisit,
  MaterialList,
  CalculateFee,
  CreateOrder,
  ConfirmOrder,
  AdjustTotalAmount,
  SaveReceiver,
  ConfirmAuditSign,
  TodayVisitList,
}
