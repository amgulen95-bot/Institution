import type { UserInfo } from '#/store';
import type { ErrorMessageMode } from '#/axios';
import { defineStore } from 'pinia';
import { store } from '@/store';
import { RoleEnum } from '@/enums/roleEnum';
import { PageEnum } from '@/enums/pageEnum';
import { ROLES_KEY, TOKEN_KEY, USER_INFO_KEY } from '@/enums/cacheEnum';
import { getAuthCache, setAuthCache } from '@/utils/auth';
import { GetUserInfoModel, LoginParams } from '@/api/sys/model/userModel';
import { doLogout, getUserInfo, loginApi, loginBySmsApi} from '/@/api/web/access';
import { useI18n } from '@/hooks/web/useI18n';
import { useMessage } from '@/hooks/web/useMessage';
import { router } from '@/router';
import { usePermissionStore } from '@/store/modules/permission';
import { RouteRecordRaw } from 'vue-router';
import { PAGE_NOT_FOUND_ROUTE } from '@/router/routes/basic';
import { isArray } from '@/utils/is';
import { h } from 'vue';
import { initGid} from '/@/utils/http/axios';
import { number } from 'vue-types';

type AccountInfoType = {
  ID: number | string,
  Gname: string
  Gaddress: string
  Gtel:string
  Gcompany: string
  GCustomerServiceManager: string
  GCustomerServiceManagerInfo: string
  WXVMSPLimit: number
  StorageSpace: number
  Star: true
  Tutor: true
  Shop: number
  Sms: number
  StorageUsed: number
  SMSUsed: number
  ShopUsed:number
  [x:string]:any
}
interface UserState {
  userInfo: Nullable<UserInfo>;
  token?: string;
  roleList: RoleEnum[];
  sessionTimeout?: boolean;
  lastUpdateTime: number;

