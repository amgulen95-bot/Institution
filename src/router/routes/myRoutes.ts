const MyRoutes = [{
    "syetmType": 0,
    "type": 0,
    "name": "dashboard",
    "path": "/dashboard",
    "redirect": "",
    "component": "/dashboard/index",
    "meta": {
        "orderNo": 0,
        "icon": "ant-design:fund-projection-screen-outlined",
        "title": "在线开方",
        "hideMenu": false,
        "hideTab": false,
        "currentActiveMenu": ""
    },
    "children": []
}, {
    "syetmType": 0,
    "type": 0,
    "name": "rootExtraction",
    "path": "/rootExtraction",
    "redirect": "",
    "component": "/rootExtraction/record",
    "meta": {
        "orderNo": 1,
        "icon": "ant-design:reconciliation-outlined",
        "title": "开方记录",
        "hideMenu": false,
        "hideTab": false,
        "currentActiveMenu": ""
    },
    "children": [{
        "syetmType": 0,
        "type": 1,
        "name": "/rootExtraction/detail",
        "path": "/rootExtraction/detail",
        "redirect": "",
        "component": "/rootExtraction/detail",
        "meta": {
            "orderNo": 1,
            "icon": "",
            "title": "开方记录详情",
            "hideMenu": true,
            "hideTab": true,
            "currentActiveMenu": "/rootExtraction"
        },
        "children": []
    }]
},{
    "syetmType": 0,
    "type": 0,
    "name": "charge",
    "path": "/charge/pendingPay",
    "redirect": "",
    "component": "/charge/pendingPay",
    "meta": {
        "orderNo": 2,
        "icon": "ant-design:file-done-outlined",
        "title": "收费管理",
        "hideMenu": false,
        "hideTab": false,
        "currentActiveMenu": ""
    },
    "children": [{
        "syetmType": 0,
        "type": 1,
        "name": "/charge/pendingPay",
        "path": "/charge/pendingPay",
        "redirect": "",
        "component": "/charge/pendingPay",
        "meta": {
            "orderNo": 1,
            "icon": "",
            "title": "待收款",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    }, {
        "syetmType": 0,
        "type": 1,
        "name": "/charge/payReceived",
        "path": "/charge/payReceived",
        "redirect": "",
        "component": "/charge/payReceived",
        "meta": {
            "orderNo": 2,
            "icon": "",
            "title": "已收款",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    }, {
        "syetmType": 0,
        "type": 1,
        "name": "/charge/refunding",
        "path": "/charge/refunding",
        "redirect": "",
        "component": "/charge/refunding",
        "meta": {
            "orderNo": 3,
            "icon": "",
            "title": "退款中",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    }, {
        "syetmType": 0,
        "type": 1,
        "name": "/charge/refunded",
        "path": "/charge/refunded",
        "redirect": "",
        "component": "/charge/refunded",
        "meta": {
            "orderNo": 4,
            "icon": "",
            "title": "已退款",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    }, {
        "syetmType": 0,
        "type": 1,
        "name": "/charge/cancelled",
        "path": "/charge/cancelled",
        "redirect": "",
        "component": "/charge/cancelled",
        "meta": {
            "orderNo": 5,
            "icon": "",
            "title": "已取消",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    }, {
        "syetmType": 0,
        "type": 1,
        "name": "/charge/detail",
        "path": "/charge/detail",
        "redirect": "",
        "component": "/charge/detail",
        "meta": {
            "orderNo": 6,
            "icon": "",
            "title": "收费详情",
            "hideMenu": true,
            "hideTab": true,
            "currentActiveMenu": "/charge"
        },
        "children": []
    }]
},{
    "syetmType": 0,
    "type": 0,
    "name": "medicalRecord",
    "path": "/medicalRecord",
    "redirect": "",
    "component": "/medicalRecord/index",
    "meta": {
        "orderNo": 3,
        "icon": "ant-design:reconciliation-outlined",
        "title": "患者病历",
        "hideMenu": false,
        "hideTab": false,
        "currentActiveMenu": ""
    },
    "children": []
},{
    "syetmType": 0,
    "type": 0,
    "name": "prescription",
    "path": "/prescription/classic",
    "redirect": "",
    "component": "/prescription/classic",
    "meta": {
        "orderNo": 4,
        "icon": "ant-design:shop-outlined",
        "title": "一人一方",
        "hideMenu": false,
        "hideTab": false,
        "currentActiveMenu": ""
    },
    "children": [{
        "syetmType": 0,
        "type": 1,
        "name": "/prescription/classic",
        "path": "/prescription/classic",
        "redirect": "",
        "component": "/prescription/classic",
        "meta": {
            "orderNo": 1,
            "icon": "",
            "title": "经典验方模板",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    }, {
        "syetmType": 0,
        "type": 1,
        "name": "/prescription/agreement",
        "path": "/prescription/agreement",
        "redirect": "",
        "component": "/prescription/agreement",
        "meta": {
            "orderNo": 2,
            "icon": "",
            "title": "协定方模板",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    }, {
        "syetmType": 0,
        "type": 1,
        "name": "/prescription/common",
        "path": "/prescription/common",
        "redirect": "",
        "component": "/prescription/common",
        "meta": {
            "orderNo": 3,
            "icon": "",
            "title": "常用方模板",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    }, {
        "syetmType": 0,
        "type": 1,
        "name": "/prescription/review",
        "path": "/prescription/review",
        "redirect": "",
        "component": "/prescription/review",
        "meta": {
            "orderNo": 4,
            "icon": "",
            "title": "常用方审核",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    }, {
        "syetmType": 0,
        "type": 1,
        "name": "/prescription/add",
        "path": "/prescription/add",
        "redirect": "",
        "component": "/prescription/add",
        "meta": {
            "orderNo": 4,
            "icon": "",
            "title": "新建处方模板",
            "hideMenu": true,
            "hideTab": true,
            "currentActiveMenu": "/prescription/common"
        },
        "children": []
    }]
},{
    "syetmType": 0,
    "type": 0,
    "name": "operate",
    "path": "/operate",
    "redirect": "",
    "component": "/operate/index",
    "meta": {
        "orderNo": 5,
        "icon": "ant-design:reconciliation-outlined",
        "title": "经营情况",
        "hideMenu": false,
        "hideTab": false,
        "currentActiveMenu": ""
    },
    "children": []
}, {
    "syetmType": 0,
    "type": 0,
    "name": "more",
    "path": "/more/printReceipt",
    "redirect": "",
    "component": "/more/printReceipt",
    "meta": {
        "orderNo": 6,
        "icon": "ant-design:dollar-circle-outlined",
        "title": "更多",
        "hideMenu": false,
        "hideTab": false,
        "currentActiveMenu": ""
    },
    "children": [{
        "syetmType": 0,
        "type": 1,
        "name": "/more/printReceipt",
        "path": "/more/printReceipt",
        "redirect": "",
        "component": "/more/printReceipt",
        "meta": {
            "orderNo": 1,
            "icon": "",
            "title": "打印收费小票",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    },{
        "syetmType": 0,
        "type": 1,
        "name": "/more/printMedical",
        "path": "/more/printMedical",
        "redirect": "",
        "component": "/more/printMedical",
        "meta": {
            "orderNo": 2,
            "icon": "",
            "title": "打印电子病历",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    },{
        "syetmType": 0,
        "type": 1,
        "name": "/more/personnel",
        "path": "/more/personnel",
        "redirect": "",
        "component": "/more/personnel",
        "meta": {
            "orderNo": 4,
            "icon": "",
            "title": "人员管理",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    },{
        "syetmType": 0,
        "type": 1,
        "name": "/more/medicalInstitution",
        "path": "/more/medicalInstitution",
        "redirect": "",
        "component": "/more/medicalInstitution",
        "meta": {
            "orderNo": 5,
            "icon": "",
            "title": "医疗机构信息",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    },{
        "syetmType": 0,
        "type": 1,
        "name": "/more/config",
        "path": "/more/config",
        "redirect": "",
        "component": "/more/config",
        "meta": {
            "orderNo": 6,
            "icon": "",
            "title": "云药房策略配置",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    },{
        "syetmType": 0,
        "type": 1,
        "name": "/more/institutionalAccount",
        "path": "/more/institutionalAccount",
        "redirect": "",
        "component": "/more/institutionalAccount",
        "meta": {
            "orderNo": 7,
            "icon": "",
            "title": "机构账户",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    },{
        "syetmType": 0,
        "type": 1,
        "name": "/more/incomeLogs",
        "path": "/more/incomeLogs",
        "redirect": "",
        "component": "/more/incomeLogs",
        "meta": {
            "orderNo": 8,
            "icon": "",
            "title": "收入明细",
            "hideMenu": false,
            "hideTab": false,
            "currentActiveMenu": ""
        },
        "children": []
    }]
}]

export default MyRoutes;