<template>
  <div class="p-4 medical-record-page">
    <div class="page-height SmallCard medical-record-card">
      <div class="medical-record-filter-panel">
        <div class="medical-record-filter-title">患者病历查询</div>
      <a-flex justify="space-between" align="flex-start" gap="16" wrap="wrap">
        <a-space class="medical-record-filter-fields" :size="[20,0]" wrap>
          <!-- <a-form-item label="就诊日期">
            <a-range-picker v-model:value="searchParams.Date" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" :get-popup-container="(trigger) => trigger.parentElement" />
          </a-form-item> -->
          <a-form-item label="首次就诊日期">
            <a-range-picker v-model:value="searchParams.FirstVisitDate" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" dropdownClassName="medical-record-date-dropdown" :get-popup-container="(trigger) => trigger.parentElement" />
          </a-form-item>
          <a-form-item label="上次就诊日期">
            <a-range-picker v-model:value="searchParams.LastVisitDate" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" dropdownClassName="medical-record-date-dropdown" :get-popup-container="(trigger) => trigger.parentElement" />
          </a-form-item>
          <a-form-item label="患者信息">
            <a-input class="medical-record-keyword-input" v-model:value="searchParams.keyword" placeholder="姓名/手机号/患者号" allowClear />
          </a-form-item>
          <a-form-item label="接诊医师" class="w240px">
            <a-select  v-model:value="searchParams.docId" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="medical-record-select-dropdown" :listHeight="220" :virtual="false" :get-popup-container="(trigger) => trigger.parentElement">
              <a-select-option :value="item.id" v-for="(item,index) in physicianList" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
        </a-space>
        <a-space class="medical-record-filter-actions">
          <a-button @click="handleResetFilter">重置筛选</a-button>
          <a-button type="primary" @click="getPatientList(true)">筛选查询</a-button>
        </a-space>
      </a-flex>
      </div>
      <a-table class="medical-record-table"
                :data-source="table.list"
                :columns="columns"
                row-key="Id"
                :loading="table.loading"
                :pagination="pagination"
                :scroll="{x:1040,y:'calc(100vh - 324px)'}">
        <template #bodyCell="{column,record,index}">
          <template v-if="column.dataIndex == 'PatientName'">
            <div class="medical-record-patient-cell">
              <img class="medical-record-patient-avatar" :src="getImageUrl(`userAvatar${(index % 7) + 1}.png`)" alt="">
              <div class="medical-record-patient-info">
                <div class="medical-record-patient-main">
                  <span class="medical-record-patient-name">{{record.Name}}</span>
                  <ManOutlined class="color-[#0A5AFF]" v-if="record.Gender==1" />
                  <WomanOutlined class="color-[#f52468]" v-else />
                </div>
                <div class="medical-record-patient-sub">{{record.Age}}岁</div>
              </div>
            </div>
          </template>
          <template v-if="column.dataIndex == 'FirstVisitTime'">
            <span class="medical-record-time">{{ record.FirstVisitTime }}</span>
          </template>
          <template v-if="column.dataIndex == 'LastVisitTime'">
            <span class="medical-record-time">{{ record.LastVisitTime }}</span>
          </template>
          <template v-if="column.dataIndex == 'operation'">
            <a-button class="medical-record-detail-button" type="link" size="small" @click="seeDetail(record)">详情</a-button>
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
    {title: '患者信息',dataIndex: 'PatientName',width: 260},
    {title: '手机号码',dataIndex: 'Phone',width: 140},
    {title: '接诊医师',dataIndex: 'DoctorName',width: 140},
    {title: '首次就诊时间',dataIndex: 'FirstVisitTime',width: 180},
    {title: '上次就诊时间',dataIndex: 'LastVisitTime',width: 180},
    {title: '操作',width: 120 ,dataIndex: 'operation',align:'center',fixed:'right'}
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
.medical-record-page {
  .medical-record-card {
    padding: 18px;
    overflow: hidden;
    border-radius: 12px;
    background: #fff;
  }

  .medical-record-filter-panel {
    padding: 16px 18px 4px;
    margin-bottom: 14px;
    border: 1px solid #E8EEF7;
    border-radius: 12px;
    background: #F9FBFD;
  }

  .medical-record-filter-title {
    margin-bottom: 14px;
    color: #1F2B3D;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }

  .medical-record-filter-fields {
    flex: 1 1 auto;
  }

  .medical-record-filter-actions {
    padding-top: 1px;
  }

  :deep(.medical-record-filter-panel .ant-form-item) {
    margin-bottom: 12px;
  }

  :deep(.medical-record-filter-panel .ant-picker),
  :deep(.medical-record-filter-panel .ant-input-affix-wrapper),
  :deep(.medical-record-filter-panel .ant-input),
  :deep(.medical-record-filter-panel .ant-select-selector) {
    border-radius: 8px !important;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  :deep(.medical-record-filter-panel .ant-picker:hover),
  :deep(.medical-record-filter-panel .ant-picker-focused),
  :deep(.medical-record-filter-panel .ant-input-affix-wrapper:hover),
  :deep(.medical-record-filter-panel .ant-input-affix-wrapper-focused),
  :deep(.medical-record-filter-panel .ant-input:hover),
  :deep(.medical-record-filter-panel .ant-input:focus),
  :deep(.medical-record-filter-panel .ant-select:not(.ant-select-disabled):hover .ant-select-selector),
  :deep(.medical-record-filter-panel .ant-select-focused .ant-select-selector) {
    border-color: @primary-color !important;
    box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
  }

  :deep(.medical-record-filter-panel .ant-input-affix-wrapper .ant-input),
  :deep(.medical-record-filter-panel .ant-input-affix-wrapper .ant-input:hover),
  :deep(.medical-record-filter-panel .ant-input-affix-wrapper .ant-input:focus) {
    border-color: transparent !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    outline: none !important;
  }

  :deep(.medical-record-select-dropdown),
  :deep(.medical-record-date-dropdown) {
    overflow: hidden;
    padding: 8px;
    border: 1px solid #E5EDF8;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 14px 32px rgba(31, 43, 61, 0.12);
  }

  :deep(.medical-record-select-dropdown .ant-select-item) {
    min-height: 34px;
    margin: 2px 0;
    padding: 6px 10px;
    color: #313947;
    border-radius: 8px;
    transition: background-color 0.16s ease, color 0.16s ease;
  }

  :deep(.medical-record-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled)) {
    background: #EEF5FF;
  }

  :deep(.medical-record-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled)) {
    color: @primary-color;
    font-weight: 500;
    background: #E8F1FF;
  }

  :deep(.medical-record-select-dropdown .rc-virtual-list-scrollbar-thumb) {
    background: #C7D7F0 !important;
    border-radius: 999px !important;
  }

  :deep(.medical-record-date-dropdown .ant-picker-panel-container) {
    overflow: hidden;
    border-radius: 12px;
    box-shadow: none;
  }

  :deep(.medical-record-date-dropdown .ant-picker-cell-in-view.ant-picker-cell-hover:not(.ant-picker-cell-selected):not(.ant-picker-cell-range-start):not(.ant-picker-cell-range-end) .ant-picker-cell-inner),
  :deep(.medical-record-date-dropdown .ant-picker-cell-in-view:hover .ant-picker-cell-inner) {
    background: #EEF5FF;
  }

  :deep(.medical-record-date-dropdown .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner),
  :deep(.medical-record-date-dropdown .ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner),
  :deep(.medical-record-date-dropdown .ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner) {
    background: @primary-color;
  }

  :deep(.medical-record-date-dropdown .ant-picker-cell-in-view.ant-picker-cell-in-range::before) {
    background: #EAF2FF;
  }

  :deep(.medical-record-table .ant-table) {
    border-radius: 12px;
    background: transparent;
  }

  :deep(.medical-record-table .ant-table-container) {
    border: 1px solid #E8EEF7;
    border-radius: 12px;
  }

  :deep(.medical-record-table .ant-table-thead > tr > th) {
    color: #5F6A7A;
    font-weight: 500;
    background: #F9FBFD;
    border-bottom: 1px dashed #D8E4F4;
  }

  :deep(.medical-record-table .ant-table-tbody > tr > td) {
    padding-top: 13px;
    padding-bottom: 13px;
    border-bottom: 1px solid #F0F3F8;
    transition: background-color 0.2s ease;
  }

  :deep(.medical-record-table .ant-table-tbody > tr:hover > td) {
    background: #F7FAFF !important;
  }

  :deep(.medical-record-table .ant-table-cell-fix-right) {
    background: #fff;
  }

  :deep(.medical-record-table .ant-table-tbody > tr:hover .ant-table-cell-fix-right) {
    background: #F7FAFF !important;
  }

  :deep(.medical-record-table .ant-pagination) {
    margin: 16px 0 2px;
  }
}

.medical-record-patient-cell {
  display: flex;
  align-items: center;
  min-width: 0;
}

.medical-record-patient-avatar {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(32, 48, 75, 0.08);
}

.medical-record-patient-info {
  min-width: 0;
  margin-left: 10px;
}

.medical-record-patient-main {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.medical-record-patient-name {
  max-width: 146px;
  overflow: hidden;
  color: #1F2B3D;
  font-weight: 400;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.medical-record-patient-sub {
  margin-top: 2px;
  color: #858D98;
  font-size: 13px;
  line-height: 18px;
}

.medical-record-time {
  display: inline-flex;
  align-items: center;
  max-width: 158px;
  height: 28px;
  padding: 0 10px;
  overflow: hidden;
  color: #313947;
  font-size: 13px;
  line-height: 28px;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px solid #E4EBF6;
  border-radius: 8px;
  background: #F9FBFD;
}

.medical-record-detail-button {
  min-width: 58px;
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  background: #EEF5FF;
}
</style>
