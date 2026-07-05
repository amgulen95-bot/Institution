<template>
  <div class="p-4 home" v-loading="loading">
    <div class="flex justify-between" style="height: calc(100vh - 192px);">
      <a-card class="dashboard-card-radius h-100% overflow-hidden w-380px">
        <div class="text-18px text-bold">今日接诊</div>
        <div class="flex align-center mt16px mb12px">
          <a-input-search v-model:value="todayVisit.searchParams.keyword" placeholder="搜索患者姓名、手机号" @search="handleTabChange" />
          <a-button class="ml12px dashboard-system-radius-btn" type="primary" @click="handleQuick">
            <template #icon><PlusOutlined /></template>
            快速接诊
          </a-button>
        </div>
        <a-tabs class="today-visit-tabs" v-model:activeKey="todayVisit.searchParams.status" @change="handleTabChange">
          <a-tab-pane :key="null" tab="全部"></a-tab-pane>
          <a-tab-pane :key="1" tab="就诊中"></a-tab-pane>
          <a-tab-pane :key="2" tab="已完成"></a-tab-pane>
        </a-tabs>
        <div ref="todayVisitListRef" class="overflow-y-scroll scrollbar-none today-visit-content-panel" :class="{ 'today-visit-content-switching': todayVisitSwitching }" style="height: calc(100% - 142px);">
          <div class="today-visit-item p16px border border-color-[#F3F4F7] border-rd-8px flex mb12px pointer" :class="visitInfo.index==index?'activeTag':''" v-for="(item,index) in todayVisit.list" @click="seleceVisit(item,index)" :key="index">
            <img class="w52px h52px border-rd-50%" :src="getImageUrl(`userAvatar${(index % 7) + 1}.png`)" alt="">
            <div class="flex-sub ml12px">
              <div class="flex justify-between align-center">
                <div class="text-16px">{{item.PatientName||'匿名患者'}}</div>
                <a-tag :bordered="false" v-if="item.Id" :color="item.VisitStatus==0?'orange':item.VisitStatus==1?'blue':''">{{ClinicVisitStatus.find(p=>p.id==item.VisitStatus)?.name}}</a-tag>
                <a-tag :bordered="false" v-else color="green">草稿</a-tag>
              </div>
              <div class="mt4px color-[#4E5766]">{{ item.PatientGender==1?'男':item.PatientGender==2?'女':'--'}} · {{item.PatientAge||'--'}}岁</div>
              <div class="flex justify-between align-center mt12px">
                <div class="color-[#4E5766]" v-if="item.PatientPhone">{{item.PatientPhone.substring(0, 3) + '****' + item.PatientPhone.substring(7)}}</div>
                <div class="color-[#4E5766]" v-else>--</div>
                <div class="color-[#858D98] flex align-center" v-if="item.Id">
                  <ClockCircleOutlined />
                  <span class="ml4px">{{item.CreateTime.split(' ')[1]}}</span>
                </div>
                <DeleteOutlined class="text-red" v-else @click.stop="DeleteDraft(item.DraftId,index)" />
              </div>
            </div>
          </div>
          <div class="text-center" v-if="todayVisit.hasNextPage" @click="handleLoadMore">
            <a-button type="link">
              <span>加载更多</span>
              <RightOutlined />
            </a-button>
          </div>
          <div v-else-if="todayVisit.list.length > 0" class="text-center color-[#858D98]">没有更多了</div>
          <a-empty class="pt48px" v-if="!todayVisit.list.length" />
        </div>
      </a-card>
      <div class="min-w600px flex-sub ml16px h-100% overflow-y-scroll pb12px scrollbar-none receptionPanel today-visit-content-panel" :class="{ 'today-visit-content-switching': todayVisitSwitching || todayVisitDetailSwitching }">
        <template v-if="isEditableVisit">
          <div class="flex justify-between align-center flex-wrap">
            <div class="flex justify-between align-center flex-wrap">
              <a-space class="patient-info-card pt2px pb2px pl16px pr16px bg-[#fff] border-rd-8px mb8px" :size="24">
                <a-popover :open="patientModal.visible && patientSearchField === 'name'" placement="bottomLeft" :trigger="[]" overlayClassName="patient-search-popover" :destroyTooltipOnHide="false" >
                  <template #content>
                    <div class="patient-search-panel">
                      <PatientList :list-data="patientModal.list" :loading="patientModal.loading" @row-click="handleSelectPatient"></PatientList>
                    </div>
                  </template>
                  <div class="flex align-center patient-name-field">
                    <img class="w20px h20px" src="../../assets/images/userImg.png" alt="">
                    <a-input class="w80px patient-name-input" size="small" v-model:value="patientModal.form.Name" :bordered="false" :disabled="Boolean(patientModal.form.Id)" placeholder="患者姓名" @change="handleInputChange" />
                  </div>
                </a-popover>

                <a-select class="patient-gender-field" v-model:value="patientModal.form.Gender" placeholder="性别" :bordered="false" :disabled="Boolean(patientModal.form.Id)" @select="selectGender">
                  <a-select-option :value="1">男</a-select-option>
                  <a-select-option :value="2">女</a-select-option>
                </a-select>
                <div class="flex align-center patient-age-field">
                  <a-input-number id="inputNumber" class="text-right patient-age-input" size="small" v-model:value="patientModal.form.Age" :controls="false" :bordered="false" :disabled="Boolean(patientModal.form.Id)" placeholder="多少" :min="0" :max="105" @change="changeAge" @blur="normalizePatientAge" />
                  <span>岁</span>
                </div>
                <a-popover :open="patientModal.visible && patientSearchField === 'phone'" placement="bottomLeft" :trigger="[]" overlayClassName="patient-search-popover" :destroyTooltipOnHide="false" >
                  <template #content>
                    <div class="patient-search-panel">
                      <PatientList :list-data="patientModal.list" :loading="patientModal.loading" @row-click="handleSelectPatient"></PatientList>
                    </div>
                  </template>
                  <div class="flex align-center patient-phone-field">
                    <img class="w20px h20px" src="../../assets/images/phone.png" alt="">
                    <a-input class="w100px patient-phone-input" size="small" v-model:value="patientModal.form.Phone" :bordered="false" :disabled="Boolean(patientModal.form.Id)" placeholder="手机号码" :maxlength="11" @change="handlePhoneInputChange" @blur="validatePatientPhone({ defer: true })" />
                  </div>
                </a-popover>
                <span class="patient-clear-slot">
                  <CloseOutlined v-if="patientModal.form.Id" @click="handleClearPatient" />
                </span>
              </a-space>
              <a-space class="patient-action-card pt8px pb8px pl16px pr16px bg-[#fff] border-rd-8px ml8px mb8px" :size="16">
                <div class="flex align-center pointer patient-action-field patient-id-card-action">
                  <img class="w20px h20px" src="../../assets/images/idCard.png" alt="">
                </div>
                <a-divider type="vertical" />
                <div class="flex align-center pointer patient-action-field patient-add-action" @click="addPatientVisible=true">
                  <img class="w20px h20px" src="../../assets/images/addUser.png" alt="">
                  <span class="ml4px whitespace-nowrap">新增患者</span>
                </div>
              </a-space>
            </div>
            <div class="flex align-center pt2px pb2px pl4px pr4px bg-[#fff] border-rd-8px mb8px" :size="16">
              <div class="flex align-center visit-type-field">
                <a-select class="w80px" v-model:value="visitOtherForm.VisitType" placeholder="问诊类型" :bordered="false">
                  <a-select-option :value="0">初诊</a-select-option>
                  <a-select-option :value="1">复诊</a-select-option>
                </a-select>
              </div>
              <a-divider type="vertical" />
              <div class="registration-fee-outer">
                <div class="flex align-center">
                  <span>挂号费：</span>
                  <span class="text-bold text-theme registration-fee-currency">￥</span>
                  <a-input-number id="inputNumber" class="text-bold text-theme registration-fee-input" size="small" :controls="false" v-model:value="visitOtherForm.RegistrationFee" :bordered="false" :min="0" @change="changeRegistrationFee" @focus="selectRegistrationFee" @click="selectRegistrationFee" />
                </div>
              </div>
            </div>
          </div>
          <div class="bg-[#fff] border-rd-12px border border-color-[#e8cf9e] overflow-hidden">
            <Medical v-model:visit-form="visitForm" ref="medicalRef"></Medical>
          </div>
          <a-card class="dashboard-card-radius mt16px">
            <Prescription v-model:prescription-list="prescriptionList" ref="prescriptionRef" @add="handleCalculateFee" @doseChange="handleCalculateFee"></Prescription>
          </a-card>
          <!-- <a-card class="mt16px">
            <div class="flex">
              <div class="text-bold">
                <span>智能审方</span>
                <InfoCircleFilled class="color-[#c9cfd6] ml4px" />
              </div>
              <div class="flex-sub ml32px">
                <div class="flex justify-between align-center border-b border-color-[#E9ECEF] pb4px">
                  <div class="color-[#DB8E1A]">
                    <WarningFilled class="text-16px mr3px" />
                    <span>提醒:【制草乌】每日最高剂量不宜超过3g 《中国药典2025年版》</span>
                  </div>
                  <a-button type="link">确认签字</a-button>
                </div>
                <div class="flex justify-between align-center mt6px">
                  <div class="color-[#858D98] text-del">
                    <WarningFilled class="text-16px mr3px" />
                    <span>提醒:【制草乌】每日最高剂量不宜超过3g 《中国药典2025年版》</span>
                  </div>
                  <a-button type="text">取消签字</a-button>
                </div>
              </div>
            </div>
          </a-card> -->

          <a-card class="mt16px pb12px">
            <a-space :size="[12,12]" wrap>
              <div class="text-16px text-bold">
                <div>开方</div>
                <div>流程</div>
              </div>
              <a-divider type="vertical" />
              <div class="flex align-center">
                <img class="w40px h40px border-rd-50%" src="../../assets/images/kaifang.png" alt="">
                <div class="ml8px">
                  <div class="text-bold">开方</div>
                  <div class="text-12px color-[#858D98] mt2px">医师创建处方</div>
                </div>
              </div>
              <img class="w32px" src="../../assets/images/jiantou.png" alt="">
              <div class="flex align-center">
                <img class="w40px h40px border-rd-50%" src="../../assets/images/shenfang.png" alt="">
                <div class="ml8px">
                  <div class="text-bold">审方</div>
                  <div class="text-12px color-[#858D98] mt2px">药师审核处方</div>
                </div>
              </div>
              <img class="w32px" src="../../assets/images/jiantou.png" alt="">
              <div class="flex align-center">
                <img class="w40px h40px border-rd-50%" src="../../assets/images/diaopei.png" alt="">
                <div class="ml8px">
                  <div class="text-bold">调配</div>
                  <div class="text-12px color-[#858D98] mt2px">调配/复核药品</div>
                </div>
              </div>
              <img class="w32px" src="../../assets/images/jiantou.png" alt="">
              <div class="flex align-center">
                <img class="w40px h40px border-rd-50%" src="../../assets/images/fahuo.png" alt="">
                <div class="ml8px">
                  <div class="text-bold">发货</div>
                  <div class="text-12px color-[#858D98] mt2px">打包发货</div>
                </div>
              </div>
              <!-- <img class="w32px" src="../../assets/images/jiantou.png" alt="">
              <div class="flex align-center">
                <img class="w40px h40px border-rd-50%" src="../../assets/images/peisong.png" alt="">
                <div class="ml8px">
                  <div class="text-bold">配送</div>
                  <div class="text-12px color-[#858D98] mt2px">物流配送中</div>
                </div>
              </div> -->
              <img class="w32px" src="../../assets/images/jiantou.png" alt="">
              <div class="flex align-center">
                <img class="w40px h40px border-rd-50%" src="../../assets/images/wancheng.png" alt="">
                <div class="ml8px">
                  <div class="text-bold">完成</div>
                  <div class="text-12px color-[#858D98] mt2px">患者签收完成</div>
                </div>
              </div>
            </a-space>
          </a-card>
        </template>
        <ReceptionDetails :data="visitInfo.detail" v-else></ReceptionDetails>
      </div>
      <div class="w-380px ml16px h-100% overflow-y-scroll scrollbar-none today-visit-content-panel" :class="{ 'today-visit-content-switching': todayVisitSwitching || todayVisitDetailSwitching }">
        <a-card class="dashboard-card-radius otherCard" title="就诊历史" style="height: calc(50% - 12px);">
          <template #extra v-if="historyList.length">
            <div class="color-[#A5A8B4] pointer" @click="medicalModalVisible=true">
              <span>更多</span>
              <RightOutlined />
            </div>
          </template>
          <a-card border class="h-100% visit-history-card" v-if="historyList.length">
            <div class="overflow-y-scroll scrollbar-none" style="height: calc(100% - 16px);">
              <a-steps class="visit-history-steps" progress-dot :current="1" direction="vertical">
                <a-step v-for="(item,index) in historyList" :key="index">
                  <template #title>
                    <div class="visit-history-item">
                      <div class="visit-history-item__main">
                        <div class="visit-history-item__diagnosis">{{item.Diagnosis || '--'}}</div>
                        <a-tag class="visit-history-item__tag" :bordered="false" color="success" v-if="item.VisitType==0">初诊</a-tag>
                        <a-tag class="visit-history-item__tag" :bordered="false" color="processing" v-else>复诊</a-tag>
                      </div>
                      <div class="visit-history-item__time">{{item.CreateTime}}</div>
                    </div>
                  </template>
                </a-step>
              </a-steps>
            </div>
            <div class="text-center mt24px" @click="medicalModalVisible=true">
              <a-button type="primary" ghost>
                <span>查看全部就诊记录</span>
                <RightOutlined />
              </a-button>
            </div>
          </a-card>
          <div class="flex justify-center align-center flex-direction" v-else style="height: calc(100% - 16px);">
            <a-empty  />
          </div>
        </a-card>
        <a-card title="处方记录" class="dashboard-card-radius mt16px otherCard" style="height: calc(50% - 12px);">
          <template #extra>
            <div class="color-[#A5A8B4] pointer" @click="seeRootExtraction">
              <span>更多</span>
              <RightOutlined />
            </div>
          </template>
          <a-card border class="h-100%" v-if="prescriptList.length">
            <div class="overflow-y-scroll scrollbar-none" style="height: calc(100% - 16px);">
              <div class="pb16px border-b border-color-[#F3F4F7] mb16px" v-for="(item,index) in prescriptList" :key="index">
                <div class="flex">
                  <div class="flex-sub text-bold">{{ item.PrescriptName }}</div>
                  <a-tag :bordered="false" color="processing">{{ item.StatusName }}</a-tag>
                </div>
                <a-space class="mt4px color-[#4E5766] text-12px">
                  <div>{{ item.CreateTime }}</div>
                  <a-divider type="vertical" />
                  <div>共{{item.MaterialCount}}味药</div>
                  <a-divider type="vertical" />
                  <div>¥{{ item.TotalPay }}</div>
                </a-space>
              </div>
            </div>
            <div class="text-center mt24px">
              <a-button type="primary" ghost @click="seeRootExtraction">
                <span>查看全部处方记录</span>
                <RightOutlined />
              </a-button>
            </div>
          </a-card>
          <div class="flex justify-center align-center flex-direction" v-else style="height: calc(100% - 16px);">
            <a-empty  />
          </div>
        </a-card>
      </div>
    </div>
    <a-card class="mt16px" v-if="isEditableVisit">
      <div class="flex justify-between align-center">
        <a-space>
          <a-button class="dashboard-system-radius-btn" type="primary" ghost @click="seeFeeDetail">费用明细</a-button>
          <div class="ml24px">
            <span class="color-[#4E5766]">药费：</span>
            <span class="text-theme text-12px text-bold">￥</span>
            <span class="text-theme text-18px text-bold">{{(feeModal.info.Fee.MedicineAmount).toFixed(2)}}</span>
          </div>
          <a-divider type="vertical" />
          <div>
            <span class="color-[#4E5766]">挂号费：</span>
            <span class="text-theme text-12px text-bold">￥</span>
            <span class="text-theme text-18px text-bold">{{feeModal.info.Fee.RegistrationFee}}</span>
          </div>
          <a-divider type="vertical" />
          <div>
            <span class="color-[#4E5766]">合计：</span>
            <span class="color-[#F74344] text-12px text-bold">￥</span>
            <span class="color-[#F74344] text-18px text-bold">{{(feeModal.info.Fee.MedicineAmount+feeModal.info.Fee.RegistrationFee).toFixed(2)}}</span>
          </div>
        </a-space>
        <a-space :size="12">
          <a-button class="dashboard-system-radius-btn" type="primary" danger ghost @click="clearPrescript">清空处方</a-button>
          <a-button class="dashboard-system-radius-btn" type="primary" ghost @click="createOrder(1)">暂存处方</a-button>
          <a-button class="dashboard-system-radius-btn" type="primary" ghost @click="createOrder(2)">保存患者病历</a-button>
          <a-button class="dashboard-system-radius-btn" type="primary" @click="createOrder(3)">提交审方/开方发药</a-button>
        </a-space>
      </div>
    </a-card>
    <AddPatient v-model:visible="addPatientVisible" @confirm="getPatientDetail"></AddPatient>

    <FeePreview v-model:visible="feeModal.visible" :originallyAmount="feeModal.originallyAmount" :fee="feeModal.info.Fee" :list-data="feeModal.info.Items" @confirm="savePrice"></FeePreview>

    <ReceiptInfo v-model:visible="receiptModal.visible" :patient="patientModal.form" :visitId="visitInfo.Id"  :total="feeModal.info.Fee.ReceivableAmount" @confirm="saveReceipt"></ReceiptInfo>
    <OrderPayCountdownModal
      v-model:visible="orderPayCountdown.visible"
      :order-code="orderPayCountdown.orderCode"
      :seconds="orderPayCountdown.seconds"
      @confirm="goChargePayment"
      @cancel="cancelChargePaymentCountdown"
    ></OrderPayCountdownModal>

    <ConfirmPayment v-model:visible="payModal.visible" :payInfo="payModal.info" wrap-class-name="dashboard-confirm-payment-modal" @confirm="confirmPay"></ConfirmPayment>

    <template v-if="patientModal.form.Id">
      <MedicalDetail v-model:visible="medicalModalVisible" :patientId="patientModal.form.Id" :type="1" wrap-class-name="dashboard-medical-detail-modal"></MedicalDetail>
    </template>
    
  </div>
