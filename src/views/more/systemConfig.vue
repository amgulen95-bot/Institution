<template>
  <div class="p-4 page-height system-config-page">
    <a-card class="system-config-card" :bordered="false">
      <div class="system-config-header">
        <div>
          <div class="text-18px text-bold">系统配置</div>
          <div class="system-config-subtitle">配置机构端本机操作偏好</div>
        </div>
      </div>

      <div class="system-config-section">
        <div class="system-config-section__main">
          <div class="system-config-section__title">云药房快速收款</div>
          <div class="system-config-section__desc">
            开启后，提交审方/开方发药并创建订单成功后，会显示倒计时收款弹窗。
          </div>
        </div>
        <a-switch v-model:checked="form.enabled" checked-children="开" un-checked-children="关" />
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

      <div class="system-config-footer">
        <a-button @click="resetConfig">恢复默认</a-button>
        <a-button type="primary" @click="saveConfig">保存配置</a-button>
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
    max-width: 760px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 28px rgba(62, 88, 120, 0.08);
  }

  .system-config-header {
    padding-bottom: 18px;
    border-bottom: 1px dashed #e3ebf5;
  }

  .system-config-subtitle {
    margin-top: 6px;
    color: #858d98;
    font-size: 13px;
    line-height: 20px;
  }

  .system-config-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    padding: 22px 4px 20px;
    border-bottom: 1px dashed #e3ebf5;
  }

  .system-config-section__main {
    min-width: 0;
  }

  .system-config-section__title {
    color: #1f2733;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  }

  .system-config-section__desc {
    margin-top: 6px;
    color: #5f6a7a;
    font-size: 13px;
    line-height: 22px;
  }

  .system-config-fields {
    padding: 22px 4px 20px;
    border-bottom: 1px dashed #e3ebf5;
    transition: opacity 0.18s ease;
  }

  .system-config-fields.is-disabled {
    opacity: 0.58;
  }

  .system-config-field {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .system-config-field__label {
    width: 96px;
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
    width: 88px;
    border-radius: 8px;
  }

  .system-config-field__control :deep(.ant-input-number-input) {
    text-align: right;
  }

  .system-config-help {
    margin-top: 8px;
    padding-left: 114px;
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
</style>
