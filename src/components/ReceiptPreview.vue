<template>
  <div>
    <div class="receipt-paper printJS-form" ref="printAreaRef">
      <div class="text-center mb24px">
        <img class="h-8 mx-auto mb8px" v-if="config.headerInfo.includes('logo')"  src="../assets/images/logo.png" alt="">
        <h2 class="text-20px font-bold">{{ config.headerName || '蒙医云蒙医医院' }}</h2>
        <h2 class="text-20px font-bold">{{ config.headerSubtitle}}</h2>
        <p class="text-14px">挂号单</p>
        <img class="w168px h28px" v-if="config.headerInfo.includes('visitCode')" src="../assets/images/barcode.png" alt="">
      </div>
      <div class="text-16px">
        <div class="mb4px">
          <span>姓名：</span>
          <span>
            <span v-if="config.privacy.includes('hideName')">
              {{ maskString(receiptInfo.patientName) }}
            </span>
            <span v-else>{{ receiptInfo.patientName }}</span>
            <span v-if="config.patientInfo.includes('gender')" class="ml-2">{{ receiptInfo.gender }}</span>
            <span v-if="config.patientInfo.includes('age')" class="ml-2">{{ receiptInfo.age }}岁</span>
          </span>
        </div>
        <div v-if="config.patientInfo.includes('mobile')" class="mb4px">
           <span>手机：</span>
           <span>
             <span v-if="config.privacy.includes('hideMobile')">
               {{ maskString(receiptInfo.mobile) }}
             </span>
             <span v-else>{{ receiptInfo.mobile }}</span>
           </span>
        </div>
        <div v-if="config.patientInfo.includes('idCard')" class="mb4px">
          <span>身份证：</span>
          <span>{{maskString(receiptInfo.idCard)}}</span>
        </div>
        <div v-if="config.patientInfo.includes('doctor')" class="mb4px">
          <span>医生：</span>
          <span>{{ receiptInfo.doctorName }}</span>
        </div>
        <div class="mb4px">
          <span>科室：</span>
          <span>{{ receiptInfo.deptName }}</span>
        </div>
        <div v-if="config.patientInfo.includes('diagnosisNo')" class="mb4px">
          <span>诊号：</span>
          <span class="font-bold">{{ receiptInfo.sequenceNo }}</span>
        </div>
      </div>
      <div class="border-t border-dashed border-gray my-12px"></div>
      <div>
        <div class="mb4px">
          <span>就诊日期：</span>
          <span>{{ receiptInfo.visitDate }}</span>
        </div>
      </div>
      <div class="border-t border-dashed border-gray my-12px"></div>
      <div v-if="config.showChargeItems">
        <!-- <div>
          <span>项目名称</span>
          <span>金额</span>
        </div> -->
        <div v-for="(item, index) in receiptInfo.items" :key="index">
          <span>{{ item.name }}</span>
          <span>{{ item.price }}</span>
        </div>
      </div>
      <div>
        <div v-if="config.cashierInfo.includes('total')" class="mb4px">
          <span>金额：</span>
          <span>{{ receiptInfo.totalAmount }}元</span>
        </div>
        <div v-if="config.cashierInfo.includes('discount') && receiptInfo.discountAmount > 0" class="mb4px">
          <span>优惠：</span>
          <span>-{{ receiptInfo.discountAmount }}元</span>
        </div>
        <div v-if="config.cashierInfo.includes('payable')" class="mb4px">
          <span>应付：</span>
          <span>{{ receiptInfo.payableAmount }}元</span>
        </div>
        <div v-if="config.cashierInfo.includes('paid')" class="mb4px">
          <span>实付：</span>
          <template v-if="receiptInfo.payMethod!=null">
            <span v-if="receiptInfo.payMethod==1">(线下支付) </span>
            <span v-else>({{ClinicPayType.find(p=>p.id==receiptInfo.payMethod)?.name}}) </span>
          </template>
          <span>{{ receiptInfo.paidAmount }}元</span>
        </div>
      </div>
      <div class="border-t border-dashed border-gray my-12px"></div>
      <div>
        <div class="mb4px" v-if="config.patientInfo.includes('issuer')">
          <span>操作员：</span>
          <span>{{ receiptInfo.operator }}</span>
        </div>
        <div class="mb4px" v-if="config.headerInfo.includes('address') && receiptInfo.address">
          <span>地址：</span>
          <span>{{ receiptInfo.address }}</span>
        </div>
        <div class="mb4px" v-if="config.headerInfo.includes('phone') && receiptInfo.phone">
          <span>电话：</span>
          <span>{{ receiptInfo.phone }}</span>
        </div>

      </div>
      <div class="border-t border-dashed border-gray my-12px"></div>
      <div class="text-center">当日有效 过期作废</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref,onMounted,watch} from 'vue';
  import { useUserStore } from '@/store/modules/user';
  import { cloneDeep } from 'lodash-es';
  import {basicEnum} from '/@/api/platform/common';

  const userStore = useUserStore();
  interface HeaderConfig {
    headerName?: string;
    headerSubtitle?:string;
    headerInfo: string[]; 
    patientInfo: string[]; 
    privacy: string[];     
    showChargeItems: boolean;
    cashierInfo: string[];
  }

  interface ReceiptData {
    address?: string;
    phone?: string;
    patientName?: string;
    gender?: string;
    age?: number;
    mobile?: string;
    doctorName?: string;
    deptName?: string;
    sequenceNo?: string;
    visitDate?: string;
    items?: Array<{ name: string; price: string | number }>;
    totalAmount?: string | number;
    discountAmount?: string | number;
    paidAmount?: string | number;
    payMethod?: string;
    operator?: string;
  }
  const ClinicPayType=ref([])
  const props = withDefaults(
    defineProps<{
      config: HeaderConfig;
      data: ReceiptData;
    }>(),
    {
      config: () => ({
        headerName:'',
        headerSubtitle:'',
        headerInfo: [],
        patientInfo: [],
        privacy: [],
        cashierInfo: [],
        showChargeItems: false
      }),
      data: () => ({})
    }
  );

  const receiptInfo=ref(cloneDeep(props.data))

  onMounted(()=>{
    getBasicEnum()
    receiptInfo.value.deptName=userStore.getUserInfo.Doctor.Department
    receiptInfo.value.operator=userStore.getUserInfo.Doctor.DoctorName
    receiptInfo.value.doctorName=userStore.getUserInfo.Doctor.DoctorName
    receiptInfo.value.address=userStore.getUserInfo.Clinic.Province+userStore.getUserInfo.Clinic.City+userStore.getUserInfo.Clinic.District+userStore.getUserInfo.Clinic.Address
    receiptInfo.value.phone=userStore.getUserInfo.Clinic.ContactPhone
  })

  const getBasicEnum=()=>{
    basicEnum({name:'ClinicPayType'}).then(data=>{
      ClinicPayType.value=data
    })
  }

  const maskString = (str: string | undefined) => {
    if (!str) return '';
    if (str.length <= 1) return str;
    return str.charAt(0) + '*'.repeat(str.length - 2) + str.charAt(str.length - 1);
  };
</script>

<style scoped>
.receipt-paper {
  width: 300px;
  background: white;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 16px;
}

@media print {
  body * {
    visibility: hidden;
  }
  .receipt-paper, .receipt-paper * {
    visibility: visible;
  }
  .receipt-paper {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    box-shadow: none;
    margin: 0;
    padding: 0;
  }
}
</style>