</template>
<script lang="ts" setup>
  import { computed,onActivated,onBeforeUnmount,onMounted,ref,createVNode,nextTick} from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Modal } from 'ant-design-vue';
  import { useUserStore } from '@/store/modules/user';
  import {PlusOutlined,ClockCircleOutlined,RightOutlined,CloseOutlined,CheckCircleFilled,DeleteOutlined} from '@ant-design/icons-vue';
  import {PrescriptApiCtrl} from '/@/api/myy/prescript';
  import {PatientApiCtrl} from '/@/api/myy/patient';
  import {OrderApiCtrl} from '/@/api/myy/order';
  import {SettingApiCtrl} from '/@/api/myy/setting';
  import { useGo } from '/@/hooks/web/usePage';
  import { cloneDeep } from 'lodash-es';
  import {basicEnum} from '/@/api/platform/common';
  import AddPatient from '/@/components/AddPatient.vue';
  import ConfirmPayment from '/@/components/ConfirmPayment.vue';
  import FeePreview from './components/FeePreview.vue';
  import ReceiptInfo from './components/ReceiptInfo.vue';
  import OrderPayCountdownModal from './components/OrderPayCountdownModal.vue';
  import PatientList from '/@/components/PatientList.vue';
  import Prescription from './components/Prescription.vue';
  import Medical from './components/Medical.vue';
  import ReceptionDetails from './components/ReceptionDetails.vue';
  import MedicalDetail from '/@/components/MedicalDetail.vue';
  import { getCloudPharmacyQuickPayConfig } from '/@/utils/quickPayConfig';

  const { createMessage} = useMessage()
  const userStore = useUserStore();
  const loading=ref(false)
  const go = useGo();
  const todayVisitListRef=ref<HTMLElement | null>(null)
  const todayVisitSwitching=ref(false)
  const todayVisitDetailSwitching=ref(false)
  const hasMounted=ref(false)
  const addPatientVisible=ref(false)
  const prescriptionRef=ref()
  const medicalRef=ref()
  const saveType=ref(1)
  const ClinicVisitStatus=ref([])
  const prescriptList=ref([])
  const medicalModalVisible=ref(false)
  const anonymousInfo={
    Id:'',
    PatientName:'',
    VisitStatus:0,
    PatientGender:null,
    PatientAge:null,
    PatientPhone:'',
    DraftId:Date.now(),
    MedicalInfo:{},
  }
  const payModal=ref({
    visible:false,
    loading:false,
    info:{},
  })
  const receiptModal=ref({
    visible:false,
    loading:false,
    info:{},
  })
  const orderPayCountdown=ref({
    visible:false,
    orderCode:'',
    visitId:'',
    patientId:'',
    seconds:8,
  })
  const feeModal=ref({
    visible:false,
    loading:false,
    originallyAmount:0,
    info:{
      "Items": [],
      "Fee": {
        "CostAmount": 0,
        "OriginalAmount": 0,
        "RetailMarkupRate":0,
        "RetailMarkupAmount": 0,
        "PremiumAmount": 0,
        "RegistrationFee": 0,
        "ReceivableAmount": 0,
        "Discount": 0,
        "DoctorIncomeAmount": 0,
        "PlatformProfit": 0,
        "MedicineAmount":0,
      }
    }
  })
  const visitInfo=ref({
    Id:'',
    index:0,
    detail:{},
  })
  const isEditableVisit = computed(() => {
    if(!visitInfo.value.Id){
      return true
    }
    const status = visitInfo.value.detail?.Visit?.VisitStatus
    return status !== undefined && status !== null && status != 2
  })
  const prescriptionForm={
    Name:'',
    Advice:'',
    Remark:'',
    DoseCount:1,
    DosageForm:'',
    UseMethod:null,
    Frequency:'',
    TakeTime:'',
    TakeDays:null,
    Materials:[{Sort:1,MaterialId:null,MaterialName:'',Weight:null}]
  }
  const prescriptionList=ref([cloneDeep(prescriptionForm)])
  const historyList=ref([])
  const initialPatientForm = {
    Id: '',
    Name: '',
    Phone: '',
    IDCard: '',
    Gender: 1,
    Age: null,
    RelationType: 0,
    BirthDate: '',
    Nation: '',
    MaritalStatus: 1,
    Address: '',
    Remark: '',
    Attrs: [],
  }
  const patientModal=ref({
    visible:false,
    loading:false,
    list:[],
    form: cloneDeep(initialPatientForm),
  })
  const defaultRegistrationFee = ref(0)
  const visitOtherForm=ref({
    VisitType:0,
    RegistrationFee:0,
  })
  const visitFormInfo={
    ChiefComplaint:'',
    PresentIllness:'',
    PastHistory:'',
    AllergyHistory:'',
    PersonalHistory:'',
    PhysicalExam:'',
    TCMDiagnosis:'',
    Diagnosis:'',
    DoctorRemark:'',
  }
  const visitForm=ref(cloneDeep(visitFormInfo))
  const todayVisit=ref({
    searchParams:{
      keyword:'',
      status:null,
      page:1,
      limit:20,
      docId:userStore.getUserInfo.Doctor.DoctorId,
    },
    list:[],
    hasNextPage: false,
  })
  let todayVisitSwitchKey = 0
  const waitFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  const waitMs = (delay: number) => new Promise<void>((resolve) => setTimeout(resolve, delay))
  const waitTodayVisitStableFrame = async () => {
    await nextTick()
    await waitFrame()
    await waitFrame()
  }
  const waitTodayVisitSwitchHidden = async () => {
    await nextTick()
    await waitFrame()
    await waitFrame()
    await waitMs(190)
  }
  onMounted(()=>{
    getBasicEnum()
    resetTodayVisitToAllFirst()
    getSettingDetail()
    nextTick(() => {
      hasMounted.value = true
    })
  })

  onActivated(()=>{
    if (hasMounted.value) {
      resetTodayVisitToAllFirst()
    }
  })

  const getSettingDetail=()=>{
    SettingApiCtrl.SettingDetail({}).then(data=>{
      defaultRegistrationFee.value = data.Clinic.RegistrationFee
      visitOtherForm.value.RegistrationFee=data.Clinic.RegistrationFee
      feeModal.value.info.Fee.RegistrationFee=visitOtherForm.value.RegistrationFee
    }).catch(() => {}).finally(() => {})
  }

    // 获取枚举
  const getBasicEnum=()=>{
    basicEnum({name:'ClinicVisitStatus'}).then(data=>{
      ClinicVisitStatus.value=data
    })
  }

  const resetTodayVisitToAllFirst=async ()=>{
    const switchKey = ++todayVisitSwitchKey
    todayVisitSwitching.value = true
    await waitTodayVisitSwitchHidden()
    if (switchKey !== todayVisitSwitchKey) return
    saveCurrentDraft()
    todayVisit.value.searchParams.status=null
    todayVisit.value.searchParams.page=1
    todayVisit.value.list=[]
    todayVisit.value.hasNextPage=false
    InitializeAll()
    nextTick(() => {
      if(todayVisitListRef.value){
        todayVisitListRef.value.scrollTop = 0
      }
    })
    await getTodayVisitList(false, { autoSelect: true, showLoading: false })
    if (switchKey !== todayVisitSwitchKey) return
    await waitTodayVisitStableFrame()
    if (switchKey === todayVisitSwitchKey) {
      todayVisitSwitching.value = false
    }
  }

  // 快速接诊
  const handleQuick=async ()=>{
    saveCurrentDraft()
    todayVisit.value.searchParams.status=null
    todayVisit.value.searchParams.page=1
    todayVisit.value.hasNextPage=false
    InitializeAll()
    const draftInfo = {
      ...cloneDeep(anonymousInfo),
      DraftId: Date.now(),
    }
    addDraftPatient(cloneDeep(draftInfo))
    await getTodayVisitList(false, { autoSelect: false, showLoading: false })
    const draftIndex = todayVisit.value.list.findIndex((item) => item.DraftId === draftInfo.DraftId)
    if(draftIndex !== -1){
      visitInfo.value={
        Id:'',
        index:draftIndex,
        detail:{},
      }
    }
    nextTick(() => {
      if(todayVisitListRef.value){
        todayVisitListRef.value.scrollTop = 0
      }
    })
  }

    // 初始化患者、病历、处方
  const InitializeAll=()=>{
    patientModal.value.form=cloneDeep(initialPatientForm)
    prescriptionList.value=[cloneDeep(prescriptionForm)]
    visitForm.value=cloneDeep(visitFormInfo)
    visitInfo.value={
      Id:'',
      index:0,
      detail:{},
    }
    historyList.value=[]
    prescriptList.value=[]
    visitOtherForm.value = {
      VisitType: 0,
      RegistrationFee: defaultRegistrationFee.value || 0,
    }
    feeModal.value.info.Fee.RegistrationFee = visitOtherForm.value.RegistrationFee
    feeModal.value.originallyAmount = 0
    feeModal.value.info.Fee.OriginalAmount = 0
    feeModal.value.info.Fee.RetailMarkupAmount = 0
    feeModal.value.info.Fee.PremiumAmount = 0
    feeModal.value.info.Fee.ReceivableAmount = 0
    feeModal.value.info.Items = []
  }

  // 删除草稿
  const DeleteDraft=(id,i)=>{
    let storedList=localStorage.getItem('DraftPatientList')
    let draftList=JSON.parse(storedList)
    let index=draftList.findIndex(p=>p.DraftId==id)
    draftList.splice(index, 1)
    localStorage.setItem('DraftPatientList',JSON.stringify(draftList))

    todayVisit.value.list.splice(i, 1)
    if (todayVisit.value.list.length) {
      seleceVisit(todayVisit.value.list[0], 0)
    } else {
      InitializeAll()
    }
  }

  // 持久化当前草稿数据到 localStorage
  const saveCurrentDraft = () => {
    const currentItem = todayVisit.value.list[visitInfo.value.index];
    if (currentItem?.DraftId) {
      currentItem.MedicalInfo = {
        patientModal: cloneDeep(patientModal.value.form),
        visitForm: cloneDeep(visitForm.value),
        prescriptionList: cloneDeep(prescriptionList.value),
        visitOtherForm: cloneDeep(visitOtherForm.value),
      };
      addDraftPatient(currentItem);
    }
  };

  // 新增/编辑草稿到今日接诊
  const addDraftPatient=(info)=>{
    if(localStorage.getItem('DraftPatientList')){
      let storedList=localStorage.getItem('DraftPatientList')
      let draftList=JSON.parse(storedList)
      if(draftList?.length){
        let index=draftList.findIndex(p=>p.DraftId==info.DraftId)
        if(index!=-1){
          draftList[index]=info
        }else{
          draftList.unshift(info)
        }
      }else{
        draftList.unshift(info)
      }
      localStorage.setItem('DraftPatientList',JSON.stringify(draftList))
    }else{
      let list=[info]
      localStorage.setItem('DraftPatientList',JSON.stringify(list))
    }
  }
  
  // 获取今日接诊列表
  const getTodayVisitList=(isLoadMore = false, options: { autoSelect?: boolean; showLoading?: boolean; preserveCompletedDetail?: boolean } = {})=>{
    const requestOptions = { autoSelect: true, showLoading: true, ...options }
    if(requestOptions.showLoading){
      loading.value=true
    }
    return PrescriptApiCtrl.TodayVisitList(todayVisit.value.searchParams).then(data=>{
      if (isLoadMore) {
        todayVisit.value.list = [...todayVisit.value.list, ...data.Rows];
      } else {
        todayVisit.value.list = data.Rows;
      }
      todayVisit.value.hasNextPage = data.HasNextPage;

      if(todayVisit.value.searchParams.status!=2&&localStorage.getItem('DraftPatientList')){
        let storedList=localStorage.getItem('DraftPatientList')
        let draftList=JSON.parse(storedList)
        if(draftList.length){
          todayVisit.value.list.unshift(...draftList)
        }
      }

      if(todayVisit.value.list.length && requestOptions.autoSelect){
        const firstVisit = todayVisit.value.list[0]
        const shouldPreserveCompletedDetail =
          requestOptions.preserveCompletedDetail &&
          firstVisit?.Id &&
          firstVisit.Id === visitInfo.value.Id &&
          visitInfo.value.detail?.Visit?.VisitStatus === 2
        if(shouldPreserveCompletedDetail){
          visitInfo.value.index=0
          visitInfo.value.Id=firstVisit.Id
          return data
        }
        if(requestOptions.preserveCompletedDetail){
          return data
        }
        visitInfo.value.index=0
        visitInfo.value.Id=todayVisit.value.list[visitInfo.value.index].Id
        if(visitInfo.value.Id){
          return visitDetail(requestOptions.showLoading).then(() => data)
        }else{
          visitInfo.value={
            Id:'',
            index:0,
            detail:{},
          }
          const newMedicalInfo = todayVisit.value.list[visitInfo.value.index].MedicalInfo;
          if (newMedicalInfo && Object.keys(newMedicalInfo).length > 0) {
            patientModal.value.form = cloneDeep(newMedicalInfo.patientModal);
            visitForm.value = cloneDeep(newMedicalInfo.visitForm);
            prescriptionList.value = cloneDeep(newMedicalInfo.prescriptionList);
            nextTick(() => { handleCalculateFee(); })
            if(patientModal.value.form.Id){
              getVisitList(patientModal.value.form.Id)
              getPrescriptSummaryList(patientModal.value.form.Id)
            }else{
              prescriptList.value=[]
              historyList.value=[]
            }
          }else {
            InitializeAll();
          }
        }
      }
      return data
    }).catch(() => null).finally(() => {
      if(requestOptions.showLoading){
        loading.value=false
      }
    })
  }

  // 选择今日接诊项
  const seleceVisit=async (item,index=0)=>{
    if(visitInfo.value.index === index && visitInfo.value.Id === item.Id){
      return
    }
    const switchKey = ++todayVisitSwitchKey
    todayVisitDetailSwitching.value = true
    await waitMs(90)
    if (switchKey !== todayVisitSwitchKey) return

    const prevItem = todayVisit.value.list[visitInfo.value.index]
    if (prevItem) {
      prevItem.MedicalInfo = {
        patientModal: cloneDeep(patientModal.value.form),
        visitForm: cloneDeep(visitForm.value),
        prescriptionList: cloneDeep(prescriptionList.value),
        visitOtherForm: cloneDeep(visitOtherForm.value),
      };
      if (prevItem.DraftId) {
        addDraftPatient(prevItem);
      }
    }
    visitInfo.value.index = index;
    visitInfo.value.Id = item.Id;
    const newMedicalInfo = todayVisit.value.list[index].MedicalInfo;
    if (newMedicalInfo && Object.keys(newMedicalInfo).length > 0) {
      patientModal.value.form = cloneDeep(newMedicalInfo.patientModal);
      visitForm.value = cloneDeep(newMedicalInfo.visitForm);
      prescriptionList.value = cloneDeep(newMedicalInfo.prescriptionList);
      if (newMedicalInfo.visitOtherForm) {
        visitOtherForm.value = cloneDeep(newMedicalInfo.visitOtherForm);
        feeModal.value.info.Fee.RegistrationFee=visitOtherForm.value.RegistrationFee
      } else {
        visitOtherForm.value.RegistrationFee = defaultRegistrationFee.value;
        feeModal.value.info.Fee.RegistrationFee=visitOtherForm.value.RegistrationFee
      }

      if(patientModal.value.form.Id){
        await Promise.all([
          getVisitList(patientModal.value.form.Id),
          getPrescriptSummaryList(patientModal.value.form.Id),
        ]).catch(() => {})
      }else{
        prescriptList.value=[]
        historyList.value=[]
      }
    } else if (!item.Id) {
      InitializeAll();
    }
    if (!item.Id) {
      visitInfo.value.detail = {}
    }
    if (!item.Id && newMedicalInfo && Object.keys(newMedicalInfo).length > 0) {
      nextTick(() => { handleCalculateFee(); })
    }
    if (item.Id) {
      await visitDetail(false);
    }
    if (switchKey !== todayVisitSwitchKey) return
    await waitTodayVisitStableFrame()
    if (switchKey === todayVisitSwitchKey) {
      todayVisitDetailSwitching.value = false
    }
  }

  // 获取接诊详情
  const visitDetail=(showLoading = true)=>{
    if(showLoading){
      loading.value=true
    }
    return PrescriptApiCtrl.VisitDetail({id:visitInfo.value.Id}).then(data=>{
      visitInfo.value.detail=cloneDeep(data)
      return Promise.all([
        getPatientDetail(visitInfo.value.detail.Visit.PatientId,1),
        getVisitList(visitInfo.value.detail.Visit.PatientId),
        getPrescriptSummaryList(visitInfo.value.detail.Visit.PatientId),
      ])
    }).catch(() => {}).finally(() => {
      if(showLoading){
        loading.value=false
      }
    })
  }

  // 获取患者就诊历史
  const getVisitList=(patientId, options: { syncVisitType?: boolean; syncMedicalHistory?: boolean } = {})=>{
    return PatientApiCtrl.VisitList({patientId:patientId}).then(data=>{
      const rows = data.Rows || []
      historyList.value=rows
      if(options.syncVisitType){
        visitOtherForm.value.VisitType = rows.length ? 1 : 0
      }
      if(options.syncMedicalHistory && rows.length){
        const info=rows[0]
        visitForm.value.PresentIllness=info.PresentIllness
        visitForm.value.PastHistory=info.PastHistory
        visitForm.value.AllergyHistory=info.AllergyHistory
      }
      return rows
    })
  }

  // 获取处方记录
  const getPrescriptSummaryList=(patientId)=>{
    return OrderApiCtrl.PrescriptSummaryList({patientId:patientId}).then(data=>{
      prescriptList.value=data.Rows
    })
  }

  // 保存患者/获取患者详情
  const getPatientDetail=(id,type)=>{
    if(id){
      if(type!=1){
        visitInfo.value.index=0
      }
      return PatientApiCtrl.PatientDetail({patientId:id}).then(data=>{
        patientModal.value.form = cloneDeep(data.Patient)
        patientModal.value.form.Id=data.Patient.PatientId
      }).catch(() => {}).finally(() => {})
    }
    return Promise.resolve()
  }

  // 循环头像
  const getImageUrl = (name) => {
    return new URL(`../../assets/images/${name}`, import.meta.url).href;
  };

  const handleLoadMore = () => {
    todayVisit.value.searchParams.page += 1
    getTodayVisitList(true)
  }

  const syncCurrentVisitListItem=(info)=>{
    const currentItem = todayVisit.value.list[visitInfo.value.index]
    if(currentItem){
      Object.assign(currentItem, info)
    }
  }

  const selectGender=(e)=>{
    syncCurrentVisitListItem({ PatientGender: e })
  }

  const changeAge=(e)=>{
    syncCurrentVisitListItem({ PatientAge: e })
  }

  const normalizePatientAge=()=>{
    const ageValue = patientModal.value.form.Age
    if (ageValue === null || ageValue === undefined || ageValue === '') {
      syncCurrentVisitListItem({ PatientAge: ageValue })
      return
    }
    const numberAge = Number(ageValue)
    if (!Number.isFinite(numberAge) || numberAge < 0) {
      patientModal.value.form.Age = null
      syncCurrentVisitListItem({ PatientAge: null })
      return
    }
    const limitedAge = Math.min(numberAge, 105)
    const normalizedAge = limitedAge < 3
      ? Math.round(limitedAge * 10) / 10
      : Math.round(limitedAge)

    patientModal.value.form.Age = normalizedAge
    syncCurrentVisitListItem({ PatientAge: normalizedAge })
  }

  const changePhone=(e)=>{
    syncCurrentVisitListItem({ PatientPhone: patientModal.value.form.Phone })
  }

  const normalizePatientPhone=()=>{
    const phone = String(patientModal.value.form.Phone || '').replace(/\D/g, '').slice(0, 11)
    patientModal.value.form.Phone = phone
    syncCurrentVisitListItem({ PatientPhone: phone })
    return phone
  }

  const validatePatientPhone=(options: { defer?: boolean } = {})=>{
    if (options.defer) {
      window.setTimeout(() => {
        validatePatientPhone()
      }, 120)
      return true
    }
    const phone = normalizePatientPhone()
    if (phone && !/^\d{11}$/.test(phone)) {
      createMessage.warning('请输入11位数字手机号')
      return false
    }
    return true
  }

  const handleTabChange = async () => {
    const switchKey = ++todayVisitSwitchKey
    const shouldTryPreserveCompletedDetail =
      todayVisit.value.searchParams.status !== 1 &&
      Boolean(visitInfo.value.Id) &&
      visitInfo.value.detail?.Visit?.VisitStatus === 2
    if(shouldTryPreserveCompletedDetail){
      todayVisit.value.searchParams.page = 1
      await getTodayVisitList(false, { autoSelect: true, showLoading: false, preserveCompletedDetail: true })
      if (switchKey !== todayVisitSwitchKey) return
      const firstVisit = todayVisit.value.list[0]
      if(firstVisit?.Id && firstVisit.Id === visitInfo.value.Id){
        visitInfo.value.index = 0
        return
      }
      todayVisitSwitching.value = true
      await waitTodayVisitSwitchHidden()
      if (switchKey !== todayVisitSwitchKey) return
      InitializeAll()
      visitInfo.value.index = 0
      visitInfo.value.Id = firstVisit?.Id || ''
      if(visitInfo.value.Id){
        await visitDetail(false)
      }
      if (switchKey !== todayVisitSwitchKey) return
      await waitTodayVisitStableFrame()
      if (switchKey === todayVisitSwitchKey) {
        todayVisitSwitching.value = false
      }
      return
    }
    todayVisitSwitching.value = true
    await waitTodayVisitSwitchHidden()
    if (switchKey !== todayVisitSwitchKey) return

    todayVisit.value.searchParams.page = 1
    todayVisit.value.list = []
    todayVisit.value.hasNextPage = false
    InitializeAll()
    await getTodayVisitList(false, { autoSelect: true, showLoading: false })
    if (switchKey !== todayVisitSwitchKey) return

    await waitTodayVisitStableFrame()
    if (switchKey === todayVisitSwitchKey) {
      todayVisitSwitching.value = false
    }
  }


  const PATIENT_VISIBLE_PAGE_SIZE = 8
  const PATIENT_POPOVER_SHOW_DELAY = 120
  let timer: any = null
  let patientSearchRequestKey = 0
  let patientPopoverTimer: any = null
  const patientSearchField = ref<'name' | 'phone'>('name')
  const searchPatientByKeyword = (keyword: string, field: 'name' | 'phone') => {
    clearTimeout(timer)
    clearTimeout(patientPopoverTimer)
    patientSearchField.value = field
    if (field === 'name') {
      syncCurrentVisitListItem({ PatientName: keyword })
    } else {
      syncCurrentVisitListItem({ PatientPhone: keyword })
    }
    if (!keyword) {
      patientModal.value.visible = false;
      patientModal.value.list = [];
      return;
    }
    timer = setTimeout(async () => {
      const currentRequestKey = ++patientSearchRequestKey
      patientModal.value.visible = false
      patientModal.value.loading=true
      try {
        const data = await PrescriptApiCtrl.SearchPatient({
          page: 1,
          limit: PATIENT_VISIBLE_PAGE_SIZE,
          keyword: keyword
        });
        if (currentRequestKey !== patientSearchRequestKey) return

        const rows = data.Rows || []
        const totalCount = data.TotalItemCount || rows.length
        let nextRows = rows

        if (totalCount > rows.length) {
          const fullData = await PrescriptApiCtrl.SearchPatient({
            page: 1,
            limit: totalCount,
            keyword: keyword
          });
          if (currentRequestKey !== patientSearchRequestKey) return
          nextRows = fullData.Rows || []
        }

        patientModal.value.list = nextRows
        patientPopoverTimer = setTimeout(() => {
          if (currentRequestKey === patientSearchRequestKey) {
            patientModal.value.visible = patientModal.value.list.length > 0
          }
        }, PATIENT_POPOVER_SHOW_DELAY)
      } catch (error) {
        if (currentRequestKey === patientSearchRequestKey) {
          patientModal.value.visible = false
        }
      } finally {
        if (currentRequestKey === patientSearchRequestKey) {
          patientModal.value.loading= false
        }
      }
    }, 300)
  }
  const handleInputChange = () => {
    searchPatientByKeyword(patientModal.value.form.Name.trim(), 'name')
  }
  const handlePhoneInputChange = () => {
    const phone = normalizePatientPhone()
    searchPatientByKeyword(phone, 'phone')
  }

  onBeforeUnmount(() => {
    clearTimeout(timer)
    clearTimeout(patientPopoverTimer)
  })

  const handleSelectPatient = (record: any) => {
    clearTimeout(timer)
    clearTimeout(patientPopoverTimer)
    patientSearchRequestKey++
    patientModal.value.form=cloneDeep(record)
    patientModal.value.form.Phone = String(patientModal.value.form.Phone || '').replace(/\D/g, '').slice(0, 11)
    syncCurrentVisitListItem({
      PatientGender: record.Gender,
      PatientAge: record.Age,
      PatientPhone: patientModal.value.form.Phone,
    })
    patientModal.value.form.Id=record.PatientId
    patientModal.value.visible = false

    getVisitList(record.PatientId, { syncVisitType: true, syncMedicalHistory: true })
    getPrescriptSummaryList(record.PatientId)
  }

  const handleClearPatient=()=>{
    visitForm.value=cloneDeep(visitFormInfo)
    patientModal.value.form = cloneDeep(initialPatientForm)
    visitOtherForm.value.VisitType = 0
    if(todayVisit.value.list[visitInfo.value.index]){
      todayVisit.value.list[visitInfo.value.index]=cloneDeep(anonymousInfo)
    }
    prescriptList.value=[]
    historyList.value=[]
  }

  const clearPrescript=()=>{
    prescriptionList.value=[cloneDeep(prescriptionForm)]
    feeModal.value.info.Fee.RegistrationFee=visitOtherForm.value.RegistrationFee
    feeModal.value.info.Fee.ReceivableAmount=visitOtherForm.value.RegistrationFee
    feeModal.value.info.Fee.OriginalAmount=0
    feeModal.value.info.Fee.RetailMarkupAmount=0
    feeModal.value.info.Fee.PremiumAmount=0
    saveCurrentDraft()
  }

  const getCurrentTodayVisit=()=>{
    return todayVisit.value.list[visitInfo.value.index]
  }

  const hasCompleteManualPatientInfo=()=>{
    return Boolean(
      patientModal.value.form.Name &&
      patientModal.value.form.Gender &&
      patientModal.value.form.Age &&
      patientModal.value.form.Phone
    )
  }

  const shouldConfirmManualQuickVisit=()=>{
    const currentItem = getCurrentTodayVisit()
    return !visitInfo.value.Id && !currentItem?.DraftId && hasCompleteManualPatientInfo()
  }

  const addManualPatientToTodayVisit=()=>{
    const draftInfo = {
      ...cloneDeep(anonymousInfo),
      DraftId: Date.now(),
      PatientName: patientModal.value.form.Name,
      PatientGender: patientModal.value.form.Gender,
      PatientAge: patientModal.value.form.Age,
      PatientPhone: patientModal.value.form.Phone,
      MedicalInfo: {
        patientModal: cloneDeep(patientModal.value.form),
        visitForm: cloneDeep(visitForm.value),
        prescriptionList: cloneDeep(prescriptionList.value),
        visitOtherForm: cloneDeep(visitOtherForm.value),
      },
    }
    todayVisit.value.searchParams.status=1
    todayVisit.value.searchParams.page=1
    todayVisit.value.list.unshift(draftInfo)
    todayVisit.value.hasNextPage=false
    visitInfo.value.index=0
    visitInfo.value.Id=''
    visitInfo.value.detail={}
    addDraftPatient(draftInfo)
    nextTick(() => {
      if(todayVisitListRef.value){
        todayVisitListRef.value.scrollTop = 0
      }
    })
  }

  const confirmManualQuickVisit=(type)=>{
    Modal.confirm({
      title: '确认添加就诊人',
      centered:true,
      content: '当前患者信息尚未加入就诊中列表，是否确认添加患者信息并进行快速接诊？',
      onOk() {
        addManualPatientToTodayVisit()
        return createOrder(type, { skipManualQuickConfirm: true })
      },
      onCancel() {
        InitializeAll()
      },
    });
  }

  // 保存患者
  const createOrder = async (type, options = { skipManualQuickConfirm: false }) => {  //1暂存处方 2保存患者病历 3提交审方/开方发药
    saveType.value=type
    normalizePatientAge()
    if(!patientModal.value.form.Name){
      createMessage.warning('请填写患者姓名')
      return
    }
    if(!patientModal.value.form.Age){
      createMessage.warning('请填写患者年龄')
      return
    }
    if(!patientModal.value.form.Phone){
      createMessage.warning('请填写患者手机号')
      return
    }
    if(!validatePatientPhone()){
      return
    }
    if(!options.skipManualQuickConfirm && shouldConfirmManualQuickVisit()){
      confirmManualQuickVisit(type)
      return
    }
    const medicalIsValid = await medicalRef.value?.handleSaveMedical()  //验证病历
    if(medicalIsValid){
      if(type==2){
        QuickSavePatient()
      }else{
        const isValid = await prescriptionRef.value?.savePrescript();  //验证处方
        if (isValid) {
          QuickSavePatient()
        }
      }
    }
  }

  const QuickSavePatient=()=>{
    if(!patientModal.value.form.Id){
      const formData=cloneDeep(patientModal.value.form)
      PrescriptApiCtrl.SavePatient(formData).then(data=>{
        patientModal.value.form.Id=data.Id
        handleQuickVisit()
      }).catch(() => {}).finally(() => {})
    }else{
      if(visitInfo.value.Id){
        handleSaveVisit()
      }else{
        handleQuickVisit()
      }
    }
  }

  // 快速接诊
  const handleQuickVisit=()=>{
    PrescriptApiCtrl.QuickVisit({
      PatientId:patientModal.value.form.Id,
      VisitType:visitOtherForm.value.VisitType,
      RegistrationFee:visitOtherForm.value.RegistrationFee,
    }).then(data=>{
      const savedIndex = visitInfo.value.index
      visitInfo.value=data
      visitInfo.value.index = savedIndex
      visitInfo.value.detail=visitInfo.value.detail||{}
      handleSaveVisit()
    }).catch(() => {}).finally(() => {})
  }

  // 保存病历/就诊记录
  const handleSaveVisit=() =>{
    let medicalInfo=cloneDeep(visitForm.value)
    PrescriptApiCtrl.SaveVisit({
      Id:visitInfo.value.Id,
      VisitType:visitOtherForm.value.VisitType,
      RegistrationFee:visitOtherForm.value.RegistrationFee,
      ...medicalInfo,
    }).then(data=>{
      if(saveType.value!=2){
        receiptModal.value.visible=true
      }else{
        createMessage.success(`保存成功`)
      }
    }).catch(() => {}).finally(() => {})
  }

  // 输入挂号费
  const changeRegistrationFee=async(e)=>{
    if(e!=null){
      feeModal.value.info.Fee.RegistrationFee=visitOtherForm.value.RegistrationFee
    }else{
      feeModal.value.info.Fee.RegistrationFee=0
    }
  }

  const selectRegistrationFee=(event)=>{
    nextTick(() => {
      const input = event?.target?.closest?.('.ant-input-number')?.querySelector?.('input') || event?.target
      input?.select?.()
    })
  }

  // 查看费用明细
  const seeFeeDetail= ()=>{
    handleCalculateFee(true)
  }

  // 费用试算
  const handleCalculateFee=async(isOpen=false)=>{
    const materialList=prescriptionRef.value?.getMaterialList?.()||[]
    if(!materialList.length){
      if(isOpen){
        createMessage.warning('请至少选择一味药材')
        return
      }
      const regFee=visitOtherForm.value.RegistrationFee||feeModal.value.info.Fee.RegistrationFee
      feeModal.value.info.Fee.OriginalAmount=0
      feeModal.value.info.Fee.RetailMarkupAmount=0
      feeModal.value.info.Fee.PremiumAmount=0
      feeModal.value.info.Fee.RegistrationFee=regFee
      feeModal.value.info.Fee.ReceivableAmount=regFee
      feeModal.value.originallyAmount=0
      saveCurrentDraft()
      return
    }
    // 打开费用详情时才校验处方完整性
    if(isOpen){
      const isValid=await prescriptionRef.value?.savePrescript()
      if(!isValid) return
    }
    PrescriptApiCtrl.CalculateFee({
      items:materialList,
      retailMarkupRate:null,
      discount:null,
      premiumAmount:isOpen?feeModal.value.info.Fee.OriginalAmount+feeModal.value.info.Fee.RetailMarkupAmount+feeModal.value.info.Fee.PremiumAmount:0,
      registrationFee:visitOtherForm.value.RegistrationFee
    }).then(data=>{
      feeModal.value.info=data
      feeModal.value.originallyAmount=data.Fee.OriginalAmount+data.Fee.RetailMarkupAmount+data.Fee.PremiumAmount
      if(isOpen){
        feeModal.value.visible=true
      }
      saveCurrentDraft()
    }).catch(() => {}).finally(() => {})
  }

  // 整单调整金额
  const savePrice=(e)=>{
    feeModal.value.info=e
  }

  // 保存收货信息
  const saveReceipt=(e)=>{
    receiptModal.value.info=e
    receiptModal.value.visible=false
    handleCreateOrder()
  }

  // 创建机构订单
  const handleCreateOrder=()=>{
    loading.value=true
    const finishedVisitId = visitInfo.value.Id
    const finishedPatientId = patientModal.value.form.Id
    let materialList=prescriptionList.value.map(item => {
      if (item.ProId) {
        return {
          ProId: item.ProId,
          Count: item.DoseCount,
          Frequency: item.Frequency,
          EachDose: item.EachDose,
          TakeTime: item.TakeTime,
          TakeDays: item.TakeDays
        }
      }
      const validMaterials = item.Materials.filter(material => material.MaterialId != null)
      return {
        ...item,
        Materials: validMaterials
      };
    });
    PrescriptApiCtrl.CreateOrder({
      VisitId:visitInfo.value.Id,
      PatientId:patientModal.value.form.Id,
      ...receiptModal.value.info,
      PremiumAmount:feeModal.value.info.Fee.OriginalAmount+feeModal.value.info.Fee.RetailMarkupAmount+feeModal.value.info.Fee.PremiumAmount,
      RegistrationFee:feeModal.value.info.Fee.RegistrationFee,
      Items:materialList,
      FreightMoney:0,
    }).then(data=>{
      // 移除本地草稿存储
      const currentItem = todayVisit.value.list[visitInfo.value.index]
      if (currentItem?.DraftId) {
        let storedList = JSON.parse(localStorage.getItem('DraftPatientList') || '[]')
        let idx = storedList.findIndex(p => p.DraftId == currentItem.DraftId)
        if (idx !== -1) { storedList.splice(idx, 1); localStorage.setItem('DraftPatientList', JSON.stringify(storedList)) }
      }
      changeFinishVisit(false, finishedVisitId)  //完成接诊

      if(saveType.value==3){
        const quickPayConfig = getCloudPharmacyQuickPayConfig()
        if(quickPayConfig.enabled){
          orderPayCountdown.value={
            visible:true,
            orderCode:data.OrderCode,
            visitId:finishedVisitId,
            patientId:finishedPatientId,
            seconds:quickPayConfig.seconds,
          }
        }
      }else if(saveType.value==1){
        Modal.confirm({
          title: '处方已保存',
          centered:true,
          content: '后续可到收费管理进行支付',
          icon: createVNode(CheckCircleFilled),
          onOk() {},
        });
      }
    }).catch(() => {}).finally(() => {loading.value=false})
  }

  // 完成接诊
  const changeFinishVisit=(refresh = true, id = visitInfo.value.Id)=>{
    return PrescriptApiCtrl.FinishVisit({id}).then(data=>{
      if(refresh){
        return getTodayVisitList()
      }
      return data
    }).catch(() => {})
  }

  const goChargePayment=()=>{
    const orderCode = orderPayCountdown.value.orderCode
    orderPayCountdown.value.visible=false
    if(orderCode){
      go('/charge/pendingPay?orderCode=' + encodeURIComponent(orderCode) + '&autoPay=1')
    }
  }

  const getVisitPatientId=(item)=>{
    return item?.PatientId || item?.PatientID || item?.Patient?.PatientId || item?.Patient?.Id || ''
  }

  const cancelChargePaymentCountdown=async()=>{
    const targetVisitId = orderPayCountdown.value.visitId
    const targetPatientId = orderPayCountdown.value.patientId
    orderPayCountdown.value.visible=false
    todayVisit.value.searchParams.status=null
    todayVisit.value.searchParams.page=1
    todayVisit.value.list=[]
    todayVisit.value.hasNextPage=false
    await getTodayVisitList(false, { autoSelect: false })
    const targetIndex = todayVisit.value.list.findIndex(item => {
      return (targetVisitId && item.Id==targetVisitId) || (targetPatientId && getVisitPatientId(item)==targetPatientId)
    })
    if(targetIndex>=0){
      seleceVisit(todayVisit.value.list[targetIndex], targetIndex)
    }else if(todayVisit.value.list.length){
      seleceVisit(todayVisit.value.list[0], 0)
    }
  }

  const seeRootExtraction=()=>{
    go('/rootExtraction')
  }

  const confirmPay=(e)=>{
    if(payModal.value.info.PayType==1){
      OrderApiCtrl.PayOrder(payModal.value.info).then(data=>{
        createMessage.success('收款成功')
        payModal.value.visible=false
        handleTabChange()
      }).catch(() => {}).finally(() => {})
    }else{
      console.log(8888)
      //扫码枪 e为扫码获取到的code
    }
  }
