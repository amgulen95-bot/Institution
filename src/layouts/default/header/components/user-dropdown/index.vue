<template>
  <div :class="`${prefixCls}__bar`">
    <button :class="`${prefixCls}__service-btn`" type="button" @click="openServiceModal" title="联系客服">
      <Icon icon="ant-design:customer-service-filled" />
    </button>
    <button
      :class="[`${prefixCls}__service-btn`, `${prefixCls}__manager-btn`]"
      type="button"
      @click="openManagerModal"
      title="专属客户经理"
    >
      <Icon icon="ant-design:question-circle-filled" />
    </button>
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
  </div>
  <a-modal v-model:open="serviceModalVisible" centered width="520px" :footer="null" :maskClosable="true" destroyOnClose wrapClassName="customer-service-modal">
    <section :class="`${prefixCls}__service-dialog`">
      <div :class="`${prefixCls}__service-header`">
        <div>
          <div :class="`${prefixCls}__service-title`">微信客服</div>
          <div :class="`${prefixCls}__service-subtitle`">扫码添加企业微信客服，咨询系统使用与业务问题</div>
        </div>
        <span :class="`${prefixCls}__service-badge`">在线支持</span>
      </div>
      <div :class="`${prefixCls}__service-body`">
        <div :class="`${prefixCls}__service-qr-wrap`">
          <img :class="`${prefixCls}__service-qr`" :src="customerServiceQr" alt="客服二维码" />
        </div>
        <div :class="`${prefixCls}__service-note`">
          <span></span>
          <p>请使用微信扫码咨询客服，工作时间内会尽快为您处理。</p>
        </div>
      </div>
    </section>
  </a-modal>
  <a-modal v-model:open="managerModalVisible" centered width="720px" :footer="null" :maskClosable="true" destroyOnClose wrapClassName="customer-manager-modal">
    <section :class="`${prefixCls}__manager-dialog`">
      <div :class="`${prefixCls}__manager-header`">
        <div>
          <div :class="`${prefixCls}__manager-title`">专属客户经理</div>
          <div :class="`${prefixCls}__manager-subtitle`">通过企业微信联系专属客户经理，获取系统使用与运营支持</div>
        </div>
        <span :class="`${prefixCls}__manager-badge`">企业微信</span>
      </div>
      <div :class="`${prefixCls}__manager-frame-wrap`">
        <iframe
          :class="`${prefixCls}__manager-frame`"
          :src="managerWechatUrl"
          scrolling="no"
          title="专属客户经理企业微信"
        ></iframe>
      </div>
      <div :class="`${prefixCls}__manager-actions`">
        <span>若页面未正常显示，可直接打开企业微信联系页。</span>
        <button type="button" @click="openManagerLink">打开企业微信</button>
      </div>
    </section>
  </a-modal>
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
  import { Icon } from '@/components/Icon';
  import headerImg from '@/assets/images/header.jpg';
  import customerServiceQr from '@/assets/images/customer-service-qrcode.png';
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
  const serviceModalVisible=ref(false)
  const managerModalVisible=ref(false)
  const managerWechatUrl='https://work.weixin.qq.com/ca/cawcde51fed427ed0f'
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

  function openServiceModal(){
    panelVisible.value = false
    serviceModalVisible.value = true
  }

  function openManagerModal(){
    panelVisible.value = false
    managerModalVisible.value = true
  }

  function openManagerLink(){
    openWindow(managerWechatUrl)
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

  .customer-service-modal {
    .ant-modal-content {
      overflow: hidden;
      padding: 0;
      border-radius: 28px;
      background: #fff;
      box-shadow: 0 24px 56px rgba(31, 43, 61, 0.16);
    }

    .ant-modal-body {
      padding: 0;
    }

    .ant-modal-close {
      top: 18px;
      right: 18px;
      border-radius: 8px;

      &:hover {
        background: #eef5ff;
      }
    }
  }

  .customer-manager-modal {
    .ant-modal-content {
      overflow: hidden;
      padding: 0;
      border-radius: 28px;
      background: #fff;
      box-shadow: 0 24px 56px rgba(31, 43, 61, 0.16);
    }

    .ant-modal-body {
      padding: 0;
    }

    .ant-modal-close {
      top: 18px;
      right: 18px;
      border-radius: 8px;

      &:hover {
        background: #eef5ff;
      }
    }
  }

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

    &__bar {
      display: flex;
      align-items: center;
      height: @header-height;
      gap: 8px;
    }

    &__service-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 34px;
      padding: 0;
      color: #0a5aff;
      font-size: 20px;
      font-weight: 700;
      line-height: 18px;
      border: 1px solid transparent;
      border-radius: 8px;
      background: transparent;
      cursor: pointer;
      outline: none;
      transition: background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, color 0.18s ease;

      .anticon,
      svg {
        width: 21px;
        height: 21px;
        font-size: 21px;
      }

      &:hover,
      &:focus-visible {
        color: #0848cc;
        border-color: transparent;
        background: #eef5ff;
        box-shadow: none;
      }
    }

    &__manager-btn {
      font-size: 21px;

      .anticon,
      svg {
        width: 22px;
        height: 22px;
        font-size: 22px;
      }
    }

    &__service-dialog {
      padding: 32px 34px 28px;
      background:
        linear-gradient(180deg, #f9fbfd 0%, #fff 42%),
        #fff;
    }

    &__service-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 18px;
      padding-right: 36px;
      padding-bottom: 20px;
      border-bottom: 1px dashed #dce6f5;
    }

    &__service-title {
      color: #1d2533;
      font-size: 20px;
      font-weight: 500;
      line-height: 28px;
    }

    &__service-subtitle {
      margin-top: 5px;
      color: #5f6a7a;
      font-size: 13px;
      font-weight: 400;
      line-height: 20px;
    }

    &__service-badge {
      display: inline-flex;
      align-items: center;
      height: 28px;
      padding: 0 12px;
      flex: 0 0 auto;
      color: #16a34a;
      font-size: 13px;
      font-weight: 400;
      border: 1px solid #c8eed8;
      border-radius: 8px;
      background: #ecfdf3;
    }

    &__service-body {
      padding-top: 22px;
    }

    &__service-qr-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 274px;
      height: 338px;
      margin: 0 auto;
      padding: 12px;
      border: 1px solid #e8eef7;
      border-radius: 18px;
      background: #fff;
      box-shadow: 0 12px 30px rgba(31, 43, 61, 0.08);
    }

    &__service-qr {
      display: block;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 12px;
    }

    &__service-note {
      display: flex;
      gap: 10px;
      margin-top: 18px;
      padding: 12px 14px;
      border: 1px solid #e8eef7;
      border-radius: 12px;
      background: #f9fbfd;

      span {
        width: 6px;
        height: 6px;
        flex: 0 0 6px;
        margin-top: 7px;
        border-radius: 50%;
        background: #0a5aff;
      }

      p {
        margin: 0;
        color: #5f6a7a;
        font-size: 13px;
        font-weight: 400;
        line-height: 20px;
      }
    }

    &__manager-dialog {
      overflow: hidden;
      padding: 26px 30px 24px;
      background:
        linear-gradient(180deg, #f9fbfd 0%, #fff 42%),
        #fff;
    }

    &__manager-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 18px;
      padding-right: 38px;
      padding-bottom: 18px;
      border-bottom: 1px dashed #dce6f5;
    }

    &__manager-title {
      color: #1d2533;
      font-size: 20px;
      font-weight: 500;
      line-height: 28px;
    }

    &__manager-subtitle {
      margin-top: 5px;
      color: #5f6a7a;
      font-size: 13px;
      font-weight: 400;
      line-height: 20px;
    }

    &__manager-badge {
      display: inline-flex;
      align-items: center;
      height: 28px;
      padding: 0 12px;
      flex: 0 0 auto;
      color: #0a5aff;
      font-size: 13px;
      font-weight: 400;
      border: 1px solid #d8e6ff;
      border-radius: 8px;
      background: #eef5ff;
    }

    &__manager-frame-wrap {
      overflow: hidden;
      height: 520px;
      margin-top: 18px;
      border: 1px solid #e8eef7;
      border-radius: 18px;
      background: #f9fbfd;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.82);
    }

    &__manager-frame {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border: 0;
      background: #fff;
    }

    &__manager-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px dashed #dce6f5;

      span {
        color: #5f6a7a;
        font-size: 13px;
        font-weight: 400;
        line-height: 20px;
      }

      button {
        height: 36px;
        padding: 0 18px;
        flex: 0 0 auto;
        color: #fff;
        font-size: 14px;
        font-weight: 400;
        border: 0;
        border-radius: 8px;
        background: #0a5aff;
        cursor: pointer;
        transition: background-color 0.18s ease, box-shadow 0.18s ease;

        &:hover,
        &:focus-visible {
          background: #0848cc;
          box-shadow: 0 8px 18px rgba(10, 90, 255, 0.18);
        }
      }
    }
  }
</style>
