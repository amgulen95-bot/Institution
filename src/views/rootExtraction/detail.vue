<template>
  <div class="p-4">
    <a-card title="开方记录详情" :bordered="false" v-loading="loading">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handlePrint">打印详情</a-button>
          <a-button type="primary" ghost @click="handleReturn">返回列表</a-button>
        </a-space>
      </template>
      <div class="overflow-y-scroll scrollbar-none" id="printJS-form" style="height: calc(100vh - 190px);">
        <div class="border-rd-12px border border-color-[#E9ECEF] overflow-hidden">
          <div class="bg-[#F9FBFD] pl16px pr16px pt12px pb12px text-16px text-bold mb12px">订单与患者信息</div>
          <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="4">
            <a-descriptions-item label="开方日期">{{orderInfo.Order.CreateTime}}</a-descriptions-item>
            <a-descriptions-item label="接诊医师">{{orderInfo.Order.DocName}}</a-descriptions-item>
            <a-descriptions-item label="初复诊">{{orderInfo.Visit.VisitType==0?'初诊':'复诊'}}</a-descriptions-item>
            <a-descriptions-item label="订单编号">{{orderInfo.Order.OrderCode}}</a-descriptions-item>
            <a-descriptions-item label="患者姓名">{{orderInfo.Visit.PatientName}}</a-descriptions-item>
            <a-descriptions-item label="性别年龄">{{orderInfo.Visit.PatientGender==1?'男':'女'}}/{{orderInfo.Visit.PatientAge}}岁</a-descriptions-item>
            <a-descriptions-item label="手机号码">{{orderInfo.Visit.PatientPhone}}</a-descriptions-item>
            <a-descriptions-item label="病历号">{{orderInfo.Visit.Id}}</a-descriptions-item>
          </a-descriptions>
        </div>

        <div v-if="orderInfo.Details.length">
          <div class="border-rd-12px border border-color-[#E9ECEF] overflow-hidden mt24px" v-for="(item,index) in orderInfo.Details" :key="index">
            <div class="bg-[#F9FBFD] pl16px pr16px pt12px pb12px  mb12px flex justify-between align-center">
              <div class="text-16px text-bold">处方及药品明细</div>
              <div>共{{item.Materials.length}}味药</div>
            </div>
            <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="6">
              <a-descriptions-item :label="p.Name" v-for="(p,i) in item.Materials" :key="i">{{p.Weight}}g</a-descriptions-item>
            </a-descriptions>
            <div class="bg-[#F9FBFD] pl16px pr16px pt8px pb8px">
              <template v-if="item.Detail.ProName">
                <span>{{item.Detail.ProName}}</span>
                <a-divider type="vertical" />
              </template>
              <span>{{item.Detail.Count}}剂</span>
              <a-divider type="vertical" />
              <span>{{item.Detail.Unit}}</span>
              <a-divider type="vertical" />
              <span>{{ChineseMedicineUseMethod.find(p=>p.id==item.Detail.UseMethod)?.name}}</span>
              <a-divider type="vertical" />
              <span>{{item.Detail.Dosage}}</span>
              <a-divider type="vertical" />
              <span>{{item.Detail.TakeTime}}</span>
              <a-divider type="vertical" />
              <span>{{item.Detail.TimeFrame}}</span>
            </div>
            <div class="pl16px pr16px pt8px pb8px flex">
              <div class="flex-sub flex">
                <div>备注</div>
                <div class="ml24px color-[#4E5766]">{{item.Detail.Remark}}</div>
              </div>
              <!-- <div class="flex-sub flex">
                <div>其他备注</div>
                <div class="ml24px color-[#4E5766]">饮食规律宜清淡，忌烟酒，忌辛辣荤腥</div>
              </div> -->
            </div>
          </div>
        </div>

        <a-space :size="24">
          <div class="border-rd-12px border border-color-[#E9ECEF] overflow-hidden mt24px">
            <div class="bg-[#F9FBFD] pl16px pr16px pt12px pb12px  mb12px flex justify-between align-center">
              <div class="text-16px text-bold">本次就诊病历摘要</div>
              <a-button type="link" size="small" @click="MedicalModalVisible=true">查看完整病历</a-button>
            </div>
            <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="1">
              <a-descriptions-item label="主诉">{{orderInfo.Visit.ChiefComplaint}}</a-descriptions-item>
              <a-descriptions-item label="既往史">{{orderInfo.Visit.PastHistory}}</a-descriptions-item>
              <a-descriptions-item label="诊断">{{orderInfo.Visit.Diagnosis}}</a-descriptions-item>
            </a-descriptions>
          </div>
          <div class="border-rd-12px border border-color-[#E9ECEF] overflow-hidden mt24px">
            <div class="bg-[#F9FBFD] pl16px pr16px pt12px pb12px  mb12px text-16px text-bold">费用与支付信息</div>
            <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="2">
              <a-descriptions-item label="药费">{{orderInfo.Order.OriginalAmount+orderInfo.Order.RetailMarkupAmount+orderInfo.Order.PremiumAmount}}</a-descriptions-item>
              <a-descriptions-item label="挂号费">{{orderInfo.Order.RegistrationFee}}</a-descriptions-item>
              <a-descriptions-item label="应收金额">{{orderInfo.Order.Total}}</a-descriptions-item>
              <a-descriptions-item label="订单状态">{{MYYOrderStatus.find(p=>p.id==orderInfo.Order.Status)?.name}}</a-descriptions-item>
              <a-descriptions-item label="支付方式">{{ClinicPayType.find(p=>p.id==orderInfo.Order.PayChannel)?.name}}</a-descriptions-item>
              <a-descriptions-item label="支付时间">{{orderInfo.Order.PayTime||'--'}}</a-descriptions-item>
            </a-descriptions>
          </div>
        </a-space>

        <div class="flex">
          <div class="border-rd-12px border border-color-[#E9ECEF] overflow-hidden mt24px flex-sub">
            <div class="bg-[#F9FBFD] pl16px pr16px pt12px pb12px  mb12px text-16px text-bold">收货人信息</div>
            <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="1">
              <a-descriptions-item label="收货人">{{orderInfo.Order.ReceiverName}}</a-descriptions-item>
              <a-descriptions-item label="联系方式">{{orderInfo.Order.ReceiverPhone}}</a-descriptions-item>
              <a-descriptions-item label="收货地址">{{computeRegionData(orderInfo.Order.RegionData)}}{{orderInfo.Order.ReceiverAddress}}</a-descriptions-item>
            </a-descriptions>
          </div>
          <div class="border-rd-12px border border-color-[#E9ECEF] overflow-hidden mt24px flex-sub ml24px">
            <div class="bg-[#F9FBFD] pl16px pr16px pt12px pb12px  mb12px text-16px text-bold">物流信息</div>
            <div class="p-16px color-[#4E5766]" v-if="!orderInfo.Order.ExpressName">还未添加物流信息</div>
            <a-descriptions :labelStyle="{ padding:'0 16px' }" :column="1" v-if="orderInfo.Order.ExpressName">
              <a-descriptions-item label="物流公司">{{orderInfo.Order.ExpressName}}</a-descriptions-item>
              <a-descriptions-item label="快递单号">{{orderInfo.Order.ExpressTicket}}</a-descriptions-item>
            </a-descriptions>
          </div>
        </div>
      </div>
    </a-card>

    <a-modal v-model:open="MedicalModalVisible" title="患者病历" centered width="800px" :footer="null" :maskClosable="false" destroyOnClose>
      <section class="p-32px pt0px">
        <a-descriptions bordered :column="1" :labelStyle="{ width: '100px' }">
          <a-descriptions-item label="主诉">{{orderInfo.Visit.ChiefComplaint}}</a-descriptions-item>
          <a-descriptions-item label="现病史">{{orderInfo.Visit.PresentIllness}}</a-descriptions-item>
          <a-descriptions-item label="既往史">{{orderInfo.Visit.PastHistory}}</a-descriptions-item>
          <a-descriptions-item label="过敏史">{{orderInfo.Visit.AllergyHistory}}</a-descriptions-item>
          <a-descriptions-item label="个人史">{{orderInfo.Visit.PersonalHistory}}</a-descriptions-item>
          <a-descriptions-item label="体格检查">{{orderInfo.Visit.PhysicalExam}}</a-descriptions-item>
          <a-descriptions-item label="望闻切诊">{{orderInfo.Visit.TCMDiagnosis}}</a-descriptions-item>
          <a-descriptions-item label="诊断">{{orderInfo.Visit.Diagnosis}}</a-descriptions-item>
        </a-descriptions>
      </section>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { ref,onMounted,computed,nextTick} from 'vue';
  import { cloneDeep } from 'lodash-es';
  import {OrderApiCtrl} from '/@/api/myy/order';
  import { useRoute, useRouter } from 'vue-router';
  import {basicEnum} from '/@/api/platform/common';
  import printJS from 'print-js';
  
  let route = useRoute();
  let router = useRouter();
  let orderId = route.query.orderId;
  let type=route.query.type;
  const loading=ref(false)
  const ChineseMedicineUseMethod=ref([])
  const MYYOrderStatus=ref([])
  const ClinicPayType=ref([])
  const orderInfo=ref({
    Details:[],
    Income:{},
    Order:{},
    Patient:{},
    PeachOrder:null,
    Visit:{},
  })
  const MedicalModalVisible=ref(false)

  onMounted(() => {
    getBasicEnum()
    getOrderDetail()
  })

  const computeRegionData=computed(()=>{
    return (val)=>{
      let text = ''
      if (val){
        try {
          JSON.parse(val).forEach(item => {
            text += item.Name
          })
        } catch (error) {}
      } 
      return text
    }
  })

  const getBasicEnum=()=>{
    basicEnum({name:'ChineseMedicineUseMethod'}).then(data=>{
      ChineseMedicineUseMethod.value=data
    })
    basicEnum({name:'MYYOrderStatus'}).then(data=>{
      MYYOrderStatus.value=data
    })
    basicEnum({name:'ClinicPayType'}).then(data=>{
      ClinicPayType.value=data
    })
  }

  const getOrderDetail=()=>{
    loading.value=true
    OrderApiCtrl.OrderDetail({orderId:orderId}).then(data=>{
      orderInfo.value=data
      if(type==2){
        handlePrint()
      }
    }).catch(() => {}).finally(() => {loading.value=false })
  }

  const handleReturn=()=>{
    router.back()
  }

  async function handlePrint() {
    await nextTick();
    await printJS({
      printable: 'printJS-form', // 对应上面容器的 id
      type: 'html', // 指定打印类型为 html
      targetStyles: ['*'], // 指定要应用到打印内容的 CSS 样式，['*'] 表示所有样式
      scanStyles: true, // 处理应用于打印内容的样式
      maxWidth: 1000, // 指定打印内容的最大宽度
      documentTitle: '开方记录详情', // 指定打印的文档标题
      style: `
        @page {margin:20px;} 
        #printJS-form { 
          height: auto !important; 
          overflow: visible !important; 
        }
      `,
    });
  }
</script>
<style lang="less" scoped>

</style>