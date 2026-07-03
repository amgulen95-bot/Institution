<template>
  <div>
    <a-card v-loading="loading">
      <div class="flex">
        <div class="flex-sub p-16px border-rd-12px bg-[#EEF3FB] flex align-center justify-between">
          <div class="flex align-center">
            <img class="w52px h52px border-rd-50%" src="../../../assets/images/statisticsIcon1.png" alt="">
            <div class="ml12px">
              <div class="text-16px text-bold">门店总收款</div>
              <div class="mt4px color-[#4E5766] text-12px">较昨日 {{summaryInfo.TotalAmountDayRate>=0?'↑':'↓'}}{{summaryInfo.TotalAmountDayRate}}%</div>
            </div>
          </div>
          <div class="text-bold">
            <span class="text-16px">￥</span>
            <span class="text-32px">{{summaryInfo.TotalAmount}}</span>
          </div>
        </div>
        <div class="flex-sub ml16px p-16px border-rd-12px bg-[#EEF3FB] flex align-center justify-between">
          <div class="flex align-center">
            <img class="w52px h52px border-rd-50%" src="../../../assets/images/statisticsIcon2.png" alt="">
            <div class="ml12px">
              <div class="text-16px text-bold">线上收款</div>
              <div class="mt4px color-[#4E5766] text-12px">较昨日 {{summaryInfo.OnlineAmountDayRate>=0?'↑':'↓'}}{{summaryInfo.OnlineAmountDayRate}}%</div>
            </div>
          </div>
          <div class="text-bold">
            <span class="text-16px">￥</span>
            <span class="text-32px">{{summaryInfo.OnlineAmount}}</span>
          </div>
        </div>
        <div class="flex-sub ml16px p-16px border-rd-12px bg-[#EEF3FB] flex align-center justify-between">
          <div class="flex align-center">
            <img class="w52px h52px border-rd-50%" src="../../../assets/images/statisticsIcon3.png" alt="">
            <div class="ml12px">
              <div class="text-16px text-bold">现金收款</div>
              <div class="mt4px color-[#4E5766] text-12px">较昨日 {{summaryInfo.CashAmountDayRate>=0?'↑':'↓'}}{{summaryInfo.CashAmountDayRate}}%</div>
            </div>
          </div>
          <div class="text-bold">
            <span class="text-16px">￥</span>
            <span class="text-32px">{{summaryInfo.CashAmount}}</span>
          </div>
        </div>
        <div class="flex-sub ml16px p-16px border-rd-12px bg-[#EEF3FB] flex align-center justify-between">
          <div class="flex align-center">
            <img class="w52px h52px border-rd-50%" src="../../../assets/images/statisticsIcon4.png" alt="">
            <div class="ml12px">
              <div class="text-16px text-bold">待收款</div>
              <div class="mt4px color-[#4E5766] text-12px">较昨日 {{summaryInfo.PendingAmountDayRate>=0?'↑':'↓'}}{{summaryInfo.PendingAmountDayRate}}%</div>
            </div>
          </div>
          <div class="text-bold">
            <span class="text-16px">￥</span>
            <span class="text-32px">{{summaryInfo.PendingAmount}}</span>
          </div>
        </div>
      </div>
    </a-card>
    <a-card class="mt16px">
      <a-flex justify="space-between" align="flex-start">
        <a-space :size="[24,0]" wrap>
          <a-form-item label="开方日期">
            <a-range-picker v-model:value="searchParams.Date" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" :get-popup-container="(trigger) => trigger.parentElement" />
          </a-form-item>
          <a-form-item label="关键字">
            <a-input v-model:value="searchParams.keyword" placeholder="订单编号/患者姓名/手机号/患者号" allowClear />
          </a-form-item>
          <a-form-item label="开单医师" class="w240px" v-if="ClinicRole==1">
            <a-select  v-model:value="searchParams.docId" placeholder="请选择" allowClear showSearch optionFilterProp="title">
              <a-select-option :value="item.id" v-for="(item,index) in physicianList" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="订单状态" class="w240px" v-if="props.chargeStatus==1">
            <a-select  v-model:value="searchParams.status" placeholder="请选择" allowClear>
              <a-select-option :value="item.id" v-for="(item,index) in MYYOrderStatus" :key="index">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="支付方式" class="w240px" v-if="props.chargeStatus!=0">
            <a-select  v-model:value="searchParams.payType" placeholder="请选择" allowClear>
              <a-select-option :value="item.id" v-for="(item,index) in ClinicPayType" :key="index">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
        </a-space>
        <a-space>
          <a-button @click="handleResetFilter">重置筛选</a-button>
          <a-button type="primary" @click="getChargeList(true)">筛选查询</a-button>
        </a-space>
      </a-flex>
      <a-table :data-source="table.list"
                :columns="props.chargeStatus==0?columns1:props.chargeStatus==1?columns2:columns3"
                row-key="Id"
                :loading="table.loading"
                :pagination="pagination"
                :scroll="{x:1000,y:'calc(100vh - 450px)'}">
        <template #bodyCell="{column,record,index}">
          <template v-if="column.dataIndex == 'PatientName'">
            <div class="flex align-center">
              <img class="w40px h40px border-rd-50%" :src="getImageUrl(`userAvatar${(index % 7) + 1}.png`)" alt="">
              <div class="ml8px">
                <div>{{record.PatientName}}</div>
                <div class="color-[#858D98] mt4px text-12px">
                  <span>{{record.PatientGender==1?'男':'女'}}</span>
                  <a-divider type="vertical" />
                  <span>{{record.PatientAge}}岁</span>
                </div>
              </div>
            </div>
          </template>
          <template v-if="column.dataIndex == 'ReceiverName'">
            <div class="flex align-center">
              <div class="text-bold whitespace-nowrap">{{record.ReceiverName}}</div>
              <div class="color-[#858D98]">({{record.ReceiverPhone}})</div>
              <img class="ml2px w16px h16px pointer" @click="handleCopy(record)" src="../../../assets/images/copyIcon.png" alt="">
            </div>
            <div class="mt8px">{{computeRegionData(record.RegionData)}}{{record.ReceiverAddress}}</div>
          </template>
          <template v-if="column.dataIndex == 'AmountReceivable'">
            <div class="color-[#F74344] text-bold">
              <span class="text-10px">￥</span>
              <span class="text-18px">{{record.Total}}</span>
            </div>
            <div class="color-[#4E5766] mt4px">含药费:￥{{(record.OriginalAmount+record.RetailMarkupAmount+record.PremiumAmount).toFixed(2)}}； 挂号费:￥{{record.RegistrationFee}}</div>
          </template>
          <template v-if="column.dataIndex == 'RefundAmount'">
            <div>{{ClinicPayType.find(p=>p.id==record.PayType)?.name}}</div>
            <div class="color-[#F74344] text-bold">
              <span class="text-10px">￥</span>
              <span class="text-18px">{{record.RefundAmount}}</span>
            </div>
            <div class="color-[#4E5766] mt4px">挂号费:￥{{record.RegistrationFee}}，不退回</div>
          </template>
          <template v-if="column.dataIndex == 'PreparStatus'">
            <a-tag :bordered="false" :color="record.PreparStatus==0?'volcano':record.PreparStatus==1?'processing':record.PreparStatus==2?'success':''">{{MYYPreparStatus.find(p=>p.id==record.PreparStatus)?.name}}</a-tag>
            <div class="mt4px">{{record.OrderCode}}</div>
          </template>
          <template v-if="column.dataIndex == 'DocName'">
            <div>{{record.DocName}}</div>
            <div class="color-[#858D98] mt2px text-12px">{{record.DocPhone}}</div>
          </template>
          <template v-if="column.dataIndex == 'Status'">
            <a-badge :color="computeColor(record.Status)" :text="MYYOrderStatus.find(p=>p.id==record.Status)?.name" />
          </template>
          <template v-if="column.dataIndex == 'OperationDate'">
            <div>开单时间：{{record.CreateTime}}</div>
            <div>支付时间：{{record.PayTime||'--'}}</div>
            <div>审方时间：{{record.ReviewTime||'--'}}</div>
            <div>调配时间：{{record.MixTime||'--'}}</div>
          </template>
          
          <template v-if="column.dataIndex == 'PayChannel'">
            <div>{{ClinicPayType.find(p=>p.id==record.PayType)?.name}}</div>
            <div class="text-bold">
              <span class="text-10px">￥</span>
              <span class="text-20px">{{record.Total}}</span>
            </div>
            <div class="mt8px color-[#4E5766]">含药费：￥{{(record.OriginalAmount+record.RetailMarkupAmount+record.PremiumAmount).toFixed(2)}}；</div>
            <div class="color-[#4E5766]">挂号费：￥{{record.RegistrationFee}}</div>
          </template>
          <template v-if="column.dataIndex == 'operation'">
            <div v-if="props.chargeStatus==0">
              <a-button type="primary" @click="operateOrder(record,1)">去收款</a-button>
              <div class="mt8px">
                <a-button type="link" size="small" @click="seeDetail(record)">详情</a-button>
                <a-divider type="vertical" />
                <a-button type="text" size="small" @click="handleCloseOrder(record)">关闭</a-button>
              </div>
            </div>
            <div v-if="props.chargeStatus==1">
              <a-button type="link" size="small" @click="seeDetail(record)">详情</a-button>
              <a-divider type="vertical" />
              <a-button type="link" size="small" @click="operateOrder(record,2)">申请售后</a-button>
              <a-divider type="vertical" />
              <a-button type="link" size="small" v-if="record.Status==3" @click="seeLogistics(record)">查看物流</a-button>
            </div>
            <div v-if="props.chargeStatus!=0&&props.chargeStatus!=1">
              <a-button type="link" size="small" @click="seeDetail(record)">详情</a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <PaymentModal v-model:visible="paymentVisible" :orderInfo="orderInfo" @confirm="completeOperate"></PaymentModal>
    <RefundModal v-model:visible="refundVisible" :orderInfo="orderInfo" @confirm="completeOperate"></RefundModal>
    <LogisticsModal v-model:visible="logisticsVisible" :orderCode="orderCode"></LogisticsModal>
  </div>
