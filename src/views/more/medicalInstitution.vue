<template>
  <div class="p-4 page-height medical-institution-page">
    <div class="SmallCard formContainer medical-institution-card" v-loading="settingModal.loading">
      <div class="medical-institution-header">
        <div>
          <div class="medical-institution-title">医疗机构信息</div>
          <div class="medical-institution-subtitle">维护机构基础资料、证照资质与对外展示信息</div>
        </div>
        <span class="medical-institution-badge">{{ activeKey == 1 ? '医院设置' : '证照资质' }}</span>
      </div>

      <a-tabs class="medical-institution-tabs" v-model:activeKey="activeKey" type="card">
        <a-tab-pane :key="1" tab="医院设置"></a-tab-pane>
        <a-tab-pane :key="2" tab="证照资质"></a-tab-pane>
      </a-tabs>

      <a-form :model="settingModal.form" class="medical-institution-form" :labelCol="{ style: 'width: 180px' }" :wrapperCol="{span:24}" :rules="settingModal.rules" :scrollToFirstError="true" ref="formIns">
        <div v-show="activeKey==1" class="medical-institution-pane">
          <a-alert class="medical-institution-alert" message="请确保以下信息填写真实有效，开通微医院后，患者可在微医院中查看医疗机构信息" banner />

          <section class="medical-institution-section">
            <div class="medical-institution-section-header">
              <div>
                <div class="medical-institution-section-title">基础信息</div>
                <div class="medical-institution-section-desc">用于系统内部识别、对外单据展示和机构基础档案维护。</div>
              </div>
            </div>
            <div class="medical-institution-grid">
          <a-form-item class="medical-institution-field is-wide" label="机构名称" name="Name" extra="主要用于外部展示，如病历、处方、挂号单、收费单等各种打印单据上店名的展示，一般为营业执照上的名称">
            <a-input v-model:value="settingModal.form.Name" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item class="medical-institution-field is-wide" label="内部简称" name="InternalName" extra="主要用于内部展示，如系统上各个模块店名、微医院店名的展示。当连锁门店过多时，简称可以方便内部人员和患者快速区分不同门店">
            <a-input v-model:value="settingModal.form.InternalName" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item class="medical-institution-field" label="机构编码" name="Code">
            <a-input v-model:value="settingModal.form.Code" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item class="medical-institution-field" label="机构地址" name="RegionCode">
            <a-cascader v-model:value="settingModal.form.RegionCode" popupClassName="medical-institution-cascader-dropdown" :get-popup-container="(trigger) => trigger.parentElement" :show-search="true" @change="changeRegionData" :options="citiesList" :field-names="{ label: 'name', value: 'code', children: 'children' }" placeholder="请选择" />
          </a-form-item>
          <a-form-item class="medical-institution-field is-wide" label="详细地址" name="Address" extra="用于打印单据、微诊所等，方便患者了解机构位置">
            <a-input v-model:value="settingModal.form.Address" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item class="medical-institution-field" label="机构类型" name="OrgType">
            <a-select v-model:value="settingModal.form.OrgType" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="medical-institution-select-dropdown" :listHeight="220" :virtual="false" :get-popup-container="(trigger) => trigger.parentElement">
              <a-select-option :value="item.id" v-for="(item,index) in ClinicOrgType" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item class="medical-institution-field" label="机构等级" name="OrgLevel">
            <a-select v-model:value="settingModal.form.OrgLevel" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="medical-institution-select-dropdown" :listHeight="220" :virtual="false" :get-popup-container="(trigger) => trigger.parentElement">
              <a-select-option :value="item.id" v-for="(item,index) in ClinicOrgLevel" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
            </div>
          </section>

          <section class="medical-institution-section">
            <div class="medical-institution-section-header">
              <div>
                <div class="medical-institution-section-title">联系与执业信息</div>
                <div class="medical-institution-section-desc">用于机构运营联系、监管备案和处方单据展示。</div>
              </div>
            </div>
            <div class="medical-institution-grid">
          <a-form-item class="medical-institution-field" label="联系人" name="ContactName">
            <a-input v-model:value="settingModal.form.ContactName" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item class="medical-institution-field" label="联系电话" name="ContactPhone">
            <a-input v-model:value="settingModal.form.ContactPhone" placeholder="请填写" :maxlength="11"></a-input>
          </a-form-item>
          <a-form-item class="medical-institution-field" label="备用电话" name="BackupPhone">
            <a-input v-model:value="settingModal.form.BackupPhone" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item class="medical-institution-field" label="执业许可科目" name="PracticeSubjects">
            <a-input v-model:value="settingModal.form.PracticeSubjects" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item class="medical-institution-field is-wide medical-institution-license-field" label="医疗机构执业许可证号" name="MedicalLicenseNo">
            <a-input v-model:value="settingModal.form.MedicalLicenseNo" placeholder="请填写"></a-input>
          </a-form-item>
            </div>
          </section>

          <section class="medical-institution-section">
            <div class="medical-institution-section-header">
              <div>
                <div class="medical-institution-section-title">机构标识</div>
                <div class="medical-institution-section-desc">用于登录、打印、微医院等位置的机构形象展示。</div>
              </div>
            </div>
          <a-form-item class="medical-institution-upload-field" label="医院Logo" name="Logo">
            <MediaPicker :max="1" formType="string" text="上传图片" :size="{height:104,width:104}" v-model:images="settingModal.form.Logo"/>
          </a-form-item>
          </section>
        </div>

        <div v-show="activeKey==2" class="medical-institution-pane">
          <a-alert class="medical-institution-alert" message="为符合医保、卫健等监管机构要求，请上传真实有效的证照资质。上传证照资质也将用于医保、卫健的结算、监管上报等业务开通" banner />

          <section class="medical-institution-section">
            <div class="medical-institution-section-header">
              <div>
                <div class="medical-institution-section-title">机构证照</div>
                <div class="medical-institution-section-desc">上传真实有效证照，便于医保、卫健监管和业务开通。</div>
              </div>
            </div>
            <div class="medical-institution-upload-grid is-compact">
          <a-form-item class="medical-institution-upload-field" label="营业执照" name="BusinessLicenseImg">
            <MediaPicker :max="1" formType="string" text="上传图片" :size="{height:104,width:104}" v-model:images="settingModal.form.BusinessLicenseImg"/>
          </a-form-item>
          <a-form-item class="medical-institution-upload-field medical-institution-long-upload-field" label="备案证/医疗机构执业许可证图片" name="FilingCertificateImg">
            <MediaPicker :max="1" formType="string" text="上传图片" :size="{height:104,width:104}" v-model:images="settingModal.form.FilingCertificateImg"/>
          </a-form-item>
            </div>
          </section>

          <section class="medical-institution-section">
            <div class="medical-institution-section-header">
              <div>
                <div class="medical-institution-section-title">法人信息</div>
                <div class="medical-institution-section-desc">用于机构实名资质审核和监管备案留档。</div>
              </div>
            </div>
            <div class="medical-institution-grid">
          <a-form-item class="medical-institution-field" label="法人姓名" name="LegalPersonName">
            <a-input v-model:value="settingModal.form.LegalPersonName" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item class="medical-institution-field" label="法人手机号" name="LegalPersonPhone">
            <a-input v-model:value="settingModal.form.LegalPersonPhone" placeholder="请填写" :maxlength="11"></a-input>
          </a-form-item>
            </div>
            <div class="medical-institution-upload-grid is-compact">
          <a-form-item class="medical-institution-upload-field" label="法人身份证正面" name="LegalPersonIdFront">
            <MediaPicker :max="1" formType="string" text="上传图片" :size="{height:104,width:104}" v-model:images="settingModal.form.LegalPersonIdFront"/>
          </a-form-item>
          <a-form-item class="medical-institution-upload-field" label="法人身份证反面" name="LegalPersonIdBack">
            <MediaPicker :max="1" formType="string" text="上传图片" :size="{height:104,width:104}" v-model:images="settingModal.form.LegalPersonIdBack"/>
          </a-form-item>
            </div>
          </section>
        </div>
        <div class="h95px"></div>
      </a-form>
      <div class="formSubmit medical-institution-submit">
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
  import {Cities,basicEnum} from '/@/api/platform/common';
  import MediaPicker from '/@/components/AJ/MediaBrowser/MediaPicker.vue'

  const { createMessage} = useMessage()
  const formIns=ref()
  const activeKey=ref(1)
  const citiesList=ref([])
  const ClinicOrgType=ref([])
  const ClinicOrgLevel=ref([])
  const phonePattern = /^1\d{10}$/
  const validateRequiredPhone = async (_rule, value) => {
    if (!value) {
      return Promise.reject('该项必须填写')
    }
    if (!phonePattern.test(String(value))) {
      return Promise.reject('请输入11位数字手机号')
    }
    return Promise.resolve()
  }
  const validateOptionalPhone = async (_rule, value) => {
    if (!value) {
      return Promise.resolve()
    }
    if (!phonePattern.test(String(value))) {
      return Promise.reject('请输入11位数字手机号')
    }
    return Promise.resolve()
  }
  const settingModal=ref({
    loading:false,
    form:{
      Name:'',
      InternalName:'',
      Code:'',
      Logo:'',
      OrgType:null,
      OrgLevel:null,
      RegionCode:[],
      Address:'',
      Province:'',
      ProvinceCode:'',
      City:'',
      CityCode:'',
      District:'',
      DistrictCode:'',
      ContactName:'',
      ContactPhone:'',
      BackupPhone:'',
      PracticeSubjects:'',
      BusinessLicenseImg:'',
      FilingCertificateImg:'',
      MedicalLicenseNo:'',
      LegalPersonName:'',
      LegalPersonPhone:'',
      LegalPersonIdFront:'',
      LegalPersonIdBack:'',
    },
    rules: {
      Name: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      InternalName: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      Code: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      Logo: [{required: true,trigger: 'change',message: '该项必须选择',type:'string'}],
      OrgType: [{required: true,trigger: 'change',message: '该项必须选择',type:'number'}],
      OrgLevel: [{required: true,trigger: 'change',message: '该项必须选择',type:'number'}],
      RegionCode: [{required: true,trigger: 'change',message: '该项必须选择',type:'array'}],
      Address: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      ContactName: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      ContactPhone: [{required: true,trigger: ['blur', 'change'], validator: validateRequiredPhone}],
      PracticeSubjects: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      BusinessLicenseImg: [{required: true,trigger: 'change',message: '该项必须选择',type:'string'}],
      FilingCertificateImg: [{required: true,trigger: 'change',message: '该项必须选择',type:'string'}],
      MedicalLicenseNo: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      LegalPersonPhone: [{trigger: ['blur', 'change'], validator: validateOptionalPhone}],
    }
  })

  onMounted(() => {
    getBasicEnum()
    getCities()
    getSettingDetail()
  })

  // 获取枚举
  const getBasicEnum=()=>{
    basicEnum({name:'ClinicOrgType'}).then(data=>{
      ClinicOrgType.value=data
    })
    basicEnum({name:'ClinicOrgLevel'}).then(data=>{
      ClinicOrgLevel.value=data
    })
  }

  // 获取地址列表
  const getCities=()=>{
    Cities().then(data=>{
      citiesList.value=data
    })
  }

  const changeRegionData=(e,list)=>{
    if(list.length){
      settingModal.value.form.Province=list[0].name
      settingModal.value.form.ProvinceCode=list[0].code
      settingModal.value.form.City=list[1].name
      settingModal.value.form.CityCode=list[1].code
      settingModal.value.form.District=list[2].name
      settingModal.value.form.DistrictCode=list[2].code
    }
  }

  const getSettingDetail=()=>{
    settingModal.value.loading=true
    SettingApiCtrl.SettingDetail({}).then(data=>{
      settingModal.value.form=cloneDeep(data.Clinic)
      settingModal.value.form.BusinessLicenseImg=settingModal.value.form.BusinessLicenseImg||''
      settingModal.value.form.FilingCertificateImg=settingModal.value.form.FilingCertificateImg||''
      settingModal.value.form.LegalPersonIdFront=settingModal.value.form.LegalPersonIdFront||''
      settingModal.value.form.LegalPersonIdBack=settingModal.value.form.LegalPersonIdBack||''
      settingModal.value.form.Logo=settingModal.value.form.Logo||''
      settingModal.value.form.RegionCode=[settingModal.value.form.ProvinceCode,settingModal.value.form.CityCode,settingModal.value.form.DistrictCode]
    }).catch(() => {}).finally(() => {settingModal.value.loading=false })
  }

  const saveSetting=()=>{
    formIns.value.validate().then(() => {
      settingModal.value.loading = true
      const formData=cloneDeep(settingModal.value.form)
      SettingApiCtrl.SaveInstitutionInfo(formData).then(data=>{
        createMessage.success('保存成功')
        getSettingDetail()
      }).catch(() => {}).finally(() => {settingModal.value.loading=false })
    }).catch((err) => {
      if(err.errorFields[0].name[0]=='BusinessLicenseImg'){
        let isRequired=err.errorFields.some(item =>item.name[0]=='BusinessLicenseImg'||item.name[0]=='FilingCertificateImg')
        if(isRequired){
          activeKey.value=2
        }
      }else{
        activeKey.value=1
      }
    })
  }
