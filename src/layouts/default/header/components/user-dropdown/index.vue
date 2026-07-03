<template>
  <Dropdown placement="bottomLeft" :overlayClassName="`${prefixCls}-dropdown-overlay`">
    <div :class="[prefixCls, `${prefixCls}--${theme}`]" class="flex">
      <img :class="`${prefixCls}__header`" :src="getUserInfo.avatar" />
      <div :class="`${prefixCls}__info hidden md:block`">
        <div :class="`${prefixCls}__name`" class="truncate" style="line-height: 22px;">
          {{ getUserInfo.AccountName }}
        </div>
        <div class="truncate text-12px color-[#4E5766]" style="line-height: 16px;">
          {{ getUserInfo.ContactName }}
        </div>
      </div>
    </div>
    
    <template #overlay>
      <Menu @click="handleMenuClick">
        <!-- <MenuItem
          key="doc"
          :text="t('layout.header.dropdownItemDoc')"
          icon="ion:document-text-outline"
          v-if="getShowDoc"
        />
        <Menu.Divider v-if="getShowDoc" /> -->
        <MenuItem
          v-if="getShowApi"
          key="api"
          :text="t('layout.header.dropdownChangeApi')"
          icon="ant-design:swap-outlined"
        />
        <MenuItem
          v-if="getUseLockPage"
          key="lock"
          :text="t('layout.header.tooltipLock')"
          icon="ion:lock-closed-outline"
        />
        <MenuItem key="phone" text="手机号" :subText="getUserInfo.Phone" icon="ant-design:mobile-outlined" />
        <MenuItem key="password" text="密码" subText="******" icon="ant-design:lock-outlined" />
        <MenuItem
          key="logout"
          :text="t('layout.header.dropdownItemLoginOut')"
          icon="ion:power-outline"
        />
      </Menu>
    </template>
  </Dropdown>
  <LockAction @register="register" />
  <ChangeApi @register="registerApi" />
  <ChangePhone v-model:visible="phoneModalVisible" />
  <PasswordModal v-model:visible="passwordModalVisible" />
</template>
<script lang="ts" setup>
  import { Dropdown, Menu } from 'ant-design-vue';
  import type { MenuInfo } from 'ant-design-vue/lib/menu/src/interface';
  import { computed,ref} from 'vue';
  import { DOC_URL } from '@/settings/siteSetting';
  import { useUserStore } from '@/store/modules/user';
  import { useHeaderSetting } from '@/hooks/setting/useHeaderSetting';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useDesign } from '@/hooks/web/useDesign';
  import { useModal } from '@/components/Modal';
  import headerImg from '@/assets/images/header.jpg';
  import { propTypes } from '@/utils/propTypes';
  import { openWindow } from '@/utils';
  import { createAsyncComponent } from '@/utils/factory/createAsyncComponent';

  type MenuEvent = 'logout' | 'doc' | 'lock' | 'api' | 'phone' | 'password';

  const MenuItem = createAsyncComponent(() => import('./DropMenuItem.vue'));
  const LockAction = createAsyncComponent(() => import('../lock/LockModal.vue'));
  const ChangeApi = createAsyncComponent(() => import('../ChangeApi/index.vue'));
  const ChangePhone = createAsyncComponent(() => import('../ChangePhone.vue'));
  const PasswordModal = createAsyncComponent(() => import('../PasswordModal.vue'));

  defineOptions({ name: 'UserDropdown' });

  defineProps({
    theme: propTypes.oneOf(['dark', 'light']),
  });

  const { prefixCls } = useDesign('header-user-dropdown');
  const { t } = useI18n();
  const { getShowDoc, getUseLockPage, getShowApi } = useHeaderSetting();
  const userStore = useUserStore();
  const phoneModalVisible=ref(false)
  const passwordModalVisible=ref(false)
  const getUserInfo = computed(() => {
    let AccountName=userStore.getUserInfo.Clinic.Name||''
    let avatar=userStore.getUserInfo.Clinic.Logo
    let ContactName=userStore.getUserInfo.Doctor.DoctorName||''
    let Phone=userStore.getUserInfo.Doctor.Phone||''
    return { AccountName, avatar: avatar || headerImg,ContactName,Phone};
  });

  const [register, { openModal }] = useModal();
  const [registerApi, { openModal: openApiModal }] = useModal();

  function handleLock() {
    openModal(true);
  }

  function handleApi() {
    openApiModal(true, {});
  }

  //  login out
  function handleLoginOut() {
    userStore.confirmLoginOut();
  }

  // open doc
  function openDoc() {
    openWindow(DOC_URL);
  }

  function changePhone(){
    phoneModalVisible.value=true
  }

  function changePassword(){
    passwordModalVisible.value=true
  }

  function handleMenuClick(e: MenuInfo) {
    switch (e.key as MenuEvent) {
      case 'logout':
        handleLoginOut();
        break;
      case 'doc':
        openDoc();
        break;
      case 'lock':
        handleLock();
        break;
      case 'api':
        handleApi();
        break;
      case 'phone':
        changePhone();
        break;
      case 'password':
        changePassword();
        break;
    }
  }
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-header-user-dropdown';

  .@{prefix-cls} {
    align-items: center;
    height: @header-height;
    padding: 0 0 0 10px;
    padding-right: 10px;
    overflow: hidden;
    font-size: 12px;
    cursor: pointer;

    img {
      width: 40px;
      height: 40px;
      margin-right: 12px;
    }

    &__header {
      border-radius: 50%;
    }

    &__name {
      font-size: 16px;
      font-weight: bold;
    }

    &--dark {
      &:hover {
        background-color: @header-dark-bg-hover-color;
      }
    }

    &--light {
      &:hover {
        // background-color: @header-light-bg-hover-color;
      }

      .@{prefix-cls}__name {
        color: @text-color-base;
      }

      .@{prefix-cls}__desc {
        color: @header-light-desc-color;
      }
    }

    &-dropdown-overlay {
      .ant-dropdown-menu-item {
        min-width: 160px;
      }
    }
  }
</style>
