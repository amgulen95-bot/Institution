<template>
  <div class="p-4 operate-report-page">
    <div class="page-height SmallCard operate-report-card">
      <div class="operate-filter-panel">
        <div class="operate-filter-title">经营情况查询</div>
      <a-flex justify="space-between" align="flex-start" gap="16" wrap="wrap">
        <a-space class="operate-filter-fields" :size="[20,0]" wrap>
          <a-form-item label="时间范围">
            <a-range-picker v-model:value="searchParams.Date" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" dropdownClassName="operate-date-dropdown" :get-popup-container="(trigger) => trigger.parentElement" />
          </a-form-item>
          <a-form-item label="医师" class="w240px">
            <a-select  v-model:value="searchParams.docId" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="operate-select-dropdown" :listHeight="220" :virtual="false" :get-popup-container="(trigger) => trigger.parentElement">
              <a-select-option :value="item.id" v-for="(item,index) in physicianList" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
        </a-space>
        <a-space class="operate-filter-actions">
          <a-button @click="handleResetFilter">重置筛选</a-button>
          <a-button type="primary" @click="getPatientList(true)">筛选查询</a-button>
          <a-button class="operate-export-button" type="primary" ghost @click="handleExport">导出</a-button>
        </a-space>
      </a-flex>
      </div>
      <div class="operate-table-scroll-shell">
      <a-table class="operate-report-table"
                :data-source="table.list"
                :columns="columns"
                row-key="Id"
                :loading="table.loading"
                bordered
                :pagination="pagination"
                :scroll="{x:1420}">
        <template #bodyCell="{column,record,index}">
          <template v-if="column.dataIndex == 'DoctorName'">
            <div class="operate-doctor-cell">
              <img class="operate-doctor-avatar" :src="getImageUrl(`userAvatar${(index % 7) + 1}.png`)" alt="">
              <div class="operate-doctor-info">
                <div class="operate-doctor-name">{{record.DoctorName}}</div>
                <div class="operate-doctor-phone">{{record.DoctorPhone}}</div>
              </div>
            </div>
          </template>
          <template v-if="false && column.dataIndex == 'OrderAmount'">
            <span class="text-bold text-red">￥{{record.OrderAmount}}</span>
          </template>
          <template v-if="false && column.dataIndex == 'OrderAmount'">
            <span class="operate-money operate-money-primary">¥{{record.OrderAmount}}</span>
          </template>
          <template v-if="false && (column.dataIndex == 'RegistrationAmount' || column.dataIndex == 'CostAmount' || column.dataIndex == 'AverageCustomerAmount')">
            <span class="operate-money">¥{{record[column.dataIndex]}}</span>
          </template>
          <template v-if="isMetricColumn(column.dataIndex)">
            <span class="operate-metric-number">{{record[column.dataIndex]}}</span>
          </template>
          <template v-if="column.dataIndex == 'OrderAmount'">
            <span class="operate-money operate-money-primary">{{formatAmount(record.OrderAmount)}}</span>
          </template>
          <template v-if="column.dataIndex == 'RegistrationAmount' || column.dataIndex == 'CostAmount' || column.dataIndex == 'AverageCustomerAmount'">
            <span class="operate-money">{{formatAmount(record[column.dataIndex])}}</span>
          </template>
        </template>
      </a-table>
      </div>
    </div>
    <a-modal
      v-model:open="exportModal.visible"
      centered
      width="560px"
      :footer="null"
      :maskClosable="false"
      destroyOnClose
      wrapClassName="operate-export-modal"
    >
      <section class="operate-export-dialog">
        <div class="operate-export-dialog-header">
          <div>
            <div class="operate-export-dialog-title">导出经营情况报表</div>
            <div class="operate-export-dialog-subtitle">系统将按照当前筛选条件生成 Excel 文件</div>
          </div>
        </div>
        <div class="operate-export-dialog-summary">
          <div class="operate-export-summary-item">
            <span>时间范围</span>
            <strong>{{ exportDateText }}</strong>
          </div>
          <div class="operate-export-summary-item">
            <span>接诊医师</span>
            <strong>{{ exportDoctorText }}</strong>
          </div>
          <div class="operate-export-summary-item">
            <span>当前数据</span>
            <strong>{{ pagination.total }} 条</strong>
          </div>
        </div>
        <div class="operate-export-dialog-note">
          <span></span>
          <p>数据量较大时导出可能需要等待，请不要重复点击确认导出。</p>
        </div>
        <div class="operate-export-dialog-actions">
          <a-button class="operate-export-dialog-button" @click="exportModal.visible=false">取消</a-button>
          <a-button class="operate-export-dialog-button operate-export-dialog-primary" type="primary" :loading="exportModal.loading" @click="confirmExport">确认导出</a-button>
        </div>
      </section>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { ref,reactive,onMounted,computed} from 'vue';
  import { cloneDeep } from 'lodash-es';
  import {AccountApiCtrl} from '/@/api/myy/account';
  import {DashboardApiCtrl} from '/@/api/myy/dashboard';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { createMessage} = useMessage()
  const physicianList=ref([])
  const searchParams = ref({
    Date:[],
    docId:null,
  })
  const table =ref({
    list: [],
    loading:false,
  })
  const exportModal = ref({
    visible: false,
    loading: false,
  })
  const columns=ref([
    {title:'医师信息',dataIndex:'DoctorName',width:200},
    {title:'门诊挂号',children:
      [{title:'总号数',dataIndex:'RegistrationCount',width: 120},
      {title:'挂号金额',dataIndex:'RegistrationAmount',width: 140},
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

  const metricColumns = ['RegistrationCount', 'SignCount', 'VisitCount', 'CancelCount', 'PrescriptionCount', 'CustomerCount']
  const amountColumns = ['RegistrationAmount', 'OrderAmount', 'CostAmount', 'AverageCustomerAmount']
  const amountTitleKeywords = ['金额', '成本', '客单价']
  const isAmountColumn = (item) => {
    return amountColumns.includes(item.dataIndex) || amountTitleKeywords.some((keyword) => String(item.title || '').includes(keyword))
  }
  const isNumericColumn = (item) => isAmountColumn(item) || metricColumns.includes(item.dataIndex)
  const applyNumericColumnAlign = (items) => {
    items.forEach((item) => {
      if (isNumericColumn(item)) {
        item.align = 'right'
        item.className = [item.className, 'operate-number-column'].filter(Boolean).join(' ')
        item.customHeaderCell = () => ({ class: 'operate-number-column' })
      }
      if (item.children) {
        applyNumericColumnAlign(item.children)
      }
    })
  }
  applyNumericColumnAlign(columns.value)

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

  const isMetricColumn = (dataIndex) => metricColumns.includes(dataIndex)
  const formatAmount = (value) => {
    const amount = Number(value)
    return Number.isFinite(amount) ? amount.toFixed(2) : '0.00'
  }

  const exportDateText = computed(() => {
    const date = searchParams.value.Date || []
    if (date[0] && date[1]) {
      return `${date[0]} 至 ${date[1]}`
    }
    return '全部时间'
  })

  const exportDoctorText = computed(() => {
    const doctor = physicianList.value.find((item) => item.id === searchParams.value.docId)
    return doctor?.name || '全部医师'
  })

  const handleExport=()=>{
    exportModal.value.visible = true
  }

  const confirmExport=()=>{
    exportModal.value.loading=true
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
      exportModal.value.visible=false
      createMessage.success('导出成功',1.5);
    }).catch(() => {}).finally(() => {
      table.value.loading=false
      exportModal.value.loading=false
    })
  }
</script>
<style lang="less" scoped>
.operate-report-page {
  .operate-report-card {
    padding: 18px;
    overflow: hidden;
    border-radius: 12px;
    background: #fff;
  }

  .operate-filter-panel {
    padding: 16px 18px 4px;
    margin-bottom: 14px;
    border: 1px solid #E8EEF7;
    border-radius: 12px;
    background: #F9FBFD;
  }

  .operate-filter-title {
    margin-bottom: 14px;
    color: #1F2B3D;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }

  .operate-filter-fields {
    flex: 1 1 auto;
  }

  .operate-filter-actions {
    padding-top: 1px;
  }

  .operate-export-button {
    border-radius: 8px;
  }

  :deep(.operate-filter-panel .ant-form-item) {
    margin-bottom: 12px;
  }

  :deep(.operate-filter-panel .ant-picker),
  :deep(.operate-filter-panel .ant-select-selector) {
    border-radius: 8px !important;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  :deep(.operate-filter-panel .ant-picker:hover),
  :deep(.operate-filter-panel .ant-picker-focused),
  :deep(.operate-filter-panel .ant-select:not(.ant-select-disabled):hover .ant-select-selector),
  :deep(.operate-filter-panel .ant-select-focused .ant-select-selector) {
    border-color: @primary-color !important;
    box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
  }

  :deep(.operate-select-dropdown),
  :deep(.operate-date-dropdown) {
    overflow: hidden;
    padding: 8px;
    border: 1px solid #E5EDF8;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 14px 32px rgba(31, 43, 61, 0.12);
  }

  :deep(.operate-select-dropdown .ant-select-item) {
    min-height: 34px;
    margin: 2px 0;
    padding: 6px 10px;
    color: #313947;
    border-radius: 8px;
    transition: background-color 0.16s ease, color 0.16s ease;
  }

  :deep(.operate-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled)) {
    background: #EEF5FF;
  }

  :deep(.operate-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled)) {
    color: @primary-color;
    font-weight: 500;
    background: #E8F1FF;
  }

  :deep(.operate-select-dropdown .rc-virtual-list-scrollbar-thumb) {
    background: #C7D7F0 !important;
    border-radius: 999px !important;
  }

  :deep(.operate-date-dropdown .ant-picker-panel-container) {
    overflow: hidden;
    border-radius: 12px;
    box-shadow: none;
  }

  :deep(.operate-date-dropdown .ant-picker-cell-in-view.ant-picker-cell-hover:not(.ant-picker-cell-selected):not(.ant-picker-cell-range-start):not(.ant-picker-cell-range-end) .ant-picker-cell-inner),
  :deep(.operate-date-dropdown .ant-picker-cell-in-view:hover .ant-picker-cell-inner) {
    background: #EEF5FF;
  }

  :deep(.operate-date-dropdown .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner),
  :deep(.operate-date-dropdown .ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner),
  :deep(.operate-date-dropdown .ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner) {
    background: @primary-color;
  }

  :deep(.operate-date-dropdown .ant-picker-cell-in-view.ant-picker-cell-in-range::before) {
    background: #EAF2FF;
  }

  .operate-table-scroll-shell {
    max-height: calc(100vh - 254px);
    overflow-y: auto;
    padding-right: 10px;
    scrollbar-gutter: stable;
  }

  .operate-table-scroll-shell::-webkit-scrollbar {
    width: 8px;
  }

  .operate-table-scroll-shell::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: #C7D7F0;
  }

  .operate-table-scroll-shell::-webkit-scrollbar-track {
    background: transparent;
  }

  :deep(.operate-report-table .ant-table) {
    border-radius: 12px;
    background: transparent;
  }

  :deep(.operate-report-table .ant-table-container) {
    border: 1px solid #E8EEF7 !important;
    border-radius: 12px;
  }

  :deep(.operate-report-table .ant-table-thead > tr > th) {
    color: #5F6A7A;
    font-weight: 500;
    background: #F9FBFD;
    border-color: #E8EEF7 !important;
  }

  :deep(.operate-report-table .ant-table-thead > tr:first-child > th) {
    color: #1F2B3D;
    background: #EEF5FF;
  }

  :deep(.operate-report-table .operate-number-column) {
    text-align: right !important;
  }

  :deep(.operate-report-table th.operate-number-column .ant-table-column-title) {
    display: block;
    width: 100%;
    text-align: right;
  }

  :deep(.operate-report-table .ant-table-tbody > tr > td) {
    padding-top: 13px;
    padding-bottom: 13px;
    border-color: #F0F3F8 !important;
    transition: background-color 0.2s ease;
  }

  :deep(.operate-report-table .ant-table-tbody > tr:hover > td) {
    background: #F7FAFF !important;
  }

  :deep(.operate-report-table .ant-pagination) {
    margin: 16px 0 2px;
  }
}

.operate-doctor-cell {
  display: flex;
  align-items: center;
  min-width: 0;
}

.operate-doctor-avatar {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(32, 48, 75, 0.08);
}

.operate-doctor-info {
  min-width: 0;
  margin-left: 10px;
}

.operate-doctor-name {
  max-width: 132px;
  overflow: hidden;
  color: #1F2B3D;
  font-weight: 400;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operate-doctor-phone {
  margin-top: 2px;
  overflow: hidden;
  color: #858D98;
  font-size: 13px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operate-money,
.operate-metric-number {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  min-width: 82px;
  height: 28px;
  padding: 0 10px;
  color: #313947;
  font-size: 13px;
  font-weight: 500;
  line-height: 28px;
  border: 1px solid #E4EBF6;
  border-radius: 8px;
  background: #F9FBFD;
}

.operate-money::before {
  margin-right: 2px;
  content: '\00A5';
}

.operate-money-primary {
  color: #0A5AFF;
  border-color: #D8E6FF;
  background: #EEF5FF;
}

.operate-metric-number {
  min-width: 64px;
  color: #1F2B3D;
}

:deep(.operate-export-modal .ant-modal-content) {
  overflow: hidden;
  padding: 0;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 24px 56px rgba(31, 43, 61, 0.16);
}

:deep(.operate-export-modal .ant-modal-close) {
  top: 18px;
  right: 18px;
  border-radius: 8px;
}

:deep(.operate-export-modal .ant-modal-close:hover) {
  background: #EEF5FF;
}

:deep(.operate-export-modal .ant-modal-body) {
  padding: 0;
}

.operate-export-dialog {
  padding: 32px 34px 28px;
  background:
    linear-gradient(180deg, #F9FBFD 0%, #fff 42%),
    #fff;
}

.operate-export-dialog-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 22px;
  border-bottom: 1px dashed #DCE6F5;
}

.operate-export-dialog-title {
  color: #1D2533;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}

.operate-export-dialog-subtitle {
  margin-top: 5px;
  color: #5F6A7A;
  font-size: 13px;
  line-height: 20px;
}

.operate-export-dialog-summary {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 20px 0 18px;
  border-bottom: 1px dashed #DCE6F5;
}

.operate-export-summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid #E8EEF7;
  border-radius: 10px;
  background: #F9FBFD;
}

.operate-export-summary-item span {
  color: #5F6A7A;
  font-size: 13px;
  font-weight: 400;
}

.operate-export-summary-item strong {
  max-width: 330px;
  overflow: hidden;
  color: #1D2533;
  font-size: 14px;
  font-weight: 500;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operate-export-dialog-note {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding: 12px 14px;
  border: 1px solid #E8EEF7;
  border-radius: 10px;
  background: #FFFDEC;
}

.operate-export-dialog-note span {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  margin-top: 7px;
  border-radius: 50%;
  background: #F5B849;
}

.operate-export-dialog-note p {
  margin: 0;
  color: #5F6A7A;
  font-size: 13px;
  line-height: 20px;
}

.operate-export-dialog-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
}

.operate-export-dialog-button {
  height: 40px;
  border-radius: 8px;
  font-weight: 400;
}

.operate-export-dialog-primary {
  background: #0A5AFF;
}
</style>
