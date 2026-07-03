<template>
  <div class="p-4">
    <div class="page-height SmallCard">
      <a-flex justify="space-between" align="flex-start">
        <a-space :size="[24,0]" wrap>
          <a-form-item label="时间范围">
            <a-range-picker v-model:value="searchParams.Date" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" :get-popup-container="(trigger) => trigger.parentElement" />
          </a-form-item>
          <a-form-item label="医师" class="w240px">
            <a-select  v-model:value="searchParams.docId" placeholder="请选择" allowClear showSearch optionFilterProp="title">
              <a-select-option :value="item.id" v-for="(item,index) in physicianList" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
        </a-space>
        <a-space>
          <a-button @click="handleResetFilter">重置筛选</a-button>
          <a-button type="primary" @click="getPatientList(true)">筛选查询</a-button>
          <a-button type="primary" ghost @click="handleExport">导出</a-button>
        </a-space>
      </a-flex>
      <a-table :data-source="table.list"
                :columns="columns"
                row-key="Id"
                :loading="table.loading"
                bordered
                :pagination="pagination"
                :scroll="{x:1000,y:'calc(100vh - 285px)'}">
        <template #bodyCell="{column,record,index}">
          <template v-if="column.dataIndex == 'DoctorName'">
            <div class="flex align-center">
              <img class="w40px h40px border-rd-50%" :src="getImageUrl(`userAvatar${(index % 7) + 1}.png`)" alt="">
              <div class="ml8px">
                <div>{{record.DoctorName}}</div>
                <div class="mt2px color-[#858D98]">{{record.DoctorPhone}}</div>
              </div>
            </div>
          </template>
          <template v-if="column.dataIndex == 'OrderAmount'">
            <span class="text-bold text-red">￥{{record.OrderAmount}}</span>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref,reactive,onMounted} from 'vue';
  import { cloneDeep } from 'lodash-es';
  import {AccountApiCtrl} from '/@/api/myy/account';
  import {DashboardApiCtrl} from '/@/api/myy/dashboard';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { createMessage,createConfirm} = useMessage()
  const physicianList=ref([])
  const searchParams = ref({
    Date:[],
    docId:null,
  })
  const table =ref({
    list: [],
    loading:false,
  })
  const columns=ref([
    {title:'医师信息',dataIndex:'DoctorName',width:200},
    {title:'门诊挂号',children:
      [{title:'总号数',dataIndex:'RegistrationCount',width: 120},
      {title:'挂号金额',dataIndex:'',width: 140},
      {title:'签到数',dataIndex:'SignCount',width: 140},
      {title:'接诊数',dataIndex:'VisitCount',width: 140},
      {title:'退号数',dataIndex:'CancelCount',width: 140}]
    },{title:'门诊开单',children:
      [{title:'开单金额',dataIndex:'OrderAmount',width: 140},
      {title:'开单成本',dataIndex:'CostAmount',width: 140},
      {title:'处方数',dataIndex:'PrescriptionCount',width: 140},
      {title:'客量',dataIndex:'CustomerCount',width: 140},
      {title:'客单价',dataIndex:'AverageCustomerAmount',width: 140}]
    },
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
      getPatientList()
    },
    onChange: (page) => {
      pagination.current = page
      getPatientList()
    }
  })

  onMounted(() => {
    getStaffList()
    getPatientList()
  })

  const getStaffList=()=>{
    AccountApiCtrl.DoctorOptions({}).then(data=>{
      physicianList.value=data
    })
  }

  const handleResetFilter=()=>{
    searchParams.value={
      Date:[],
      docId:null,
    }
    getPatientList(true)
  }

  // 获取列表
  const getPatientList=(isSearch=false)=>{
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
    DashboardApiCtrl.DoctorBusinessReport({
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

  const handleExport=()=>{
    createConfirm({
      iconType: 'warning',
      title: '确定导出吗？',
      content:`当数据量大时,请耐心等候!`,
      onOk :() => {
        table.value.loading=true
        const query =cloneDeep(searchParams.value)
        if(searchParams.value.Date){
          query.startTime = searchParams.value.Date[0]||'',
          query.endTime = searchParams.value.Date[1]||'',
          delete query.Date
        }
        DashboardApiCtrl.ExportDoctorBusinessReport(query).then(data=>{
          const link = document.createElement('a');
          link.setAttribute('target', "_blank")
          link.style.display = 'none';
          link.href = `${location.origin}${data.File}`;
          link.download = '经营情况.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          createMessage.success('导出成功',1.5);
        }).catch(() => {}).finally(() => { table.value.loading=false })
      }
    })
  }
</script>
<style lang="less" scoped>
</style>