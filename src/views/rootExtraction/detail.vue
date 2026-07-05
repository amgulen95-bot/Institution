<template>
  <div class="p-4">
    <a-card title="开方记录详情" :bordered="false" v-loading="loading">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handlePrint">打印详情</a-button>
          <a-button type="primary" ghost @click="handleReturn">返回列表</a-button>
        </a-space>
      </template>
      <div class="record-detail-scroll overflow-y-scroll scrollbar-none" id="printJS-form" style="height: calc(100vh - 190px);">
        <div class="record-detail-card">
          <div class="record-detail-header">
            <div class="record-detail-title">订单与患者信息</div>
          </div>
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
          <div class="record-detail-card mt20px" v-for="(item,index) in orderInfo.Details" :key="index">
            <div class="record-detail-header">
              <div class="record-detail-title">处方及药品明细</div>
              <div class="record-detail-count">共{{item.Materials.length}}味药</div>
            </div>
            <div class="record-prescription-body">
              <div class="record-material-matrix">
                <div class="record-material-cell" v-for="(p,i) in item.Materials" :key="i">
                  <span class="record-material-index">{{i + 1}}</span>
                  <span class="record-material-name">{{materialName(p)}}</span>
                  <span class="record-material-weight">{{materialWeight(p)}}g</span>
                </div>
              </div>
            </div>
            <div class="record-usage-panel">
              <div class="record-usage-title">用药方案</div>
              <div class="record-usage-tags">
                <span class="record-usage-tag" v-for="(usage, usageIndex) in usageItems(item.Detail)" :key="usageIndex">
                  <em>{{usage.label}}</em>
                  <strong>{{usage.value}}</strong>
                </span>
              </div>
            </div>
            <div class="record-note-row">
              <div class="flex-sub flex">
                <div>备注</div>
                <div class="ml24px color-[#4E5766]">{{detailRemark(item.Detail)}}</div>
              </div>
              <!-- <div class="flex-sub flex">
                <div>其他备注</div>
                <div class="ml24px color-[#4E5766]">饮食规律宜清淡，忌烟酒，忌辛辣荤腥</div>
              </div> -->
            </div>
          </div>
        </div>

        <div class="record-summary-grid">
          <div class="record-detail-card">
            <div class="record-detail-header">
              <div class="record-detail-title">本次就诊病历摘要</div>
              <a-button type="link" size="small" @click="MedicalModalVisible=true">查看完整病历</a-button>
            </div>
            <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="1">
              <a-descriptions-item label="主诉">{{orderInfo.Visit.ChiefComplaint}}</a-descriptions-item>
              <a-descriptions-item label="既往史">{{orderInfo.Visit.PastHistory}}</a-descriptions-item>
              <a-descriptions-item label="诊断">{{orderInfo.Visit.Diagnosis}}</a-descriptions-item>
            </a-descriptions>
          </div>
          <div class="record-detail-card">
            <div class="record-detail-header">
              <div class="record-detail-title">费用与支付信息</div>
            </div>
            <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="2">
              <a-descriptions-item label="药费">{{orderInfo.Order.OriginalAmount+orderInfo.Order.RetailMarkupAmount+orderInfo.Order.PremiumAmount}}</a-descriptions-item>
              <a-descriptions-item label="挂号费">{{orderInfo.Order.RegistrationFee}}</a-descriptions-item>
              <a-descriptions-item label="应收金额">{{orderInfo.Order.Total}}</a-descriptions-item>
              <a-descriptions-item label="订单状态">{{MYYOrderStatus.find(p=>p.id==orderInfo.Order.Status)?.name}}</a-descriptions-item>
              <a-descriptions-item label="支付方式">{{ClinicPayType.find(p=>p.id==orderInfo.Order.PayChannel)?.name}}</a-descriptions-item>
              <a-descriptions-item label="支付时间">{{orderInfo.Order.PayTime||'--'}}</a-descriptions-item>
            </a-descriptions>
          </div>
        </div>

        <div class="record-summary-grid">
          <div class="record-detail-card">
            <div class="record-detail-header">
              <div class="record-detail-title">收货人信息</div>
            </div>
            <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="1">
              <a-descriptions-item label="收货人">{{orderInfo.Order.ReceiverName}}</a-descriptions-item>
              <a-descriptions-item label="联系方式">{{orderInfo.Order.ReceiverPhone}}</a-descriptions-item>
              <a-descriptions-item label="收货地址">{{computeRegionData(orderInfo.Order.RegionData)}}{{orderInfo.Order.ReceiverAddress}}</a-descriptions-item>
            </a-descriptions>
          </div>
          <div class="record-detail-card">
            <div class="record-detail-header">
              <div class="record-detail-title">物流信息</div>
            </div>
            <div class="p-16px color-[#4E5766]" v-if="!orderInfo.Order.ExpressName">还未添加物流信息</div>
            <a-descriptions :labelStyle="{ padding:'0 16px' }" :column="1" v-if="orderInfo.Order.ExpressName">
              <a-descriptions-item label="物流公司">{{orderInfo.Order.ExpressName}}</a-descriptions-item>
              <a-descriptions-item label="快递单号">{{orderInfo.Order.ExpressTicket}}</a-descriptions-item>
            </a-descriptions>
          </div>
        </div>
      </div>
    </a-card>

    <a-modal v-model:open="MedicalModalVisible" centered width="860px" wrapClassName="root-extraction-medical-modal" :footer="null" :maskClosable="false" destroyOnClose>
      <section class="record-medical-modal">
        <div class="record-medical-table">
          <div class="record-medical-section-title">
            <span>患者病历详情</span>
          </div>
          <div class="record-medical-table-inner">
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
  const ChineseMedicineDailyFrequency=ref([])
  const MedicineType=ref([])
  const ChineseMedicineDoseUnit=ref([])
  const ChineseMedicineMedicationTime=ref([])
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
.record-detail-scroll {
  padding-right: 4px;
}

