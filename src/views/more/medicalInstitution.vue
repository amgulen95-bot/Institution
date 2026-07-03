<template>
  <div class="p-4 page-height">
    <div class="SmallCard formContainer" v-loading="settingModal.loading">
      <a-tabs v-model:activeKey="activeKey" type="card">
        <a-tab-pane :key="1" tab="医院设置"></a-tab-pane>
        <a-tab-pane :key="2" tab="证照资质"></a-tab-pane>
      </a-tabs>
      <a-form :model="settingModal.form" class="overflow-y-scroll" style="height:calc(100% - 60px)" :labelCol="{ style: 'width: 180px' }" :wrapperCol="{span:12}" :rules="settingModal.rules" :scrollToFirstError="true" ref="formIns">
        <div v-show="activeKey==1">
          <a-alert class="mb24px" message="请确保以下信息填写真实有效，开通微医院后，患者可在微医院中查看医疗机构信息" banner />
          <a-form-item label="机构名称" name="Name" extra="主要用于外部展示，如病历、处方、挂号单、收费单等各种打印单据上店名的展示，一般为营业执照上的名称">
            <a-input v-model:value="settingModal.form.Name" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item label="内部简称" name="InternalName" extra="主要用于内部展示，如系统上各个模块店名、微医院店名的展示。当连锁门店过多时，简称可以方便内部人员和患者快速区分不同门店">
            <a-input v-model:value="settingModal.form.InternalName" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item label="机构编码" name="Code">
            <a-input v-model:value="settingModal.form.Code" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item label="机构地址" name="RegionCode">
            <a-cascader v-model:value="settingModal.form.RegionCode" :show-search="true" @change="changeRegionData" :options="citiesList" :field-names="{ label: 'name', value: 'code', children: 'children' }" placeholder="请选择" />
          </a-form-item>
          <a-form-item label="详细地址" name="Address" extra="用于打印单据、微诊所等，方便患者了解机构位置">
            <a-input v-model:value="settingModal.form.Address" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item label="机构类型" name="OrgType">
            <a-select v-model:value="settingModal.form.OrgType" placeholder="请选择" allowClear showSearch optionFilterProp="title">
              <a-select-option :value="item.id" v-for="(item,index) in ClinicOrgType" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="机构等级" name="OrgLevel">
            <a-select v-model:value="settingModal.form.OrgLevel" placeholder="请选择" allowClear showSearch optionFilterProp="title">
              <a-select-option :value="item.id" v-for="(item,index) in ClinicOrgLevel" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="联系人" name="ContactName">
            <a-input v-model:value="settingModal.form.ContactName" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item label="联系电话" name="ContactPhone">
            <a-input v-model:value="settingModal.form.ContactPhone" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item label="备用电话" name="BackupPhone">
            <a-input v-model:value="settingModal.form.BackupPhone" placeholder="请填写"></a-input>
          </a-form-item>
          <a-divider />
          <a-form-item label="执业许可科目" name="PracticeSubjects">
            <a-input v-model:value="settingModal.form.PracticeSubjects" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item label="医疗机构执业许可证号" name="MedicalLicenseNo">
            <a-input v-model:value="settingModal.form.MedicalLicenseNo" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item label="医院Logo" name="Logo">
            <MediaPicker :max="1" formType="string" text="上传图片" :size="{height:104,width:104}" v-model:images="settingModal.form.Logo"/>
          </a-form-item>
        </div>

        <div v-show="activeKey==2">
          <a-alert class="mb24px" message="为符合医保、卫健等监管机构要求，请上传真实有效的证照资质。上传证照资质也将用于医保、卫健的结算、监管上报等业务开通" banner />
          <a-form-item label="营业执照" name="BusinessLicenseImg">
            <MediaPicker :max="1" formType="string" text="上传图片" :size="{height:104,width:104}" v-model:images="settingModal.form.BusinessLicenseImg"/>
          </a-form-item>
          <a-form-item label="备案证图片" name="FilingCertificateImg">
            <MediaPicker :max="1" formType="string" text="上传图片" :size="{height:104,width:104}" v-model:images="settingModal.form.FilingCertificateImg"/>
          </a-form-item>
          <a-divider />
          <a-form-item label="法人姓名" name="LegalPersonName">
            <a-input v-model:value="settingModal.form.LegalPersonName" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item label="法人手机号" name="LegalPersonPhone">
            <a-input v-model:value="settingModal.form.LegalPersonPhone" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item label="法人身份证正面" name="LegalPersonIdFront">
            <MediaPicker :max="1" formType="string" text="上传图片" :size="{height:104,width:104}" v-model:images="settingModal.form.LegalPersonIdFront"/>
          </a-form-item>
          <a-form-item label="法人身份证反面" name="LegalPersonIdBack">
            <MediaPicker :max="1" formType="string" text="上传图片" :size="{height:104,width:104}" v-model:images="settingModal.form.LegalPersonIdBack"/>
          </a-form-item>
        </div>
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
  import {Cities,basicEnum} from '/@/api/platform/common';
  import MediaPicker from '/@/components/AJ/MediaBrowser/MediaPicker.vue'

  const { createMessage} = useMessage()
  const formIns=ref()
  const activeKey=ref(1)
  const citiesList=ref([])
  const ClinicOrgType=ref([])
  const ClinicOrgLevel=ref([])
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
      ContactPhone: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      PracticeSubjects: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      BusinessLicenseImg: [{required: true,trigger: 'change',message: '该项必须选择',type:'string'}],
      FilingCertificateImg: [{required: true,trigger: 'change',message: '该项必须选择',type:'string'}],
      MedicalLicenseNo: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
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
</style>