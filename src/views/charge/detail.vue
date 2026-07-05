<template>
  <div class="p-4">
    <a-card :title="detailTitle" :bordered="false" v-loading="loading">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="paymentVisible=true" v-if="orderInfo.Order.ChargeStatus==0">去收款</a-button>
          <a-button type="primary" ghost @click="handleReturn">返回列表</a-button>
        </a-space>
      </template>
      <div class="charge-detail-scroll overflow-y-scroll scrollbar-none" id="printJS-form" style="height: calc(100vh - 190px);">
        <div class="charge-overview-card">
          <div class="charge-overview-main">
            <div>
              <div class="charge-overview-label" :class="`is-${overviewState.type}`">{{overviewState.name}}</div>
              <div class="charge-overview-title">{{orderInfo.Visit.PatientName || '--'}} · {{chargeStatusName}}</div>
              <div class="charge-overview-code">{{overviewState.desc}} · 订单编号 {{orderInfo.Order.OrderCode || '--'}}</div>
            </div>
            <div class="charge-overview-total" :class="`is-${overviewState.type}`">
              <span>{{overviewAmount.label}}</span>
              <strong>￥{{moneyText(overviewAmount.value)}}</strong>
            </div>
          </div>
          <div class="charge-metric-grid">
            <div class="charge-metric-cell">
              <span>药费</span>
              <strong>￥{{moneyText(medicineAmount)}}</strong>
            </div>
            <div class="charge-metric-cell">
              <span>挂号费</span>
              <strong>￥{{moneyText(orderInfo.Order.RegistrationFee)}}</strong>
            </div>
            <div class="charge-metric-cell">
              <span>订单状态</span>
              <strong>{{orderStatusName}}</strong>
            </div>
            <div class="charge-metric-cell">
              <span>支付方式</span>
              <strong>{{payTypeName}}</strong>
            </div>
          </div>
        </div>

        <div class="charge-flow-card" v-if="orderInfo.Order.ChargeStatus==0||orderInfo.Order.ChargeStatus==1">
          <div class="charge-flow-step" v-for="(step,index) in flowSteps" :key="step.name" :class="{ active: step.active }">
            <img :src="step.active ? step.activeIcon : step.icon" alt="">
            <div>
              <strong>{{step.name}}</strong>
              <span>{{step.desc}}</span>
            </div>
            <i v-if="index < flowSteps.length - 1"></i>
          </div>
        </div>

        <div class="charge-detail-card" v-if="orderInfo.Order.ChargeStatus==3">
          <div class="charge-detail-header">
            <div class="charge-detail-title">退货信息</div>
          </div>
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

        <div class="charge-detail-card">
          <div class="charge-detail-header">
            <div class="charge-detail-title">订单与患者信息</div>
          </div>
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
          <div class="charge-detail-card" v-for="(item,index) in orderInfo.Details" :key="index">
            <div class="charge-detail-header">
              <div class="charge-detail-title">处方及药品明细</div>
              <div class="charge-detail-count">共{{item.Materials.length}}味药</div>
            </div>
            <div class="charge-prescription-body">
              <div class="charge-material-matrix">
                <div class="charge-material-cell" v-for="(p,i) in item.Materials" :key="i">
                  <span class="charge-material-index">{{i + 1}}</span>
                  <span class="charge-material-name">{{materialName(p)}}</span>
                  <span class="charge-material-weight">{{materialWeight(p)}}g</span>
                </div>
              </div>
            </div>
            <div class="charge-usage-panel">
              <div class="charge-usage-title">用药方案</div>
              <div class="charge-usage-tags">
                <span class="charge-usage-tag" v-for="(usage, usageIndex) in usageItems(item.Detail)" :key="usageIndex">
                  <em>{{usage.label}}</em>
                  <strong>{{usage.value}}</strong>
                </span>
              </div>
            </div>
            <div class="charge-note-row">
              <span>备注</span>
              <strong>{{detailRemark(item.Detail)}}</strong>
            </div>
          </div>
        </div>

        <div class="charge-summary-grid">
          <div class="charge-detail-card">
            <div class="charge-detail-header">
              <div class="charge-detail-title">本次就诊病历摘要</div>
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
          <div class="charge-detail-card">
            <div class="charge-detail-header">
              <div class="charge-detail-title">费用与支付信息</div>
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

        <div class="charge-detail-card" v-if="orderInfo.Order.ChargeStatus!=0">
          <div class="charge-detail-header">
            <div class="charge-detail-title">操作时间</div>
          </div>
          <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="4">
            <a-descriptions-item label="开单时间">{{orderInfo.Order.CreateTime}}</a-descriptions-item>
            <a-descriptions-item label="支付时间">{{orderInfo.Order.PayTime||'--'}}</a-descriptions-item>
            <a-descriptions-item label="审方时间">{{orderInfo.Order.ReviewTime||'--'}}</a-descriptions-item>
            <a-descriptions-item label="调配时间">{{orderInfo.Order.MixTime||'--'}}</a-descriptions-item>
            <a-descriptions-item label="发货时间">{{orderInfo.Order.SendTime||'--'}}</a-descriptions-item>
            <a-descriptions-item label="完成时间">{{orderInfo.Order.FinishTime||'--'}}</a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="charge-summary-grid">
          <div class="charge-detail-card">
            <div class="charge-detail-header">
              <div class="charge-detail-title">收货人信息</div>
            </div>
            <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="1">
              <a-descriptions-item label="收货人">{{orderInfo.Order.ReceiverName}}</a-descriptions-item>
              <a-descriptions-item label="联系方式">{{orderInfo.Order.ReceiverPhone}}</a-descriptions-item>
              <a-descriptions-item label="收货地址">{{computeRegionData(orderInfo.Order.RegionData)}}{{orderInfo.Order.ReceiverAddress}}</a-descriptions-item>
            </a-descriptions>
          </div>
          <div class="charge-detail-card">
            <div class="charge-detail-header">
              <div class="charge-detail-title">物流信息</div>
            </div>
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

    <a-modal v-model:open="MedicalModalVisible" centered width="860px" wrapClassName="charge-medical-modal" :footer="null" :maskClosable="false" destroyOnClose>
      <section class="charge-medical-modal-body">
        <div class="charge-medical-table">
          <div class="charge-medical-section-title">患者病历详情</div>
          <div class="charge-medical-table-inner">
            <a-descriptions bordered :column="1" :labelStyle="{ width: '104px' }">
              <a-descriptions-item label="主诉">{{orderInfo.Visit.ChiefComplaint || '--'}}</a-descriptions-item>
              <a-descriptions-item label="现病史">{{orderInfo.Visit.PresentIllness || '--'}}</a-descriptions-item>
              <a-descriptions-item label="既往史">{{orderInfo.Visit.PastHistory || '--'}}</a-descriptions-item>
              <a-descriptions-item label="过敏史">{{orderInfo.Visit.AllergyHistory || '--'}}</a-descriptions-item>
              <a-descriptions-item label="个人史">{{orderInfo.Visit.PersonalHistory || '--'}}</a-descriptions-item>
              <a-descriptions-item label="体格检查">{{orderInfo.Visit.PhysicalExam || '--'}}</a-descriptions-item>
              <a-descriptions-item label="望闻切诊">{{orderInfo.Visit.TCMDiagnosis || '--'}}</a-descriptions-item>
              <a-descriptions-item label="诊断">{{orderInfo.Visit.Diagnosis || '--'}}</a-descriptions-item>
            </a-descriptions>
          </div>
        </div>
      </section>
    </a-modal>

    <PaymentModal v-model:visible="paymentVisible" :orderInfo="orderInfo" @confirm="completePay"></PaymentModal>
    <RefundModal v-model:visible="refundVisible" :orderInfo="orderInfo" @confirm="completePay"></RefundModal>
    <LogisticsModal v-model:visible="logisticsVisible" :orderCode="orderInfo.Order.OrderCode"></LogisticsModal>

    <a-modal
      v-model:open="closeOrderVisible"
      centered
      width="560px"
      wrapClassName="charge-close-order-modal"
      :footer="null"
      :closable="false"
      :maskClosable="false"
      destroyOnClose
    >
      <section class="charge-close-order-panel">
        <div class="charge-close-order-header">
          <div>
            <span class="charge-close-order-badge">待收款订单</span>
            <h3>确认关闭该订单吗？</h3>
            <p>关闭后该订单将结束收款流程，请确认患者与金额信息无误。</p>
          </div>
          <button class="charge-close-order-x" type="button" @click="closeOrderVisible=false" aria-label="关闭">×</button>
        </div>
        <div class="charge-close-order-summary">
          <div>
            <span>患者姓名</span>
            <strong>{{orderInfo.Visit.PatientName || '--'}}</strong>
          </div>
          <div>
            <span>订单编号</span>
            <strong>{{orderInfo.Order.OrderCode || '--'}}</strong>
          </div>
          <div>
            <span>待收金额</span>
            <strong>￥{{moneyText(orderInfo.Order.Total)}}</strong>
          </div>
        </div>
        <div class="charge-close-order-note">
          <span>提示</span>
          <p>该操作用于取消当前待收款订单，确认关闭后将不能继续在此订单上完成收款。</p>
        </div>
        <div class="charge-close-order-actions">
          <a-button size="large" @click="closeOrderVisible=false">取消</a-button>
          <a-button size="large" danger type="primary" :loading="closeOrderSubmitting" @click="confirmCloseOrder">确认关闭订单</a-button>
        </div>
      </section>
    </a-modal>

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
  import { ref,onMounted,computed} from 'vue';
  import {ChargeApiCtrl} from '/@/api/myy/charge';
  import { useRoute, useRouter } from 'vue-router';
  import {basicEnum} from '/@/api/platform/common';
  import PaymentModal from '/@/components/PaymentModal.vue';
  import RefundModal from '/@/components/RefundModal.vue';
  import LogisticsModal from '/@/components/LogisticsModal.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import MedicalPreview from '/@/components/MedicalPreview.vue';
  import kaifangIcon from '../../assets/images/kaifang.png';
  import shenfangIcon from '../../assets/images/shenfang.png';
  import shenfangActiveIcon from '../../assets/images/shenfang-on.png';
  import diaopeiIcon from '../../assets/images/diaopei.png';
  import diaopeiActiveIcon from '../../assets/images/diaopei-on.png';
  import fahuoIcon from '../../assets/images/fahuo.png';
  import fahuoActiveIcon from '../../assets/images/fahuo-on.png';
  import wanchengIcon from '../../assets/images/wancheng.png';
  import wanchengActiveIcon from '../../assets/images/wancheng-on.png';
  
  let route = useRoute();
  let router = useRouter();
  let orderCode = route.query.orderCode;
  const { createMessage} = useMessage()
  const loading=ref(false)
  const ChineseMedicineUseMethod=ref([])
  const ChineseMedicineDailyFrequency=ref([])
  const MedicineType=ref([])
  const ChineseMedicineDoseUnit=ref([])
  const ChineseMedicineMedicationTime=ref([])
  const ClinicChargeStatus=ref([])
  const MYYOrderStatus=ref([])
  const ClinicPayType=ref([])
  const MYYPreparStatus=ref([])
  const MYYOrderRefundStatus=ref([])
  const logisticsVisible=ref(false)
  const detailTitle=ref('待收款详情')
  const paymentVisible=ref(false)
  const refundVisible=ref(false)
  const closeOrderVisible=ref(false)
  const closeOrderSubmitting=ref(false)
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

  const chargeStatusName=computed(()=>{
    return ClinicChargeStatus.value.find(p=>p.id==orderInfo.value.Order.ChargeStatus)?.name || '--'
  })

  const orderStatusName=computed(()=>{
    return MYYOrderStatus.value.find(p=>p.id==orderInfo.value.Order.Status)?.name || '--'
  })

  const payTypeName=computed(()=>{
    return ClinicPayType.value.find(p=>p.id==orderInfo.value.Order.PayType || p.id==orderInfo.value.Order.PayChannel)?.name || '--'
  })

  const medicineAmount=computed(()=>{
    const order:any = orderInfo.value.Order || {}
    return Number(order.OriginalAmount || 0) + Number(order.RetailMarkupAmount || 0) + Number(order.PremiumAmount || 0)
  })

  const refundAmount=computed(()=>{
    const order:any = orderInfo.value.Order || {}
    return Number(order.RefundAmount || order.RefundTotal || order.ReturnAmount || 0)
  })

  const overviewState=computed(()=>{
    const order:any = orderInfo.value.Order || {}
    const status = Number(order.ChargeStatus)
    const name = chargeStatusName.value || ''
    const refundName = MYYOrderRefundStatus.value.find(p=>p.id==order.RefundStatus)?.name || ''
    const text = `${name}${refundName}`

    if (text.includes('取消') || text.includes('关闭')) {
      return { type:'cancelled', name:'订单已取消', desc:'该订单已结束，金额仅作历史记录展示' }
    }
    if (text.includes('已退款') || text.includes('退款完成')) {
      return { type:'refunded', name:'已退款', desc:'退款流程已完成，金额为本次退款记录' }
    }
    if (text.includes('退款中') || text.includes('退货') || text.includes('售后') || text.includes('退款')) {
      return { type:'refunding', name:'退款处理中', desc:'退款相关流程处理中，请关注审核与退款状态' }
    }
    if (status === 0 || text.includes('待收')) {
      return { type:'pending', name:'待收款', desc:'订单待完成收款，请核对患者与金额信息' }
    }
    if (status === 1 || text.includes('已收')) {
      return { type:'paid', name:'已收款', desc:'订单已完成收款，可查看支付与履约信息' }
    }
    return { type:'normal', name:chargeStatusName.value || '收款详情', desc:'当前订单收款状态详情' }
  })

  const overviewAmount=computed(()=>{
    const type = overviewState.value.type
    const order:any = orderInfo.value.Order || {}
    const refundValue = refundAmount.value || Number(order.Total || 0)
    if (type === 'pending') return { label:'待收金额', value:order.Total }
    if (type === 'paid') return { label:'实收金额', value:order.Total }
    if (type === 'refunding') return { label:'退款金额', value:refundValue }
    if (type === 'refunded') return { label:'已退金额', value:refundValue }
    if (type === 'cancelled') return { label:'订单金额', value:order.Total }
    return { label:'订单金额', value:order.Total }
  })

  const flowSteps=computed(()=>{
    const status = Number(orderInfo.value.Order.Status || 0)
    return [
      {name:'开方', desc:'医师创建处方', active:true, icon:kaifangIcon, activeIcon:kaifangIcon},
      {name:'审方', desc:'药师审核处方', active:status >= 2, icon:shenfangIcon, activeIcon:shenfangActiveIcon},
      {name:'调配', desc:'调配/复核药品', active:status >= 2, icon:diaopeiIcon, activeIcon:diaopeiActiveIcon},
      {name:'发货', desc:'打包发货', active:status >= 3, icon:fahuoIcon, activeIcon:fahuoActiveIcon},
      {name:'完成', desc:'患者签收完成', active:status >= 4, icon:wanchengIcon, activeIcon:wanchengActiveIcon},
    ]
  })

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

  const moneyText=(value)=>{
    const number = Number(value || 0)
    return Number.isFinite(number) ? number.toFixed(2) : '0.00'
  }

  const firstText=(...values)=>{
    const value = values.find(item => item !== undefined && item !== null && item !== '')
    return value === undefined || value === null || value === '' ? '--' : value
  }

  const rawText=(...values)=>{
    const value = values.find(item => item !== undefined && item !== null && item !== '')
    return value === undefined || value === null || value === '' ? '' : String(value)
  }

  const enumName=(list, id)=>{
    if (id === null || id === undefined || id === '') return ''
    const match = list.value.find(item => String(item.id) === String(id))
    return match?.name || ''
  }

  const normalizeNumberText=(value)=>{
    if (value === null || value === undefined || value === '') return ''
    const matched = String(value).match(/\d+(\.\d+)?/)
    return matched ? matched[0] : String(value)
  }

  const materialName=(item)=>{
    return firstText(item?.Name, item?.MaterialName)
  }

  const materialWeight=(item)=>{
    return firstText(item?.Weight, item?.Count, item?.Quantity)
  }

  const usageItems=(detail)=>{
    const doseCount = normalizeNumberText(rawText(detail?.Count, detail?.DoseCount)) || ''
    const dosageForm = rawText(detail?.MedicineTypeName, detail?.DosageFormName, enumName(MedicineType, detail?.DosageForm), detail?.Unit)
    const useMethod = rawText(detail?.UseMethodName, enumName(ChineseMedicineUseMethod, detail?.UseMethod), detail?.UseMethod)
    const frequency = rawText(detail?.DailyFrequencyName, detail?.FrequencyName, enumName(ChineseMedicineDailyFrequency, detail?.Frequency), detail?.DailyFrequency, detail?.Frequency)
    const eachDose = normalizeNumberText(rawText(detail?.PerDoseAmount, detail?.EachDose))
    const doseUnit = rawText(detail?.DoseUnitName, enumName(ChineseMedicineDoseUnit, detail?.DoseUnit), detail?.DoseUnit)
    const takeTime = rawText(detail?.TakeTimeName, enumName(ChineseMedicineMedicationTime, detail?.TakeTime), detail?.TakeTime)
    const takeDays = normalizeNumberText(rawText(detail?.CertNumber, detail?.TimeFrame, detail?.TakeDays))
    const items=[
      {label:'方名', value:detail?.ProName},
      {label:'剂数', value:doseCount ? `${doseCount}剂` : ''},
      {label:'剂型', value:dosageForm},
      {label:'用法', value:useMethod},
      {label:'每日次数', value:frequency},
      {label:'单次剂量', value:eachDose ? `${eachDose}${doseUnit}` : ''},
      {label:'服用时间', value:takeTime},
      {label:'疗程', value:takeDays ? `${takeDays}天` : ''},
    ]
    return items
      .filter(item => item.value !== undefined && item.value !== null && item.value !== '')
      .map(item => ({...item, value:firstText(item.value)}))
  }

  const detailRemark=(detail)=>{
    const explicitRemark = rawText(
      detail?.Advice,
      detail?.OtherRemark,
      detail?.DoctorRemark,
      detail?.RemarkText,
      detail?.Note,
      detail?.Memo
    )
    if (explicitRemark) return explicitRemark

    const remark = rawText(detail?.Remark)
    if (!remark || /^频次\s*[:：]?\s*\d+$/u.test(remark.trim())) return '--'
    return remark
  }

  const getBasicEnum=()=>{
    basicEnum({name:'ChineseMedicineUseMethod'}).then(data=>{
      ChineseMedicineUseMethod.value=data
    })
    basicEnum({name:'MedicineType'}).then(data=>{
      MedicineType.value=data
    })
    basicEnum({name:'ChineseMedicineDailyFrequency'}).then(data=>{
      ChineseMedicineDailyFrequency.value=data
    })
    basicEnum({name:'ChineseMedicineDoseUnit'}).then(data=>{
      ChineseMedicineDoseUnit.value=data
    })
    basicEnum({name:'ChineseMedicineMedicationTime'}).then(data=>{
      ChineseMedicineMedicationTime.value=data
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
    closeOrderVisible.value=true
  }

  const confirmCloseOrder=()=>{
    closeOrderSubmitting.value=true
    loading.value=true
    ChargeApiCtrl.CloseOrder({OrderCode:orderCode}).then(data => {
      createMessage.success(`操作成功`);
      closeOrderVisible.value=false
      getChargeDetail()
    }).catch(() => {}).finally(() => {
      closeOrderSubmitting.value=false
      loading.value=false
    })
  }


</script>
<style lang="less" scoped>
.charge-detail-scroll {
  padding-right: 4px;
}

.charge-overview-card,
.charge-flow-card,
.charge-detail-card {
  overflow: hidden;
  border: 1px solid #E7EEF8;
  border-radius: 12px;
  background: #FFFFFF;
}

.charge-overview-card {
  margin-bottom: 18px;
  padding: 18px 18px 16px;
}

.charge-overview-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #DCE7F5;
}

.charge-overview-label {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  margin-bottom: 8px;
  padding: 2px 10px;
  border: 1px solid #DCE6F3;
  border-radius: 8px;
  color: #0A5AFF;
  font-size: 13px;
  line-height: 20px;
  background: #F9FBFD;
}

.charge-overview-label.is-pending {
  border-color: #CFE0FF;
  color: #0A5AFF;
  background: #EEF5FF;
}

.charge-overview-label.is-paid,
.charge-overview-label.is-refunded {
  border-color: #BFE8D4;
  color: #0F7A4F;
  background: #F1FBF6;
}

.charge-overview-label.is-refunding {
  border-color: #F5DE9F;
  color: #9A6700;
  background: #FFF9E8;
}

.charge-overview-label.is-cancelled {
  border-color: #DCE3ED;
  color: #5F6A7A;
  background: #F4F7F9;
}

.charge-overview-title {
  color: #1F2B3D;
  font-size: 22px;
  line-height: 30px;
  font-weight: 500;
}

.charge-overview-code {
  margin-top: 6px;
  color: #6B7687;
  font-size: 13px;
  line-height: 20px;
}

.charge-overview-total {
  min-width: 200px;
  text-align: right;

  span {
    display: block;
    margin-bottom: 4px;
    color: #6B7687;
    font-size: 13px;
    line-height: 20px;
  }

  strong {
    color: #1F2B3D;
    font-size: 30px;
    line-height: 38px;
    font-weight: 600;
  }
}

.charge-overview-total.is-pending strong {
  color: #0A5AFF;
}

.charge-overview-total.is-paid strong,
.charge-overview-total.is-refunded strong {
  color: #0F7A4F;
}

.charge-overview-total.is-refunding strong {
  color: #B7791F;
}

.charge-overview-total.is-cancelled strong {
  color: #5F6A7A;
}

.charge-metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding-top: 14px;
}

