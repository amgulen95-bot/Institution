<template>
  <div class="p-4 home" v-loading="loading">
    <div class="flex justify-between" style="height: calc(100vh - 192px);">
      <a-card class="h-100% overflow-hidden w-380px">
        <div class="text-18px text-bold">今日接诊</div>
        <div class="flex align-center mt16px mb12px">
          <a-input-search v-model:value="todayVisit.searchParams.keyword" placeholder="搜索患者姓名、手机号" @search="handleTabChange" />
          <a-button class="ml12px" type="primary" @click="handleQuick">
            <template #icon><PlusOutlined /></template>
            快速接诊
          </a-button>
        </div>
        <a-tabs v-model:activeKey="todayVisit.searchParams.status" centered @change="handleTabChange">
          <a-tab-pane :key="1" tab="就诊中"></a-tab-pane>
          <a-tab-pane :key="2" tab="已完成"></a-tab-pane>
          <a-tab-pane :key="null" tab="全部"></a-tab-pane>
        </a-tabs>
        <div class="overflow-y-scroll scrollbar-none" style="height: calc(100% - 142px);">
          <div class="p16px border border-color-[#F3F4F7] border-rd-8px flex mb12px pointer" :class="visitInfo.index==index?'activeTag':''" v-for="(item,index) in todayVisit.list" @click="seleceVisit(item,index)" :key="index">
            <img class="w52px h52px border-rd-50%" :src="getImageUrl(`userAvatar${(index % 7) + 1}.png`)" alt="">
            <div class="flex-sub ml12px">
              <div class="flex justify-between align-center">
                <div class="text-16px text-bold">{{item.PatientName||'匿名患者'}}</div>
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
      <div class="min-w600px flex-sub ml16px h-100% overflow-y-scroll pb12px scrollbar-none receptionPanel">
        <template v-if="visitInfo.detail.Visit?.VisitStatus==2&&visitInfo.Id">
          <ReceptionDetails :data="visitInfo.detail"></ReceptionDetails>
        </template>
        <template v-if="visitInfo.detail.Visit?.VisitStatus!=2">
          <div class="flex justify-between align-center flex-wrap">
            <div class="flex justify-between align-center flex-wrap">
              <a-space class="pt2px pb2px pl16px pr16px bg-[#fff] border-rd-8px mb8px" :size="24">
                <a-popover v-model:open="patientModal.visible" placement="bottomLeft" trigger="focus" :destroyTooltipOnHide="false" >
                  <template #content>
                    <div class="w650px">
                      <PatientList :list-data="patientModal.list" :loading="patientModal.loading" @row-click="handleSelectPatient"></PatientList>
                    </div>
                  </template>
                  <div class="flex align-center">
                    <img class="w20px h20px" src="../../assets/images/userImg.png" alt="">
                    <a-input class="w80px" size="small" v-model:value="patientModal.form.Name" :bordered="false" :disabled="Boolean(patientModal.form.Id)" placeholder="患者姓名" @change="handleInputChange" />
                  </div>
                </a-popover>

                <a-select v-model:value="patientModal.form.Gender" placeholder="性别" :bordered="false" :disabled="Boolean(patientModal.form.Id)" @select="selectGender">
                  <a-select-option :value="1">男</a-select-option>
                  <a-select-option :value="2">女</a-select-option>
                </a-select>
                <div class="flex align-center">
                  <a-input-number id="inputNumber" class="text-right" size="small" v-model:value="patientModal.form.Age" :controls="false" :bordered="false" :disabled="Boolean(patientModal.form.Id)" placeholder="多少" :min="0" @change="changeAge" />
                  <span>岁</span>
                </div>
                <div class="flex align-center">
                  <img class="w20px h20px" src="../../assets/images/phone.png" alt="">
                  <a-input class="w100px" size="small" v-model:value="patientModal.form.Phone" :bordered="false" :disabled="Boolean(patientModal.form.Id)" placeholder="手机号码" @change="changePhone" />
                </div>
                <CloseOutlined v-if="patientModal.form.Id" @click="handleClearPatient" />
              </a-space>
              <a-space class="pt8px pb8px pl16px pr16px bg-[#fff] border-rd-8px ml8px mb8px" :size="16">
                <div class="flex align-center pointer">
                  <img class="w20px h20px" src="../../assets/images/idCard.png" alt="">
                  <span class="ml4px whitespace-nowrap">读取身份证</span>
                </div>
                <a-divider type="vertical" />
                <div class="flex align-center pointer" @click="addPatientVisible=true">
                  <img class="w20px h20px" src="../../assets/images/addUser.png" alt="">
                  <span class="ml4px whitespace-nowrap">新增患者</span>
                </div>
              </a-space>
            </div>
            <div class="flex align-center pt2px pb2px pl4px pr4px bg-[#fff] border-rd-8px mb8px" :size="16">
              <a-select class="w80px" v-model:value="visitOtherForm.VisitType" placeholder="问诊类型" :bordered="false">
                <a-select-option :value="0">初诊</a-select-option>
                <a-select-option :value="1">复诊</a-select-option>
              </a-select>
              <a-divider type="vertical" />
              <div class="flex align-center ml8px">
                <span>挂号费：</span>
                <span class="text-bold text-theme">￥</span>
                <a-input-number id="inputNumber" class="text-bold text-theme" size="small" :controls="false" v-model:value="visitOtherForm.RegistrationFee" :bordered="false" :min="0" @change="changeRegistrationFee" />
              </div>
            </div>
          </div>
          <div class="bg-[#fff] border-rd-12px border border-color-[#e8cf9e] overflow-hidden">
            <Medical v-model:visit-form="visitForm" ref="medicalRef"></Medical>
          </div>
          <a-card class="mt16px">
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
      </div>
      <div class="w-380px ml16px h-100% overflow-y-scroll scrollbar-none">
        <a-card class="otherCard" title="就诊历史" style="height: calc(50% - 12px);">
          <template #extra v-if="historyList.length">
            <div class="color-[#A5A8B4] pointer" @click="medicalModalVisible=true">
              <span>更多</span>
              <RightOutlined />
            </div>
          </template>
          <a-card border class="h-100%" v-if="historyList.length">
            <div class="overflow-y-scroll scrollbar-none" style="height: calc(100% - 16px);">
              <a-steps progress-dot :current="1" direction="vertical">
                <a-step v-for="(item,index) in historyList" :key="index">
                  <template #title>
                    <span class="text-14px">{{item.Diagnosis}}</span>
                  </template>
                  <template #subTitle>
                    <a-tag :bordered="false" color="success" v-if="item.VisitType==0">初诊</a-tag>
                    <a-tag :bordered="false" color="processing" v-else>复诊</a-tag>
                  </template>
                  <template #description>
                    <div class="text-12px mt4px">{{item.CreateTime}}</div>
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
        <a-card title="处方记录" class="mt16px otherCard" style="height: calc(50% - 12px);">
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
    <a-card class="mt16px" v-if="visitInfo.detail.Visit?.VisitStatus!=2">
      <div class="flex justify-between align-center">
        <a-space>
          <a-button type="primary" ghost @click="seeFeeDetail">费用明细</a-button>
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
          <a-button type="primary" danger ghost @click="clearPrescript">清空处方</a-button>
          <a-button type="primary" ghost @click="createOrder(1)">暂存处方</a-button>
          <a-button type="primary" ghost @click="createOrder(2)">保存患者病历</a-button>
          <a-button type="primary" @click="createOrder(3)">提交审方/开方发药</a-button>
        </a-space>
      </div>
    </a-card>
    <AddPatient v-model:visible="addPatientVisible" @confirm="getPatientDetail"></AddPatient>

    <FeePreview v-model:visible="feeModal.visible" :originallyAmount="feeModal.originallyAmount" :fee="feeModal.info.Fee" :list-data="feeModal.info.Items" @confirm="savePrice"></FeePreview>

    <ReceiptInfo v-model:visible="receiptModal.visible" :patient="patientModal.form" :visitId="visitInfo.Id"  :total="feeModal.info.Fee.ReceivableAmount" @confirm="saveReceipt"></ReceiptInfo>

    <ConfirmPayment v-model:visible="payModal.visible" :payInfo="payModal.info" @confirm="confirmPay"></ConfirmPayment>

    <template v-if="patientModal.form.Id">
      <MedicalDetail v-model:visible="medicalModalVisible" :patientId="patientModal.form.Id" :type="1"></MedicalDetail>
    </template>
    
  </div>
