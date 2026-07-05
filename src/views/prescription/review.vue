<template>
  <div class="p-4 prescription-review-page">
    <div class="page-height SmallCard prescription-review-card">
      <div class="prescription-review-filter-panel">
        <div class="prescription-review-filter-title">常用方审核查询</div>
      <a-flex justify="space-between" align="flex-start" gap="16" wrap="wrap">
        <a-space class="prescription-review-filter-fields" :size="[20,0]" wrap>
          <a-form-item label="关键字">
            <a-input v-model:value="searchParams.keyword" placeholder="模板名称/审核备注" allowClear />
          </a-form-item>
          <a-form-item label="模板分类" class="prescription-review-filter-select">
            <a-select v-model:value="searchParams.categoryId" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="prescription-review-select-dropdown" :listHeight="220" :virtual="false" :get-popup-container="(trigger) => trigger.parentElement">
              <a-select-option :value="item.Id" v-for="(item,index) in categoryList" :key="index" :title="item.Name">{{item.Name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="所属医生" class="prescription-review-filter-select">
            <a-select v-model:value="searchParams.doctorId" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="prescription-review-select-dropdown" :listHeight="220" :virtual="false" :get-popup-container="(trigger) => trigger.parentElement">
              <a-select-option :value="item.id" v-for="(item,index) in physicianList" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="审核状态" class="prescription-review-filter-select">
            <a-select v-model:value="searchParams.auditStatus" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="prescription-review-select-dropdown" :listHeight="220" :virtual="false" :get-popup-container="(trigger) => trigger.parentElement">
              <a-select-option :value="item.id" v-for="(item,index) in ClinicPrescriptAuditStatus" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
        </a-space>
        <a-space class="prescription-review-filter-actions">
          <a-button class="prescription-review-button" @click="handleResetFilter">重置筛选</a-button>
          <a-button class="prescription-review-button" type="primary" @click="getPrescriptList(true)">筛选查询</a-button>
        </a-space>
      </a-flex>
      </div>
      <div class="prescription-review-table-scroll">
      <a-table class="prescription-review-table"
                :data-source="table.list"
                :columns="columns"
                row-key="Id"
                :loading="table.loading"
                :pagination="pagination"
                :scroll="{x:1120}">
        <template #bodyCell="{column,record,index}">
          <!-- <template v-if="column.dataIndex == 'PatientName'">
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
          </template> -->
          <template v-if="column.dataIndex == 'Name'">
            <div class="prescription-review-name-cell">
              <div class="prescription-review-name">{{ record.Name || '--' }}</div>
              <div class="prescription-review-owner">{{ record.DoctorName || record.CreateDoctorName || '常用方模板' }}</div>
            </div>
          </template>
          <template v-if="column.dataIndex == 'CategoryName'">
            <span class="prescription-review-category">{{ record.CategoryName || '--' }}</span>
          </template>
          <template v-if="column.dataIndex == 'AuditStatusName'">
            <span class="prescription-review-status" :class="getAuditStatusClass(record.AuditStatusName)">{{ record.AuditStatusName || '--' }}</span>
          </template>
          <template v-if="column.dataIndex == 'AuditorName'">
            <span class="prescription-review-text">{{ record.AuditorName || '--' }}</span>
          </template>
          <template v-if="column.dataIndex == 'AuditRemark'">
            <span class="prescription-review-remark">{{ record.AuditRemark || '--' }}</span>
          </template>
          <template v-if="column.dataIndex == 'CreateTime'">
            <div class="prescription-review-time-cell">
              <div><span>创建</span>{{ record.CreateTime || '--' }}</div>
              <div><span>审核</span>{{ record.AuditTime||'--' }}</div>
            </div>
          </template>
          <template v-if="column.dataIndex == 'operation'">
            <a-button class="prescription-review-action-button" type="link" size="small" :disabled="record.AuditStatusName!='待审核'" @click="openAudit(record)">审核</a-button>
          </template>
        </template>
      </a-table>
      </div>
    </div>

    <a-modal v-model:open="auditModal.visible" centered width="640px" :footer="null" :maskClosable="false" destroyOnClose wrapClassName="prescription-review-audit-modal">
      <section class="prescription-review-audit-dialog">
        <div class="prescription-review-audit-header">
          <div>
            <div class="prescription-review-audit-title">审核常用方</div>
            <div class="prescription-review-audit-subtitle">确认模板内容是否符合机构常用方管理要求</div>
          </div>
          <span class="prescription-review-audit-badge">待确认</span>
        </div>
        <a-form class="prescription-review-audit-form" :model="auditModal.form">
          <div class="prescription-review-audit-section">
          <a-form-item label="审核结果" class="prescription-review-audit-result">
            <a-radio-group v-model:value="auditModal.form.AuditStatus" class="prescription-review-radio-group">
              <a-radio-button :value="1">通过</a-radio-button>
              <a-radio-button :value="2">拒绝</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="拒绝原因" v-if="auditModal.form.AuditStatus == 2" :rules="[{ required: true, message: '请填写拒绝原因' }]">
            <a-textarea class="prescription-review-audit-textarea" v-model:value="auditModal.form.Remark" placeholder="请填写拒绝原因" :rows="3" />
          </a-form-item>
          <div class="prescription-review-audit-note">
            <span></span>
            <p>{{ auditModal.form.AuditStatus == 1 ? '通过后，该常用方模板可继续用于在线开方调取。' : '拒绝时请填写清晰原因，方便医生后续调整模板内容。' }}</p>
          </div>
          </div>
        </a-form>
        <div class="prescription-review-audit-actions">
          <a-button class="prescription-review-audit-button" @click="auditModal.visible=false">取消</a-button>
          <a-button class="prescription-review-audit-button prescription-review-audit-primary" type="primary" :loading="auditModal.loading" @click="handleAudit">确认审核</a-button>
        </div>
      </section>
    </a-modal>

  </div>
</template>
<script lang="ts" setup>
  import { ref,reactive,onMounted} from 'vue';
  import { cloneDeep } from 'lodash-es';
  import {basicEnum} from '/@/api/platform/common';
  import {AccountApiCtrl} from '/@/api/myy/account';
  import {TemplateApiCtrl} from '/@/api/myy/template';
  import { useMessage } from '/@/hooks/web/useMessage';
  
  const { createMessage} = useMessage()
  
  const physicianList=ref([])
  const categoryList=ref([])
  const ClinicPrescriptAuditStatus=ref([])
  const searchParams = ref({
    keyword:'',
    categoryId:null,
    doctorId:null,
    auditStatus:null,
  })
  const table =ref({
    list: [],
    loading:false,
  })
  const columns=ref([
    {title: '模板名称',dataIndex: 'Name',width: 160},
    {title: '模板分类',dataIndex: 'CategoryName',width: 160},
    {title: '审核状态',dataIndex: 'AuditStatusName',width: 140},
    {title: '审核人',dataIndex: 'AuditorName',width: 140},
    {title: '审核备注',dataIndex: 'AuditRemark',width: 230},
    {title: '操作时间',dataIndex: 'CreateTime',width: 220},
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
      getPrescriptList()
    },
    onChange: (page) => {
      pagination.current = page
      getPrescriptList()
    }
  })

  const auditModal=ref({
    visible:false,
    loading:false,
    form:{
      Id:'',
      AuditStatus:1,
      Remark:'',
    }
  })

  const openAudit=(record)=>{
    auditModal.value.visible=true
    auditModal.value.form={
      Id:record.Id,
      AuditStatus:1,
      Remark:'',
    }
  }

  const getAuditStatusClass=(statusName)=>{
    if(statusName === '待审核'){
      return 'is-pending'
    }
    if(statusName === '审核通过' || statusName === '通过'){
      return 'is-approved'
    }
    if(statusName === '审核拒绝' || statusName === '拒绝'){
      return 'is-rejected'
    }
    return 'is-default'
  }

  const handleAudit=()=>{
    if(auditModal.value.form.AuditStatus==2&&!auditModal.value.form.Remark){
      createMessage.warning('请填写拒绝原因')
      return
    }
    auditModal.value.loading=true
    TemplateApiCtrl.AuditPrescript(auditModal.value.form).then(()=>{
      createMessage.success('审核成功')
      auditModal.value.visible=false
      getPrescriptList()
    }).catch(() => {}).finally(() => {
      auditModal.value.loading=false
    })
  }

  onMounted(() => {
    getBasicEnum()
    getCategoryList()
    getStaffList()
    getPrescriptList()
  })

    // 获取枚举
  const getBasicEnum=()=>{
    basicEnum({name:'ClinicPrescriptAuditStatus'}).then(data=>{
      ClinicPrescriptAuditStatus.value=data
    })
  }

  const getCategoryList=()=>{
    TemplateApiCtrl.CategoryList({page:1,limit:100,type:1}).then(data=>{
      categoryList.value=data.Rows
    })
  }

  const getStaffList=()=>{
    AccountApiCtrl.DoctorOptions({}).then(data=>{
      physicianList.value=data
    })
  }

  const handleResetFilter=()=>{
    searchParams.value={
      keyword:'',
      categoryId:null,
      doctorId:null,
      auditStatus:null,
    }
    getPrescriptList(true)
  }

  // 获取列表
  const getPrescriptList=(isSearch=false)=>{
    if(isSearch){
      pagination.current=1
    }
    table.value.loading=true
    const query =cloneDeep(searchParams.value)
    TemplateApiCtrl.PrescriptList({
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
.prescription-review-page {
  background: #f4f7f9;
}

.prescription-review-card {
  padding: 18px;
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
}

.prescription-review-filter-panel {
  padding: 16px 18px 4px;
  margin-bottom: 14px;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #f9fbfd;
}

.prescription-review-filter-title {
  margin-bottom: 14px;
  color: #1d2533;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
}

.prescription-review-filter-fields {
  flex: 1 1 auto;
}

.prescription-review-filter-select {
  width: 220px;
}

.prescription-review-filter-actions {
  padding-top: 1px;
}

.prescription-review-button {
  min-width: 86px;
  border-radius: 8px;
  font-weight: 400;
}

:deep(.prescription-review-filter-panel .ant-form-item) {
  margin-bottom: 12px;
}

:deep(.prescription-review-filter-panel .ant-form-item-label > label) {
  color: #5f6a7a;
  font-weight: 400;
}

:deep(.prescription-review-filter-panel .ant-input-affix-wrapper),
:deep(.prescription-review-filter-panel .ant-input),
:deep(.prescription-review-filter-panel .ant-select-selector) {
  border-color: #dce6f5 !important;
  border-radius: 8px !important;
  background: #fff;
  box-shadow: none !important;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

:deep(.prescription-review-filter-panel .ant-input-affix-wrapper:hover),
:deep(.prescription-review-filter-panel .ant-input-affix-wrapper-focused),
:deep(.prescription-review-filter-panel .ant-input:hover),
:deep(.prescription-review-filter-panel .ant-input:focus),
:deep(.prescription-review-filter-panel .ant-select:hover .ant-select-selector),
:deep(.prescription-review-filter-panel .ant-select-focused .ant-select-selector) {
  border-color: #0a5aff !important;
  box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
}

:deep(.prescription-review-filter-panel .ant-input-affix-wrapper .ant-input),
:deep(.prescription-review-filter-panel .ant-input-affix-wrapper .ant-input:hover),
:deep(.prescription-review-filter-panel .ant-input-affix-wrapper .ant-input:focus) {
  border-color: transparent !important;
  background: transparent !important;
  box-shadow: none !important;
}

.prescription-review-table-scroll {
  max-height: calc(100vh - 254px);
  padding-right: 8px;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.prescription-review-table-scroll::-webkit-scrollbar {
  width: 8px;
}

.prescription-review-table-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #c7d7f0;
}

.prescription-review-table-scroll::-webkit-scrollbar-track {
  background: transparent;
}

:deep(.prescription-review-table .ant-table) {
  border-radius: 12px;
  background: transparent;
}

:deep(.prescription-review-table .ant-table-container) {
  border: 1px solid #e8eef7 !important;
  border-radius: 12px;
}

:deep(.prescription-review-table .ant-table-thead > tr > th) {
  color: #5f6a7a;
  font-weight: 500;
  background: #f9fbfd;
  border-color: #e8eef7 !important;
}

:deep(.prescription-review-table .ant-table-tbody > tr > td) {
  padding-top: 13px;
  padding-bottom: 13px;
  border-color: #f0f3f8 !important;
  transition: background-color 0.2s ease;
}

:deep(.prescription-review-table .ant-table-tbody > tr:hover > td) {
  background: #f7faff !important;
}

:deep(.prescription-review-table .ant-pagination) {
  margin: 16px 0 2px;
}

.prescription-review-name-cell {
  min-width: 0;
}

.prescription-review-name {
  max-width: 170px;
  overflow: hidden;
  color: #1d2533;
  font-weight: 400;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prescription-review-owner {
  margin-top: 2px;
  overflow: hidden;
  color: #858d98;
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prescription-review-category,
.prescription-review-text,
.prescription-review-remark,
.prescription-review-status {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 400;
  line-height: 28px;
  border-radius: 8px;
}

.prescription-review-category {
  color: #0a5aff;
  border: 1px solid #d8e6ff;
  background: #eef5ff;
}

.prescription-review-text,
.prescription-review-remark {
  max-width: 150px;
  overflow: hidden;
  color: #313947;
  border: 1px solid #e4ebf6;
  background: #f9fbfd;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prescription-review-remark {
  max-width: 220px;
}

.prescription-review-status.is-pending {
  color: #9a6500;
  border: 1px solid #f3dc9a;
  background: #fff8dc;
}

.prescription-review-status.is-approved {
  color: #14804a;
  border: 1px solid #cdeedb;
  background: #ecfdf3;
}

.prescription-review-status.is-rejected {
  color: #c43b3b;
  border: 1px solid #f4d4d4;
  background: #fff1f1;
}

.prescription-review-status.is-default {
  color: #5f6a7a;
  border: 1px solid #e4ebf6;
  background: #f9fbfd;
}

.prescription-review-time-cell {
  color: #1d2533;
  font-size: 13px;
  line-height: 22px;
}

.prescription-review-time-cell div + div {
  margin-top: 2px;
}

.prescription-review-time-cell span {
  display: inline-flex;
  width: 32px;
  margin-right: 8px;
  color: #858d98;
}

.prescription-review-action-button {
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  font-weight: 400;
}

:deep(.prescription-review-select-dropdown) {
  overflow: hidden;
  padding: 8px;
  border: 1px solid #e5edf8;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 14px 32px rgba(31, 43, 61, 0.12);
}

:deep(.prescription-review-select-dropdown .ant-select-item) {
  min-height: 34px;
  margin: 2px 0;
  padding: 6px 10px;
  color: #313947;
  border-radius: 8px;
  transition: background-color 0.16s ease, color 0.16s ease;
}

:deep(.prescription-review-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled)) {
  background: #eef5ff;
}

:deep(.prescription-review-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled)) {
  color: #0a5aff;
  font-weight: 500;
  background: #e8f1ff;
}

:global(.prescription-review-audit-modal .ant-modal-content) {
  overflow: hidden;
  padding: 0;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 24px 56px rgba(31, 43, 61, 0.16);
}

:global(.prescription-review-audit-modal .ant-modal-close) {
  top: 18px;
  right: 18px;
  border-radius: 8px;
}

:global(.prescription-review-audit-modal .ant-modal-close:hover) {
  background: #eef5ff;
}

:global(.prescription-review-audit-modal .ant-modal-body) {
  padding: 0;
}

.prescription-review-audit-dialog {
  padding: 32px 34px 28px;
  background:
    linear-gradient(180deg, #f9fbfd 0%, #fff 38%),
    #fff;
}

.prescription-review-audit-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 0 34px 22px 0;
  border-bottom: 1px dashed #dce6f5;
}

.prescription-review-audit-title {
  color: #1d2533;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}

.prescription-review-audit-subtitle {
  margin-top: 5px;
  color: #5f6a7a;
  font-size: 13px;
  line-height: 20px;
}

.prescription-review-audit-badge {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  color: #0a5aff;
  font-size: 13px;
  border: 1px solid #d8e6ff;
  border-radius: 999px;
  background: #eef5ff;
}

.prescription-review-audit-form {
  padding-top: 20px;
}

.prescription-review-audit-section {
  padding: 18px 18px 16px;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #fff;
}

.prescription-review-audit-result {
  margin-bottom: 16px;
}

:deep(.prescription-review-audit-form .ant-form-item-label > label) {
  color: #5f6a7a;
  font-weight: 400;
}

.prescription-review-radio-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 220px;
  overflow: hidden;
  border: 1px solid #dce6f5;
  border-radius: 10px;
}

:deep(.prescription-review-radio-group .ant-radio-button-wrapper) {
  height: 36px;
  padding: 0;
  border: 0;
  color: #5f6a7a;
  line-height: 36px;
  text-align: center;
  background: #f9fbfd;
}

:deep(.prescription-review-radio-group .ant-radio-button-wrapper::before) {
  display: none;
}

:deep(.prescription-review-radio-group .ant-radio-button-wrapper-checked) {
  color: #0a5aff;
  background: #eef5ff;
}

.prescription-review-audit-textarea {
  border-color: #dce6f5 !important;
  border-radius: 8px !important;
  box-shadow: none !important;
  resize: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.prescription-review-audit-textarea:hover,
.prescription-review-audit-textarea:focus {
  border-color: #0a5aff !important;
  box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
}

.prescription-review-audit-note {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid #e8eef7;
  border-radius: 10px;
  background: #fffdec;
}

.prescription-review-audit-note span {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  margin-top: 7px;
  border-radius: 50%;
  background: #f5b849;
}

.prescription-review-audit-note p {
  margin: 0;
  color: #5f6a7a;
  font-size: 13px;
  line-height: 20px;
}

.prescription-review-audit-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
}

.prescription-review-audit-button {
  height: 40px;
  border-radius: 8px;
  font-weight: 400;
}

.prescription-review-audit-primary {
  background: #0a5aff;
}
</style>
