<template>
  <div>
    <a-modal v-model:open="medicalModal.visible" title="病历详情" centered width="1080px" :wrapClassName="wrapClassName" :footer="null" :maskClosable="false" destroyOnClose>
      <section class="medical-detail-modal">
        <div class="medical-detail-modal__layout">
          <aside class="medical-detail-modal__timeline" v-if="visitInfo.list.length">
            <div class="medical-detail-modal__timeline-title">就诊记录</div>
            <div class="medical-detail-modal__timeline-list">
              <div
                class="medical-detail-modal__timeline-item"
                :class="{ 'medical-detail-modal__timeline-item--active': visitInfo.id==item.Id }"
                v-for="(item,index) in visitInfo.list"
                :key="index"
                @click="changeVisit(item)"
              >
                <span class="medical-detail-modal__timeline-dot"></span>
                <div class="medical-detail-modal__timeline-time">{{item.CreateTime}}</div>
                <div class="medical-detail-modal__timeline-diagnosis">{{item.Diagnosis || '病历记录'}}</div>
              </div>
            </div>
          </aside>

          <main class="medical-detail-modal__content" id="printJS-form">
            <a-empty description="暂无病历" v-if="!visitInfo.list.length" />
            <div v-if="visitInfo.list.length&&visitInfo.id" v-loading="visitInfo.loading">
              <section class="medical-detail-modal__hero">
                <div class="medical-detail-modal__avatar">
                  <img src="../assets/images/userAvatar1.png" alt="">
                </div>
                <div class="medical-detail-modal__patient">
                  <div class="medical-detail-modal__patient-main">
                    <div>
                      <div class="medical-detail-modal__patient-name">{{patientInfo.Patient.Name || '--'}}</div>
                      <div class="medical-detail-modal__patient-meta">
                        <span>{{patientInfo.Patient.Gender==1?'男':'女'}}</span>
                        <span>{{patientInfo.Patient.Age || '--'}}岁</span>
                        <span>{{patientInfo.Patient.Phone || '--'}}</span>
                      </div>
                    </div>
                    <a-button class="medical-detail-modal__print-btn" type="primary" @click="medicalPreviewRef?.handlePrint()">打印病历</a-button>
                  </div>
                  <div class="medical-detail-modal__info-grid">
                    <div>
                      <span>开单医师</span>
                      <strong>{{visitInfo.detail.Visit.DoctorName||'--'}}</strong>
                    </div>
                    <div>
                      <span>病历号</span>
                      <strong>{{visitInfo.id||'--'}}</strong>
                    </div>
                    <div>
                      <span>首次就诊时间</span>
                      <strong>{{ patientInfo.Patient.FirstVisitTime || '--' }}</strong>
                    </div>
                    <div>
                      <span>上次就诊时间</span>
                      <strong>{{ patientInfo.Patient.LastVisitTime || '--' }}</strong>
                    </div>
                  </div>
                </div>
              </section>

              <section class="medical-detail-modal__section medical-detail-modal__case-section">
                <div class="medical-detail-modal__section-title">本次就诊病历</div>
                <div class="medical-detail-modal__record-table">
                  <a-descriptions bordered :column="1" :labelStyle="{ width: '100px' }">
                    <a-descriptions-item label="主诉">{{visitInfo.detail.Visit.ChiefComplaint || '--'}}</a-descriptions-item>
                    <a-descriptions-item label="现病史">{{visitInfo.detail.Visit.PresentIllness || '--'}}</a-descriptions-item>
                    <a-descriptions-item label="既往史">{{visitInfo.detail.Visit.PastHistory || '--'}}</a-descriptions-item>
                    <a-descriptions-item label="过敏史">{{visitInfo.detail.Visit.AllergyHistory || '--'}}</a-descriptions-item>
                    <a-descriptions-item label="个人史">{{visitInfo.detail.Visit.PersonalHistory || '--'}}</a-descriptions-item>
                    <a-descriptions-item label="体格检查">{{visitInfo.detail.Visit.PhysicalExam || '--'}}</a-descriptions-item>
                    <a-descriptions-item label="望闻切诊">{{visitInfo.detail.Visit.TCMDiagnosis || '--'}}</a-descriptions-item>
                    <a-descriptions-item label="诊断">{{visitInfo.detail.Visit.Diagnosis || '--'}}</a-descriptions-item>
                  </a-descriptions>
                </div>
              </section>

              <section class="medical-detail-modal__section mt16px" v-if="visitInfo.detail.Details.length">
                <div class="medical-detail-modal__section-title">处方及药品明细</div>
                <div class="medical-detail-modal__prescription" v-for="(item,index) in visitInfo.detail.Details" :key="index">
                  <div class="medical-detail-modal__prescription-title">
                    <span>处方 {{index + 1}}</span>
                    <span>共{{item.Materials?.length || 0}}味药</span>
                  </div>
                  <div class="medical-detail-modal__materials">
                    <div class="medical-detail-modal__material" v-for="(p,i) in item.Materials" :key="i">
                      <span>{{p.Name}}</span>
                      <strong>{{p.Weight}}g</strong>
                    </div>
                  </div>
                  <div class="medical-detail-modal__usage">
                    <span>{{doseCountText(item.Detail)}}剂</span>
                    <span>{{dosageFormText(item.Detail) || '--'}}</span>
                    <span>{{useMethodText(item.Detail) || '--'}}</span>
                    <span>{{frequencyText(item.Detail) || '--'}}</span>
                    <span>单次剂量：{{eachDoseText(item.Detail) || '--'}}{{doseUnitText(item.Detail) || ''}}</span>
                    <span>{{takeTimeText(item.Detail) || '--'}}</span>
                    <span>{{takeDaysText(item.Detail) ? `${takeDaysText(item.Detail)}天` : '--'}}</span>
                  </div>
                  <div class="medical-detail-modal__remark">
                    <span>备注</span>
                    <p>{{item.Detail?.Remark || '--'}}</p>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </section>
    </a-modal>

    <div style="display:none;">
      <MedicalPreview
        ref="medicalPreviewRef"
        :patient-id="props.patientId"
        :visit-id="visitInfo.id"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref,watch,onMounted} from 'vue';
  import {PatientApiCtrl} from '/@/api/myy/patient';
  import {PrescriptApiCtrl} from '/@/api/myy/prescript';
  import {basicEnum} from '/@/api/platform/common';
  import { useMessage } from '/@/hooks/web/useMessage';
  import MedicalPreview from '/@/components/MedicalPreview.vue';

  const props = defineProps({
    patientId: { type: String, default:'' },
    visitId: { type: String, default:'' },
    visible: { type: Boolean, default: false },
    wrapClassName: { type: String, default: '' },
  });
  const { createMessage} = useMessage()
  const emit = defineEmits(['update:visible'])
  const ChineseMedicineUseMethod=ref([])
  const ChineseMedicineDailyFrequency=ref([])
  const MedicineType=ref([])
  const ChineseMedicineDoseUnit=ref([])
  const ChineseMedicineMedicationTime=ref([])
  const patientInfo=ref({
    Patient:{},
  })
  const visitInfo=ref({
    loading:false,
    list:[],
    detail:{
      Visit:{},
      Details:[],
      Order:{},
    },
    id:'',
  })
  const medicalModal=ref({
    loading:false,
    visible:false,
    info:{},
  })
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      medicalModal.value.visible = true
      if(medicalModal.value.visible){
        getPatientDetail()
        getVisitList()
      }
    }
  })

  watch(() => medicalModal.value.visible, (newVal) => {
    if (!newVal) {
      emit('update:visible',false)
    }
  })

  const medicalPreviewRef = ref<InstanceType<typeof MedicalPreview>>()

  onMounted(() => {
    getBasicEnum()
  })

  const getPatientDetail=()=>{
    medicalModal.value.loading=true
    PatientApiCtrl.PatientDetail({patientId:props.patientId}).then(data=>{
      patientInfo.value=data
    }).catch(() => {}).finally(() => {medicalModal.value.loading=false })
  }

  const getVisitList=()=>{
    PatientApiCtrl.VisitList({patientId:props.patientId,page:1,limit:100}).then(data=>{
      visitInfo.value.list=data.Rows
      if(visitInfo.value.list.length){
        const target = props.visitId ? visitInfo.value.list.find(item => item.Id == props.visitId) : null
        visitInfo.value.id=target?.Id || visitInfo.value.list[0].Id
        seeVisitDetail()
        
      }
    }).catch(() => {}).finally(() => {})
  }

  const changeVisit=(item)=>{
    visitInfo.value.id=item.Id
    seeVisitDetail()
  }

  const seeVisitDetail=()=>{
    visitInfo.value.loading=true
    PrescriptApiCtrl.VisitDetail({id:visitInfo.value.id}).then(data=>{
      visitInfo.value.detail=data
    }).catch(() => {}).finally(() => {visitInfo.value.loading=false})
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
  }

  const normalizeNumberText = (value) => {
    if (value === null || value === undefined || value === '') return ''
    const matched = String(value).match(/\d+(\.\d+)?/)
    return matched ? matched[0] : String(value)
  }

  const firstText = (...values) => {
    const value = values.find(item => item !== null && item !== undefined && item !== '')
    return value === undefined ? '' : String(value)
  }

  const enumName=(list, id)=>{
    if (id === null || id === undefined || id === '') return ''
    const match = list.value.find(item => String(item.id) === String(id))
    return match?.name || ''
  }

  const doseCountText = (detail) => normalizeNumberText(firstText(detail?.Count, detail?.DoseCount)) || '1'
  const dosageFormText = (detail) => firstText(detail?.MedicineTypeName, detail?.DosageFormName, enumName(MedicineType, detail?.DosageForm), detail?.Unit)
  const useMethodText = (detail) => firstText(detail?.UseMethodName, enumName(ChineseMedicineUseMethod, detail?.UseMethod), detail?.UseMethod)
  const frequencyText = (detail) => firstText(detail?.DailyFrequencyName, detail?.FrequencyName, enumName(ChineseMedicineDailyFrequency, detail?.Frequency), detail?.DailyFrequency, detail?.Frequency, detail?.Dosage)
  const eachDoseText = (detail) => normalizeNumberText(firstText(detail?.PerDoseAmount, detail?.EachDose))
  const doseUnitText = (detail) => firstText(detail?.DoseUnitName, enumName(ChineseMedicineDoseUnit, detail?.DoseUnit), detail?.DoseUnit)
  const takeTimeText = (detail) => firstText(detail?.TakeTimeName, enumName(ChineseMedicineMedicationTime, detail?.TakeTime), detail?.TakeTime)
  const takeDaysText = (detail) => normalizeNumberText(firstText(detail?.CertNumber, detail?.TimeFrame, detail?.TakeDays))