.record-detail-card {
  overflow: hidden;
  border: 1px solid #E7EEF8;
  border-radius: 12px;
  background: #FFFFFF;
}

.record-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 12px 16px;
  border-bottom: 1px dashed #DCE7F5;
  background: #F9FBFD;
}

.record-detail-title {
  color: #1F2B3D;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
}

.record-detail-count {
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

.record-summary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.record-prescription-body {
  padding: 14px 16px 12px;
  background: #FFFFFF;
}

.record-material-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  gap: 10px;
  overflow: hidden;
  border-radius: 10px;
}

.record-material-cell {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  min-height: 40px;
  overflow: hidden;
  border: 1px solid #DCE6F3;
  border-radius: 8px;
  background: #FFFFFF;
}

.record-material-index,
.record-material-name,
.record-material-weight {
  display: flex;
  align-items: center;
  min-width: 0;
  height: 100%;
  font-size: 14px;
  line-height: 22px;
}

.record-material-index {
  justify-content: center;
  border-right: 1px dashed #DCE7F5;
  color: #6B7687;
  background: #F9FBFD;
}

.record-material-name {
  padding: 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1F2B3D;
}

.record-material-weight {
  justify-content: flex-end;
  min-width: 58px;
  padding: 0 10px;
  border-left: 1px dashed #DCE7F5;
  color: #0A5AFF !important;
  font-weight: 500 !important;
  white-space: nowrap;
}

.record-usage-panel {
  margin: 0 16px;
  padding: 12px 14px 14px;
  border: 1px solid #E7EEF8;
  border-radius: 10px;
  background: #F9FBFD;
}

.record-usage-title {
  margin-bottom: 10px;
  color: #1F2B3D;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
}

.record-usage-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.record-usage-tag {
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

.record-note-row {
  display: flex;
  padding: 10px 16px 14px;
  color: #1F2B3D;
}

.record-medical-modal {
  margin: 0;
  padding: 0;
  background: #FFFFFF;
}

.record-medical-table {
  overflow: hidden;
  border-radius: 0 0 28px 28px;
  background: #FFFFFF;
}

.record-medical-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  padding: 18px 30px 14px;
  border-bottom: 1px dashed #DCE7F5;
  background: #F9FBFD;

  span {
    color: #1F2B3D;
    font-size: 20px;
    line-height: 28px;
    font-weight: 500;
  }

  em {
    padding: 3px 12px;
    border: 1px solid #CFE0FF;
    border-radius: 8px;
    color: #0A5AFF;
    font-size: 13px;
    font-style: normal;
    line-height: 20px;
    background: #EEF5FF;
  }
}

.record-medical-table-inner {
  padding: 18px 30px 26px;
}

.record-medical-table :deep(.ant-descriptions) {
  padding: 0;
}

.record-medical-table :deep(.ant-descriptions-view) {
  width: 100%;
  overflow: hidden;
  border: 1px solid #e8cf9e;
  border-radius: 12px;
}

.record-medical-table :deep(.ant-descriptions-view table) {
  width: 100%;
  table-layout: fixed;
}

.record-medical-table :deep(.ant-descriptions-item-label) {
  width: 104px;
  color: #5F6A7A;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  background: #FFFDEC;
}

.record-medical-table :deep(.ant-descriptions-item-content) {
  color: #000000;
  font-weight: 400;
  line-height: 24px;
  word-break: break-word;
  overflow-wrap: anywhere;
  background: #FFFFFF;
}

.record-medical-table :deep(.ant-descriptions-row > th),
.record-medical-table :deep(.ant-descriptions-row > td) {
  min-height: 42px;
  padding: 9px 14px !important;
  border-color: #e8cf9e;
  vertical-align: middle;
}

.record-medical-table :deep(.ant-descriptions-row) {
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

:global(.root-extraction-medical-modal .ant-modal-content) {
  overflow: hidden;
  border-radius: 28px;
  background: #FFFFFF;
  box-shadow: 0 22px 56px rgba(31, 43, 61, .18);
}

:global(.root-extraction-medical-modal .ant-modal-header) {
  display: none;
}

:global(.root-extraction-medical-modal .ant-modal-close) {
  top: 17px;
  right: 24px;
  border-radius: 8px;
}

:global(.root-extraction-medical-modal .ant-modal-close:hover) {
  background: #EEF5FF;
}

:global(.root-extraction-medical-modal .ant-modal-body) {
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
}
</style>