</script>
<style lang="less" scoped>
  .medical-institution-page {
    background: #f4f7f9;
  }

  .medical-institution-card {
    position: relative;
    overflow: hidden;
    border: 1px solid #e8eef7;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 10px 28px rgba(62, 88, 120, 0.06);
  }

  .medical-institution-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 22px 16px;
    border-bottom: 1px dashed #dce6f5;
  }

  .medical-institution-title {
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

  .medical-institution-subtitle {
    margin-top: 6px;
    color: #858d98;
    font-size: 13px;
    line-height: 20px;
  }

  .medical-institution-badge {
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

  .medical-institution-tabs {
    padding: 14px 22px 0;

    :deep(.ant-tabs-nav) {
      margin-bottom: 14px;
    }

    :deep(.ant-tabs-nav::before) {
      border-bottom-color: #e8eef7;
    }

    :deep(.ant-tabs-tab) {
      min-width: 104px;
      justify-content: center;
      border-color: #e8eef7;
      border-radius: 8px 8px 0 0 !important;
      background: #f9fbfd;
      color: #5f6a7a;
      font-size: 14px;
      font-weight: 400;
      transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
    }

    :deep(.ant-tabs-tab-active) {
      border-color: #dce6f5 !important;
      background: #fff !important;
    }

    :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
      color: #0a5aff;
      font-weight: 500;
    }
  }

  .medical-institution-form {
    height: calc(100% - 142px);
    overflow-y: auto;
    padding: 0 22px;
    scrollbar-gutter: stable;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-thumb {
      border: 2px solid #fff;
      border-radius: 999px;
      background: #d8e2f2;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  .medical-institution-pane {
    padding-bottom: 8px;
  }

  .medical-institution-alert {
    margin-bottom: 14px;
    border: 1px solid #dce6f5;
    border-radius: 10px;
    background: #f9fbfd;
    color: #5f6a7a;

    :deep(.ant-alert-message) {
      color: #5f6a7a;
      font-size: 13px;
      font-weight: 400;
      line-height: 22px;
    }
  }

  .medical-institution-section {
    margin-bottom: 14px;
    overflow: hidden;
    border: 1px solid #e8eef7;
    border-radius: 12px;
    background: #fff;
  }

  .medical-institution-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px dashed #dce6f5;
    background: #f9fbfd;
  }

  .medical-institution-section-title {
    color: #1d2533;
    font-size: 15px;
    font-weight: 500;
    line-height: 22px;
  }

  .medical-institution-section-desc {
    margin-top: 4px;
    color: #858d98;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }

  .medical-institution-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2px 18px;
    padding: 18px 18px 4px;
  }

  .medical-institution-field {
    min-width: 0;
  }

  .medical-institution-field.is-wide {
    grid-column: span 2;
  }

  .medical-institution-upload-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 18px;
    padding: 18px 18px 8px;
  }

  .medical-institution-upload-grid.is-compact {
    grid-template-columns: minmax(276px, 336px) minmax(392px, 480px);
    justify-content: flex-start;
    gap: 0 24px;
  }

  .medical-institution-upload-field {
    min-width: 0;
    padding-bottom: 6px;
  }

  .medical-institution-long-upload-field {
    max-width: 480px;
  }

  .medical-institution-long-upload-field :deep(.ant-form-item-label) {
    flex: 0 0 232px !important;
    max-width: 232px !important;
  }

  .medical-institution-long-upload-field :deep(.ant-form-item-label > label) {
    align-items: flex-start;
    height: auto;
    min-height: 40px;
    white-space: normal;
    line-height: 20px;
  }

  .medical-institution-form :deep(.ant-form-item) {
    margin-bottom: 16px;
  }

  .medical-institution-form :deep(.ant-form-item-label > label) {
    color: #5f6a7a;
    font-size: 14px;
    font-weight: 400;
    white-space: nowrap;
  }

  .medical-institution-license-field :deep(.ant-form-item-label) {
    flex: 0 0 180px !important;
    max-width: 180px !important;
  }

  .medical-institution-license-field :deep(.ant-form-item-label > label) {
    font-size: 13px;
  }

  .medical-institution-form :deep(.ant-form-item-extra) {
    margin-top: 6px;
    color: #858d98;
    font-size: 12px;
    line-height: 18px;
  }

  .medical-institution-form :deep(.ant-input),
  .medical-institution-form :deep(.ant-select-selector),
  .medical-institution-form :deep(.ant-cascader-picker) {
    min-height: 36px;
    border-color: #dce6f5;
    border-radius: 8px;
    background: #fff;
    color: #1d2533;
    font-size: 14px;
    font-weight: 400;
    box-shadow: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }

  .medical-institution-form :deep(.ant-input:hover),
  .medical-institution-form :deep(.ant-input:focus),
  .medical-institution-form :deep(.ant-select:hover .ant-select-selector),
  .medical-institution-form :deep(.ant-select-focused .ant-select-selector),
  .medical-institution-form :deep(.ant-cascader-picker:hover),
  .medical-institution-form :deep(.ant-cascader-picker-focused) {
    border-color: #0a5aff !important;
    box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
  }

  .medical-institution-form :deep(.ant-input-affix-wrapper .ant-input),
  .medical-institution-form :deep(.ant-input-affix-wrapper .ant-input:hover),
  .medical-institution-form :deep(.ant-input-affix-wrapper .ant-input:focus) {
    border: 0 !important;
    box-shadow: none !important;
  }

  .medical-institution-form :deep(.ant-select-selection-placeholder),
  .medical-institution-form :deep(.ant-cascader-picker-label),
  .medical-institution-form :deep(.ant-input::placeholder) {
    color: #a4acb7;
  }

  .medical-institution-form :deep(.ant-form-item-explain-error) {
    padding-top: 4px;
    color: #f74344;
    font-size: 12px;
    line-height: 18px;
  }

  .medical-institution-upload-field :deep(.ant-btn) {
    border-radius: 8px;
  }

  .medical-institution-submit {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 72px;
    padding: 0 22px;
    border-top: 1px dashed #dce6f5;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(8px);

    :deep(.ant-btn) {
      min-width: 112px;
      height: 36px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 400;
    }
  }

  :deep(.medical-institution-select-dropdown),
  :global(.medical-institution-cascader-dropdown) {
    overflow: hidden;
    border: 1px solid #dce6f5;
    border-radius: 10px;
    box-shadow: 0 10px 28px rgba(62, 88, 120, 0.12);
  }

  :deep(.medical-institution-select-dropdown .ant-select-item),
  :global(.medical-institution-cascader-dropdown .ant-cascader-menu-item) {
    min-height: 34px;
    color: #1d2533;
    font-size: 14px;
    font-weight: 400;
    transition: background 0.16s ease, color 0.16s ease;
  }

  :deep(.medical-institution-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled)),
  :global(.medical-institution-cascader-dropdown .ant-cascader-menu-item-active),
  :global(.medical-institution-cascader-dropdown .ant-cascader-menu-item:hover) {
    background: #eef5ff;
  }

  @media (max-width: 1280px) {
    .medical-institution-grid,
    .medical-institution-upload-grid {
      grid-template-columns: 1fr;
    }

    .medical-institution-upload-grid.is-compact {
      grid-template-columns: 1fr;
    }

    .medical-institution-field.is-wide {
      grid-column: span 1;
    }
  }
</style>