</template>
<script lang="ts" setup>
  import { onMounted,ref,createVNode,nextTick} from 'vue';
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
  import PatientList from '/@/components/PatientList.vue';
  import Prescription from './components/Prescription.vue';
  import Medical from './components/Medical.vue';
  import ReceptionDetails from './components/ReceptionDetails.vue';
  import MedicalDetail from '/@/components/MedicalDetail.vue';

  const { createMessage} = useMessage()
  const userStore = useUserStore();
  const loading=ref(false)
  const go = useGo();
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
  const prescriptionForm={
    Name:'',
    Advice:'',
    Remark:'',
    DoseCount:null,
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
      status:1,
      page:1,
      limit:20,
      docId:userStore.getUserInfo.Doctor.DoctorId,
    },
    list:[],
    hasNextPage: false,
  })

  onMounted(()=>{
    getBasicEnum()
    getTodayVisitList()
    getSettingDetail()
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

  // 快速接诊
  const handleQuick=()=>{
    InitializeAll()
    todayVisit.value.list.unshift(cloneDeep(anonymousInfo))
    addDraftPatient(cloneDeep(anonymousInfo))
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
  const getTodayVisitList=(isLoadMore = false)=>{
    loading.value=true
    PrescriptApiCtrl.TodayVisitList(todayVisit.value.searchParams).then(data=>{
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

      if(todayVisit.value.list.length){
        visitInfo.value.index=0
        visitInfo.value.Id=todayVisit.value.list[visitInfo.value.index].Id
        if(visitInfo.value.Id){
          visitDetail()
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
    }).catch(() => {}).finally(() => {loading.value=false })
  }

  // 选择今日接诊项
  const seleceVisit=(item,index=0)=>{
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
        getVisitList(patientModal.value.form.Id)
        getPrescriptSummaryList(patientModal.value.form.Id)
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
    visitInfo.value.index = index;
    if (item.Id) {
      visitDetail();
    }
  }

  // 获取接诊详情
  const visitDetail=()=>{
    loading.value=true
    PrescriptApiCtrl.VisitDetail({id:visitInfo.value.Id}).then(data=>{
      visitInfo.value.detail=cloneDeep(data)
      getPatientDetail(visitInfo.value.detail.Visit.PatientId,1)
      getVisitList(visitInfo.value.detail.Visit.PatientId)
      getPrescriptSummaryList(visitInfo.value.detail.Visit.PatientId)
    }).catch(() => {}).finally(() => {loading.value=false })
  }

  // 获取患者就诊历史
  const getVisitList=(patientId)=>{
    PatientApiCtrl.VisitList({patientId:patientId}).then(data=>{
      historyList.value=data.Rows
    })
  }

  // 获取处方记录
  const getPrescriptSummaryList=(patientId)=>{
    OrderApiCtrl.PrescriptSummaryList({patientId:patientId}).then(data=>{
      prescriptList.value=data.Rows
    })
  }

  // 保存患者/获取患者详情
  const getPatientDetail=(id,type)=>{
    if(id){
      if(type!=1){
        visitInfo.value.index=0
      }
      PatientApiCtrl.PatientDetail({patientId:id}).then(data=>{
        patientModal.value.form = cloneDeep(data.Patient)
        patientModal.value.form.Id=data.Patient.PatientId
      }).catch(() => {}).finally(() => {})
    }
  }

  // 循环头像
  const getImageUrl = (name) => {
    return new URL(`../../assets/images/${name}`, import.meta.url).href;
  };

  const handleLoadMore = () => {
    todayVisit.value.searchParams.page += 1
    getTodayVisitList(true)
  }

  const selectGender=(e)=>{
    todayVisit.value.list[visitInfo.value.index].PatientGender=e
  }

  const changeAge=(e)=>{
    todayVisit.value.list[visitInfo.value.index].PatientAge=e
  }

  const changePhone=(e)=>{
    todayVisit.value.list[visitInfo.value.index].PatientPhone=patientModal.value.form.Phone
  }

  const handleTabChange = () => {
    todayVisit.value.searchParams.page = 1; // 重置页码
    todayVisit.value.list = [];             // 清空当前列表
    todayVisit.value.hasNextPage = false;   // 重置加载状态
    InitializeAll()
    getTodayVisitList(true);               // 重新加载第一页
  }


  let timer: any = null
  const handleInputChange = () => {
    clearTimeout(timer)
    const keyword = patientModal.value.form.Name.trim()
    todayVisit.value.list[visitInfo.value.index].PatientName=keyword
    if (!keyword) {
      patientModal.value.visible = false;
      patientModal.value.list = [];
      return;
    }
    timer = setTimeout(async () => {
      patientModal.value.loading=true
      try {
        const data = await PrescriptApiCtrl.SearchPatient({
          page: 1,
          limit: 10,
          keyword: keyword
        });
        patientModal.value.list = data.Rows || []
        patientModal.value.visible = patientModal.value.list.length > 0
      } catch (error) {
        patientModal.value.visible = false
      } finally {
        patientModal.value.loading= false
      }
    }, 300)
  }

  const handleSelectPatient = (record: any) => {
    PatientApiCtrl.VisitList({patientId:record.PatientId}).then(data=>{
      if(data.Rows.length){
        let info=data.Rows[0]
        visitForm.value.PresentIllness=info.PresentIllness
        visitForm.value.PastHistory=info.PastHistory
        visitForm.value.AllergyHistory=info.AllergyHistory
      }
    })
    patientModal.value.form=cloneDeep(record)
    todayVisit.value.list[visitInfo.value.index].PatientGender=record.Gender
    todayVisit.value.list[visitInfo.value.index].PatientAge=record.Age
    todayVisit.value.list[visitInfo.value.index].PatientPhone=record.Phone
    patientModal.value.form.Id=record.PatientId
    patientModal.value.visible = false

    getVisitList(record.PatientId)
    getPrescriptSummaryList(record.PatientId)
  }

  const handleClearPatient=()=>{
    visitForm.value=cloneDeep(visitFormInfo)
    patientModal.value.form = cloneDeep(initialPatientForm)
    todayVisit.value.list[visitInfo.value.index]=cloneDeep(anonymousInfo)
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

  // 保存患者
  const createOrder = async (type) => {  //1暂存处方 2保存患者病历 3提交审方/开方发药
    saveType.value=type
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
    let materialList=prescriptionList.value.map(item => {
      if (item.ProId) {
        return { ProId: item.ProId, Count: item.DoseCount }
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
      changeFinishVisit()  //完成接诊

      if(saveType.value==3){
        if(receiptModal.value.info.PayChannel==1){
          payModal.value.info={
            OrderCode:data.OrderCode,
            PayType:receiptModal.value.info.PayChannel,
            Amount:data.Total,
          }
          payModal.value.visible=true
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
  const changeFinishVisit=()=>{
    PrescriptApiCtrl.FinishVisit({id:visitInfo.value.Id}).then(data=>{
      getTodayVisitList()
    }).catch(() => {})
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
.home ::v-deep(.ant-card-body){
  height: 100% !important;
}
.otherCard ::v-deep(.ant-card-body){
  height: calc(100% - 48px) !important;
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
</style>