.charge-metric-cell {
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid #E7EEF8;
  border-radius: 10px;
  background: #F9FBFD;

  span,
  strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: #6B7687;
    font-size: 13px;
    line-height: 20px;
  }

  strong {
    margin-top: 4px;
    color: #1F2B3D;
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
  }
}

.charge-flow-card {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: center;
  gap: 8px;
  min-height: 86px;
  margin-bottom: 18px;
  padding: 14px 16px;
}

.charge-flow-step {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 10px;

  img {
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
    border-radius: 50%;
    opacity: .58;
  }

  strong,
  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: #1F2B3D;
    font-size: 15px;
    line-height: 22px;
    font-weight: 500;
  }

  span {
    margin-top: 2px;
    color: #858D98;
    font-size: 12px;
    line-height: 18px;
  }

  i {
    flex: 1;
    min-width: 28px;
    height: 1px;
    margin-left: 8px;
    border-top: 1px dashed #DCE7F5;
  }
}

.charge-flow-step.active {
  img {
    opacity: 1;
  }

  i {
    border-color: #AFCBFF;
  }
}

.charge-detail-card {
  margin-bottom: 20px;
}

.charge-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 12px 16px;
  border-bottom: 1px dashed #DCE7F5;
  background: #F9FBFD;
}

.charge-detail-title {
  color: #1F2B3D;
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;
}

