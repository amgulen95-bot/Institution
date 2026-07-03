<template>
  <div ref="printAreaRef">
    <div class="medical-paper printJS-form">
      <div class="flex justify-between align-center">
        <div class="w104px">
          <img v-if="effectiveConfig.headerInfo?.includes('logo')" class="w104px h24px" src="../assets/images/logoText.png" alt="Logo">
        </div>
        <div class="text-center">
          <div class="text-20px text-bold">{{ effectiveConfig.headerName || '蒙医云蒙医医院' }}</div>
          <div class="text-20px text-bold">{{ effectiveConfig.headerSubtitle }}</div>
          <div class="mt4px" v-if="effectiveConfig.headerInfo?.includes('docTitle')">门诊病历</div>
        </div>
        <div class="w104px flex justify-center">
          <img v-if="effectiveConfig.headerInfo?.includes('barcode') && staticBarcode" class="w104px h32px" src="../assets/images/barcode.png" alt="">
          <svg v-if="effectiveConfig.headerInfo?.includes('barcode') && !staticBarcode" ref="barcodeRef" class="w104px" style="height:32px;"></svg>
        </div>
      </div>

      <div class="mt16px flex align-center flex-wrap">
        <div class="min-w33% border-b py8px">
          <span>姓名：</span>
          <span>{{receiptInfo.patientName}}</span>
          <span class="ml4px">{{ receiptInfo.gender }}</span>
          <span class="ml4px">{{ receiptInfo.age }}岁</span>
        </div>
        <div class="min-w33% border-b py8px">
          <span>诊号：</span>
          <span>{{ receiptInfo.sequenceNo }}</span>
          <span class="ml4px" v-if="effectiveConfig.checkStates?.includes('showVisitNo')">初诊</span>
        </div>
        <div class="min-w33% border-b py8px">
          <span>日期：</span>
          <span>{{ formatDate(receiptInfo.visitDate) }}</span>
        </div>
        <div class="min-w33% border-b py8px">
          <span>科室：</span>
          <span>{{ receiptInfo.deptName }}</span>
        </div>
        <div class="min-w33% border-b py8px" v-if="effectiveConfig.checkStates?.includes('showIdCard')">
          <span>身份证：</span>
          <span>{{ effectiveConfig.privacy?.includes('hideIdCard') ? maskString(receiptInfo.idCard) : receiptInfo.idCard }}</span>
        </div>
        <div class="min-w33% border-b py8px" v-if="effectiveConfig.checkStates?.includes('showBirth')">
          <span>出生日期：</span>
          <span>{{ receiptInfo.birthDate }}</span>
        </div>
        <div class="min-w33% border-b py8px" v-if="effectiveConfig.checkStates?.includes('showNation')">
          <span>民族：</span>
          <span>{{ receiptInfo.nation }}</span>
        </div>
        <div class="min-w33% border-b py8px" v-if="effectiveConfig.checkStates?.includes('showMobile')">
          <span>手机号：</span>
          <span>{{ effectiveConfig.privacy?.includes('hideMobile') ? maskString(receiptInfo.mobile) : receiptInfo.mobile }}</span>
        </div>
        <div class="min-w33% border-b py8px" v-if="effectiveConfig.checkStates?.includes('showAddress')">
          <span>地址：</span>
          <span>{{ receiptInfo.address }}</span>
        </div>
      </div>

      <div class="mt4px">
        <div class="pt8px">
          <span class="text-bold">主      诉：</span>
          <span>{{ receiptInfo.chiefComplaint }}</span>
        </div>
        <div class="pt8px">
          <span class="text-bold">现病史：</span>
          <span>{{ receiptInfo.presentIllness }}</span>
        </div>
        <div class="pt8px">
          <span class="text-bold">既往史：</span>
          <span>{{ receiptInfo.pastHistory }}</span>
        </div>
        <div class="pt8px">
          <span class="text-bold">诊断：</span>
          <span>{{ receiptInfo.diagnosis }}</span>
        </div>
      </div>

      <div class="mt12px space-y-3 border-t border-dashed">
        <div v-if="receiptInfo.prescriptions?.length" class="mt-4">
          <div class="mb12px" v-for="(item, index) in receiptInfo.prescriptions" :key="index">
            <div class="grid grid-cols-3 gap-x-4 gap-y-2 pl-4">
              <div v-for="(mat, mi) in item.materials" :key="mi" class="flex justify-between">
                <span>{{ mat.name }}</span>
                <span>{{ mat.weight }}</span>
              </div>
            </div>
            <div v-if="item.usage" class="mt-2 pl-4 text-gray-700">用法：{{ item.usage }}</div>
          </div>
        </div>

        <div v-if="receiptInfo.advice" class="mt12px pt12px border-t border-dashed flex">
          <div class="font-bold">医嘱：</div>
          <div class="ml8px whitespace-pre-wrap">{{ receiptInfo.advice }}</div>
        </div>
      </div>
      <template v-if="effectiveConfig.footerInfo?.includes('address')&&(effectiveConfig.footerInfo?.includes('phone')||effectiveConfig.footerInfo?.includes('printTime'))">
        <div class="mt24px border-t py8px flex align-center gap12px">
          <div>医生：{{ receiptInfo.doctorName }}</div>
          <div v-if="effectiveConfig.footerInfo?.includes('amount')">金额：￥{{ receiptInfo.totalAmount }}</div>
          <div v-if="effectiveConfig.footerInfo?.includes('printTime')">打印时间：{{ currentTime}}</div>
          <div v-if="effectiveConfig.footerInfo?.includes('phone')">电话：{{ receiptInfo.doctorPhone }}</div>
        </div>
        <div v-if="effectiveConfig.footerInfo?.includes('address')">地址：{{ receiptInfo.doctorAddress }}</div>
      </template>
      <div v-else class="mt24px border-t py8px flex align-center gap12px">
        <div>医生：{{ receiptInfo.doctorName }}</div>
        <div v-if="effectiveConfig.footerInfo?.includes('amount')">金额：￥{{ receiptInfo.totalAmount }}</div>
        <div v-if="effectiveConfig.footerInfo?.includes('printTime')">打印时间：{{ currentTime}}</div>
        <div v-if="effectiveConfig.footerInfo?.includes('phone')">电话：{{ receiptInfo.doctorPhone }}</div>
        <div v-if="effectiveConfig.footerInfo?.includes('address')">地址：{{ receiptInfo.doctorAddress }}</div>
      </div>

      <div v-if="effectiveConfig.footerNote" class="text-10px mt8px">{{ effectiveConfig.footerNote }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import dayjs from 'dayjs';
import JsBarcode from 'jsbarcode';
import { cloneDeep } from 'lodash-es';
import { PrintApiCtrl } from '/@/api/myy/print';
import { PrescriptApiCtrl } from '/@/api/myy/prescript';
import { PatientApiCtrl } from '/@/api/myy/patient';
import { basicEnum } from '/@/api/platform/common';
import { useUserStore } from '@/store/modules/user';

interface HeaderConfig {
  headerName?: string;
  headerSubtitle?: string;
  headerInfo: string[];
  checkStates: string[];
  patientInfo: string[];
  privacy: string[];
  showChargeItems: boolean;
  packageMode?: string;
  latinAbbreviation?: boolean;
  footerInfo: string[];
  footerNote?: string;
}

interface MedicalData {
  patientName?: string;
  gender?: string;
  age?: number;
  sequenceNo?: string;
  mobile?: string;
  idCard?: string;
  deptName?: string;
  birthDate?: string;
  nation?: string;
  address?: string;
  visitDate?: string;
  feeType?: string;
  diagnosis?: string;
  pastHistory?: string;
  presentIllness?: string;
  chiefComplaint?: string;
  items?: Array<{ name: string; price: number }>;
  prescriptions?: Array<{
    materials: Array<{ name: string; weight: string }>;
    usage: string;
  }>;
  packageItems?: Array<{ name: string }>;
  advice?: string;
  doctorName?: string;
  totalAmount?: number;
  doctorPhone?: string;
  doctorAddress?: string;
}

const props = withDefaults(
  defineProps<{
    config?: HeaderConfig | null;
    data?: MedicalData | null;
    patientId?: string;
    visitId?: string;
    staticBarcode?: boolean;
  }>(),
  {
    config: null,
    data: null,
    patientId: '',
    visitId: '',
    staticBarcode: false,
  }
);

const userStore = useUserStore();
const printAreaRef = ref<HTMLElement>();
const barcodeRef = ref<SVGSVGElement>();

const defaultConfig: HeaderConfig = {
  headerName: '',
  headerSubtitle: '',
  headerInfo: ['logo', 'docTitle'],
  checkStates: ['showMobile'],
  patientInfo: [],
  privacy: ['hideMobile'],
  showChargeItems: true,
  footerInfo: ['amount', 'printTime'],
  footerNote: '',
};

const apiConfig = ref<HeaderConfig>(cloneDeep(defaultConfig));
const ChineseMedicineUseMethod = ref<any[]>([]);
const visitDetail = ref<any>({ Visit: {}, Details: [], Order: {} });
const patientInfo = ref<any>({ Patient: {} });
const loading = ref(false);

const effectiveConfig = computed(() => props.config || apiConfig.value);

const receiptInfo = computed<MedicalData>(() => {
  if (props.data) return props.data;

  if (props.patientId && props.visitId) {
    const detail = visitDetail.value
    const patient = patientInfo.value.Patient || {}
    const visit = detail.Visit || {}
    const details = detail.Details || []
    const order = detail.Order || {}
    return {
      patientName: patient.Name || '',
      gender: patient.Gender == 1 ? '男' : patient.Gender == 2 ? '女' : '',
      age: patient.Age,
      idCard: patient.IDCard || '',
      nation: patient.Nation || '',
      address: patient.Address || '',
      sequenceNo: visit.Id || '',
      mobile: patient.Phone || '',
      deptName: userStore.getUserInfo?.Doctor?.Department || '',
      doctorName: visit.DoctorName || '',
      doctorAddress: (userStore.getUserInfo?.Clinic?.Province || '') + (userStore.getUserInfo?.Clinic?.City || '') + (userStore.getUserInfo?.Clinic?.District || '') + (userStore.getUserInfo?.Clinic?.Address || ''),
      doctorPhone: userStore.getUserInfo?.Clinic?.ContactPhone || '',
      visitDate: visit.CreateTime || '',
      chiefComplaint: visit.ChiefComplaint || '',
      presentIllness: visit.PresentIllness || '',
      pastHistory: visit.PastHistory || '',
      diagnosis: visit.Diagnosis || '',
      prescriptions: details.map((d: any) => {
        const det = d.Detail || {}
        const materials = (d.Materials || []).map((m: any) => ({
          name: m.Name || '',
          weight: (m.Weight || m.Weight === 0) ? m.Weight + 'g' : '',
        }))
        const usage = [(det.Count || '') + '剂', det.MedicineTypeName, det.UseMethodName, det.DailyFrequencyName, '单次剂量：' + (det.PerDoseAmount || '') + (det.DoseUnitName || ''), det.TakeTimeName, det.CertNumber ? '疗程：' + det.CertNumber : det.TimeFrame ? '疗程：' + det.TimeFrame : ''].filter(Boolean).join('；')
        return { materials, usage }
      }),
      advice: visit.Advice || '',
      totalAmount: order.TotalPay,
    }
  }

  return {
    patientName: '任盈盈',
    gender: '女',
    age: 22,
    sequenceNo: '1841841564864',
    deptName: '内科',
    doctorName: '胡青牛',
    birthDate: '1998-12-10',
    idCard: '500361199602102320',
    nation: '汉族',
    address: '重庆市南岸区南城大道128号',
    visitDate: '2026-06-10',
    mobile: '184****7385',
    diagnosis: '感冒',
    pastHistory: '无',
    presentIllness: '无',
    chiefComplaint: '咳嗽,发热,头痛',
    prescriptions: [
      {
        materials: [
          { name: '桔梗', weight: '6g' },
          { name: '黄芩', weight: '6g' },
          { name: '知母', weight: '6g' },
          { name: '赤芍', weight: '6g' },
          { name: '玄参', weight: '6g' },
          { name: '连翘', weight: '6g' },
        ],
        usage: '2剂；煎服；1日1剂日3次每次150ml，饭后1小时服用',
      },
    ],
    advice: '1.多喝水，保持身体充足水分\n2.饮食规律宜清淡，忌烟酒，忌辛辣寒凉',
    totalAmount: 285.09,
    doctorPhone: '13888883007',
    doctorAddress: '重庆市大渡口区南城大道128号测试诊所',
  }
})

const currentTime = computed(() => dayjs().format('YYYY-MM-DD HH:mm:ss'));

const generateBarcode = () => {
  const code = receiptInfo.value.sequenceNo
  if (barcodeRef.value && code) {
    try {
      JsBarcode(barcodeRef.value, code, {
        format: 'CODE128',
        width: 1.5,
        height: 24,
        displayValue: false,
        margin: 0,
        background: 'transparent',
      })
    } catch (_e) { }
  }
}

watch(() => receiptInfo.value.sequenceNo, generateBarcode)

const getPrintConfig = () => {
  if (props.config) return
  PrintApiCtrl.PrintConfig({}).then(data => {
    const raw = data.MedicalRecordTemplate || data.MedicalTemplate
    if (raw) {
      const parsed = JSON.parse(raw)
      apiConfig.value = cloneDeep({ ...defaultConfig, ...parsed })
    }
  }).catch(() => { })
}

const getBasicEnum = () => {
  if (!props.data && props.patientId && props.visitId) {
    basicEnum({ name: 'ChineseMedicineUseMethod' }).then(data => {
      ChineseMedicineUseMethod.value = data
    })
  }
}

const fetchData = () => {
  if (!props.patientId || !props.visitId) return
  loading.value = true
  Promise.all([
    PrescriptApiCtrl.VisitDetail({ id: props.visitId }),
    PatientApiCtrl.PatientDetail({ patientId: props.patientId }),
  ]).then(([visitData, patientData]) => {
    visitDetail.value = visitData
    patientInfo.value = patientData
  }).catch(() => { }).finally(() => { loading.value = false })
}

watch(() => [props.patientId, props.visitId], ([pid, vid]) => {
  if (pid && vid) {
    getBasicEnum()
    fetchData()
  }
}, { immediate: true })

onMounted(() => {
  getPrintConfig()
  if (!props.data && !props.patientId && !props.visitId) {
    getBasicEnum()
  }
  generateBarcode()
})

const formatDate = (dateStr: string) => dateStr || ''

const maskString = (str: string | undefined) => {
  if (!str) return ''
  if (str.length <= 2) return '*'
  if (str.length >= 7) return str.substring(0, 3) + '****' + str.substring(str.length - 4)
  return str.substring(0, 1) + '***' + str.substring(str.length - 1)
}

const handlePrint = () => {
  nextTick(() => {
    const el = printAreaRef.value
    if (!el) return
    const styles = Array.from(document.styleSheets).map(s => {
      try { return Array.from(s.cssRules || []).map(r => r.cssText).join('') } catch (e) { return '' }
    }).join('')
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:0;height:0;border:none'
    document.body.appendChild(iframe)
    const doc = iframe.contentWindow?.document
    if (!doc) { document.body.removeChild(iframe); return }
    doc.write(`<html><head><title>打印病历</title><style>${styles}</style></head><body>${el.innerHTML}</body></html>`)
    doc.close()
    iframe.contentWindow?.focus()
    setTimeout(() => {
      iframe.contentWindow?.print()
      setTimeout(() => document.body.removeChild(iframe), 1000)
    }, 500)
  })
}

defineExpose({ handlePrint })
</script>

<style scoped>
.medical-paper {
  width: 740px;
  min-height: 726px;
  background: white;
  padding: 24px;
}
@media print {
  .medical-preview-container {
    transform: scale(1);
  }
}
</style>
