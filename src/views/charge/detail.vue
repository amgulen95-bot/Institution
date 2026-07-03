<template>
  <div class="p-4">
    <a-card :title="detailTitle" :bordered="false" v-loading="loading">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="paymentVisible=true" v-if="orderInfo.Order.ChargeStatus==0">去收款</a-button>
          <a-button type="primary" ghost @click="handleReturn">返回列表</a-button>
        </a-space>
      </template>
      <div class="overflow-y-scroll scrollbar-none" id="printJS-form" style="height: calc(100vh - 190px);">
        <div class="flex align-center flex-wrap whitespace-nowrap mb16px" v-if="orderInfo.Order.ChargeStatus==0||orderInfo.Order.ChargeStatus==1">
          <div class="flex-sub flex align-center ">
            <img class="w40px h40px border-rd-50%" src="../../assets/images/kaifang.png" alt="">
            <div class="ml8px">
              <div class="text-bold">开方</div>
              <div class="text-12px color-[#858D98] mt2px">医师创建处方</div>
            </div>
            <img class="flex-sub ml12px mr12px w150px" src="../../assets/images/activeChangjiantou.png" alt="">
          </div>
          
          <div class="flex-sub flex align-center">
            <img class="w40px h40px border-rd-50%" v-if="orderInfo.Order.Status==2||orderInfo.Order.Status==3||orderInfo.Order.Status==4" src="../../assets/images/shenfang-on.png" alt="">
            <img class="w40px h40px border-rd-50%" v-else src="../../assets/images/shenfang.png" alt="">
            <div class="ml8px">
              <div class="text-bold">审方</div>
              <div class="text-12px color-[#858D98] mt2px">药师审核处方</div>
            </div>
            <img class="flex-sub ml12px mr12px w150px" v-if="orderInfo.Order.Status==2||orderInfo.Order.Status==3||orderInfo.Order.Status==4" src="../../assets/images/activeChangjiantou.png" alt="">
            <img class="flex-sub ml12px mr12px w150px" v-else src="../../assets/images/changjiantou.png" alt="">
          </div>

          <div class="flex-sub flex align-center">
            <img class="w40px h40px border-rd-50%" v-if="orderInfo.Order.Status==2||orderInfo.Order.Status==3||orderInfo.Order.Status==4" src="../../assets/images/diaopei-on.png" alt="">
            <img class="w40px h40px border-rd-50%" v-else src="../../assets/images/diaopei.png" alt="">
            <div class="ml8px">
              <div class="text-bold">调配</div>
              <div class="text-12px color-[#858D98] mt2px">调配/复核药品</div>
            </div>
            <img class="flex-sub ml12px mr12px w150px" v-if="orderInfo.Order.Status==2||orderInfo.Order.Status==3||orderInfo.Order.Status==4" src="../../assets/images/activeChangjiantou.png" alt="">
            <img class="flex-sub ml12px mr12px w150px" v-else src="../../assets/images/changjiantou.png" alt="">
          </div>

          <div class="flex-sub flex align-center">
            <img class="w40px h40px border-rd-50%" v-if="orderInfo.Order.Status==3||orderInfo.Order.Status==4" src="../../assets/images/fahuo-on.png" alt="">
            <img class="w40px h40px border-rd-50%" v-else src="../../assets/images/fahuo.png" alt="">
            <div class="ml8px">
              <div class="text-bold">发货</div>
              <div class="text-12px color-[#858D98] mt2px">打包发货</div>
            </div>
            <img class="flex-sub ml12px mr12px w150px" v-if="orderInfo.Order.Status==3||orderInfo.Order.Status==4" src="../../assets/images/activeChangjiantou.png" alt="">
            <img class="flex-sub ml12px mr12px w150px" v-else src="../../assets/images/changjiantou.png" alt="">
          </div>

          <!-- <div class="flex-sub flex align-center">
            <img class="w40px h40px border-rd-50%" v-if="orderInfo.Order.Status==4" src="../../assets/images/peisong-on.png" alt="">
            <img class="w40px h40px border-rd-50%" v-else src="../../assets/images/peisong.png" alt="">
            <div class="ml8px">
              <div class="text-bold">配送</div>
              <div class="text-12px color-[#858D98] mt2px">物流配送中</div>
            </div>
            <img class="flex-sub ml12px mr12px w150px" v-if="orderInfo.Order.Status==4" src="../../assets/images/activeChangjiantou.png" alt="">
            <img class="flex-sub ml12px mr12px w150px" v-else src="../../assets/images/changjiantou.png" alt="">
          </div> -->
          <div class="flex-sub flex align-center">
            <img class="w40px h40px border-rd-50%" v-if="orderInfo.Order.Status==4" src="../../assets/images/wancheng-on.png" alt="">
            <img class="w40px h40px border-rd-50%" v-else src="../../assets/images/wancheng.png" alt="">
            <div class="ml8px">
              <div class="text-bold">完成</div>
              <div class="text-12px color-[#858D98] mt2px">患者签收完成</div>
            </div>
          </div>
        </div>
        <div class="border-rd-12px border border-color-[#E9ECEF] overflow-hidden" v-if="orderInfo.Order.ChargeStatus==3">
          <div class="bg-[#F9FBFD] pl16px pr16px pt12px pb12px text-16px text-bold mb12px">退货信息</div>
          <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="4">
            <a-descriptions-item label="退货状态">{{MYYOrderRefundStatus.find(p=>p.id==orderInfo.Order.RefundStatus)?.name}}</a-descriptions-item>
            <a-descriptions-item label="退货单号"></a-descriptions-item>
            <a-descriptions-item label="申请时间"></a-descriptions-item>
            <a-descriptions-item label="审核时间"></a-descriptions-item>
            <a-descriptions-item label="退货原因">{{orderInfo.Visit.Remark}}</a-descriptions-item>
            <a-descriptions-item label="退款金额"></a-descriptions-item>
            <a-descriptions-item label="退款方式">原路返回</a-descriptions-item>
            <a-descriptions-item label="退款时间"></a-descriptions-item>
            <a-descriptions-item label="退款编号"></a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="border-rd-12px border border-color-[#E9ECEF] overflow-hidden mb24px">
          <div class="bg-[#F9FBFD] pl16px pr16px pt12px pb12px text-16px text-bold mb12px">订单与患者信息</div>
          <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="4">
            <a-descriptions-item label="开方日期">{{orderInfo.Order.CreateTime}}</a-descriptions-item>
            <a-descriptions-item label="开单医师">{{orderInfo.Order.DocName}}({{orderInfo.Order.DocPhone}})</a-descriptions-item>
            <a-descriptions-item label="初复诊">{{orderInfo.Visit.VisitType==0?'初诊':'复诊'}}</a-descriptions-item>
            <a-descriptions-item label="订单编号">{{orderInfo.Order.OrderCode}}</a-descriptions-item>
            <a-descriptions-item label="患者姓名">{{orderInfo.Visit.PatientName}}</a-descriptions-item>
            <a-descriptions-item label="性别年龄">{{orderInfo.Visit.PatientGender==1?'男':'女'}}/{{orderInfo.Visit.PatientAge}}岁</a-descriptions-item>
            <a-descriptions-item label="手机号码">{{orderInfo.Visit.PatientPhone}}</a-descriptions-item>
            <a-descriptions-item label="病历号">{{orderInfo.Visit.Id}}</a-descriptions-item>
          </a-descriptions>
        </div>

        <div v-if="orderInfo.Details.length">
          <div class="border-rd-12px border border-color-[#E9ECEF] overflow-hidden mb24px" v-for="(item,index) in orderInfo.Details" :key="index">
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
              <span>{{item.Detail.MedicineTypeName}}</span>
              <a-divider type="vertical" />
              <span>{{item.Detail.UseMethodName}}</span>
              <a-divider type="vertical" />
              <span>{{item.Detail.DailyFrequencyName}}</span>
              <a-divider type="vertical" />
              <span>单次剂量：{{item.Detail.PerDoseAmount}}{{item.Detail.DoseUnitName}}</span>
              <a-divider type="vertical" />
              <span>{{item.Detail.TakeTimeName}}</span>
              <a-divider type="vertical" />
              <span>疗程：{{item.Detail.CertNumber||item.Detail.TimeFrame}}</span>
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

        <div class="flex">
          <div class="flex-sub border-rd-12px border border-color-[#E9ECEF] overflow-hidden mb24px">
            <div class="bg-[#F9FBFD] pl16px pr16px pt12px pb12px  mb12px flex justify-between align-center">
              <div class="text-16px text-bold">本次就诊病历摘要</div>
              <div class="flex">
                <a-button type="link" size="small" @click="MedicalModalVisible=true">查看完整病历</a-button>
                <a-button type="link" size="small" @click="medicalPreviewRef?.handlePrint()">打印电子病历</a-button>
              </div>
            </div>
            <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="1">
              <a-descriptions-item label="主诉">{{orderInfo.Visit.ChiefComplaint}}</a-descriptions-item>
              <a-descriptions-item label="既往史">{{orderInfo.Visit.PastHistory}}</a-descriptions-item>
              <a-descriptions-item label="诊断">{{orderInfo.Visit.Diagnosis}}</a-descriptions-item>
            </a-descriptions>
          </div>
          <div class="flex-sub border-rd-12px border border-color-[#E9ECEF] overflow-hidden mb24px ml24px">
            <div class="bg-[#F9FBFD] pl16px pr16px pt12px pb12px  mb12px flex justify-between align-center">
              <div class="text-16px text-bold">费用与支付信息</div>
              <a-button type="primary" size="small" danger ghost @click="handleCloseOrder" v-if="orderInfo.Order.ChargeStatus==0">关闭订单</a-button>
              <a-button type="link" size="small" v-if="orderInfo.Order.ChargeStatus==1" @click="refundVisible=true">申请售后</a-button>
            </div>
            <a-descriptions :labelStyle="{ padding:'0 16px' }" :column="2">
              <a-descriptions-item label="药费">
                <span class="text-theme">￥{{(orderInfo.Order.OriginalAmount+orderInfo.Order.RetailMarkupAmount+orderInfo.Order.PremiumAmount).toFixed(2)}}</span>
              </a-descriptions-item>
              <a-descriptions-item label="挂号费">
                <span class="text-theme">￥{{orderInfo.Order.RegistrationFee}}</span>
              </a-descriptions-item>
              <a-descriptions-item label="应收金额">
                <span class="text-red">￥{{orderInfo.Order.Total}}</span>
              </a-descriptions-item>
              <a-descriptions-item label="支付方式">{{ClinicPayType.find(p=>p.id==orderInfo.Order.PayType)?.name}}</a-descriptions-item>
              <a-descriptions-item label="订单状态">
                <span class="text-red">{{MYYOrderStatus.find(p=>p.id==orderInfo.Order.Status)?.name}}</span>
              </a-descriptions-item>
              <a-descriptions-item label="支付时间" v-if="orderInfo.Order.ChargeStatus==0">{{orderInfo.Order.PayTime||'--'}}</a-descriptions-item>
              <a-descriptions-item label="调配状态" v-if="orderInfo.Order.ChargeStatus!=0">
                <a-tag :bordered="false" :color="orderInfo.Order.PreparStatus==0?'volcano':orderInfo.Order.PreparStatus==1?'processing':orderInfo.Order.PreparStatus==2?'success':''">{{MYYPreparStatus.find(p=>p.id==orderInfo.Order.PreparStatus)?.name}}</a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </div>
        </div>

        <div class="border-rd-12px border border-color-[#E9ECEF] overflow-hidden mb24px" v-if="orderInfo.Order.ChargeStatus!=0">
          <div class="bg-[#F9FBFD] pl16px pr16px pt12px pb12px text-16px text-bold mb12px">操作时间</div>
          <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="4">
            <a-descriptions-item label="开单时间">{{orderInfo.Order.CreateTime}}</a-descriptions-item>
            <a-descriptions-item label="支付时间">{{orderInfo.Order.PayTime||'--'}}</a-descriptions-item>
            <a-descriptions-item label="审方时间">{{orderInfo.Order.ReviewTime||'--'}}</a-descriptions-item>
            <a-descriptions-item label="调配时间">{{orderInfo.Order.MixTime||'--'}}</a-descriptions-item>
            <a-descriptions-item label="发货时间">{{orderInfo.Order.SendTime||'--'}}</a-descriptions-item>
            <a-descriptions-item label="完成时间">{{orderInfo.Order.FinishTime||'--'}}</a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="flex">
          <div class="border-rd-12px border border-color-[#E9ECEF] overflow-hidden mb24px flex-sub">
            <div class="bg-[#F9FBFD] pl16px pr16px pt12px pb12px  mb12px text-16px text-bold">收货人信息</div>
            <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="1">
              <a-descriptions-item label="收货人">{{orderInfo.Order.ReceiverName}}</a-descriptions-item>
              <a-descriptions-item label="联系方式">{{orderInfo.Order.ReceiverPhone}}</a-descriptions-item>
              <a-descriptions-item label="收货地址">{{computeRegionData(orderInfo.Order.RegionData)}}{{orderInfo.Order.ReceiverAddress}}</a-descriptions-item>
            </a-descriptions>
          </div>
          <div class="border-rd-12px border border-color-[#E9ECEF] overflow-hidden mb24px flex-sub ml24px">
            <div class="bg-[#F9FBFD] pl16px pr16px pt12px pb12px  mb12px text-16px text-bold">物流信息</div>
            <div class="p-16px color-[#4E5766]" v-if="!orderInfo.Order.ExpressName">还未添加物流信息</div>
            <a-descriptions :labelStyle="{ padding:'0 16px' }" :column="1" v-if="orderInfo.Order.ExpressName">
              <a-descriptions-item label="物流公司">{{orderInfo.Order.ExpressName}}</a-descriptions-item>
              <a-descriptions-item label="快递单号">
                <span>{{orderInfo.Order.ExpressTicket}}</span>
                <a-button type="link" size="small" v-if="orderInfo.Order.ExpressTicket" @click="logisticsVisible=true">查看物流</a-button>
              </a-descriptions-item>
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

    <PaymentModal v-model:visible="paymentVisible" :orderInfo="orderInfo" @confirm="completePay"></PaymentModal>
    <RefundModal v-model:visible="refundVisible" :orderInfo="orderInfo" @confirm="completePay"></RefundModal>
    <LogisticsModal v-model:visible="logisticsVisible" :orderCode="orderInfo.Order.OrderCode"></LogisticsModal>

    <div style="display:none;">
      <MedicalPreview
        ref="medicalPreviewRef"
        :patient-id="orderInfo.Visit.PatientId"
        :visit-id="orderInfo.Visit.Id"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref,onMounted,computed,createVNode} from 'vue';
  import {ExclamationCircleOutlined} from '@ant-design/icons-vue';
  import {ChargeApiCtrl} from '/@/api/myy/charge';
  import { useRoute, useRouter } from 'vue-router';
  import {basicEnum} from '/@/api/platform/common';
  import PaymentModal from '/@/components/PaymentModal.vue';
  import RefundModal from '/@/components/RefundModal.vue';
  import LogisticsModal from '/@/components/LogisticsModal.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Modal } from 'ant-design-vue';
  import MedicalPreview from '/@/components/MedicalPreview.vue';
  
  let route = useRoute();
  let router = useRouter();
  let orderCode = route.query.orderCode;
  const { createMessage} = useMessage()
  const loading=ref(false)
  const ChineseMedicineUseMethod=ref([])
  const ClinicChargeStatus=ref([])
  const MYYOrderStatus=ref([])
  const ClinicPayType=ref([])
  const MYYPreparStatus=ref([])
  const MYYOrderRefundStatus=ref([])
  const logisticsVisible=ref(false)
  const detailTitle=ref('待收款详情')
  const paymentVisible=ref(false)
  const refundVisible=ref(false)
  const orderInfo=ref({
    Details:[],
    Income:{},
    Order:{},
    Patient:{},
    PeachOrder:null,
    Visit:{},
  })
  const MedicalModalVisible=ref(false)


  const medicalPreviewRef = ref<InstanceType<typeof MedicalPreview>>()

  onMounted(() => {
    getBasicEnum()
    getChargeDetail()
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
    basicEnum({name:'ClinicChargeStatus'}).then(data=>{
      ClinicChargeStatus.value=data
    })
    basicEnum({name:'ClinicPayType'}).then(data=>{
      ClinicPayType.value=data
    })
    basicEnum({name:'MYYPreparStatus'}).then(data=>{
      MYYPreparStatus.value=data
    })
    basicEnum({name:'MYYOrderRefundStatus'}).then(data=>{
      MYYOrderRefundStatus.value=data
    })
  }

  const getChargeDetail=()=>{
    loading.value=true
    ChargeApiCtrl.ChargeDetail({orderCode:orderCode}).then(data=>{
      orderInfo.value=data
      detailTitle.value=ClinicChargeStatus.value.find(p=>p.id==orderInfo.value.Order.ChargeStatus)?.name+'详情'
    }).catch(() => {}).finally(() => {loading.value=false })
  }

  const handleReturn=()=>{
    router.back()
  }

  const completePay=()=>{
    paymentVisible.value=false
    refundVisible.value=false
    getChargeDetail()
  }

  const handleCloseOrder=()=>{
    Modal.confirm({
      title: '提示',
      centered:true,
      content: '确定要关闭该订单吗？',
      icon: createVNode(ExclamationCircleOutlined),
      onOk() {
        loading.value=true
        ChargeApiCtrl.CloseOrder({OrderCode:orderCode}).then(data => {
          createMessage.success(`操作成功`);
          getChargeDetail()
        }).catch(() => {}).finally(() => {loading.value=false})
      },
    });
  }


</script>
<style lang="less" scoped>

</style>