.charge-detail-count {
  min-width: 74px;
  padding: 4px 12px;
  border: 1px solid #DCE6F3;
  border-radius: 999px;
  color: #4E73B8;
  font-size: 13px;
  line-height: 20px;
  text-align: center;
  background: #FFFFFF;
}

.charge-summary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
}

.charge-prescription-body {
  padding: 14px 16px 12px;
  background: #FFFFFF;
}

.charge-material-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  gap: 10px;
  overflow: hidden;
  border-radius: 10px;
}

.charge-material-cell {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  min-height: 40px;
  overflow: hidden;
  border: 1px solid #DCE6F3;
  border-radius: 8px;
  background: #FFFFFF;
}

.charge-material-index,
.charge-material-name,
.charge-material-weight {
  display: flex;
  align-items: center;
  min-width: 0;
  height: 100%;
  font-size: 14px;
  line-height: 22px;
}

.charge-material-index {
  justify-content: center;
  border-right: 1px dashed #DCE7F5;
  color: #6B7687;
  background: #F9FBFD;
}

.charge-material-name {
  padding: 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1F2B3D;
}

.charge-material-weight {
  justify-content: flex-end;
  min-width: 58px;
  padding: 0 10px;
  border-left: 1px dashed #DCE7F5;
  color: #0A5AFF;
  font-weight: 500;
  white-space: nowrap;
}

