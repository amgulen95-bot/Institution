<template>
  <div class="income-logs-page p-4">
    <div class="income-logs-card page-height SmallCard">
      <div class="income-logs-header">
        <div>
          <div class="income-logs-title">收入明细</div>
          <div class="income-logs-subtitle">按订单、提现单号、流水类型和时间范围查看机构收入结算明细。</div>
        </div>
      </div>
      <a-flex class="income-logs-filter-panel" justify="space-between" align="center">
        <a-space :size="[20,0]" wrap>
          <a-form-item label="订单号">
            <a-input v-model:value="searchParams.orderCode" placeholder="订单号" allowClear />
          </a-form-item>
          <a-form-item label="提现单号">
            <a-input v-model:value="searchParams.withdrawCode" placeholder="提现单号" allowClear />
          </a-form-item>
          <a-form-item label="流水类型" class="income-logs-filter-select">
            <a-select
              v-model:value="searchParams.type"
              placeholder="请选择"
              allowClear
              showSearch
              optionFilterProp="title"
              dropdownClassName="income-logs-select-dropdown"
              :listHeight="220"
              :virtual="false"
              :get-popup-container="(trigger) => trigger.parentElement"
            >
              <a-select-option :value="item.id" v-for="(item,index) in ClinicIncomeLogType" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="时间范围">
            <a-range-picker v-model:value="searchParams.Date" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" :get-popup-container="(trigger) => trigger.parentElement" dropdownClassName="income-logs-date-dropdown" />
          </a-form-item>
        </a-space>
        <a-space class="income-logs-filter-actions">
          <a-button class="income-logs-action-btn" @click="handleResetFilter">重置筛选</a-button>
          <a-button class="income-logs-action-btn" type="primary" @click="getIncomeLogsList(true)">筛选查询</a-button>
        </a-space>
      </a-flex>
      <div class="income-logs-table-scroll-shell">
        <a-table :data-source="table.list"
                :columns="columns"
                row-key="Id"
                class="income-logs-table"
                :loading="table.loading"
                :pagination="pagination"
                :scroll="{x:1780}">
        <template #bodyCell="{column,record,index}">
          <template v-if="amountColumns.includes(column.dataIndex)">
            <span class="income-logs-amount">￥{{ formatAmount(record[column.dataIndex]) }}</span>
          </template>
          <template v-if="column.dataIndex == 'Status'">
            <a-tag class="income-logs-status-tag" :class="record.Status == 0 ? 'income-logs-status-settled' : 'income-logs-status-pending'" :bordered="false">{{record.Status?'预估':'已结算'}}</a-tag>
          </template>
        </template>
      </a-table>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref,reactive,onMounted} from 'vue';
  import { cloneDeep } from 'lodash-es';
  import {FinanceApiCtrl} from '/@/api/myy/finance';
  import {basicEnum} from '/@/api/platform/common';
  
  const ClinicIncomeLogType=ref([])
  const searchParams = ref({
    Date:[],
    type:null,
    orderCode:'',
    withdrawCode:'',
  })
  const table =ref({
    list: [],
    loading:false,
  })
  const amountColumns = ['TotalPay', 'OriginalAmount', 'RetailMarkupAmount', 'PremiumAmount', 'IncomeAmount', 'PlatformCost', 'PlatformProfit', 'Fee', 'PayFee']
  const numberColumns = [...amountColumns, 'Discount']
  const columns=ref([
    {title: '医生',dataIndex: 'DoctorName',width: 150},
    {title: '订单号',dataIndex: 'OrderCode',width: 250},
    {title: '实付金额',dataIndex: 'TotalPay',width: 130},
    {title: '平台基础药费',dataIndex: 'OriginalAmount',width: 140},
    {title: '机构加成',dataIndex: 'RetailMarkupAmount',width: 130},
    {title: '溢价',dataIndex: 'PremiumAmount',width: 120},
    {title: '折扣率',dataIndex: 'Discount',width: 110},
    {title: '医生收入',dataIndex: 'IncomeAmount',width: 130},
    {title: '平台成本',dataIndex: 'PlatformCost',width: 130},
    {title: '平台利润',dataIndex: 'PlatformProfit',width: 130},
    {title: '挂号费',dataIndex: 'Fee',width: 120},
    {title: '手续费',dataIndex: 'PayFee',width: 120},
    {title: '状态',dataIndex: 'Status',width: 120},
    {title: '支付方式',dataIndex: '1Name',width: 120},
    {title: '结算时间',dataIndex: 'SettleTime',width: 170},
    {title: '创建时间',dataIndex: 'CreateTime',width: 170}
  ].map((column) => {
    if (numberColumns.includes(column.dataIndex)) {
      return {
        ...column,
        align: 'right',
        className: 'income-logs-number-column',
        customHeaderCell: () => ({ class: 'income-logs-number-column' }),
      }
    }
    return column
  }))

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
      getIncomeLogsList()
    },
    onChange: (page) => {
      pagination.current = page
      getIncomeLogsList()
    }
  })

  onMounted(() => {
    getBasicEnum()
    getIncomeLogsList()
  })

  const formatAmount=(value)=>{
    const amount = Number(value)
    if (!Number.isFinite(amount)) {
      return '0.00'
    }
    return amount.toFixed(2)
  }

  const getBasicEnum=()=>{
    basicEnum({name:'ClinicIncomeLogType'}).then(data=>{
      ClinicIncomeLogType.value=data
    })
  }

  const handleResetFilter=()=>{
    searchParams.value={
      Date:[],
      type:null,
      orderCode:'',
      withdrawCode:'',
    }
    getIncomeLogsList(true)
  }

  // 获取列表
  const getIncomeLogsList=(isSearch=false)=>{
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
    FinanceApiCtrl.IncomeLogs({
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
  .income-logs-page {
    background: #f4f7f9;
  }

  .income-logs-card {
    padding: 18px 18px 14px;
    overflow: hidden;
    border: 1px solid #e8eef7;
    border-radius: 12px;
    background: #fff;
  }

  .income-logs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    padding: 0 2px 14px;
    border-bottom: 1px dashed #dce6f5;
  }

  .income-logs-title {
    color: #1d2533;
    font-size: 18px;
    font-weight: 500;
    line-height: 26px;
  }

  .income-logs-subtitle {
    margin-top: 4px;
    color: #5f6a7a;
    font-size: 13px;
    line-height: 20px;
  }

  .income-logs-filter-panel {
    align-items: center !important;
    margin-bottom: 14px;
    padding: 14px;
    border: 1px solid #e8eef7;
    border-radius: 12px;
    background: #f9fbfd;
  }

  .income-logs-filter-select {
    width: 240px;
  }

  .income-logs-filter-actions {
    align-self: center;
  }

  .income-logs-action-btn {
    min-width: 88px;
    border-radius: 8px;
  }

  .income-logs-table-scroll-shell {
    max-height: calc(100vh - 250px);
    padding-right: 8px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .income-logs-table-scroll-shell::-webkit-scrollbar {
    width: 8px;
  }

  .income-logs-table-scroll-shell::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: #cdd8ea;
  }

  .income-logs-table-scroll-shell::-webkit-scrollbar-track {
    border-radius: 999px;
    background: #f4f7fb;
  }

  .income-logs-amount {
    color: #1d2533;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .income-logs-status-tag {
    min-width: 58px;
    border-radius: 999px;
    text-align: center;
    font-weight: 400;
  }

  .income-logs-status-settled {
    color: #21865b;
    background: #e9f8f0;
  }

  .income-logs-status-pending {
    color: #2f6fd6;
    background: #eef5ff;
  }

  :deep(.ant-form-item-label > label) {
    color: #5f6a7a;
    font-weight: 400;
  }

  :deep(.income-logs-filter-panel .ant-form-item) {
    margin-bottom: 0;
  }

  :deep(.income-logs-filter-panel .ant-input-affix-wrapper),
  :deep(.income-logs-filter-panel .ant-select-selector),
  :deep(.income-logs-filter-panel .ant-picker) {
    border-color: #dce6f5 !important;
    border-radius: 8px !important;
    background: #fff;
    box-shadow: none !important;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
  }

  :deep(.income-logs-filter-panel .ant-input-affix-wrapper:hover),
  :deep(.income-logs-filter-panel .ant-select:hover .ant-select-selector),
  :deep(.income-logs-filter-panel .ant-picker:hover),
  :deep(.income-logs-filter-panel .ant-input-affix-wrapper-focused),
  :deep(.income-logs-filter-panel .ant-select-focused .ant-select-selector),
  :deep(.income-logs-filter-panel .ant-picker-focused) {
    border-color: #0a5aff !important;
    box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
  }

  :deep(.income-logs-filter-panel .ant-input-affix-wrapper .ant-input),
  :deep(.income-logs-filter-panel .ant-input-affix-wrapper .ant-input:hover),
  :deep(.income-logs-filter-panel .ant-input-affix-wrapper .ant-input:focus) {
    border-color: transparent !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  :deep(.income-logs-table .ant-table) {
    border-radius: 12px;
  }

  :deep(.income-logs-table .ant-table-thead > tr > th) {
    color: #5f6a7a;
    font-weight: 400;
    background: #f9fbfd;
    border-bottom: 1px solid #e8eef7;
  }

  :deep(.income-logs-table .ant-table-tbody > tr > td) {
    color: #1d2533;
    border-bottom: 1px dashed #dce6f5;
  }

  :deep(.income-logs-table .ant-table-tbody > tr:hover > td) {
    background: #eef5ff;
  }

  :deep(.income-logs-table .income-logs-number-column) {
    text-align: right;
  }

  :deep(th.income-logs-number-column .ant-table-column-title) {
    display: block;
    text-align: right;
  }

  :deep(.income-logs-table .ant-pagination) {
    margin-right: 2px;
  }

  :deep(.income-logs-select-dropdown) {
    padding: 6px;
    border-radius: 12px;
    box-shadow: 0 16px 40px rgba(29, 37, 51, 0.12);
  }

  :deep(.income-logs-select-dropdown .ant-select-item) {
    min-height: 34px;
    border-radius: 8px;
    transition: background-color 0.16s ease, color 0.16s ease;
  }

  :deep(.income-logs-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled)) {
    background: #eef5ff;
  }
</style>
