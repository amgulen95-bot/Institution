<template>
  <div class="p-4 page-height system-config-page">
    <a-card class="system-config-card" :bordered="false">
      <div class="system-config-header">
        <div>
          <div class="system-config-title">系统配置</div>
          <div class="system-config-subtitle">配置机构端本机操作偏好</div>
        </div>
        <span class="system-config-badge">本机生效</span>
      </div>

      <div class="system-config-panel">
        <div class="system-config-section">
          <div class="system-config-section__main">
            <div class="system-config-section__eyebrow">收款流程</div>
            <div class="system-config-section__title">云药房快速收款</div>
            <div class="system-config-section__desc">
              开启后，提交审方/开方发药并创建订单成功后，会显示倒计时收款弹窗。
            </div>
          </div>
          <div class="system-config-switch-wrap" :class="{ 'is-on': form.enabled }">
            <span>{{ form.enabled ? '已开启' : '已关闭' }}</span>
            <a-switch v-model:checked="form.enabled" checked-children="开" un-checked-children="关" />
          </div>
        </div>

        <div class="system-config-fields" :class="{ 'is-disabled': !form.enabled }">
          <div class="system-config-field">
            <div class="system-config-field__label">倒计时秒数</div>
            <div class="system-config-field__control">
              <a-input-number
                v-model:value="form.seconds"
                :min="3"
                :max="30"
                :precision="0"
                :controls="false"
                :disabled="!form.enabled"
                @blur="normalizeSeconds"
                @pressEnter="normalizeSeconds"
              />
              <span>秒</span>
            </div>
          </div>
          <div class="system-config-help">可填写 3 到 30 的正整数，默认 8 秒。</div>
        </div>
      </div>

      <div class="system-config-footer">
        <a-button class="system-config-button" @click="resetConfig">恢复默认</a-button>
        <a-button class="system-config-button" type="primary" @click="saveConfig">保存配置</a-button>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, reactive } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    CloudPharmacyQuickPayConfig,
    getCloudPharmacyQuickPayConfig,
    getDefaultCloudPharmacyQuickPayConfig,
    normalizeQuickPaySeconds,
    saveCloudPharmacyQuickPayConfig,
  } from '/@/utils/quickPayConfig';

  const { createMessage } = useMessage();

  const form = reactive({
    enabled: true,
    seconds: 8,
  });

  const applyConfig = (config: CloudPharmacyQuickPayConfig) => {
    form.enabled = config.enabled;
    form.seconds = normalizeQuickPaySeconds(config.seconds);
  };

  const normalizeSeconds = () => {
    form.seconds = normalizeQuickPaySeconds(form.seconds);
  };

  const saveConfig = () => {
    normalizeSeconds();
    const nextConfig = saveCloudPharmacyQuickPayConfig({
      enabled: form.enabled,
      seconds: form.seconds,
    });
    applyConfig(nextConfig);
    createMessage.success('保存成功');
  };

  const resetConfig = () => {
    applyConfig(getDefaultCloudPharmacyQuickPayConfig());
    saveConfig();
  };

  onMounted(() => {
    applyConfig(getCloudPharmacyQuickPayConfig());
  });
</script>

<style lang="less" scoped>
  .system-config-page {
    background: #f4f7f9;
  }

  .system-config-card {
    max-width: 900px;
    min-height: 360px;
    border: 1px solid #e8eef7;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 10px 28px rgba(62, 88, 120, 0.06);

    :deep(.ant-card-body) {
      padding: 20px;
    }
  }

  .system-config-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 2px 18px;
    border-bottom: 1px dashed #dce6f5;
  }

  .system-config-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #1d2533;
    font-size: 18px;
    font-weight: 500;
    line-height: 26px;

    &::before {
      display: inline-block;
      width: 5px;
      height: 18px;
      border-radius: 999px;
      background: #0a5aff;
      content: '';
    }
  }

  .system-config-subtitle {
    margin-top: 6px;
    color: #858d98;
    font-size: 13px;
    line-height: 20px;
  }

  .system-config-badge {
    display: inline-flex;
    align-items: center;
    height: 28px;
    padding: 0 12px;
    border: 1px solid #dce6f5;
    border-radius: 999px;
    background: #f9fbfd;
    color: #5f6a7a;
    font-size: 13px;
    font-weight: 400;
  }

  .system-config-panel {
    margin-top: 18px;
    overflow: hidden;
    border: 1px solid #e8eef7;
    border-radius: 12px;
    background: #f9fbfd;
  }

  .system-config-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    padding: 18px 20px;
    border-bottom: 1px dashed #dce6f5;
  }

  .system-config-section__main {
    min-width: 0;
  }

  .system-config-section__eyebrow {
    margin-bottom: 4px;
    color: #0a5aff;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }

  .system-config-section__title {
    color: #1f2733;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }

  .system-config-section__desc {
    margin-top: 6px;
    color: #5f6a7a;
    font-size: 13px;
    line-height: 22px;
  }

  .system-config-switch-wrap {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    min-width: 128px;
    justify-content: flex-end;
    color: #858d98;
    font-size: 13px;
    font-weight: 400;
    white-space: nowrap;

    &.is-on {
      color: #0a5aff;
    }
  }

  .system-config-fields {
    padding: 18px 20px 20px;
    transition: opacity 0.18s ease;
  }

  .system-config-fields.is-disabled {
    opacity: 0.58;
  }

  .system-config-field {
    display: flex;
    align-items: center;
    gap: 18px;
    min-height: 38px;
  }

  .system-config-field__label {
    width: 104px;
    color: #5f6a7a;
    font-size: 14px;
    line-height: 32px;
  }

  .system-config-field__control {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #5f6a7a;
  }

  .system-config-field__control :deep(.ant-input-number) {
    width: 96px;
    border-color: #dce6f5 !important;
    border-radius: 8px !important;
    box-shadow: none !important;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;

    &:hover,
    &.ant-input-number-focused {
      border-color: #0a5aff !important;
      box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
    }
  }

  .system-config-field__control :deep(.ant-input-number-input) {
    padding-right: 12px;
    text-align: right;
  }

  .system-config-help {
    margin-top: 8px;
    padding-left: 122px;
    color: #858d98;
    font-size: 12px;
    line-height: 20px;
  }

  .system-config-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
  }

  .system-config-button {
    min-width: 92px;
    border-radius: 8px;
  }
</style>
