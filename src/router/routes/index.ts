import type { AppRouteRecordRaw, AppRouteModule } from '@/router/types';

import { PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE } from '@/router/routes/basic';

import {PAGELAYOUT} from '/@/router/constant';
import { mainOutRoutes } from './mainOut';
import { PageEnum } from '@/enums/pageEnum';
import { t } from '@/hooks/web/useI18n';

// import.meta.glob() 直接引入所有的模块 Vite 独有的功能
const modules = import.meta.glob('./modules/**/*.ts', { eager: true });
const routeModuleList: AppRouteModule[] = [];

// 加入到路由集合中
Object.keys(modules).forEach((key) => {
  const mod = (modules as Recordable)[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeModuleList.push(...modList);
});

export const asyncRoutes = [PAGE_NOT_FOUND_ROUTE, ...routeModuleList];

// 根路由
export const RootRoute: AppRouteRecordRaw = {
  path: '/',
  name: 'Root',
  redirect: PageEnum.BASE_HOME,
  meta: {
    title: 'Root',
  },
};

export const LoginRoute: AppRouteRecordRaw = {
  path: '/login',
  name: 'Login',
  component: () => import('@/views/sys/login/Login.vue'),
  meta: {
    title: t('routes.basic.login'),
  },
};

export const RegisterRoute: AppRouteRecordRaw = {
  path: '/register',
  name: 'Register',
  component: PAGELAYOUT,
  meta: {
    title: '入驻一码达',
    ignoreAuth: true
  },
  redirect: '/register/index',
  children: [{
    path: 'index',
    name: 'RegisterIndex',
    component: () => import('/@/views/sys/register/index.vue'),
    meta: {
      title: '入驻一码达',
      ignoreAuth: true
    },
  },{
    path: 'set',
    name: 'RegisterSet',
    component: () => import('/@/views/sys/register/set.vue'),
    meta: {
      title: '选择使用-套餐介绍',
      ignoreAuth: true
    },
  }, {
    path: 'initialize',
    name: 'RegisterInit',
    component: () => import('/@/views/sys/register/initialize.vue'),
    meta: {
      title: '初始化系统',
      ignoreAuth: true
    },
  }]
}

const myRouter = [
  // {
  //   "name": "decoratorpage",
  //   "path": "/diy/decorator",
  //   "component": () => import('/@/views/shop/diy/decorator.vue'),
  //   "meta": {
  //     "title": "装修",
  //   }
  // }
]

// Basic routing without permission
// 未经许可的基本路由
export const basicRoutes = [
  LoginRoute,
  RootRoute,
  RegisterRoute,
  ...mainOutRoutes,
  REDIRECT_ROUTE,
  PAGE_NOT_FOUND_ROUTE,
  ...myRouter
];