</script>
<style lang="less" scoped>
.medical-detail-modal {
  margin: -4px -8px -8px;
  padding: 0 24px 24px;
  background: linear-gradient(180deg, #F9FBFD 0%, #FFFFFF 34%);
}

.medical-detail-modal__layout {
  display: flex;
  gap: 16px;
  min-height: 520px;
}

.medical-detail-modal__timeline {
  flex: 0 0 210px;
  min-width: 210px;
  max-height: calc(100vh - 250px);
  overflow: hidden;
  border: 1px solid #E7EEF8;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
}

.medical-detail-modal__timeline-title {
  padding: 14px 16px;
  border-bottom: 1px dashed #DCE6F3;
  background: #FDFCFA;
  color: #1F2B3D;
  font-size: 15px;
  font-weight: 500;
}

.medical-detail-modal__timeline-list {
  max-height: calc(100vh - 304px);
  overflow-y: auto;
  padding: 10px 10px 12px;
}

.medical-detail-modal__timeline-list::-webkit-scrollbar,
.medical-detail-modal__content::-webkit-scrollbar {
  width: 6px;
}

.medical-detail-modal__timeline-list::-webkit-scrollbar-thumb,
.medical-detail-modal__content::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(143, 164, 196, 0.28);
}

.medical-detail-modal__timeline-list::-webkit-scrollbar-track,
.medical-detail-modal__content::-webkit-scrollbar-track {
  background: transparent;
}

