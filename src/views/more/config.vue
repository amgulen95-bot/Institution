<template>
  <div class="p-4 page-height">
    <div class="SmallCard formContainer" v-loading="settingModal.loading">
      <a-form :model="settingModal.form" class="overflow-y-scroll pt24px" style="height:calc(100% - 60px)" :labelCol="{ style: 'width: 180px' }" :wrapperCol="{span:8}" :rules="settingModal.rules" :scrollToFirstError="true" ref="formIns">
        <a-form-item label="零售价加成比例" name="RetailMarkupRate" extra="平台已设定零售价，您可在此基础上设置溢价比例。">
          <a-input-number id="inputNumber" v-model:value="settingModal.form.RetailMarkupRate" :min="0" :max="10" />
        </a-form-item>
        <a-form-item label="机构折扣率" name="Discount" extra="常用方药材折扣">
          <a-input-number id="inputNumber" v-model:value="settingModal.form.Discount" :min="0" :max="1" disabled />
        </a-form-item>
        <a-form-item label="挂号费" name="RegistrationFee" extra="单位：元">
          <a-input-number id="inputNumber" v-model:value="settingModal.form.RegistrationFee" :min="0" />
        </a-form-item>
        <div class="h95px"></div>
      </a-form>
      <div class="formSubmit">
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
</style>