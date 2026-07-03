<template>
  <div class="p-4">
    <a-flex justify="space-between" align="flex-start">
      <a-space :size="[24,0]" wrap>
        <a-form-item label="时间范围">
          <a-range-picker  class="w200px" v-model:value="searchParams.Date" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" :get-popup-container="(trigger) => trigger.parentElement" />
        </a-form-item>
        <a-form-item label="关联单号">
          <a-input v-model:value="searchParams.orderCode" placeholder="关联单号" allowClear />
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
    <a-table :data-source="table.list"
              :columns="columns"
              row-key="Id"
              :loading="table.loading"
              :pagination="pagination"
              :scroll="{x:800,y:600}">
      <template #bodyCell="{column,record,index}">
        <template v-if="column.dataIndex == 'BankName'">
          <span>{{ record.BankName }}</span>
          <span v-if="record.BankCardNo">（{{ record.BankCardNo.slice(-4) }}）</span>
        </template>
        <template v-if="column.dataIndex == 'Type'">
          <span>{{ ClinicCreditLogType.find(p=>p.id==record.Type)?.name}}</span>
        </template>
      </template>
    </a-table>
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
    {title: '关联单号',dataIndex: 'OrderCode',width: 230},
    {title: '操作人',dataIndex: 'OperatorName',width: 140},
    {title: '变动金额',dataIndex: 'Amount',width: 100},
    {title: '变动后金额',dataIndex: 'BalanceAfter',width: 100},
    {title: '类型',dataIndex: 'Type',width: 120},
    {title: '创建时间',dataIndex: 'CreateTime',width: 160},
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
</style>