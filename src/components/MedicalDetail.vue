<template>
  <div>
    <a-modal v-model:open="medicalModal.visible" title="病历详情" centered width="1000px" :footer="null" :maskClosable="false" destroyOnClose>
      <section class="padding-lr24 pb24px">
        <div class="flex">
          <div class="bg-[#f5f7fa] border-rd-8px p-12px overflow-y-scroll scrollbar-none" style="height: calc(100vh - 380px);" v-if="visitInfo.list.length">
            <div class="p-12px mb4px border-rd-8px color-[#4E5766] pointer" :class="visitInfo.id==item.Id?'bg-[#d8e4fb] color-[#0A5AFF] text-bold':''" v-for="(item,index) in visitInfo.list" :key="index" @click="changeVisit(item)">{{item.CreateTime}}</div>
          </div>
          <div class="flex-sub ml12px overflow-y-scroll scrollbar-none" id="printJS-form" style="height: calc(100vh - 380px);">
            <div class="p-16px border-rd-8px flex border border-color-[#E9ECEF] mb16px">
              <img class="w40px h40px border-rd-50%" src="../assets/images/userAvatar1.png" alt="">
              <div class="ml8px flex-sub">
                <div class="flex justify-between align-center">
                  <div class="flex align-center flex-sub">
                    <div class="text-16px text-bold">{{patientInfo.Patient.Name}}</div>
                    <div class="ml8px">{{patientInfo.Patient.Gender==1?'男':'女'}}</div>
                    <div class="ml4px">{{patientInfo.Patient.Age}}岁</div>
                    <div class="ml8px">{{patientInfo.Patient.Phone}}</div>
                  </div>
                  <a-button type="primary" @click="medicalPreviewRef?.handlePrint()">打印病历</a-button>
                </div>
                <div class="flex align-center mt16px">
                  <div class="w50%">
                    <span class="color-[#4E5766]">开单医师：</span>
                    <span>{{visitInfo.detail.Visit.DoctorName||'--'}}</span>
                  </div>
                  <div class="w50%">
                    <span class="color-[#4E5766]">病历号：</span>
                    <span>{{visitInfo.id||'--'}}</span>
                  </div>
                </div>
                <div class="flex align-center mt4px flex-wrap">
                  <div class="w50% visitTime whitespace-nowrap">
                    <span class="color-[#4E5766]">首次就诊时间：</span>
                    <span>{{ patientInfo.Patient.FirstVisitTime }}</span>
                  </div>
                  <div class="w50% visitTime whitespace-nowrap">
                    <span class="color-[#4E5766]">上次就诊时间：</span>
                    <span>{{ patientInfo.Patient.LastVisitTime }}</span>
                  </div>
                </div>
              </div>
            </div>
            <a-empty description="暂无病历" v-if="!visitInfo.list.length" />
            <div v-if="visitInfo.list.length&&visitInfo.id" v-loading="visitInfo.loading">
              <a-descriptions bordered :column="1" size="small" :labelStyle="{ width: '100px' }">
                <a-descriptions-item label="主诉">{{visitInfo.detail.Visit.ChiefComplaint}}</a-descriptions-item>
                <a-descriptions-item label="现病史">{{visitInfo.detail.Visit.PresentIllness}}</a-descriptions-item>
                <a-descriptions-item label="既往史">{{visitInfo.detail.Visit.PastHistory}}</a-descriptions-item>
                <a-descriptions-item label="过敏史">{{visitInfo.detail.Visit.AllergyHistory}}</a-descriptions-item>
                <a-descriptions-item label="个人史">{{visitInfo.detail.Visit.PersonalHistory}}</a-descriptions-item>
                <a-descriptions-item label="体格检查">{{visitInfo.detail.Visit.PhysicalExam}}</a-descriptions-item>
                <a-descriptions-item label="望闻切诊">{{visitInfo.detail.Visit.TCMDiagnosis}}</a-descriptions-item>
                <a-descriptions-item label="诊断">{{visitInfo.detail.Visit.Diagnosis}}</a-descriptions-item>
              </a-descriptions>
              <div v-if="visitInfo.detail.Details.length">
                <div class="border-rd-12px border border-color-[#E9ECEF] overflow-hidden mt24px" v-for="(item,index) in visitInfo.detail.Details" :key="index">
                  <div class="bg-[#F9FBFD] pl16px pr16px pt12px pb12px  mb12px flex justify-between align-center">
                    <div class="text-16px text-bold">处方及药品明细</div>
                    <div>共{{item.Materials.length}}味药</div>
                  </div>
                  <a-descriptions  :labelStyle="{ padding:'0 16px' }" :column="3">
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
                      <div class="whitespace-nowrap">备注</div>
                      <div class="ml24px color-[#4E5766]">{{item.Detail.Remark}}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
    visible: { type: Boolean, default: false },
  });
  const { createMessage} = useMessage()
  const emit = defineEmits(['update:visible'])
  const ChineseMedicineUseMethod=ref([])
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
        visitInfo.value.id=visitInfo.value.list[0].Id
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
  }

</script>
<style lang="less" scoped>
</style>