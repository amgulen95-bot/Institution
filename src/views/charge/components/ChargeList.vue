<template>
  <div class="charge-list-page">
    <a-card class="charge-list-summary-card" v-loading="loading">
      <div class="charge-list-summary-grid flex">
        <div class="charge-list-stat-card flex-sub p-16px border-rd-12px bg-[#EEF3FB] flex align-center justify-between">
          <div class="flex align-center">
            <img class="w52px h52px border-rd-50%" src="../../../assets/images/statisticsIcon1.png" alt="">
            <div class="ml12px">
              <div class="text-16px text-bold">门店总收款</div>
              <div class="mt4px color-[#4E5766] text-12px">较昨日 {{summaryInfo.TotalAmountDayRate>=0?'↑':'↓'}}{{summaryInfo.TotalAmountDayRate}}%</div>
            </div>
          </div>
          <div class="text-bold">
            <span class="text-16px">￥</span>
            <span class="text-32px">{{moneyText(summaryInfo.TotalAmount)}}</span>
          </div>
        </div>
        <div class="charge-list-stat-card flex-sub ml16px p-16px border-rd-12px bg-[#EEF3FB] flex align-center justify-between">
          <div class="flex align-center">
            <img class="w52px h52px border-rd-50%" src="../../../assets/images/statisticsIcon2.png" alt="">
            <div class="ml12px">
              <div class="text-16px text-bold">线上收款</div>
              <div class="mt4px color-[#4E5766] text-12px">较昨日 {{summaryInfo.OnlineAmountDayRate>=0?'↑':'↓'}}{{summaryInfo.OnlineAmountDayRate}}%</div>
            </div>
          </div>
          <div class="text-bold">
            <span class="text-16px">￥</span>
            <span class="text-32px">{{moneyText(summaryInfo.OnlineAmount)}}</span>
          </div>
        </div>
        <div class="charge-list-stat-card flex-sub ml16px p-16px border-rd-12px bg-[#EEF3FB] flex align-center justify-between">
          <div class="flex align-center">
            <img class="w52px h52px border-rd-50%" src="../../../assets/images/statisticsIcon3.png" alt="">
            <div class="ml12px">
              <div class="text-16px text-bold">现金收款</div>
              <div class="mt4px color-[#4E5766] text-12px">较昨日 {{summaryInfo.CashAmountDayRate>=0?'↑':'↓'}}{{summaryInfo.CashAmountDayRate}}%</div>
            </div>
          </div>
          <div class="text-bold">
            <span class="text-16px">￥</span>
            <span class="text-32px">{{moneyText(summaryInfo.CashAmount)}}</span>
          </div>
        </div>
        <div class="charge-list-stat-card flex-sub ml16px p-16px border-rd-12px bg-[#EEF3FB] flex align-center justify-between">
          <div class="flex align-center">
            <img class="w52px h52px border-rd-50%" src="../../../assets/images/statisticsIcon4.png" alt="">
            <div class="ml12px">
              <div class="text-16px text-bold">待收款</div>
              <div class="mt4px color-[#4E5766] text-12px">较昨日 {{summaryInfo.PendingAmountDayRate>=0?'↑':'↓'}}{{summaryInfo.PendingAmountDayRate}}%</div>
            </div>
          </div>
          <div class="text-bold">
            <span class="text-16px">￥</span>
            <span class="text-32px">{{moneyText(summaryInfo.PendingAmount)}}</span>
          </div>
        </div>
      </div>
    </a-card>
    <a-card class="charge-list-table-card mt16px">
      <a-flex class="charge-list-filter-panel" justify="space-between" align="center">
        <a-space :size="[20,0]" wrap>
          <a-form-item label="开方日期">
            <a-range-picker v-model:value="searchParams.Date" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" :get-popup-container="(trigger) => trigger.parentElement" />
          </a-form-item>
          <a-form-item label="关键字">
            <a-input class="charge-list-keyword" v-model:value="searchParams.keyword" placeholder="订单编号/患者姓名/手机号/患者号" allowClear />
          </a-form-item>
          <a-form-item label="开单医师" class="charge-list-filter-select" v-if="ClinicRole==1">
            <a-select  v-model:value="searchParams.docId" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="charge-list-select-dropdown" :listHeight="220" :virtual="false" :get-popup-container="(trigger) => trigger.parentElement">
              <a-select-option :value="item.id" v-for="(item,index) in physicianList" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="订单状态" class="charge-list-filter-select" v-if="props.chargeStatus==1">
            <a-select  v-model:value="searchParams.status" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="charge-list-select-dropdown" :listHeight="220" :virtual="false" :get-popup-container="(trigger) => trigger.parentElement">
              <a-select-option :value="item.id" v-for="(item,index) in MYYOrderStatus" :key="index">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="支付方式" class="charge-list-filter-select" v-if="props.chargeStatus!=0">
            <a-select  v-model:value="searchParams.payType" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="charge-list-select-dropdown" :listHeight="220" :virtual="false" :get-popup-container="(trigger) => trigger.parentElement">
              <a-select-option :value="item.id" v-for="(item,index) in ClinicPayType" :key="index">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
        </a-space>
        <a-space class="charge-list-filter-actions">
          <a-button class="charge-list-action-button" @click="handleResetFilter">重置筛选</a-button>
          <a-button class="charge-list-action-button" type="primary" @click="getChargeList(true)">筛选查询</a-button>
        </a-space>
      </a-flex>
      <div class="charge-list-table-scroll">
      <a-table class="charge-list-table"
                :data-source="table.list"
                :columns="props.chargeStatus==0?columns1:props.chargeStatus==1?columns2:columns3"
                row-key="Id"
                :loading="table.loading"
                :pagination="pagination"
                :scroll="{x:tableScrollX}">
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
            <div class="charge-list-money color-[#F74344] text-bold">
              <span class="text-10px">￥</span>
              <span class="text-18px">{{moneyText(record.Total)}}</span>
            </div>
            <div class="charge-list-money-detail color-[#4E5766] mt4px">含药费:￥{{moneyText(record.OriginalAmount+record.RetailMarkupAmount+record.PremiumAmount)}}； 挂号费:￥{{moneyText(record.RegistrationFee)}}</div>
          </template>
          <template v-if="column.dataIndex == 'RefundAmount'">
            <div>{{ClinicPayType.find(p=>p.id==record.PayType)?.name}}</div>
            <div class="charge-list-money color-[#F74344] text-bold">
              <span class="text-10px">￥</span>
              <span class="text-18px">{{moneyText(record.RefundAmount)}}</span>
            </div>
            <div class="charge-list-money-detail color-[#4E5766] mt4px">挂号费:￥{{moneyText(record.RegistrationFee)}}，不退回</div>
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
            <div class="charge-list-money text-bold">
              <span class="text-10px">￥</span>
              <span class="text-20px">{{moneyText(record.Total)}}</span>
            </div>
            <div class="charge-list-money-detail mt8px color-[#4E5766]">含药费：￥{{moneyText(record.OriginalAmount+record.RetailMarkupAmount+record.PremiumAmount)}}；</div>
            <div class="charge-list-money-detail color-[#4E5766]">挂号费：￥{{moneyText(record.RegistrationFee)}}</div>
          </template>
          <template v-if="column.dataIndex == 'operation'">
            <div v-if="props.chargeStatus==0" class="charge-list-pending-actions">
              <a-button class="charge-list-pay-button" type="primary" @click="operateOrder(record,1)">去收款</a-button>
              <div class="charge-list-pending-secondary">
                <a-button class="charge-list-detail-button" size="small" @click="seeDetail(record)">详情</a-button>
                <a-button class="charge-list-close-button" size="small" @click="handleCloseOrder(record)">关闭</a-button>
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
      </div>
    </a-card>

    <PaymentModal v-model:visible="paymentVisible" :orderInfo="orderInfo" @confirm="completeOperate"></PaymentModal>
    <RefundModal v-model:visible="refundVisible" :orderInfo="orderInfo" @confirm="completeOperate"></RefundModal>
    <LogisticsModal v-model:visible="logisticsVisible" :orderCode="orderCode"></LogisticsModal>
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
            <strong>{{closeOrderRecord?.PatientName || '--'}}</strong>
          </div>
          <div>
            <span>订单编号</span>
            <strong>{{closeOrderRecord?.OrderCode || '--'}}</strong>
          </div>
          <div>
            <span>待收金额</span>
            <strong>￥{{moneyText(closeOrderRecord?.Total)}}</strong>
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
  </div>
