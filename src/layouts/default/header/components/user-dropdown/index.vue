<template>
  <div
    :class="[`${prefixCls}__shell`, { [`${prefixCls}__shell--open`]: panelVisible }]"
    @mouseenter="panelVisible = true"
    @mouseleave="panelVisible = false"
  >
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

    <div :class="`${prefixCls}__panel`">
      <div :class="`${prefixCls}__profile`">
        <img :class="`${prefixCls}__profile-avatar`" :src="getUserInfo.avatar" />
        <div :class="`${prefixCls}__profile-text`">
          <div :class="`${prefixCls}__profile-name`">{{ getUserInfo.AccountName }}</div>
          <div :class="`${prefixCls}__profile-desc`">{{ getUserInfo.ContactName || getUserInfo.Phone }}</div>
        </div>
      </div>
      <div :class="`${prefixCls}__divider`"></div>
      <div :class="`${prefixCls}__menu`">
        <!-- <MenuItem
          key="doc"
          :text="t('layout.header.dropdownItemDoc')"
          icon="ion:document-text-outline"
          v-if="getShowDoc"
        /> -->
        <MenuItem
          v-if="getShowApi"
          key="api"
          :text="t('layout.header.dropdownChangeApi')"
          icon="ant-design:swap-outlined"
          @select="handleMenuSelect"
        />
        <MenuItem
          v-if="getUseLockPage"
          key="lock"
          :text="t('layout.header.tooltipLock')"
          icon="ion:lock-closed-outline"
          @select="handleMenuSelect"
        />
        <MenuItem
          key="phone"
          text="手机号"
          :subText="getUserInfo.Phone"
          icon="ant-design:mobile-outlined"
          @select="handleMenuSelect"
        />
        <MenuItem
          key="password"
          text="密码"
          subText="******"
          icon="ant-design:lock-outlined"
          @select="handleMenuSelect"
        />
        <MenuItem
          key="logout"
          :text="t('layout.header.dropdownItemLoginOut')"
          icon="ion:power-outline"
          @select="handleMenuSelect"
        />
      </div>
    </div>
  </div>
  <LockAction @register="register" />
  <ChangeApi @register="registerApi" />
  <ChangePhone v-model:visible="phoneModalVisible" />
  <PasswordModal v-model:visible="passwordModalVisible" />
</template>
<script lang="ts" setup>
  import type { MenuInfo } from 'ant-design-vue/lib/menu/src/interface';
  import { computed, ref } from 'vue';
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
  import MenuItem from './DropMenuItem.vue';

  type MenuEvent = 'logout' | 'doc' | 'lock' | 'api' | 'phone' | 'password';

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
  const panelVisible = ref(false)
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

  function handleMenuSelect(key: MenuEvent) {
    panelVisible.value = false;
    handleMenuClick({ key } as MenuInfo);
  }
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-header-user-dropdown';

  .@{prefix-cls} {
    align-items: center;
    height: @header-height;
    padding: 0 10px;
    overflow: hidden;
    font-size: 12px;
    cursor: pointer;
    border-radius: 12px;
    outline: 1px solid transparent;
    outline-offset: -3px;
    transition: background-color 0.18s ease, outline-color 0.18s ease, box-shadow 0.18s ease;

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
        outline-color: rgba(47, 111, 237, 0.2);
        box-shadow: 0 0 0 3px rgba(47, 111, 237, 0.08) inset;
      }
    }

    &--light {
      &:hover {
        background-color: #f9fbfd;
        outline-color: rgba(47, 111, 237, 0.22);
        box-shadow: 0 0 0 3px rgba(47, 111, 237, 0.08) inset;
      }

      .@{prefix-cls}__name {
        color: @text-color-base;
      }

      .@{prefix-cls}__desc {
        color: @header-light-desc-color;
      }
    }

    &__shell {
      position: relative;
      display: flex;
      align-items: center;
      height: @header-height;
      overflow: visible;
      z-index: 20;

      .@{prefix-cls}__panel {
        position: absolute;
        top: calc(100% - 2px);
        right: 0;
        width: 308px;
        min-height: 274px;
        padding: 12px;
        overflow: hidden;
        background: #fff;
        border: 1px solid #e8eef7;
        border-radius: 16px;
        box-shadow: 0 18px 42px rgba(38, 52, 78, 0.14);
        opacity: 0;
        pointer-events: none;
        transform: translateY(-2px);
        visibility: hidden;
        transition: opacity 0.14s ease, transform 0.14s ease, visibility 0.14s ease;
        will-change: opacity, transform;
      }

      &--open {
        z-index: 1200;

        .@{prefix-cls}__panel {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
          visibility: visible;
        }
      }

      .@{prefix-cls}__profile {
        display: flex;
        align-items: center;
        min-height: 64px;
        padding: 10px 10px 12px;
      }

      .@{prefix-cls}__profile-avatar {
        flex: 0 0 auto;
        width: 44px;
        height: 44px;
        margin-right: 12px;
        border-radius: 50%;
        box-shadow: 0 0 0 1px rgba(225, 235, 255, 0.9);
      }

      .@{prefix-cls}__profile-text {
        min-width: 0;
      }

      .@{prefix-cls}__profile-name {
        overflow: hidden;
        color: #1f2937;
        font-size: 15px;
        font-weight: 500;
        line-height: 22px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .@{prefix-cls}__profile-desc {
        overflow: hidden;
        margin-top: 2px;
        color: #5f6a7a;
        font-size: 12px;
        line-height: 18px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .@{prefix-cls}__divider {
        height: 1px;
        margin: 0 4px 8px;
        background-image: linear-gradient(to right, #d8e2f0 50%, transparent 50%);
        background-size: 8px 1px;
      }

      .@{prefix-cls}__menu {
        padding: 0;
        background: transparent;
        border-radius: 12px;
      }

      .@{prefix-cls}__menu-item {
        display: block;
        width: 100%;
        height: 46px;
        margin: 2px 0;
        padding: 0 10px;
        color: #263447;
        text-align: left;
        background: transparent;
        border: 0;
        border-radius: 8px;
        cursor: pointer;
        outline: none;
        transition: background-color 0.16s ease, color 0.16s ease;
      }

      .@{prefix-cls}__menu-item:hover,
      .@{prefix-cls}__menu-item:focus-visible {
        background-color: #eef5ff;
      }

      .@{prefix-cls}__item {
        width: 100%;
        height: 100%;
      }

      .@{prefix-cls}__item-left {
        min-width: 0;
      }

      .@{prefix-cls}__item-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        margin-right: 10px;
        color: #2f6fed;
        font-size: 16px;
        background: #f4f8ff;
        border-radius: 8px;
      }

      .@{prefix-cls}__item-text {
        color: #263447;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px;
      }

      .@{prefix-cls}__item-sub {
        max-width: 150px;
        overflow: hidden;
        color: #5f6a7a;
        font-size: 12px;
        line-height: 18px;
        text-align: right;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .@{prefix-cls}__item-arrow {
        margin-left: 6px;
        color: #9aa6b6;
        font-size: 10px;
      }

      .@{prefix-cls}__menu-item--logout {
        .@{prefix-cls}__item-icon {
          color: #d65b5b;
          background: #fff3f3;
        }
      }

      .@{prefix-cls}__menu-item:hover .@{prefix-cls}__item-icon,
      .@{prefix-cls}__menu-item:focus-visible .@{prefix-cls}__item-icon {
        background: #e1ebff;
      }
    }
  }
</style>
