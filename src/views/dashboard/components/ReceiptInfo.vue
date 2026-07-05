<template>
  <div>
    <a-modal v-model:open="receiptModal.visible" title="请输入用药人收货信息"  centered width="800px" wrapClassName="receipt-info-modal" @ok="confirm" :maskClosable="false" destroyOnClose>
      <div class="padding-lr32">
        <div class="p-16px border-rd-8px bg-[#F9FBFD] flex">
          <img class="w40px h40px border-rd-50%" src="../../../assets//images/userAvatar1.png" alt="">
          <div class="ml8px flex-sub">
            <div class="flex justify-between align-center">
              <div class="flex align-center">
                <div class="text-16px">{{patient.Name}}</div>
                <ManOutlined class="color-[#0A5AFF] ml4px" v-if="patient.Gender==1" />
                <WomanOutlined class="color-[#f52468] ml4px" v-else />
                <div class="color-[#858D98] ml8px ">{{patient.Age}}岁</div>
              </div>
              <div class="color-[#F74344] text-bold flex align-end">
                <div class="text-12px">￥</div>
                <div class="text-18px">{{total}}</div>
              </div>
            </div>
            <div class="flex align-center mt16px">
              <div class="flex-sub">
                <span class="color-[#4E5766]">病历编号：</span>
                <span>{{visitId}}</span>
              </div>
              <div class="flex-sub">
                <span class="color-[#4E5766]">开方日期：</span>
                <span>{{ createDate }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="p-16px border-rd-8px border border-color-[#0A5AFF] mt12px">
          <div class="flex justify-between align-center">
            <div class="flex align-center">
              <img class="w18px h18px" src="../../../assets//images/recognizeIcon.png" alt="">
              <div class="text-bold color-[#0A5AFF] ml4px">智能粘贴</div>
            </div>
            <a-space>
              <a-button size="small" @click="address=''">清除</a-button>
              <a-button type="primary" ghost size="small" @click="handleIdentify">识别</a-button>
            </a-space>
          </div>
          <a-textarea v-model:value="address" placeholder="粘贴文本到此处，将自动识别收货信息" :bordered="false" :rows="1" />
        </div>
      </div>
      
      <section class="padding-lr32 formModal mt24px">
        <a-form :model="receiptModal.form" :rules="receiptModal.rules" ref="formIns" :labelCol="{ style: 'width: 100px' }" :wrapperCol="{span:16}">
          <a-form-item label="快捷地址">
            <a-space>
              <a-button type="primary" ghost>微信扫码上传</a-button>
              <a-button type="primary" @click="handleInstitutionalAddress">默认机构地址</a-button>
            </a-space>
          </a-form-item>
          <a-form-item label="收货人" name="ReceiverName">
            <a-input v-model:value="receiptModal.form.ReceiverName" placeholder="请输入收货人姓名"></a-input>
          </a-form-item>
          <a-form-item label="联系电话" name="ReceiverPhone">
            <a-input v-model:value="receiptModal.form.ReceiverPhone" placeholder="请输入电话号码" :maxlength="11" @input="handleReceiverPhoneInput"></a-input>
          </a-form-item>
          <a-form-item label="省市区" name="RegionCode">
            <a-cascader v-model:value="receiptModal.form.RegionCode" @change="changeRegionData" :options="citiesList" :field-names="{ label: 'name', value: 'code', children: 'children' }" placeholder="请选择" />
          </a-form-item>
          <a-form-item label="详细地址" name="ReceiverAddress">
            <a-input v-model:value="receiptModal.form.ReceiverAddress" placeholder="请输入具体街道/小区/楼牌号"></a-input>
          </a-form-item>
        </a-form>
      </section>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { ref,onMounted,watch} from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { formatToDateTime } from '/@/utils/dateUtil'
  import {Cities,AddressAnalysis} from '/@/api/platform/common';
  import {WomanOutlined,ManOutlined} from '@ant-design/icons-vue';
  import { useUserStore } from '@/store/modules/user';

  const userStore = useUserStore();
  const { createMessage } = useMessage()
  const props = defineProps({
    patient:{ type: Object, default:{}},
    total:{ type: Number, default:0},
    visitId:{ type: String, default:''},
    visible: { type: Boolean, default: false },
  });
  const emit = defineEmits(['update:visible', 'confirm'])
  const formIns=ref()
  const address=ref('')
  const citiesList=ref([])
  const createDate=ref(formatToDateTime(new Date()))
  const receiptForm={
    ReceiverName:'',
    ReceiverPhone:'',
    ReceiverAddress:'',
    RegionCode:[],
    RegionData:[],
  }
  const receiptModal=ref({
    loading:false,
    visible:false,
    form:cloneDeep(receiptForm),
    rules: {
      ReceiverName: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      ReceiverPhone: [{required: true,trigger: 'blur',validator: validateReceiverPhone}],
      ReceiverAddress: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      RegionCode: [{required: true,trigger: 'change',message: '该项必须选择',type:'array'}],
    }
  })
  
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      receiptModal.value.visible = true
    }
  })
  watch(() => receiptModal.value.visible, (newVal) => {
    if (!newVal) {
      emit('update:visible', false)
      formIns.value?.resetFields()
    }
  })

  onMounted(()=>{
    getCities()
  })

    // 获取地址列表
  const getCities=()=>{
    Cities().then(data=>{
      citiesList.value=data
    })
  }

  const normalizeReceiverPhone = () => {
    receiptModal.value.form.ReceiverPhone = String(receiptModal.value.form.ReceiverPhone || '').replace(/\D/g, '').slice(0, 11)
  }

  function validateReceiverPhone(_rule, value) {
    const phone = String(value || '').trim()
    if (!phone) {
      return Promise.reject('该项必须填写')
    }
    if (!/^\d{11}$/.test(phone)) {
      return Promise.reject('请输入11位数字手机号')
    }
    return Promise.resolve()
  }

  const handleReceiverPhoneInput = () => {
    normalizeReceiverPhone()
  }

  const handleIdentify = async () => {
    if (address.value == '') {
      createMessage.warning('请输入需要识别的信息')
      return
    }
    receiptModal.value.loading = true

    try {
      const data = await AddressAnalysis({ address: address.value })
      let addressinfo = data

      if (!addressinfo.ad_info.adcode) {
        createMessage.error('地址识别失败，请手动输入地址')
        return;
      }

      let addressArray=[{
        Code: addressinfo.ad_info.adcode,
        Name: addressinfo.address_components.province
      },{
        Code: addressinfo.ad_info.adcode,
        Name: addressinfo.address_components.city
      },{
        Code: addressinfo.ad_info.adcode,
        Name: addressinfo.address_components.district
      }]
      const uniqueCodes = [...new Set(addressArray.map(item => item.Code))];
      receiptModal.value.form.RegionCode = [...new Set(
        uniqueCodes.flatMap(code => [
          code.substring(0, 2),
          code.substring(0, 4),
          code
        ])
      )]
      receiptModal.value.form.RegionData = addressArray.map((item, index) => {
        return {
          Code: receiptModal.value.form.RegionCode[index],
          Name: item.Name
        }
      })
      const response = await fetch('https://uni.qishangke.com/address-master/query.php?address='+address.value)
      if (!response.ok) {
        throw new Error(`请求失败，状态码: ${response.status}`)
      }
      const extraData = await response.json()
      receiptModal.value.form.ReceiverName = extraData.name
      receiptModal.value.form.ReceiverPhone = extraData.mobile
      normalizeReceiverPhone()
      receiptModal.value.form.ReceiverAddress = extraData.street
    } catch (error) {
      createMessage.error('识别或请求异常，请稍后重试')
    } finally {
      receiptModal.value.loading = false
    }
  }

  const changeRegionData=(e,list)=>{
    if(list.length){
      receiptModal.value.form.RegionData=list.map(item=>{
        return {
          Code:item.code,
          Name:item.name
        }
      })
    }
  }

  const handleInstitutionalAddress=()=>{
    let userInfo=userStore.getUserInfo
    receiptModal.value.form.ReceiverName = userInfo.Clinic.ContactName
    receiptModal.value.form.ReceiverPhone = userInfo.Clinic.ContactPhone
    normalizeReceiverPhone()
    receiptModal.value.form.ReceiverAddress = userInfo.Clinic.Address

    receiptModal.value.form.RegionCode = [userInfo.Clinic.ProvinceCode,userInfo.Clinic.CityCode,userInfo.Clinic.DistrictCode]
    receiptModal.value.form.RegionData = [
      {
        Code: userInfo.Clinic.ProvinceCode,
        Name: userInfo.Clinic.Province,
      },{
        Code: userInfo.Clinic.CityCode,
        Name: userInfo.Clinic.City,
      },{
        Code: userInfo.Clinic.DistrictCode,
        Name: userInfo.Clinic.District,
      }
    ]
  }
  
  const confirm=()=>{
    normalizeReceiverPhone()
    formIns.value.validate().then(() => {
      receiptModal.value.loading = true
      const formData = cloneDeep(receiptModal.value.form)
      formData.RegionData=JSON.stringify(formData.RegionData)
      createMessage.success('保存成功')
      receiptModal.value.form=cloneDeep(receiptForm)
      receiptModal.value.visible = false
      emit('update:visible',false);
      emit('confirm',formData)
    })
  }
</script>
<style lang="less" scoped>
:global(.receipt-info-modal .ant-modal-content) {
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 14px 36px rgb(32 56 85 / 14%);
}

:global(.receipt-info-modal .ant-modal-header) {
  border-bottom: 1px solid #f0f2f5;
}

:global(.receipt-info-modal .ant-modal-title) {
  font-weight: 400;
}

:global(.receipt-info-modal .ant-modal-footer .ant-btn),
:global(.receipt-info-modal .ant-btn) {
  border-radius: 8px;
}

:global(.receipt-info-modal .ant-input),
:global(.receipt-info-modal .ant-select-selector),
:global(.receipt-info-modal .ant-cascader-picker) {
  border-radius: 8px;
}
</style>
