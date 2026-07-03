import { defHttp,initGid} from '/@/utils/http/axios';
import { ErrorMessageMode } from '/#/axios';

// 模板分类列表
export function CategoryList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Template/CategoryList`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 保存模板分类
export function SaveCategory(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Template/SaveCategory`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

//删除存模板分类
export function DeleteCategory(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Template/DeleteCategory`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 病历模板列表
export function MedicalList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Template/MedicalList`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 病历模板详情
export function MedicalDetail(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Template/MedicalDetail`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

//保存病历模板
export function SaveMedical(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Template/SaveMedical`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

//使用病历模板
export function UseMedical(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Template/UseMedical`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

//删除病历模板
export function DeleteMedical(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Template/DeleteMedical`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 机构常用方列表
export function PrescriptList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Template/PrescriptList`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 机构常用方详情
export function PrescriptDetail(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Template/PrescriptDetail`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

//保存机构常用方
export function SavePrescript(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Template/SavePrescript`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

//删除机构常用方
export function DeletePrescript(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Template/DeletePrescript`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

//使用机构常用方
export function UsePrescript(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Template/UsePrescript`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

//审核机构常用方
export function AuditPrescript(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Template/AuditPrescript`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 机构常用方审核日志
export function PrescriptAuditLogList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Template/PrescriptAuditLogList`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 系统药方分类列表
export function SystemPrescriptCategoryList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Template/SystemPrescriptCategoryList`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 系统药方列表
export function SystemPrescriptList(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Template/SystemPrescriptList`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 系统药方详情
export function SystemPrescriptDetail(params, mode: ErrorMessageMode = 'message') {
  return defHttp.get(
    {
      url: `/Myy/Clinic/${initGid}/Template/SystemPrescriptDetail`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

// 使用系统药方
export function UseSystemPrescript(params, mode: ErrorMessageMode = 'message') {
  return defHttp.post(
    {
      url: `/Myy/Clinic/${initGid}/Template/UseSystemPrescript`,
      params
    },
    {
      errorMessageMode: mode,
    }
  );
}

export let TemplateApiCtrl={
  CategoryList,
  SaveCategory,
  DeleteCategory,
  MedicalList,
  MedicalDetail,
  SaveMedical,
  UseMedical,
  DeleteMedical,
  PrescriptList,
  PrescriptDetail,
  SavePrescript,
  DeletePrescript,
  UsePrescript,
  AuditPrescript,
  PrescriptAuditLogList,
  SystemPrescriptCategoryList,
  SystemPrescriptList,
  SystemPrescriptDetail,
  UseSystemPrescript
}