</script>
<style lang="less" scoped>
.dashboard-card-radius {
  overflow: hidden;
  border-radius: 12px;
}

.home ::v-deep(.ant-card-body){
  height: 100% !important;
}
.otherCard ::v-deep(.ant-card-body){
  height: calc(100% - 48px) !important;
}
.visit-history-card {
  :deep(.ant-card-body) {
    padding: 12px 12px 8px;
  }
}
.visit-history-steps {
  :deep(.ant-steps-item) {
    padding-bottom: 4px;
  }

  :deep(.ant-steps-item-content) {
    width: calc(100% - 26px);
    min-height: 0;
  }

  :deep(.ant-steps-item-title) {
    width: 100%;
    padding-right: 0;
    line-height: normal;

    &::after {
      display: none;
    }
  }

  :deep(.ant-steps-item-description) {
    min-height: 0;
  }
}
.visit-history-item {
  width: 100%;
  padding: 8px 10px 9px;
  border-bottom: 1px dashed #E8EEF7;
  border-radius: 8px;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: #D7E4F8;
    background: #F9FBFD;
    box-shadow: 0 0 0 2px fade(@primary-color, 10%), 0 4px 10px rgba(32, 48, 75, 0.05);
  }
}
.visit-history-item__main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.visit-history-item__diagnosis {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #1F2B3D;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.visit-history-item__tag {
  flex: 0 0 auto;
  margin-right: 0;
  font-size: 12px;
}
.visit-history-item__time {
  margin-top: 5px;
  color: #6C7583;
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
}
.ant-input {
  &-number,
  &-number-group-wrapper {
    width:50px !important;
    min-width: 50px;
    max-width: 100%;
  }
}
.activeTag{
  background: #F9FBFD;
  box-shadow: 4px 0 0 0 #0A5AFF inset;
}
.today-visit-item {
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: #D7E4F8;
    background: #F9FBFD;
    box-shadow: 0 0 0 2px fade(@primary-color, 8%), 0 4px 10px rgba(32, 48, 75, 0.05);
  }
}
.today-visit-tabs {
  :deep(.ant-tabs-nav-list) {
    width: 100%;
  }

  :deep(.ant-tabs-tab) {
    flex: 1;
    justify-content: center;
    margin: 0;
  }

  :deep(.ant-tabs-nav-operations),
  :deep(.ant-tabs-nav-more) {
    display: none !important;
  }
}
.today-visit-content-panel {
  transition: opacity 160ms ease-out;
}
.today-visit-content-switching {
  opacity: 0;
  pointer-events: none;
}
.patient-info-card {
  border: 1px solid transparent;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover,
  &:focus-within {
    border-color: @primary-color;
    box-shadow: 0 0 0 2px fade(@primary-color, 20%);
  }
}
.patient-name-field {
  width: 108px;
  min-width: 108px;
}
.patient-info-card .patient-name-input {
  width: 80px !important;
}
.patient-info-card .patient-gender-field {
  width: 64px;
  min-width: 64px;
}
.patient-age-field {
  width: 62px;
  min-width: 62px;
  font-size: 14px;
  line-height: 24px;

  span {
    display: inline-flex;
    align-items: center;
    height: 24px;
    font-size: 14px;
    line-height: 24px;
  }
}
.patient-info-card .patient-age-input {
  width: 42px !important;
  min-width: 42px !important;

  :deep(.ant-input-number-input) {
    text-align: right !important;
    padding-right: 2px;
    height: 24px;
    font-size: 14px;
    line-height: 24px;
  }
}
.patient-phone-field {
  width: 128px;
  min-width: 128px;
}
.patient-info-card .patient-phone-input {
  width: 100px !important;
}
.patient-info-card {
  :deep(.ant-input[disabled]),
  :deep(.ant-input-number-disabled .ant-input-number-input),
  :deep(.ant-select-disabled .ant-select-selection-item) {
    color: #000000 !important;
    -webkit-text-fill-color: #000000;
  }
}
.patient-clear-slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  min-width: 14px;
  color: #c8cdd4;

  :deep(.anticon) {
    cursor: pointer;
  }
}
.patient-action-card {
  overflow: visible;
}
.patient-action-field {
  position: relative;

  &::after {
    position: absolute;
    top: -9px;
    right: -8px;
    bottom: -9px;
    left: -8px;
    z-index: 1;
    border: 1px solid transparent;
    pointer-events: none;
    content: '';
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  &:hover,
  &:focus-within {
    &::after {
      border-color: @primary-color;
      box-shadow: 0 0 0 2px fade(@primary-color, 20%);
    }
  }
}
.patient-id-card-action {
  &::after {
    left: -8px;
    border-radius: 8px 0 0 8px;
  }
}
.patient-add-action {
  &::after {
    right: -8px;
    border-radius: 0 8px 8px 0;
  }
}
.visit-type-field,
.registration-fee-outer {
  border-radius: 4px;
  border: 1px solid transparent;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover,
  &:focus-within {
    border-color: @primary-color;
    box-shadow: 0 0 0 2px fade(@primary-color, 20%);
  }
}
.visit-type-field {
  align-self: stretch;
  margin: 0;
  border-radius: 8px 0 0 8px;
}
.registration-fee-outer {
  display: flex;
  align-items: center;
  align-self: stretch;
  margin: 0 0 0 8px;
  padding: 2px 4px 2px 8px;
  border-radius: 0 8px 8px 0;
}
.registration-fee-currency {
  font-size: 14px;
  line-height: 1;
}
.registration-fee-input {
  width: 34px !important;
  min-width: 34px !important;
  font-size: 14px;
  font-weight: 700;
  color: @primary-color;

  :deep(.ant-input-number-input) {
    color: @primary-color;
    font-size: 14px;
    font-weight: 700;
    text-align: center;
  }
}
.dashboard-system-radius-btn {
  border-radius: 8px !important;
}

.patient-search-panel {
  animation: patientSearchPanelIn 0.18s ease-out;
}

@keyframes patientSearchPanelIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:global(.patient-search-popover .ant-popover-inner) {
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(32, 48, 75, 0.12);
}

:global(.patient-search-popover .ant-popover-inner-content) {
  padding: 8px;
}
</style>