.charge-usage-panel {
  margin: 0 16px;
  padding: 12px 14px 14px;
  border: 1px solid #E7EEF8;
  border-radius: 10px;
  background: #F9FBFD;
}

.charge-usage-title {
  margin-bottom: 10px;
  color: #1F2B3D;
  font-size: 14px;
  line-height: 22px;
  font-weight: 500;
}

.charge-usage-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.charge-usage-tag {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  overflow: hidden;
  border: 1px solid #DCE6F3;
  border-radius: 8px;
  background: #FFFFFF;

  em,
  strong {
    font-style: normal;
    font-size: 13px;
    line-height: 20px;
    font-weight: 400;
  }

  em {
    padding: 5px 8px;
    border-right: 1px dashed #CFE0F8;
    color: #5F6A7A;
    background: #EEF5FF;
  }

  strong {
    padding: 5px 10px;
    color: #1F2B3D;
  }
}

.charge-note-row {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 10px 16px 14px;

  span {
    flex: 0 0 auto;
    color: #1F2B3D;
    font-size: 14px;
    line-height: 22px;
  }

  strong {
    min-width: 0;
    color: #4E5766;
    font-size: 14px;
    line-height: 22px;
    font-weight: 400;
    word-break: break-word;
  }
}

.charge-medical-modal-body {
  margin: 0;
  padding: 0;
  background: #FFFFFF;
}