  AccountInfo:AccountInfoType
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({
    // user info
    userInfo: null,
    // token
    token: undefined,
    // roleList
    roleList: [],
    // Whether the login expired
    sessionTimeout: false,
    // Last fetch time
    lastUpdateTime: 0,
    AccountInfo:<AccountInfoType>{}

  }),
  getters: {
    getUserInfo(state): UserInfo {
      return state.userInfo || getAuthCache<UserInfo>(USER_INFO_KEY) || {};
    },
    getToken(state): string {
      return state.token || getAuthCache<string>(TOKEN_KEY);
    },
    getRoleList(state): RoleEnum[] {
      return state.roleList.length > 0 ? state.roleList : getAuthCache<RoleEnum[]>(ROLES_KEY);
    },
    getSessionTimeout(state): boolean {
      return !!state.sessionTimeout;
    },
    getLastUpdateTime(state): number {
      return state.lastUpdateTime;
    },
  },
  actions: {
    setToken(info: string | undefined) {
      this.token = info ? info : ''; // for null or undefined value
      setAuthCache(TOKEN_KEY, info);
    },
    setRoleList(roleList: RoleEnum[]) {
      this.roleList = roleList;
      setAuthCache(ROLES_KEY, roleList);
    },
    setUserInfo(info: UserInfo | null) {
      this.userInfo = info;
      this.lastUpdateTime = new Date().getTime();
      setAuthCache(USER_INFO_KEY, info);
    },

    setSessionTimeout(flag: boolean) {
      this.sessionTimeout = flag;
    },
    resetState() {
      this.userInfo = null;
      this.token = '';
      this.roleList = [];
      this.sessionTimeout = false;
    },

    autoLoginForTest(){
      let data =  {
        gid:initGid,
        token:'tTGZuUyemPMqTgcsy4pSEyaShVPvzWsgA8Jana9wyc2/c9o89hmiDDWKRHO9hTju1WHkfzwa9mwRFAufvYVN936qYxZQt5Sh1InIUJqdVNkysuz6V1P0qfwoFBkWSswJoR0Ob4DF7oZsMX1AIg/KsYTUX50f4BcQsACj3Ms2Ezo='
      }
      localStorage.setItem('GID',data.gid)
      this.setToken(data.token);
      this.afterLoginAction(true);
    },
    
    registerLogin(token: string): Promise<GetUserInfoModel | null> {
      // save token
      this.setToken(token);
      return this.afterLoginAction(true);
    },

    /**
     * @description: login
     */
    async login(
      params: LoginParams & {
        goHome?: boolean;
        mode?: ErrorMessageMode;
      },
    ): Promise<GetUserInfoModel | null> {
      try {
        const { goHome = true, mode, ...loginParams } = params;
        const data = await loginApi(loginParams, mode);
        const token= data.Token;
        localStorage.setItem('GID',initGid)
        this.setToken(token);
        return this.afterLoginAction(goHome);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async loginBySms(
      params: {
        phone: string;
        code: string;
        goHome?: boolean;
        mode?: ErrorMessageMode;
      },
    ): Promise<GetUserInfoModel | null> {
      try {
        const { goHome = true, mode, ...loginParams } = params;
        const data = await loginBySmsApi(loginParams, mode);
        const token = data.Token;
        localStorage.setItem('GID', initGid)
        this.setToken(token);
        return this.afterLoginAction(goHome);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async afterLoginAction(goHome?: boolean): Promise<GetUserInfoModel | null> {
      if (!this.getToken) return null;
      const userInfo = await this.getUserInfoAction();

      if (userInfo?.gid){
       (window as any).GID = userInfo?.gid;
       (window as any).USERID  = userInfo?.userId
      }

      const sessionTimeout = this.sessionTimeout;
      if (sessionTimeout) {
        this.setSessionTimeout(false);
      } else {
        const permissionStore = usePermissionStore();
        if (!permissionStore.isDynamicAddedRoute) {
          const routes = await permissionStore.buildRoutesAction();
          routes.forEach((route) => {
            router.addRoute(route as unknown as RouteRecordRaw);
          });
          router.addRoute(PAGE_NOT_FOUND_ROUTE as unknown as RouteRecordRaw);
          permissionStore.setDynamicAddedRoute(true);
        }
        goHome && (await router.replace(userInfo?.homePath || PageEnum.BASE_HOME));
      }
      return userInfo;
    },
    async getUserInfoAction(): Promise<UserInfo | null> {
      if (!this.getToken) return null;
      const userInfo = await getUserInfo();

      if (userInfo?.gid){
        (window as any).GID = userInfo?.gid;
        (window as any).USERID  = userInfo?.userId
      }

      const { roles = [] } = userInfo;
      if (isArray(roles)) {
        const roleList = roles.map((item) => item.value) as RoleEnum[];
        this.setRoleList(roleList);
      } else {
        userInfo.roles = [];
        this.setRoleList([]);
      }
      this.setUserInfo(userInfo);
      return userInfo;
    },
    /**
     * @description: logout
     */
    async logout(goLogin = false) {
      if (this.getToken) {
        localStorage.removeItem('GID')
      }
      this.setToken(undefined);
      this.setSessionTimeout(false);
      this.setUserInfo(null);
      goLogin && router.push(PageEnum.BASE_LOGIN);
    },

    /**
     * @description: Confirm before logging out
     */
    confirmLoginOut() {
      const { createConfirm } = useMessage();
      const { t } = useI18n();
      createConfirm({
        iconType: 'warning',
        icon: () =>
          h('span', { class: 'logout-confirm-icon' }, [
            h('span', { class: 'logout-confirm-icon-core' }),
          ]),
        wrapClassName: 'logout-confirm-modal',
        width: 500,
        okText: '确认退出',
        cancelText: '继续使用',
        title: () => h('div', { class: 'logout-confirm-title' }, t('sys.app.logoutTip')),
        content: () =>
          h('div', { class: 'logout-confirm-content' }, [
            h('p', { class: 'logout-confirm-message' }, t('sys.app.logoutMessage')),
            h('div', { class: 'logout-confirm-tip' }, [
              h('span', { class: 'logout-confirm-tip-label' }, '退出后'),
              h('span', { class: 'logout-confirm-tip-text' }, '将返回登录页，再次使用需要重新登录。'),
            ]),
          ]),
        onOk: async () => {
          await this.logout(true);
        },
      });
    },
  },
});

// Need to be used outside the setup
export function useUserStoreWithOut() {
  return useUserStore(store);
}
