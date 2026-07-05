<template>
  <div class="institution-account-modal-panel">
    <a-flex class="institution-account-filter" justify="space-between" align="flex-start">
      <a-space :size="[24,0]" wrap>
        <a-form-item label="时间范围">
          <a-range-picker class="w240px" v-model:value="searchParams.Date" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" :get-popup-container="(trigger) => trigger.parentElement" />
        </a-form-item>
        <a-form-item label="关键字">
          <a-input class="w260px" v-model:value="searchParams.keyword" placeholder="提现单号/户名/银行卡/银行" allowClear />
        </a-form-item>
        <a-form-item label="提现状态" class="w240px">
          <a-select  v-model:value="searchParams.status" placeholder="请选择" allowClear showSearch optionFilterProp="title">
            <a-select-option :value="item.id" v-for="(item,index) in ClinicWithdrawStatus" :key="index" :title="item.name">{{item.name}}</a-select-option>
          </a-select>
        </a-form-item>
      </a-space>
      <a-space>
        <a-button @click="handleResetFilter">重置筛选</a-button>
        <a-button type="primary" @click="getWithdrawList(true)">筛选查询</a-button>
      </a-space>
    </a-flex>
    <div class="institution-account-table-scroll">
      <a-table class="institution-account-table"
              :data-source="table.list"
              :columns="columns"
              row-key="Id"
              :loading="table.loading"
              :pagination="pagination">
        <template #bodyCell="{column,record,index}">
          <template v-if="column.dataIndex == 'BankName'">
            <span>{{ record.BankName }}</span>
            <span v-if="record.BankCardNo">（{{ record.BankCardNo.slice(-4) }}）</span>
          </template>
          <template v-if="column.dataIndex == 'Status'">
            <span class="institution-account-status" :class="getStatusClass(record)">{{ getStatusName(record) }}</span>
          </template>
          <template v-if="column.dataIndex == 'Amount' || column.dataIndex == 'Fee'">
            <span class="institution-account-amount">{{ record[column.dataIndex] }}</span>
          </template>
          <template v-if="column.dataIndex == 'CreateTime'">
            <div class="institution-account-time">申请时间：{{ record.CreateTime }}</div>
            <div class="institution-account-time institution-account-time--muted">打款时间：{{ record.PayFinishTime||'--' }}</div>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref,reactive,onMounted} from 'vue';
  import { cloneDeep } from 'lodash-es';
  import {FinanceApiCtrl} from '/@/api/myy/finance';
  import {basicEnum} from '/@/api/platform/common';

  const ClinicWithdrawStatus=ref([])
  const searchParams = ref({
    Date:[],
    keyword:'',
    status:null,
  })
  const table =ref({
    list: [],
    loading:false,
  })
  const columns=ref([
    {title: '申请人',dataIndex: 'ApplyDoctorName',width: 140},
    {title: '到账账户',dataIndex: 'BankName',width: 180},
    {title: '提现金额',dataIndex: 'Amount',width: 120,align:'right'},
    {title: '手续费',dataIndex: 'Fee',width: 120,align:'right'},
    {title: '提现状态',dataIndex: 'Status',width: 120},
    {title: '操作时间',dataIndex: 'CreateTime',width: 320},
    {title: '关联单号',dataIndex: 'WithdrawCode',width: 250},
    {title: '备注',dataIndex: 'Remark',width: 140},
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
      getWithdrawList()
    },
    onChange: (page) => {
      pagination.current = page
      getWithdrawList()
    }
  })

  onMounted(() => {
    getBasicEnum()
    getWithdrawList()
  })

  const getBasicEnum=()=>{
    basicEnum({name:'ClinicWithdrawStatus'}).then(data=>{
      ClinicWithdrawStatus.value=data
    })
  }

  const handleResetFilter=()=>{
    searchParams.value={
      Date:[],
      keyword:'',
      status:null,
    }
    getWithdrawList(true)
  }

  const getStatusName=(record)=>{
    return ClinicWithdrawStatus.value.find(p=>p.id==record.Status)?.name || ''
  }

  const getStatusClass=(record)=>{
    const statusName = getStatusName(record)
    if(statusName === '待审核'){
      return 'institution-account-status--pending'
    }
    if(statusName === '已打款'){
      return 'institution-account-status--paid'
    }
    return ''
  }

  // 获取列表
  const getWithdrawList=(isSearch=false)=>{
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
    FinanceApiCtrl.WithdrawList({
      page:pagination.current,
      limit:pagination.pageSize,
      ...query
    }).then(data=>{
      table.value.loading=false
      table.value.list=data.Rows
      pagination.total=data.TotalItemCount
    }).catch(() => {}).finally(() => { table.value.loading=false })
  }
