<template>
  <div class="p-4 root-extraction-record-page">
    <div class="page-height SmallCard record-list-card">
      <div class="record-filter-panel">
      <div class="record-filter-title">开方记录查询</div>
      <a-flex justify="space-between" align="flex-start" gap="16" wrap="wrap">
        <a-space class="record-filter-fields" :size="[20,0]" wrap>
          <a-form-item label="开方日期">
            <a-range-picker v-model:value="searchParams.Date" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" dropdownClassName="record-filter-date-dropdown" :get-popup-container="(trigger) => trigger.parentElement" />
          </a-form-item>
          <a-form-item label="患者信息">
            <a-input class="record-keyword-input" v-model:value="searchParams.keyword" placeholder="姓名/手机号/患者号" allowClear />
          </a-form-item>
          <a-form-item label="接诊医师" class="w240px" v-if="ClinicRole==1">
            <a-select  v-model:value="searchParams.docId" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="record-filter-select-dropdown" :listHeight="220" :virtual="false" :get-popup-container="(trigger) => trigger.parentElement">
              <a-select-option :value="item.id" v-for="(item,index) in physicianList" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
        </a-space>
        <a-space class="record-filter-actions">
          <a-button @click="handleResetFilter">重置筛选</a-button>
          <a-button type="primary" @click="getRootExtractionRecord(true)">筛选查询</a-button>
        </a-space>
      </a-flex>
      </div>
      <a-table class="record-table"
                :data-source="table.list"
                :columns="columns"
                row-key="Id"
                :loading="table.loading"
                :pagination="pagination"
                :scroll="{x:1180,y:'calc(100vh - 324px)'}">
        <template #bodyCell="{column,record,index}">
          <template v-if="column.dataIndex == 'PatientName'">
            <div class="record-patient-cell">
              <img class="record-patient-avatar" :src="getImageUrl(`userAvatar${(index % 7) + 1}.png`)" alt="">
              <div class="record-patient-info">
                <div class="record-patient-main">
                  <span class="record-patient-name">{{record.PatientName}}</span>
                  <ManOutlined class="color-[#0A5AFF]" v-if="record.PatientGender==1" />
                  <WomanOutlined class="color-[#f52468]" v-else />
                </div>
                <div class="record-patient-age">{{record.PatientAge}}岁</div>
              </div>
            </div>
          </template>
          <template v-if="column.dataIndex == 'OrderCode'">
            <div class="record-order-cell">
              <span class="record-order-code">{{ record.OrderCode }}</span>
              <a-button v-if="record.OrderStatus==1" class="record-collect-button" type="link" size="small" @click="operateOrder(record)">去收款</a-button>
            </div>
          </template>
          <template v-if="column.dataIndex == 'OrderStatusName'">
            <span class="record-status-tag" :class="getOrderStatusClass(record)">{{ record.OrderStatusName }}</span>
          </template>
          <template v-if="column.dataIndex == 'operation'">
            <div class="record-operation-actions">
              <a-button type="link" size="small" @click="seeDetail(record,1)">查看</a-button>
              <a-divider type="vertical" />
              <a-button type="link" size="small" @click="seeDetail(record,2)">打印</a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <PaymentModal v-model:visible="paymentVisible" :orderInfo="orderInfo" @confirm="completeOperate"></PaymentModal>
  </div>