</template>
<script lang="ts" setup>
  import { ref,onMounted,reactive,computed} from 'vue';
  import { useRoute, useRouter } from 'vue-router';
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
  import LogisticsModal from '/@/components/LogisticsModal.vue';

  const props = defineProps({
    chargeStatus: {
      type: Number,
      default:0
    },
  });
  const userStore = useUserStore()
  const route = useRoute();
  const router = useRouter();
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
  const autoPayHandled=ref(false)
  const closeOrderVisible=ref(false)
  const closeOrderSubmitting=ref(false)
  const closeOrderRecord=ref<any>(null)
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
  ].map((column)=>{
    if(column.dataIndex === 'AmountReceivable'){
      return {
        ...column,
        align:'right',
        className:'charge-list-money-column',
        customHeaderCell: () => ({ class: 'charge-list-money-column' }),
      }
    }
    return column
  }))
    const columns2=ref([
    {title: '订单编号&调配状态',dataIndex: 'PreparStatus',width: 240},
    {title: '患者信息',dataIndex: 'PatientName',width: 180},
    {title: '收货信息',dataIndex: 'ReceiverName',width: 200},
    {title: '开单医师',dataIndex: 'DocName',width: 140},
    {title: '订单金额&支付方式',dataIndex: 'PayChannel',width: 160},
    {title: '订单状态',dataIndex: 'Status',width: 140},
    {title: '操作日期',dataIndex: 'OperationDate',width: 250},
    {title: '操作',width: 240 ,dataIndex: 'operation',align:'center',fixed:'right'}
  ].map((column)=>{
    if(column.dataIndex === 'PayChannel'){
      return {
        ...column,
        align:'right',
        className:'charge-list-money-column',
        customHeaderCell: () => ({ class: 'charge-list-money-column' }),
      }
    }
    return column
  }))
    const columns3=ref([
    {title: '订单编号&调配状态',dataIndex: 'PreparStatus',width: 240},
    {title: '患者信息',dataIndex: 'PatientName',width: 180},
    {title: '收货信息',dataIndex: 'ReceiverName',width: 200},
    {title: '开单医师',dataIndex: 'DocName',width: 140},
    {title: '退款金额',dataIndex: 'RefundAmount',width: 160},
    {title: '退款时间',dataIndex: 'RefundTime',width: 160},
    {title: '操作',width: 160 ,dataIndex: 'operation',align:'center',fixed:'right'}
  ].map((column)=>{
    if(column.dataIndex === 'RefundAmount'){
      return {
        ...column,
        align:'right',
        className:'charge-list-money-column',
        customHeaderCell: () => ({ class: 'charge-list-money-column' }),
      }
    }
    return column
  }))

  const tableScrollX=computed(()=>{
    if(props.chargeStatus==0) return 1220
    if(props.chargeStatus==1) return 1530
    return 1240
  })

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
    if(props.chargeStatus==0&&route.query.orderCode){
      searchParams.value.keyword=String(route.query.orderCode)
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
    return ChargeApiCtrl.ChargeList({
      page:pagination.current,
      limit:pagination.pageSize,
      ...query
    }).then(data=>{
      table.value.loading=false
      table.value.list=data.Rows
      pagination.total=data.TotalItemCount
      handleAutoOpenPayment()
      return data
    }).catch(() => {}).finally(() => { table.value.loading=false })
  }

  const getRouteOrderCode=()=>{
    return String(route.query.orderCode || '')
  }

  const shouldAutoPay=()=>{
    return props.chargeStatus==0 && route.query.autoPay=='1' && !!getRouteOrderCode()
  }

  const handleAutoOpenPayment=()=>{
    if(autoPayHandled.value || !shouldAutoPay()){
      return
    }
    autoPayHandled.value=true
    const targetOrderCode = getRouteOrderCode()
    const targetRecord = table.value.list.find(item => item.OrderCode==targetOrderCode)
    if(targetRecord){
      operateOrder(targetRecord,1)
      return
    }
    ChargeApiCtrl.ChargeDetail({orderCode:targetOrderCode}).then(data=>{
      orderInfo.value=data
      paymentVisible.value=true
    }).catch(() => {}).finally(() => {})
  }

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

  const moneyText=(value)=>{
    const number = Number(value || 0)
    return Number.isFinite(number) ? number.toFixed(2) : '0.00'
  }

  const handleCloseOrder=(record)=>{
    closeOrderRecord.value=record
    closeOrderVisible.value=true
  }

  const confirmCloseOrder=()=>{
    const record = closeOrderRecord.value
    if (!record?.OrderCode) return
    closeOrderSubmitting.value=true
    table.value.loading=true
    ChargeApiCtrl.CloseOrder({OrderCode:record.OrderCode}).then(data => {
      createMessage.success(`操作成功`);
      closeOrderVisible.value=false
      closeOrderRecord.value=null
      getChargeList()
    }).catch(() => {}).finally(() => {
      closeOrderSubmitting.value=false
      table.value.loading=false
    })
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
.charge-list-page {
  background: #f4f7f9;
}

.charge-list-summary-card,
.charge-list-table-card {
  overflow: hidden;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #fff;

  :deep(.ant-card-body) {
    padding: 18px;
  }
}

.charge-list-summary-grid {
  gap: 12px;
}

.charge-list-stat-card {
  min-height: 118px;
  margin-left: 0 !important;
  border: 1px solid #e8eef7;
  background: #f9fbfd !important;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;

  &:hover {
    border-color: #cfe0ff;
    box-shadow: 0 10px 26px rgba(32, 48, 75, 0.08);
    transform: translateY(-1px);
  }

  .text-16px.text-bold {
    color: #1d2533;
    font-weight: 500;
  }

  .text-12px {
    color: #5f6a7a !important;
    font-weight: 400;
  }

  > .text-bold {
    color: #1d2533;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }

  > .text-bold .text-16px {
    color: #5f6a7a;
    font-weight: 400;
  }

  > .text-bold .text-32px {
    font-weight: 500;
  }
}

.charge-list-stat-card + .charge-list-stat-card {
  margin-left: 0 !important;
}

.charge-list-filter-panel {
  align-items: center !important;
  margin-bottom: 14px;
  padding: 14px;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #f9fbfd;

  :deep(.ant-form-item) {
    margin-bottom: 0;
  }

  :deep(.ant-form-item-label > label) {
    color: #5f6a7a;
    font-weight: 400;
  }
}

.charge-list-keyword {
  width: 300px;
}

.charge-list-filter-select {
  width: 220px;
}

.charge-list-filter-actions {
  align-self: center;
}

.charge-list-action-button {
  min-width: 88px;
  border-radius: 8px;
}

.charge-list-table-scroll {
  max-height: calc(100vh - 360px);
  padding-right: 8px;
  overflow-x: hidden;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: #cdd8ea;
  }

  &::-webkit-scrollbar-track {
    border-radius: 999px;
    background: #f4f7fb;
  }
}

.charge-list-table {
  overflow: hidden;
  border: 1px solid #e8eef7;
  border-radius: 12px;

  :deep(.ant-table) {
    border-radius: 12px;
  }

  :deep(.ant-table-thead > tr > th) {
    color: #5f6a7a;
    font-weight: 400;
    background: #f9fbfd !important;
    border-bottom: 1px solid #e8eef7 !important;
  }

  :deep(.ant-table-tbody > tr > td) {
    color: #1d2533;
    border-bottom: 1px dashed #dce6f5 !important;
  }

  :deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
    background: #eef5ff !important;
  }

  :deep(.ant-pagination) {
    margin: 14px 4px 2px;
  }
}