</script>
<style lang="less" scoped>
.institution-account-modal-panel {
  padding: 6px 4px 2px;
}

.institution-account-filter {
  margin-bottom: 14px;
  padding: 16px 18px 4px;
  border: 1px dashed #E8EEF7;
  border-radius: 12px;
  background: #F9FBFD;

  :deep(.ant-form-item) {
    margin-bottom: 12px;
  }

  :deep(.ant-input),
  :deep(.ant-picker),
  :deep(.ant-select-selector) {
    border-radius: 8px !important;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  :deep(.ant-input:hover),
  :deep(.ant-input:focus),
  :deep(.ant-picker:hover),
  :deep(.ant-picker-focused),
  :deep(.ant-select:hover .ant-select-selector),
  :deep(.ant-select-focused .ant-select-selector) {
    border-color: @primary-color !important;
    box-shadow: 0 0 0 2px fade(@primary-color, 16%) !important;
  }
}

.institution-account-table-scroll {
  max-height: 680px;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: #D8E3F2;
  }
}

.institution-account-table {
  overflow: hidden;
  border: 1px dashed #E8EEF7;
  border-radius: 12px;

  :deep(.ant-table) {
    border-radius: 12px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #FFFDEC !important;
    border-right: 1px dashed #E8EEF7 !important;
    border-bottom: 1px dashed #E8EEF7 !important;
    color: #5F6A7A;
    font-weight: 400;
  }

  :deep(.ant-table-tbody > tr > td) {
    border-right: 1px dashed #E8EEF7 !important;
    border-bottom: 1px dashed #E8EEF7 !important;
    color: #1F2B3D;
  }

  :deep(.ant-table-thead > tr > th:last-child),
  :deep(.ant-table-tbody > tr > td:last-child) {
    border-right: none !important;
  }

  :deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
    background: #EEF5FF !important;
  }

  :deep(.ant-table-body) {
    scrollbar-width: thin;
    scrollbar-color: #D8E3F2 transparent;
  }

  :deep(.ant-table-body::-webkit-scrollbar) {
    width: 6px;
    height: 6px;
  }

  :deep(.ant-table-body::-webkit-scrollbar-thumb) {
    border-radius: 999px;
    background: #D8E3F2;
  }

  :deep(.ant-pagination) {
    margin: 14px 4px 2px;
  }
}

.institution-account-amount {
  display: block;
  text-align: right;
  color: #1F2B3D;
  font-weight: 600;
}

.institution-account-status {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 8px;
  background: #F9FBFD;
  color: #5F6A7A;
}

.institution-account-status--pending {
  background: #FFF7E6;
  color: #D48806;
}

.institution-account-status--paid {
  background: #EAF8F0;
  color: #1F9D55;
}

.institution-account-time {
  color: #1F2B3D;
  line-height: 22px;
  white-space: nowrap;
}

.institution-account-time--muted {
  color: #858D98;
}

:global(.institution-account-list-modal .ant-modal-content) {
  overflow: hidden;
  border-radius: 28px;
  box-shadow: 0 16px 40px rgba(32, 48, 75, 0.14);
}

:global(.institution-account-list-modal .ant-modal-header) {
  padding: 22px 32px 16px;
  border-bottom: none;
}

:global(.institution-account-list-modal .ant-modal-body) {
  padding: 8px 28px 24px;
}
</style>
