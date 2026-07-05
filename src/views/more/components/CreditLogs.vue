<template>
  <div class="institution-account-modal-panel">
    <a-flex class="institution-account-filter" justify="space-between" align="flex-start">
      <a-space :size="[24,0]" wrap>
        <a-form-item label="时间范围">
          <a-range-picker class="w240px" v-model:value="searchParams.Date" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" :get-popup-container="(trigger) => trigger.parentElement" />
        </a-form-item>
        <a-form-item label="关联单号">
          <a-input class="w220px" v-model:value="searchParams.orderCode" placeholder="关联单号" allowClear />
        </a-form-item>
        <a-form-item label="筛选类型" class="w240px">
          <a-select  v-model:value="searchParams.type" placeholder="请选择" allowClear showSearch optionFilterProp="title">
            <a-select-option :value="item.id" v-for="(item,index) in ClinicCreditLogType" :key="index" :title="item.name">{{item.name}}</a-select-option>
          </a-select>
        </a-form-item>
      </a-space>
      <a-space>
        <a-button @click="handleResetFilter">重置筛选</a-button>
        <a-button type="primary" @click="getCreditLogList(true)">筛选查询</a-button>
      </a-space>
    </a-flex>
    <div class="institution-account-table-scroll">
      <a-table class="institution-account-table"
                :data-source="table.list"
              :columns="columns"
              row-key="Id"
              :loading="table.loading"
              :pagination="pagination"
              :scroll="{x:1040}">
        <template #bodyCell="{column,record,index}">
          <template v-if="column.dataIndex == 'OrderCode'">
            <span class="institution-account-order-code">{{ record.OrderCode }}</span>
          </template>
          <template v-if="column.dataIndex == 'BankName'">
            <span>{{ record.BankName }}</span>
            <span v-if="record.BankCardNo">（{{ record.BankCardNo.slice(-4) }}）</span>
          </template>
          <template v-if="column.dataIndex == 'Type'">
            <span class="institution-account-type">{{ ClinicCreditLogType.find(p=>p.id==record.Type)?.name}}</span>
          </template>
          <template v-if="column.dataIndex == 'CreateTime'">
            <span class="institution-account-time">
              <span class="institution-account-time__date">{{ formatCreateDate(record.CreateTime) }}</span>
              <span class="institution-account-time__clock">{{ formatCreateClock(record.CreateTime) }}</span>
            </span>
          </template>
          <template v-if="column.dataIndex == 'Amount' || column.dataIndex == 'BalanceAfter'">
            <span class="institution-account-amount">{{ record[column.dataIndex] }}</span>
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

  const ClinicCreditLogType=ref([])
  const searchParams = ref({
    Date:[],
    type:null,
    orderCode:'',
  })
  const table =ref({
    list: [],
    loading:false,
  })
  const columns=ref([
    {title: '关联单号',dataIndex: 'OrderCode',width: 260},
    {title: '操作人',dataIndex: 'OperatorName',width: 96},
    {title: '变动金额',dataIndex: 'Amount',width: 112,align:'right'},
    {title: '变动后金额',dataIndex: 'BalanceAfter',width: 126,align:'right'},
    {title: '类型',dataIndex: 'Type',width: 108},
    {title: '创建时间',dataIndex: 'CreateTime',width: 200},
    {title: '备注',dataIndex: 'Remark',width: 138},
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
      getCreditLogList()
    },
    onChange: (page) => {
      pagination.current = page
      getCreditLogList()
    }
  })

  onMounted(() => {
    getBasicEnum()
    getCreditLogList()
  })

  const getBasicEnum=()=>{
    basicEnum({name:'ClinicCreditLogType'}).then(data=>{
      ClinicCreditLogType.value=data
    })
  }

  const handleResetFilter=()=>{
    searchParams.value={
      Date:[],
      type:null,
      orderCode:'',
    }
    getCreditLogList(true)
  }

  const formatCreateDate=(value = '')=>{
    return String(value).split(' ')[0] || '--'
  }

  const formatCreateClock=(value = '')=>{
    return String(value).split(' ')[1] || ''
  }

  // 获取列表
  const getCreditLogList=(isSearch=false)=>{
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
    FinanceApiCtrl.CreditLogs({
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
    white-space: nowrap;
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

.institution-account-order-code {
  display: block;
  white-space: nowrap;
}

.institution-account-time {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
}

.institution-account-time__date {
  color: #1F2B3D;
  font-weight: 500;
}

.institution-account-time__clock {
  color: #858D98;
  font-size: 12px;
}

.institution-account-type {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 8px;
  background: #F9FBFD;
  color: #5F6A7A;
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