.charge-medical-table {
  overflow: hidden;
  border-radius: 0 0 28px 28px;
  background: #FFFFFF;
}

.charge-medical-section-title {
  min-height: 58px;
  padding: 18px 30px 14px;
  border-bottom: 1px dashed #DCE7F5;
  color: #1F2B3D;
  font-size: 20px;
  line-height: 28px;
  font-weight: 500;
  background: #F9FBFD;
}

.charge-medical-table-inner {
  padding: 18px 30px 26px;
}

.charge-medical-table :deep(.ant-descriptions) {
  padding: 0;
}

.charge-medical-table :deep(.ant-descriptions-view) {
  width: 100%;
  overflow: hidden;
  border: 1px solid #e8cf9e;
  border-radius: 12px;
}

.charge-medical-table :deep(.ant-descriptions-view table) {
  width: 100%;
  table-layout: fixed;
}

.charge-medical-table :deep(.ant-descriptions-item-label) {
  width: 104px;
  color: #5F6A7A;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  background: #FFFDEC;
}

.charge-medical-table :deep(.ant-descriptions-item-content) {
  color: #000000;
  font-weight: 400;
  line-height: 24px;
  word-break: break-word;
  overflow-wrap: anywhere;
  background: #FFFFFF;
}

.charge-medical-table :deep(.ant-descriptions-row > th),
.charge-medical-table :deep(.ant-descriptions-row > td) {
  min-height: 42px;
  padding: 9px 14px !important;
  border-color: #e8cf9e;
  vertical-align: middle;
}

