import { defHttp,initGid} from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';

// 授信余额变动记录
export function CreditLogs(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Finance/CreditLogs`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 机构账户概览
export function Account(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Finance/Account`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 机构收入流水
export function IncomeLogs(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Finance/IncomeLogs`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 银行卡账户列表
export function BankAccounts(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Finance/BankAccounts`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 保存银行卡账户
export function SaveBankAccount(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Finance/SaveBankAccount`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 删除银行卡账户
export function DeleteBankAccount(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Finance/DeleteBankAccount`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 设置默认银行卡账户
export function SetDefaultBankAccount(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Finance/SetDefaultBankAccount`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 申请提现
export function ApplyWithdraw(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Finance/ApplyWithdraw`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 提现记录列表
export function WithdrawList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Finance/WithdrawList`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 提现详情
export function WithdrawDetail(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Finance/WithdrawDetail`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 资金流水明细列表
export function FlowList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Finance/FlowList`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 导出资金流水明细
export function ExportFlow(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Finance/ExportFlow`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

export let FinanceApiCtrl={
  CreditLogs,
  Account,
  IncomeLogs,
  BankAccounts,
  SaveBankAccount,
  DeleteBankAccount,
  SetDefaultBankAccount,
  ApplyWithdraw,
  WithdrawList,
  WithdrawDetail,
  FlowList,
  ExportFlow
}
