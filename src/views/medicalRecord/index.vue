<template>
  <div class="p-4">
    <div class="page-height SmallCard">
      <a-flex justify="space-between" align="flex-start">
        <a-space :size="[24,0]" wrap>
          <!-- <a-form-item label="就诊日期">
            <a-range-picker v-model:value="searchParams.Date" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" :get-popup-container="(trigger) => trigger.parentElement" />
          </a-form-item> -->
          <a-form-item label="首次就诊日期">
            <a-range-picker v-model:value="searchParams.FirstVisitDate" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" :get-popup-container="(trigger) => trigger.parentElement" />
          </a-form-item>
          <a-form-item label="上次就诊日期">
            <a-range-picker v-model:value="searchParams.LastVisitDate" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" :get-popup-container="(trigger) => trigger.parentElement" />
          </a-form-item>
          <a-form-item label="患者信息">
            <a-input v-model:value="searchParams.keyword" placeholder="姓名/手机号/患者号" allowClear />
          </a-form-item>
          <a-form-item label="接诊医师" class="w240px">
            <a-select  v-model:value="searchParams.docId" placeholder="请选择" allowClear showSearch optionFilterProp="title">
              <a-select-option :value="item.id" v-for="(item,index) in physicianList" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
        </a-space>
        <a-space>
          <a-button @click="handleResetFilter">重置筛选</a-button>
          <a-button type="primary" @click="getPatientList(true)">筛选查询</a-button>
        </a-space>
      </a-flex>
      <a-table :data-source="table.list"
                :columns="columns"
                row-key="Id"
                :loading="table.loading"
                :pagination="pagination"
                :scroll="{x:1000,y:'calc(100vh - 300px)'}">
        <template #bodyCell="{column,record,index}">
          <template v-if="column.dataIndex == 'PatientName'">
            <div class="flex align-center">
              <img class="w40px h40px border-rd-50%" :src="getImageUrl(`userAvatar${(index % 7) + 1}.png`)" alt="">
              <div class="ml8px">
                <div class="ml8px">{{record.Name}}</div>
                <div class="flex align-center mt4px">
                  <ManOutlined class="color-[#0A5AFF]" v-if="record.Gender==1" />
                  <WomanOutlined class="color-[#f52468]" v-else />
                  <a-divider type="vertical" />
                  <div class="color-[#858D98]">{{record.Age}}岁</div>
                </div>
              </div>
            </div>
          </template>
          <template v-if="column.dataIndex == 'operation'">
            <a-button type="link" size="small" @click="seeDetail(record)">详情</a-button>
          </template>
        </template>
      </a-table>
    </div>

    <MedicalDetail v-model:visible="medicalModal.visible" :patientId="medicalModal.patientId"></MedicalDetail>
  </div>
</template>
<script lang="ts" setup>
  import { ref,reactive,onMounted} from 'vue';
  import {WomanOutlined,ManOutlined} from '@ant-design/icons-vue';
  import { cloneDeep } from 'lodash-es';
  import {PatientApiCtrl} from '/@/api/myy/patient';
  import {AccountApiCtrl} from '/@/api/myy/account';
  import MedicalDetail from '/@/components/MedicalDetail.vue';
  
  const physicianList=ref([])
  const medicalModal=ref({
    visible:false,
    patientId:'',
    type:1
  })
  const searchParams = ref({
    Date:[],
    FirstVisitDate:[],
    LastVisitDate:[],
    keyword:'',
    docId:null,
  })
  const table =ref({
    list: [],
    loading:false,
  })
  const columns=ref([
    {title: '患者信息',dataIndex: 'PatientName',width: 220},
    {title: '手机号码',dataIndex: 'Phone',width: 140},
    {title: '接诊医师',dataIndex: 'DoctorName',width: 140},
    {title: '首次就诊时间',dataIndex: 'FirstVisitTime',width: 160},
    {title: '上次就诊时间',dataIndex: 'LastVisitTime',width: 160},
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
      FirstVisitDate:[],
      LastVisitDate:[],
      keyword:'',
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
    if(searchParams.value.FirstVisitDate){
      query.firstVisitStartTime = searchParams.value.FirstVisitDate[0]||'',
      query.firstVisitEndTime  = searchParams.value.FirstVisitDate[1]||'',
      delete query.FirstVisitDate
    }
    if(searchParams.value.LastVisitDate){
      query.lastVisitStartTime = searchParams.value.LastVisitDate[0]||'',
      query.lastVisitEndTime = searchParams.value.LastVisitDate[1]||'',
      delete query.LastVisitDate
    }
    PatientApiCtrl.PatientList({
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

  const seeDetail=(record)=>{
    medicalModal.value.patientId=record.PatientId
    medicalModal.value.visible=true
  }
</script>
<style lang="less" scoped>
</style>