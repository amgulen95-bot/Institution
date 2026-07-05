<template>
  <BasicModal
    :footer="null"
    :title="t('layout.header.lockScreen')"
    v-bind="$attrs"
    :class="prefixCls"
    @register="register"
  >
    <div :class="`${prefixCls}__entry`">
      <div :class="`${prefixCls}__profile`">
        <img :src="avatar" :class="`${prefixCls}__profile-img`" />
        <div :class="`${prefixCls}__profile-info`">
          <div :class="`${prefixCls}__profile-name`">{{ getRealName }}</div>
          <div :class="`${prefixCls}__profile-desc`">系统将进入安全休息状态</div>
        </div>
      </div>

      <div :class="`${prefixCls}__divider`"></div>

      <div :class="`${prefixCls}__notice`">
        锁定后需要输入锁屏密码或当前账号密码，才能重新进入系统。
      </div>

      <BasicForm :class="`${prefixCls}__form`" @register="registerForm" />

      <div :class="`${prefixCls}__footer`">
        <a-button :class="`${prefixCls}__cancel`" @click="closeModal">
          取消
        </a-button>
        <a-button type="primary" :class="`${prefixCls}__confirm`" @click="handleLock">
          {{ t('layout.header.lockScreenBtn') }}
        </a-button>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useDesign } from '@/hooks/web/useDesign';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';

  import { useUserStore } from '@/store/modules/user';
  import { useLockStore } from '@/store/modules/lock';
  import headerImg from '@/assets/images/header.jpg';

  defineOptions({ name: 'LockModal' });

  const { t } = useI18n();
  const { prefixCls } = useDesign('header-lock-modal');
  const userStore = useUserStore();
  const lockStore = useLockStore();

  const getRealName = computed(() => userStore.getUserInfo?.Clinic.Name);
  const [register, { closeModal }] = useModalInner();

  const [registerForm, { validate, resetFields }] = useForm({
    showActionButtonGroup: false,
    baseColProps: {
      span: 24,
    },
    labelWidth: 0,
    schemas: [
      {
        field: 'password',
        label: '',
        colProps: {
          span: 24,
        },
        component: 'InputPassword',
        componentProps: {
          placeholder: t('layout.header.lockScreenPassword'),
        },
        required: true,
      },
    ],
  });

  const handleLock = async () => {
    const { password = '' } = await validate<{
      password: string;
    }>();

    closeModal();

    lockStore.setLockInfo({
      isLock: true,
      pwd: password,
    });

    await resetFields();
  };

  const avatar = computed(() => {
    return userStore.getUserInfo?.Clinic?.Logo || headerImg;
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-header-lock-modal';

  .@{prefix-cls} {
    .ant-modal-content {
      overflow: hidden;
      border-radius: 28px;
      box-shadow: 0 24px 60px rgba(38, 52, 78, 0.16);
    }

    .ant-modal-header {
      padding: 24px 30px 0;
      border-bottom: 0;
      border-radius: 28px 28px 0 0;
    }

    .ant-modal-title {
      color: #1f2937;
      font-size: 18px;
      font-weight: 500;
      line-height: 26px;
    }

    .ant-modal-body {
      padding: 0;
    }

    &__entry {
      position: relative;
      padding: 22px 30px 28px;
      background: linear-gradient(180deg, #fff 0%, #f9fbfd 100%);
    }

    &__profile {
      display: flex;
      align-items: center;
      padding: 4px 0 18px;
    }

    &__profile-img {
      width: 58px;
      height: 58px;
      margin-right: 14px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 0 0 1px #e1ebff, 0 8px 20px rgba(47, 111, 237, 0.12);
    }

    &__profile-info {
      min-width: 0;
    }

    &__profile-name {
      overflow: hidden;
      color: #1f2937;
      font-size: 17px;
      font-weight: 500;
      line-height: 24px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__profile-desc {
      margin-top: 4px;
      color: #5f6a7a;
      font-size: 13px;
      line-height: 20px;
    }

    &__divider {
      height: 1px;
      margin-bottom: 18px;
      background-image: linear-gradient(to right, #d8e2f0 50%, transparent 50%);
      background-size: 8px 1px;
    }

    &__notice {
      margin-bottom: 14px;
      padding: 12px 14px;
      color: #5f6a7a;
      font-size: 13px;
      line-height: 20px;
      background: #f9fbfd;
      border: 1px solid #e8eef7;
      border-radius: 12px;
    }

    &__form {
      .ant-form-item {
        margin-bottom: 0;
      }

      .ant-input-affix-wrapper {
        height: 44px;
        border-color: #e1e8f2;
        border-radius: 10px;
        transition: border-color 0.18s ease, box-shadow 0.18s ease;

        &:hover,
        &-focused {
          border-color: rgba(47, 111, 237, 0.44);
          box-shadow: 0 0 0 3px rgba(47, 111, 237, 0.1);
        }
      }
    }

    &__footer {
      display: grid;
      grid-template-columns: 1fr 1.3fr;
      gap: 12px;
      margin-top: 24px;
    }

    &__cancel,
    &__confirm {
      height: 42px;
      border-radius: 8px;
      font-weight: 400;
    }

    &__cancel {
      color: #5f6a7a;
      background: #fff;
      border-color: #dce5f0;

      &:hover {
        color: #2f6fed;
        background: #eef5ff;
        border-color: #cfe0ff;
      }
    }
  }
</style>