</template>
<script lang="ts" setup>
  import { ref,onMounted,reactive,computed,createVNode} from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import {ExclamationCircleOutlined} from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { cloneDeep } from 'lodash-es';
  import {ChargeApiCtrl} from '/@/api/myy/charge';
  import { useUserStore } from '@/store/modules/user';
  import {AccountApiCtrl} from '/@/api/myy/account';
  import { useGo } from '/@/hooks/web/usePage';
  import { setRouteChange } from '@/logics/mitt/routeChange';
  import {basicEnum} from '/@/api/platform/common';
  import PaymentModal from '/@/components/PaymentModal.vue';
  import RefundModal from '/@/components/RefundModal.vue';
  import { Modal } from 'ant-design-vue';
  import LogisticsModal from '/@/components/LogisticsModal.vue';

  const props = defineProps({
    chargeStatus: {
      type: Number,
      default:0
    },
  });
  const userStore = useUserStore()
  const ClinicRole=ref(1)
  const { createMessage} = useMessage()
  const go = useGo();
  const loading=ref(false)
  const logisticsVisible=ref(false)
  const summaryInfo=ref({})
  const ClinicPayType=ref([])
  const MYYOrderStatus=ref([])
  const physicianList=ref([])
  const MYYPreparStatus=ref([])
  const orderInfo=ref({})
  const orderCode=ref('')
  const paymentVisible=ref(false)
  const refundVisible=ref(false)
  const searchParams = ref({
    Date:[],
    keyword:'',
    docId:null,
    status:null,
    payType:null,
    chargeStatus:props.chargeStatus,
  })
  const table =ref({
    list: [],
    loading:false,
  })
  const columns1=ref([
    {title: '订单编号',dataIndex: 'OrderCode',width: 200},
    {title: '患者信息',dataIndex: 'PatientName',width: 180},
    {title: '收货信息',dataIndex: 'ReceiverName',width: 200},
    {title: '开单医师',dataIndex: 'DocName',width: 140},
    {title: '开单时间',dataIndex: 'CreateTime',width: 160},
    {title: '应收金额',dataIndex: 'AmountReceivable',width: 180},
    {title: '操作',width: 160 ,dataIndex: 'operation',align:'center',fixed:'right'}
  ])
    const columns2=ref([
    {title: '订单编号&调配状态',dataIndex: 'PreparStatus',width: 240},
    {title: '患者信息',dataIndex: 'PatientName',width: 180},
    {title: '收货信息',dataIndex: 'ReceiverName',width: 200},
    {title: '开单医师',dataIndex: 'DocName',width: 140},
    {title: '订单金额&支付方式',dataIndex: 'PayChannel',width: 160},
    {title: '订单状态',dataIndex: 'Status',width: 140},
    {title: '操作日期',dataIndex: 'OperationDate',width: 250},
    {title: '操作',width: 240 ,dataIndex: 'operation',align:'center',fixed:'right'}
  ])
    const columns3=ref([
    {title: '订单编号&调配状态',dataIndex: 'PreparStatus',width: 240},
    {title: '患者信息',dataIndex: 'PatientName',width: 180},
    {title: '收货信息',dataIndex: 'ReceiverName',width: 200},
    {title: '开单医师',dataIndex: 'DocName',width: 140},
    {title: '退款金额',dataIndex: 'RefundAmount',width: 160},
    {title: '退款时间',dataIndex: 'RefundTime',width: 160},
    {title: '操作',width: 160 ,dataIndex: 'operation',align:'center',fixed:'right'}
  ])

  const pagination = reactive({
    total: 0,
    current: 1,
    pageSize: 10,
    showQuickJumper:true,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`, 
    onShowSizeChange: (current,size) => {
      pagination.pageSize = size
      pagination.current = 1
      getChargeList()
    },
    onChange: (page) => {
      pagination.current = page
      getChargeList()
    }
  })


  onMounted(() => {
    ClinicRole.value=userStore.getUserInfo.Doctor.ClinicRole
    if(ClinicRole.value==2){
      searchParams.value.docId=userStore.getUserInfo.Doctor.DoctorId
    }
    getBasicEnum()
    getStaffList()
    getChargeSummary()
    getChargeList()
  })

  const computeColor=computed(()=>{
    return (val)=>{
      if (val === -1) return 'grey';
      if (val === 3) return 'blue';
      if (val === 4) return 'green';
      if (val === 5) return 'red';
      if (val === 6) return 'grey';
      return 'orange';
    }
  })

  const computeRegionData=(val)=>{
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

  const getImageUrl = (name) => {
    return new URL(`../../../assets/images/${name}`, import.meta.url).href;
  };

  const getBasicEnum=()=>{
    basicEnum({name:'ClinicPayType'}).then(data=>{
      ClinicPayType.value=data
    })
    basicEnum({name:'MYYOrderStatus'}).then(data=>{
      MYYOrderStatus.value=data
    })
    basicEnum({name:'MYYPreparStatus'}).then(data=>{
      MYYPreparStatus.value=data
    })
  }

  const getStaffList=()=>{
    AccountApiCtrl.DoctorOptions({}).then(data=>{
      physicianList.value=data
    })
  }

  const getChargeSummary=()=>{
    loading.value=true
    ChargeApiCtrl.ChargeSummary({}).then(data=>{
      summaryInfo.value=data
    }).catch(() => {}).finally(() => {loading.value=false })
  }

  const handleResetFilter=()=>{
    searchParams.value={
      Date:[],
      keyword:'',
      docId:null,
      status:null,
      payType:null,
      chargeStatus:props.chargeStatus,
    }
    getChargeList(true)
  }

  // 获取列表
  const getChargeList=(isSearch=false)=>{
    if(isSearch){
      pagination.current=1
    }
    table.value.loading=true
    const query =cloneDeep(searchParams.value)
    if(searchParams.value.Date){
      query.startTime = searchParams.value.Date[0]||'',
      query.endTime = searchParams.value.Date[1]||'',
      delete query.Date
    }
    ChargeApiCtrl.ChargeList({
      page:pagination.current,
      limit:pagination.pageSize,
      ...query
    }).then(data=>{
      table.value.loading=false
      table.value.list=data.Rows
      pagination.total=data.TotalItemCount
    }).catch(() => {}).finally(() => { table.value.loading=false })
  }

  const route = useRoute();
  const router = useRouter();
  const seeDetail=(record)=>{
    const fromPath = route.path
    const removeGuard = router.beforeEach((to) => {
      if (to.path === '/charge/detail' && to.query.from) {
        to.meta.currentActiveMenu = to.query.from as string
        setRouteChange(to)
      }
      removeGuard()
      return true
    })
    go('/charge/detail?orderCode=' + record.OrderCode + '&from=' + encodeURIComponent(fromPath))
  }

  const operateOrder=(record,type)=>{
    ChargeApiCtrl.ChargeDetail({orderCode:record.OrderCode}).then(data=>{
      orderInfo.value=data
      if(type==1){
        paymentVisible.value=true
      }else{
        refundVisible.value=true
      }
    }).catch(() => {}).finally(() => {})
  }

  const completeOperate=()=>{
    paymentVisible.value=false
    refundVisible.value=false
    getChargeList()
  }

  const handleCloseOrder=(record)=>{
    Modal.confirm({
      title: '提示',
      centered:true,
      content: '确定要关闭该订单吗？',
      icon: createVNode(ExclamationCircleOutlined),
      onOk() {
        table.value.loading=true
        ChargeApiCtrl.CloseOrder({OrderCode:record.OrderCode}).then(data => {
          createMessage.success(`操作成功`);
          getChargeList()
        }).catch(() => {}).finally(() => {table.value.loading=false})
      },
    });
  }

  const handleCopy=(record)=>{
    let text=record.ReceiverName+','+record.ReceiverPhone+','+computeRegionData(record.RegionData)+record.ReceiverAddress
    navigator.clipboard.writeText(text)
    createMessage.success('复制成功');
  }

  const seeLogistics=(record)=>{
    orderCode.value=record.OrderCode
    logisticsVisible.value=true
  }
</script>
<style lang="less" scoped>
</style>