<template>
  <div class="p-4">
    <div class="page-height SmallCard">
      <a-flex justify="space-between" align="flex-start">
        <a-space :size="[24,0]" wrap>
          <a-form-item label="订单号">
            <a-input v-model:value="searchParams.orderCode" placeholder="订单号" allowClear />
          </a-form-item>
          <a-form-item label="提现单号">
            <a-input v-model:value="searchParams.withdrawCode" placeholder="订单号" allowClear />
          </a-form-item>
          <a-form-item label="流水类型" class="w240px">
            <a-select  v-model:value="searchParams.type" placeholder="请选择" allowClear showSearch optionFilterProp="title">
              <a-select-option :value="item.id" v-for="(item,index) in ClinicIncomeLogType" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="时间范围">
            <a-range-picker v-model:value="searchParams.Date" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" :get-popup-container="(trigger) => trigger.parentElement" />
          </a-form-item>
        </a-space>
        <a-space>
          <a-button @click="handleResetFilter">重置筛选</a-button>
          <a-button type="primary" @click="getIncomeLogsList(true)">筛选查询</a-button>
        </a-space>
      </a-flex>
      <a-table :data-source="table.list"
                :columns="columns"
                row-key="Id"
                :loading="table.loading"
                :pagination="pagination"
                :scroll="{x:1000,y:'calc(100vh - 300px)'}">
        <template #bodyCell="{column,record,index}">
          <template v-if="column.dataIndex == 'TotalPay'">
            <span>￥{{ record.TotalPay }}</span>
          </template>
          <template v-if="column.dataIndex == 'OriginalAmount'">
            <span>￥{{ record.OriginalAmount }}</span>
          </template>
          <template v-if="column.dataIndex == 'RetailMarkupAmount'">
            <span>￥{{ record.RetailMarkupAmount }}</span>
          </template>
          <template v-if="column.dataIndex == 'PremiumAmount'">
            <span>￥{{ record.PremiumAmount }}</span>
          </template>
          <template v-if="column.dataIndex == 'IncomeAmount'">
            <span>￥{{ record.IncomeAmount }}</span>
          </template>
          <template v-if="column.dataIndex == 'PlatformCost'">
            <span>￥{{ record.PlatformCost }}</span>
          </template>
          <template v-if="column.dataIndex == 'PlatformProfit'">
            <span>￥{{ record.PlatformProfit }}</span>
          </template>
          <template v-if="column.dataIndex == 'Fee'">
            <span>￥{{ record.Fee }}</span>
          </template>
          <template v-if="column.dataIndex == 'PayFee'">
            <span>￥{{ record.PayFee }}</span>
          </template>
          <template v-if="column.dataIndex == 'Status'">
            <a-tag :color="record.Status == 0 ? 'blue' : 'green'">{{record.Status?'预估':'已结算'}}</a-tag>
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
  const columns=ref([
    {title: '医生',dataIndex: 'DoctorName',width: 160},
    {title: '订单号',dataIndex: 'OrderCode',width: 240},
    {title: '实付金额',dataIndex: 'TotalPay',width: 120},
    {title: '平台基础药费',dataIndex: 'OriginalAmount',width: 120},
    {title: '机构加成',dataIndex: 'RetailMarkupAmount',width: 120},
    {title: '溢价',dataIndex: 'PremiumAmount',width: 120},
    {title: '折扣率',dataIndex: 'Discount',width: 120},
    {title: '医生收入',dataIndex: 'IncomeAmount',width: 120},
    {title: '平台成本',dataIndex: 'PlatformCost',width: 120},
    {title: '平台利润',dataIndex: 'PlatformProfit',width: 120},
    {title: '挂号费',dataIndex: 'Fee',width: 120},
    {title: '手续费',dataIndex: 'PayFee',width: 120},
    {title: '状态',dataIndex: 'Status',width: 120},
    {title: '支付方式',dataIndex: '1Name',width: 120},
    {title: '结算时间',dataIndex: 'SettleTime',width: 160},
    {title: '创建时间',dataIndex: 'CreateTime',width: 160}
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
</style>