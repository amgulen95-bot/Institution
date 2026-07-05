<template>
  <div class="p-4 page-height cloud-strategy-page">
    <div class="SmallCard cloud-strategy-card" v-loading="settingModal.loading">
      <div class="cloud-strategy-header">
        <div>
          <div class="cloud-strategy-title">云药房策略配置</div>
          <div class="cloud-strategy-subtitle">统一配置机构云药房加成、折扣与接诊挂号费策略。</div>
        </div>
        <div class="cloud-strategy-status">实时生效</div>
      </div>
      <a-form :model="settingModal.form" class="cloud-strategy-form" :labelCol="{ style: 'width: 180px' }" :wrapperCol="{span:12}" :rules="settingModal.rules" :scrollToFirstError="true" ref="formIns">
        <div class="cloud-strategy-section">
          <div class="cloud-strategy-section-title">云药房价格策略</div>
          <a-form-item label="零售价加成比例" name="RetailMarkupRate" extra="平台已设定零售价，您可在此基础上设置溢价比例。">
            <a-input-number class="cloud-strategy-number" v-model:value="settingModal.form.RetailMarkupRate" :min="0" :max="10" />
          </a-form-item>
          <a-form-item label="机构折扣率" name="Discount" extra="常用方药材折扣">
            <a-input-number class="cloud-strategy-number" v-model:value="settingModal.form.Discount" :min="0" :max="1" disabled />
          </a-form-item>
        </div>
        <div class="cloud-strategy-section">
          <div class="cloud-strategy-section-title">接诊收费策略</div>
          <a-form-item label="挂号费" name="RegistrationFee" extra="单位：元">
            <a-input-number class="cloud-strategy-number" v-model:value="settingModal.form.RegistrationFee" :min="0" />
          </a-form-item>
        </div>
      </a-form>
      <div class="cloud-strategy-submit">
        <a-button type="primary" @click="saveSetting" :loading="settingModal.loading">保存</a-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref,onMounted} from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { cloneDeep } from 'lodash-es';
  import {SettingApiCtrl} from '/@/api/myy/setting';

  const { createMessage} = useMessage()
  const formIns=ref()
  const settingModal=ref({
    loading:false,
    form:{
      RetailMarkupRate:null,
      Discount:null,
      RegistrationFee:null,
    },
    rules: {
      RetailMarkupRate: [{required: true,trigger: 'blur',message: '该项必须填写',type:'number'}],
      Discount: [{required: true,trigger: 'blur',message: '该项必须填写',type:'number'}],
      RegistrationFee: [{required: true,trigger: 'blur',message: '该项必须填写',type:'number'}],
    }
  })

  onMounted(() => {
    getSettingDetail()
  })

  const getSettingDetail=()=>{
    settingModal.value.loading=true
    SettingApiCtrl.SettingDetail({}).then(data=>{
      settingModal.value.form={
        RetailMarkupRate:data.Clinic.RetailMarkupRate,
        Discount:data.Clinic.Discount,
        RegistrationFee:data.Clinic.RegistrationFee
      }
    }).catch(() => {}).finally(() => {settingModal.value.loading=false })
  }

  const saveSetting=()=>{
    formIns.value.validate().then(() => {
      settingModal.value.loading = true
      const formData=cloneDeep(settingModal.value.form)
      SettingApiCtrl.SaveCloudPharmacyStrategy(formData).then(data=>{
        createMessage.success('保存成功')
        getSettingDetail()
      }).catch(() => {}).finally(() => {settingModal.value.loading=false })
    }).catch((err) => {})
  }
</script>
<style lang="less" scoped>
.cloud-strategy-page {
  .cloud-strategy-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 18px;
    overflow: hidden;
    border-radius: 12px;
    background: #fff;
  }

  .cloud-strategy-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    margin-bottom: 16px;
    border: 1px solid #E8EEF7;
    border-radius: 12px;
    background: #F9FBFD;
  }

  .cloud-strategy-title {
    color: #1F2B3D;
    font-size: 18px;
    font-weight: 500;
    line-height: 26px;
  }

  .cloud-strategy-subtitle {
    margin-top: 4px;
    color: #6D7787;
    font-size: 13px;
    line-height: 20px;
  }

  .cloud-strategy-status {
    display: inline-flex;
    align-items: center;
    height: 30px;
    padding: 0 12px;
    color: #0A5AFF;
    font-size: 13px;
    font-weight: 400;
    border: 1px solid #D8E6FF;
    border-radius: 8px;
    background: #EEF5FF;
  }

  .cloud-strategy-form {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding-right: 10px;
    scrollbar-gutter: stable;
  }

  .cloud-strategy-form::-webkit-scrollbar {
    width: 8px;
  }

  .cloud-strategy-form::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: #C7D7F0;
  }

  .cloud-strategy-form::-webkit-scrollbar-track {
    background: transparent;
  }

  .cloud-strategy-section {
    padding: 18px 20px 4px;
    margin-bottom: 14px;
    border: 1px solid #E8EEF7;
    border-radius: 12px;
    background: #fff;
  }

  .cloud-strategy-section-title {
    padding-bottom: 12px;
    margin-bottom: 16px;
    color: #1F2B3D;
    font-size: 15px;
    font-weight: 500;
    line-height: 22px;
    border-bottom: 1px dashed #DCE6F5;
  }

  :deep(.cloud-strategy-section .ant-form-item) {
    margin-bottom: 18px;
  }

  :deep(.cloud-strategy-section .ant-form-item-label > label) {
    color: #5F6A7A;
    font-weight: 400;
  }

  :deep(.cloud-strategy-section .ant-form-item-extra) {
    color: #858D98;
    font-size: 12px;
    line-height: 18px;
  }

  :deep(.cloud-strategy-number) {
    width: 220px;
    border-radius: 8px !important;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  :deep(.cloud-strategy-number:hover),
  :deep(.cloud-strategy-number-focused) {
    border-color: @primary-color !important;
    box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
  }

  :deep(.cloud-strategy-number .ant-input-number-input) {
    padding-right: 34px;
    text-align: right;
  }

  :deep(.cloud-strategy-number.ant-input-number-disabled) {
    color: #6D7787;
    background: #F9FBFD;
  }

  .cloud-strategy-submit {
    display: flex;
    justify-content: flex-end;
    padding: 14px 20px 2px;
    border-top: 1px dashed #DCE6F5;
  }

  .cloud-strategy-submit .ant-btn {
    min-width: 120px;
    border-radius: 8px;
  }
}
</style>