.charge-medical-table :deep(.ant-descriptions-row) {
  min-height: 42px;
}

:deep(.ant-descriptions) {
  padding: 12px 0;
}

:deep(.ant-descriptions-row > th),
:deep(.ant-descriptions-row > td) {
  padding-bottom: 8px;
}

:deep(.ant-descriptions-row:last-child > th),
:deep(.ant-descriptions-row:last-child > td) {
  padding-bottom: 0;
}

:deep(.ant-descriptions-item-label) {
  color: #5F6A7A;
  font-weight: 400;
}

:deep(.ant-descriptions-item-content) {
  color: #1F2B3D;
}

:global(.charge-close-order-modal .ant-modal-content) {
  overflow: hidden;
  border-radius: 28px;
  background: #FFFFFF;
  box-shadow: 0 22px 56px rgba(31, 43, 61, .18);
}

:global(.charge-close-order-modal .ant-modal-body) {
  padding: 0;
}

.charge-close-order-panel {
  overflow: hidden;
  border-radius: 28px;
  background: #FFFFFF;
}

.charge-close-order-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 28px 30px 24px;
  border-bottom: 1px dashed #DCE7F5;
  background: #F9FBFD;

  h3 {
    margin: 12px 0 8px;
    color: #1F2B3D;
    font-size: 22px;
    line-height: 30px;
    font-weight: 500;
  }

  p {
    margin: 0;
    color: #6B7687;
    font-size: 14px;
    line-height: 22px;
  }
}