.charge-list-money {
  color: #1d2533;
  font-variant-numeric: tabular-nums;
  text-align: right;

  .text-18px,
  .text-20px {
    font-weight: 500;
  }
}

.charge-list-money-detail {
  font-size: 12px;
  line-height: 20px;
  text-align: right;
  white-space: nowrap;
}

.charge-list-pending-actions {
  display: inline-flex;
  width: 116px;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.charge-list-pay-button {
  width: 100%;
  height: 34px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  box-shadow: 0 6px 14px rgba(10, 90, 255, 0.14);
}

.charge-list-pending-secondary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.charge-list-detail-button,
.charge-list-close-button {
  height: 28px;
  padding: 0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 400;
  background: #fff;
  transition: border-color 0.18s ease, color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
}

.charge-list-detail-button {
  border-color: #dce6f5;
  color: #0a5aff;

  &:hover,
  &:focus {
    border-color: #cfe0ff;
    color: #0a5aff;
    background: #eef5ff;
    box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.06);
  }
}

.charge-list-close-button {
  border-color: #eadfe0;
  color: #8a4b4b;

  &:hover,
  &:focus {
    border-color: #f1c8c8;
    color: #d84a4a;
    background: #fff5f5;
    box-shadow: 0 0 0 2px rgba(216, 74, 74, 0.06);
  }
}