</template>
<script lang="ts" setup>
  import { ref,reactive,onMounted} from 'vue';
  import {WomanOutlined,ManOutlined} from '@ant-design/icons-vue';
  import { cloneDeep } from 'lodash-es';
  import {PatientApiCtrl} from '/@/api/myy/patient';
  import {AccountApiCtrl} from '/@/api/myy/account';
  import { useGo } from '/@/hooks/web/usePage';
  import { useRoute } from 'vue-router';
  import { useUserStore } from '@/store/modules/user';
  import {ChargeApiCtrl} from '/@/api/myy/charge';
  import PaymentModal from '/@/components/PaymentModal.vue';
  
  const go = useGo();
  const route = useRoute();
  const physicianList=ref([])
  const userStore = useUserStore()
  const ClinicRole=ref(1)
  const orderInfo=ref({})
  const paymentVisible=ref(false)
  const searchParams = ref({
    Date:[],
    keyword:'',
    docId:null,
    patientId:'',
    hasOrder:true,
  })
  const table =ref({
    list: [],
    loading:false,
  })
  const columns=ref([
    {title: '病历号',dataIndex: 'Id',width: 150},
    {title: '患者信息',dataIndex: 'PatientName',width: 240},
    {title: '手机号',dataIndex: 'PatientPhone',width: 140},
    {title: '接诊医师',dataIndex: 'DoctorName',width: 140},
    {title: '开方日期',dataIndex: 'CreateTime',width: 170},
    {title: '订单编号',dataIndex: 'OrderCode',width: 320},
    {title: '订单状态',dataIndex: 'OrderStatusName',width: 130},
    {title: '操作',width: 132 ,dataIndex: 'operation',align:'center',fixed:'right'}
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
      getRootExtractionRecord()
    },
    onChange: (page) => {
      pagination.current = page
      getRootExtractionRecord()
    }
  })

  onMounted(() => {
    searchParams.value.patientId = route.query.patientId ? String(route.query.patientId) : ''
    ClinicRole.value=userStore.getUserInfo.Doctor.ClinicRole
    if(ClinicRole.value==2){
      searchParams.value.docId=userStore.getUserInfo.Doctor.DoctorId
    }
    getStaffList()
    getRootExtractionRecord()
  })

  const getStaffList=()=>{
    AccountApiCtrl.DoctorOptions({}).then(data=>{
      physicianList.value=data
    })
  }

  const handleResetFilter=()=>{
    searchParams.value={
      Date:[],
      keyword:'',
      docId:null,
      patientId:'',
      hasOrder:true,
    }
    getRootExtractionRecord(true)
  }

  // 获取列表
  const getRootExtractionRecord=(isSearch=false)=>{
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
    PatientApiCtrl.VisitList({
      page:pagination.current,
      limit:pagination.pageSize,
      ...query
    }).then(data=>{
      table.value.loading=false
      table.value.list=data.Rows
      pagination.total=data.TotalItemCount
    }).catch(() => {}).finally(() => { table.value.loading=false })
  }

  const getImageUrl = (name) => {
    return new URL(`../../assets/images/${name}`, import.meta.url).href;
  };

  const getOrderStatusClass = (record) => {
    const status = Number(record?.OrderStatus)
    const statusName = String(record?.OrderStatusName || '')
    if (status === 1 || statusName.includes('待')) return 'is-pending'
    if (status === 2 || statusName.includes('已收')) return 'is-paid'
    if (statusName.includes('退款中')) return 'is-refunding'
    if (statusName.includes('已退款')) return 'is-refunded'
    if (statusName.includes('取消')) return 'is-cancelled'
    return 'is-default'
  }

  const seeDetail=(record,type)=>{
    go('/rootExtraction/detail?orderId='+record.OrderId+'&type='+type)
  }

  const operateOrder=(record,type)=>{
    ChargeApiCtrl.ChargeDetail({orderCode:record.OrderCode}).then(data=>{
      orderInfo.value=data
      paymentVisible.value=true
    }).catch(() => {}).finally(() => {})
  }

  const completeOperate=()=>{
    paymentVisible.value=false
    getRootExtractionRecord()
  }