.medical-detail-modal__timeline-item {
  position: relative;
  padding: 10px 10px 10px 20px;
  border: 1px solid transparent;
  border-radius: 10px;
  color: #4E5766;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;

  &::before {
    position: absolute;
    top: 20px;
    bottom: -12px;
    left: 7px;
    border-left: 1px dashed #DCE6F3;
    content: '';
  }

  &:last-child::before {
    display: none;
  }

  &:hover {
    border-color: #D7E4F8;
    background: #EEF5FF;
    box-shadow: 0 0 0 2px fade(@primary-color, 8%), 0 4px 10px rgba(32, 48, 75, 0.05);
  }
}

.medical-detail-modal__timeline-item + .medical-detail-modal__timeline-item {
  margin-top: 6px;
}

.medical-detail-modal__timeline-dot {
  position: absolute;
  top: 16px;
  left: 3px;
  z-index: 1;
  width: 9px;
  height: 9px;
  border: 2px solid #C9D8EF;
  border-radius: 50%;
  background: #FFFFFF;
}

.medical-detail-modal__timeline-item--active {
  border-color: #D7E4F8;
  background: #E1EBFF;
  color: @primary-color;
  box-shadow: 0 0 0 2px fade(@primary-color, 8%);

  .medical-detail-modal__timeline-dot {
    border-color: @primary-color;
    background: @primary-color;
  }
}

.medical-detail-modal__timeline-time {
  font-size: 13px;
  line-height: 18px;
}

.medical-detail-modal__timeline-diagnosis {
  margin-top: 4px;
  overflow: hidden;
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.medical-detail-modal__content {
  flex: 1;
  min-width: 0;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
  padding-right: 4px;
}

.medical-detail-modal__hero {
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
  padding: 18px 20px;
  border: 1px solid #E7EEF8;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 28px rgba(32, 48, 75, 0.06);
}

.medical-detail-modal__avatar {
  flex: 0 0 auto;

  img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }
}