:deep(.charge-list-money-column) {
  text-align: right;
}

:deep(th.charge-list-money-column .ant-table-column-title) {
  display: block;
  text-align: right;
}

:deep(.charge-list-filter-panel .ant-input-affix-wrapper),
:deep(.charge-list-filter-panel .ant-picker),
:deep(.charge-list-filter-panel .ant-select-selector) {
  border-color: #dce6f5 !important;
  border-radius: 8px !important;
  background: #fff;
  box-shadow: none !important;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

:deep(.charge-list-filter-panel .ant-input-affix-wrapper:hover),
:deep(.charge-list-filter-panel .ant-input-affix-wrapper-focused),
:deep(.charge-list-filter-panel .ant-picker:hover),
:deep(.charge-list-filter-panel .ant-picker-focused),
:deep(.charge-list-filter-panel .ant-select:hover .ant-select-selector),
:deep(.charge-list-filter-panel .ant-select-focused .ant-select-selector) {
  border-color: #0a5aff !important;
  box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
}

:deep(.charge-list-filter-panel .ant-input-affix-wrapper .ant-input),
:deep(.charge-list-filter-panel .ant-input-affix-wrapper .ant-input:hover),
:deep(.charge-list-filter-panel .ant-input-affix-wrapper .ant-input:focus) {
  border-color: transparent !important;
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.charge-list-select-dropdown) {
  padding: 6px;
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(29, 37, 51, 0.12);
}

:deep(.charge-list-select-dropdown .ant-select-item) {
  min-height: 34px;
  border-radius: 8px;
  transition: background-color 0.16s ease, color 0.16s ease;
}

:deep(.charge-list-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled)) {
  background: #eef5ff;
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
</style>