</script>
<style lang="less" scoped>
.root-extraction-record-page {
  .record-list-card {
    padding: 18px;
    overflow: hidden;
    border-radius: 12px;
    background: #fff;
  }

  .record-filter-panel {
    padding: 16px 18px 4px;
    margin-bottom: 14px;
    border: 1px solid #E8EEF7;
    border-radius: 12px;
    background: #F9FBFD;
  }

  .record-filter-title {
    margin-bottom: 14px;
    color: #1F2B3D;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }

  .record-filter-fields {
    flex: 1 1 auto;
  }

  .record-filter-actions {
    padding-top: 1px;
  }

  :deep(.record-filter-panel .ant-form-item) {
    margin-bottom: 12px;
  }

  :deep(.record-filter-panel .ant-picker),
  :deep(.record-filter-panel .ant-input-affix-wrapper),
  :deep(.record-filter-panel .ant-input),
  :deep(.record-filter-panel .ant-select-selector) {
    border-radius: 8px !important;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  :deep(.record-filter-panel .ant-picker:hover),
  :deep(.record-filter-panel .ant-picker-focused),
  :deep(.record-filter-panel .ant-input-affix-wrapper:hover),
  :deep(.record-filter-panel .ant-input-affix-wrapper-focused),
  :deep(.record-filter-panel .ant-input:hover),
  :deep(.record-filter-panel .ant-input:focus),
  :deep(.record-filter-panel .ant-select:not(.ant-select-disabled):hover .ant-select-selector),
  :deep(.record-filter-panel .ant-select-focused .ant-select-selector) {
    border-color: @primary-color !important;
    box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
  }

  :deep(.record-filter-panel .ant-input-affix-wrapper .ant-input),
  :deep(.record-filter-panel .ant-input-affix-wrapper .ant-input:hover),
  :deep(.record-filter-panel .ant-input-affix-wrapper .ant-input:focus) {
    border-color: transparent !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    outline: none !important;
  }

  :deep(.record-filter-select-dropdown),
  :deep(.record-filter-date-dropdown) {
    overflow: hidden;
    padding: 8px;
    border: 1px solid #E5EDF8;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 14px 32px rgba(31, 43, 61, 0.12);
  }

  :deep(.record-filter-select-dropdown .ant-select-item) {
    min-height: 34px;
    margin: 2px 0;
    padding: 6px 10px;
    color: #313947;
    border-radius: 8px;
    transition: background-color 0.16s ease, color 0.16s ease;
  }

  :deep(.record-filter-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled)) {
    background: #EEF5FF;
  }

  :deep(.record-filter-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled)) {
    color: @primary-color;
    font-weight: 500;
    background: #E8F1FF;
  }

  :deep(.record-filter-select-dropdown .rc-virtual-list-scrollbar-thumb) {
    background: #C7D7F0 !important;
    border-radius: 999px !important;
  }

  :deep(.record-filter-date-dropdown .ant-picker-panel-container) {
    overflow: hidden;
    border-radius: 12px;
    box-shadow: none;
  }

  :deep(.record-filter-date-dropdown .ant-picker-cell-in-view.ant-picker-cell-hover:not(.ant-picker-cell-selected):not(.ant-picker-cell-range-start):not(.ant-picker-cell-range-end) .ant-picker-cell-inner),
  :deep(.record-filter-date-dropdown .ant-picker-cell-in-view:hover .ant-picker-cell-inner) {
    background: #EEF5FF;
  }

  :deep(.record-filter-date-dropdown .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner),
  :deep(.record-filter-date-dropdown .ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner),
  :deep(.record-filter-date-dropdown .ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner) {
    background: @primary-color;
  }

  :deep(.record-filter-date-dropdown .ant-picker-cell-in-view.ant-picker-cell-in-range::before) {
    background: #EAF2FF;
  }

  :deep(.record-table .ant-table) {
    border-radius: 12px;
    background: transparent;
  }

  :deep(.record-table .ant-table-container) {
    border: 1px solid #E8EEF7;
    border-radius: 12px;
  }

  :deep(.record-table .ant-table-thead > tr > th) {
    color: #5F6A7A;
    font-weight: 500;
    background: #F9FBFD;
    border-bottom: 1px dashed #D8E4F4;
  }

  :deep(.record-table .ant-table-tbody > tr > td) {
    padding-top: 13px;
    padding-bottom: 13px;
    border-bottom: 1px solid #F0F3F8;
    transition: background-color 0.2s ease;
  }

  :deep(.record-table .ant-table-tbody > tr:hover > td) {
    background: #F7FAFF !important;
  }

  :deep(.record-table .ant-table-cell-fix-right) {
    background: #fff;
  }

  :deep(.record-table .ant-table-tbody > tr:hover .ant-table-cell-fix-right) {
    background: #F7FAFF !important;
  }

  :deep(.record-table .ant-pagination) {
    margin: 16px 0 2px;
  }
}

.record-patient-cell {
  display: flex;
  align-items: center;
  min-width: 0;
}

.record-patient-avatar {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(32, 48, 75, 0.08);
}

.record-patient-info {
  min-width: 0;
  margin-left: 10px;
}

.record-patient-main {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.record-patient-name {
  max-width: 126px;
  overflow: hidden;
  color: #1F2B3D;
  font-weight: 400;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-patient-age {
  margin-top: 2px;
  color: #858D98;
  font-size: 13px;
  line-height: 18px;
}

.record-order-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.record-order-code {
  display: inline-flex;
  align-items: center;
  max-width: 226px;
  height: 28px;
  padding: 0 10px;
  overflow: hidden;
  color: #313947;
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 28px;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px solid #E4EBF6;
  border-radius: 8px;
  background: #F9FBFD;
}

.record-collect-button {
  height: 28px;
  padding: 0 8px;
  border-radius: 8px;
  background: #EEF5FF;
}

.record-status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 76px;
  height: 28px;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 500;
  line-height: 28px;
  border-radius: 8px;
}

.record-status-tag.is-pending {
  color: #9A5B00;
  background: #FFF4D8;
}

.record-status-tag.is-paid {
  color: #12805C;
  background: #EAF8F0;
}

.record-status-tag.is-refunding {
  color: #946200;
  background: #FFF7E6;
}

.record-status-tag.is-refunded {
  color: #3C6F8F;
  background: #EAF5FB;
}

.record-status-tag.is-cancelled,
.record-status-tag.is-default {
  color: #6F7785;
  background: #F1F3F6;
}

.record-operation-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 104px;
}
</style>