.medical-detail-modal__patient {
  flex: 1;
  min-width: 0;
}

.medical-detail-modal__patient-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.medical-detail-modal__patient-name {
  color: #1F2B3D;
  font-size: 18px;
  font-weight: 500;
  line-height: 26px;
}

.medical-detail-modal__patient-meta {
  display: flex;
  flex-wrap: wrap;
  margin-top: 4px;
  color: #5F6A7A;
  font-size: 13px;
  line-height: 20px;

  span + span::before {
    width: 1px;
    height: 12px;
    margin: 0 10px;
    border-left: 1px dashed #DCE6F3;
    content: '';
  }
}

.medical-detail-modal__print-btn {
  border-radius: 8px !important;
}

.medical-detail-modal__info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 14px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed #DCE6F3;

  div {
    min-width: 0;
  }

  span {
    display: block;
    color: #7A8494;
    font-size: 12px;
    line-height: 18px;
  }

  strong {
    display: block;
    overflow: hidden;
    color: #1F2B3D;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.medical-detail-modal__section {
  overflow: hidden;
  border: 1px solid #E7EEF8;
  border-radius: 14px;
  background: #FFFFFF;
}

.medical-detail-modal__section-title {
  padding: 12px 16px;
  border-bottom: 1px dashed #DCE6F3;
  background: #FDFCFA;
  color: #1F2B3D;
  font-size: 16px;
  font-weight: 500;
}

.medical-detail-modal__case-section {
  border-color: #e8cf9e;
  border-radius: 12px;

  .medical-detail-modal__section-title {
    padding: 14px 16px;
    border-bottom: 1px solid #f0e2c2;
    background: #FFFDEC;
    color: #1F2B3D;
    font-weight: 600;
  }
}

.medical-detail-modal__record-table {
  padding: 0;

  :deep(.ant-descriptions-view) {
    overflow: hidden;
    border: 0;
    border-radius: 0;
  }

  :deep(.ant-descriptions-item-label) {
    color: #5F6A7A;
    font-size: 14px;
    font-weight: 400;
    background: #fafafa;
  }

  :deep(.ant-descriptions-item-content) {
    color: #000000;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
    white-space: pre-wrap;
    background: #FFFFFF;
  }

  :deep(.ant-descriptions-bordered .ant-descriptions-item-label),
  :deep(.ant-descriptions-bordered .ant-descriptions-item-content) {
    border-color: #f0f0f0;
  }

  :deep(.ant-descriptions-row:last-child .ant-descriptions-item-label),
  :deep(.ant-descriptions-row:last-child .ant-descriptions-item-content) {
    border-bottom: 0;
  }
}

.medical-detail-modal__prescription {
  margin: 14px 16px 16px;
  overflow: hidden;
  border: 1px dashed #DCE6F3;
  border-radius: 12px;

  & + & {
    margin-top: 0;
  }
}

.medical-detail-modal__prescription-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #F9FBFD;
  color: #1F2B3D;
  font-size: 14px;
  font-weight: 500;

  span:last-child {
    color: #5F6A7A;
    font-size: 13px;
    font-weight: 400;
  }
}

.medical-detail-modal__materials {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px 10px;
  padding: 12px;
}

.medical-detail-modal__material {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 34px;
  padding: 0 10px;
  border: 1px dashed #DCE6F3;
  border-radius: 8px;
  background: #FFFFFF;

  span {
    min-width: 0;
    overflow: hidden;
    color: #1F2B3D;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    flex: 0 0 auto;
    color: @primary-color;
    font-size: 14px;
    font-weight: 500;
  }
}

.medical-detail-modal__usage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 10px 12px;
  border-top: 1px dashed #DCE6F3;
  background: #F9FBFD;
  color: #4E5766;
  font-size: 14px;
  line-height: 22px;

  span {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
  }

  span + span::before {
    width: 1px;
    height: 12px;
    margin: 0 10px;
    border-left: 1px dashed #DCE6F3;
    content: '';
  }
}

.medical-detail-modal__remark {
  display: flex;
  gap: 16px;
  padding: 10px 12px;
  border-top: 1px dashed #DCE6F3;

  span {
    flex: 0 0 auto;
    color: #5F6A7A;
    font-size: 13px;
  }

  p {
    margin: 0;
    color: #4E5766;
    font-size: 14px;
    line-height: 22px;
  }
}

:global(.dashboard-medical-detail-modal .ant-modal-content) {
  border-radius: 28px;
  overflow: hidden;
}

:global(.dashboard-medical-detail-modal .ant-modal-header) {
  margin-bottom: 0;
  padding: 20px 24px 14px;
  border-bottom: 1px dashed #DCE6F3;
}

:global(.dashboard-medical-detail-modal .ant-modal-body) {
  padding-top: 18px;
}
</style>