.charge-close-order-badge {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 2px 12px;
  border: 1px solid #CFE0FF;
  border-radius: 8px;
  color: #0A5AFF;
  font-size: 13px;
  line-height: 20px;
  background: #EEF5FF;
}

.charge-close-order-x {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  color: #5F6A7A;
  font-size: 24px;
  line-height: 32px;
  background: transparent;
  cursor: pointer;
  transition: background-color .18s ease, color .18s ease;

  &:hover {
    color: #0A5AFF;
    background: #EEF5FF;
  }
}

.charge-close-order-summary {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  margin: 22px 30px 18px;
  overflow: hidden;
  border: 1px solid #E7EEF8;
  border-radius: 12px;
  background: #FFFFFF;

  div {
    display: grid;
    grid-template-columns: 104px minmax(0, 1fr);
    min-height: 46px;
    border-bottom: 1px dashed #DCE7F5;
  }

  div:last-child {
    border-bottom: 0;
  }

  span,
  strong {
    display: flex;
    align-items: center;
    min-width: 0;
    padding: 0 14px;
    font-size: 14px;
    line-height: 22px;
  }

  span {
    color: #5F6A7A;
    background: #F9FBFD;
  }

  strong {
    overflow: hidden;
    color: #1F2B3D;
    font-weight: 400;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  div:last-child strong {
    color: #0A5AFF;
    font-weight: 500;
  }
}

.charge-close-order-note {
  display: flex;
  gap: 12px;
  margin: 0 30px 22px;
  padding: 12px 14px;
  border: 1px solid #F2DEAF;
  border-radius: 10px;
  background: #FFFDEC;

  span {
    flex: 0 0 auto;
    color: #9A6700;
    font-size: 14px;
    line-height: 22px;
    font-weight: 500;
  }

  p {
    margin: 0;
    color: #5F6A7A;
    font-size: 14px;
    line-height: 22px;
  }
}

.charge-close-order-actions {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 14px;
  padding: 0 30px 30px;

  :deep(.ant-btn) {
    height: 44px;
    border-radius: 8px;
    font-weight: 400;
  }
}

:global(.charge-medical-modal .ant-modal-content) {
  overflow: hidden;
  border-radius: 28px;
  background: #FFFFFF;
  box-shadow: 0 22px 56px rgba(31, 43, 61, .18);
}

:global(.charge-medical-modal .ant-modal-header) {
  display: none;
}

:global(.charge-medical-modal .ant-modal-close) {
  top: 17px;
  right: 24px;
  border-radius: 8px;
}

:global(.charge-medical-modal .ant-modal-close:hover) {
  background: #EEF5FF;
}

:global(.charge-medical-modal .ant-modal-body) {
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
}
</style>
