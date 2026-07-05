<template>
  <div class="p-4 personnel-page">
    <div class="page-height SmallCard personnel-card">
      <div class="personnel-filter-panel">
        <div class="personnel-filter-title">人员管理查询</div>
      <a-flex justify="space-between" align="flex-start" gap="16" wrap="wrap">
        <a-space class="personnel-filter-fields" :size="[20,0]" wrap>
          <a-form-item label="成员">
            <a-input v-model:value="searchParams.keyword" placeholder="姓名/手机号" allowClear />
          </a-form-item>
          <a-form-item label="人员角色" class="w240px">
            <a-select v-model:value="searchParams.roleId" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="personnel-select-dropdown" :listHeight="220" :virtual="false" :get-popup-container="(trigger) => trigger.parentElement">
              <a-select-option :value="item.Id" v-for="(item,index) in roleList" :key="index" :title="item.Name">{{item.Name}}</a-select-option>
            </a-select>
          </a-form-item>
        </a-space>
        <a-space class="personnel-filter-actions">
          <a-button @click="handleResetFilter">重置筛选</a-button>
          <a-button type="primary" @click="getStaffList(true)">筛选查询</a-button>
          <a-button class="personnel-add-button" type="primary" @click="handleAdd">新增医生</a-button>
        </a-space>
      </a-flex>
      </div>
      <div class="personnel-table-scroll-shell">
      <a-table class="personnel-table"
                :data-source="table.list"
                :columns="columns"
                row-key="Id"
                :loading="table.loading"
                :pagination="pagination"
                :scroll="{x:1040}">
        <template #bodyCell="{column,record}">
          <template v-if="column.dataIndex == 'Name'">
            <div class="personnel-member-cell">
              <a-avatar class="personnel-avatar" :size="40" :src="record.Avatar" />
              <div class="personnel-member-info">
                <div class="personnel-member-name">{{record.Name}}</div>
                <div class="personnel-member-phone">{{record.Phone || '--'}}</div>
              </div>
            </div>
          </template>
          <template v-if="column.dataIndex == 'RoleName'">
            <span class="personnel-role-tag">{{record.RoleName || '--'}}</span>
          </template>
          <template v-if="column.dataIndex == 'Department'">
            <span class="personnel-text">{{record.Department || '--'}}</span>
          </template>
          <template v-if="column.dataIndex == 'Phone'">
            <span class="personnel-phone-text">{{record.Phone || '--'}}</span>
          </template>
          <template v-if="column.dataIndex == 'Status'">
            <span class="personnel-status-tag personnel-status-enabled" v-if="record.Status==1">启用</span>
            <span class="personnel-status-tag personnel-status-disabled" v-else>禁用</span>
          </template>
          <template v-else-if="column.dataIndex == 'action'">
            <a-space class="personnel-action-group">
              <a-button class="personnel-action-button" type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button class="personnel-action-button" type="link" size="small" :danger="record.Status==1" @click="handleToggle(record)">{{record.Status==1?'禁用':'启用'}}</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
      </div>

      <a-modal class="personnel-doctor-modal" v-model:open="doctorModal.visible" centered width="760px" :footer="null" :maskClosable="false" destroyOnClose>
        <section class="personnel-doctor-dialog">
          <div class="personnel-doctor-dialog-header">
            <div>
              <div class="personnel-doctor-dialog-title">{{ doctorModal.isEdit ? '编辑医生' : '新增医生' }}</div>
              <div class="personnel-doctor-dialog-subtitle">维护医生账号、角色权限和接诊展示信息</div>
            </div>
            <span class="personnel-doctor-dialog-badge">{{ doctorModal.isEdit ? '资料维护' : '新建账号' }}</span>
          </div>
          <a-form class="personnel-doctor-form" :model="doctorModal.form" :rules="doctorModal.rules" ref="formIns" :labelCol="{ style: 'width: 92px' }" :wrapperCol="{span:24}">
            <div class="personnel-doctor-section is-profile">
              <div class="personnel-doctor-section-title">基础资料</div>
              <div class="personnel-doctor-profile-grid">
                <div class="personnel-doctor-avatar-panel">
                  <div class="personnel-doctor-avatar-label">医生头像</div>
                  <a-form-item name="Avatar" class="personnel-doctor-avatar-item">
                    <MediaPicker :max="1" formType="string" text="上传图片" :size="{height:104,width:104}" v-model:images="doctorModal.form.Avatar" />
                  </a-form-item>
                </div>
                <div class="personnel-doctor-field-grid">
                  <a-form-item label="姓名" name="Name">
                    <a-input v-model:value="doctorModal.form.Name" placeholder="请输入姓名" />
                  </a-form-item>
                  <a-form-item label="手机号" name="Phone">
                    <a-input v-model:value="doctorModal.form.Phone" placeholder="请输入手机号" :maxlength="11" />
                  </a-form-item>
                  <a-form-item label="科室" name="Department">
                    <a-input v-model:value="doctorModal.form.Department" placeholder="请输入科室" />
                  </a-form-item>
                  <a-form-item label="职位" name="Position">
                    <a-input v-model:value="doctorModal.form.Position" placeholder="请输入职位" />
                  </a-form-item>
                </div>
              </div>
            </div>

            <div class="personnel-doctor-section">
              <div class="personnel-doctor-section-title">权限与状态</div>
              <div class="personnel-doctor-auth-grid">
                <a-form-item label="登录密码" name="Password">
                  <a-input-password v-model:value="doctorModal.form.Password" :placeholder="doctorModal.isEdit ? '留空则不修改密码' : '为空时默认手机号后6位'" />
                </a-form-item>
                <a-form-item label="角色" name="ClinicRoleId">
                  <a-select v-model:value="doctorModal.form.ClinicRoleId" placeholder="请选择角色" allowClear showSearch optionFilterProp="title" dropdownClassName="personnel-select-dropdown" :listHeight="220" :virtual="false" :get-popup-container="(trigger) => trigger.parentElement" @change="handleRoleChange">
                    <a-select-option :value="item.Id" v-for="(item,index) in roleList" :key="index" :title="item.Name">{{item.Name}}</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="账号启用" name="Enable" class="personnel-doctor-switch-item">
                  <a-switch v-model:checked="doctorModal.form.Enable" />
                  <span class="personnel-doctor-switch-text">{{ doctorModal.form.Enable ? '已启用' : '已禁用' }}</span>
                </a-form-item>
              </div>
            </div>

            <div class="personnel-doctor-section">
              <div class="personnel-doctor-section-title">备注信息</div>
              <a-form-item label="备注" name="Remark" class="personnel-doctor-remark-item">
                <a-textarea v-model:value="doctorModal.form.Remark" placeholder="请输入备注" :rows="2" />
              </a-form-item>
            </div>
        </a-form>
          <div class="personnel-doctor-dialog-actions">
            <a-button class="personnel-doctor-dialog-button" @click="doctorModal.visible=false">取消</a-button>
            <a-button class="personnel-doctor-dialog-button personnel-doctor-dialog-primary" type="primary" :loading="doctorModal.loading" @click="handleSave">保存</a-button>
          </div>
        </section>
      </a-modal>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref,reactive,onMounted} from 'vue';
  import { cloneDeep } from 'lodash-es';
  import {StaffApiCtrl} from '/@/api/myy/staff';
  import MediaPicker from '/@/components/AJ/MediaBrowser/MediaPicker.vue'
  import { useMessage } from '/@/hooks/web/useMessage';

  const { createMessage } = useMessage()

  const roleList=ref([])
  const searchParams = ref({
    keyword:'',
    roleId:null,
  })
  const table =ref({
    list: [],
    loading:false,
  })
  const columns=ref([
    {title: '姓名头像',dataIndex: 'Name',width: 180},
    {title: '角色',dataIndex: 'RoleName',width: 160},
    {title: '科室',dataIndex: 'Department',width: 160},
    {title: '电话',dataIndex: 'Phone',width: 140},
    {title: '状态',dataIndex: 'Status',width: 140},
    {title: '备注',dataIndex: 'Remark',width: 240},
    {title: '操作',dataIndex: 'action',width: 140},
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
      getStaffList()
    },
    onChange: (page) => {
      pagination.current = page
      getStaffList()
    }
  })

  const formIns=ref()
  const doctorDefaultForm={
    DoctorId:null,
    Name:'',
    Phone:'',
    Password:'',
    Avatar:'',
    Department:'',
    Position:'',
    ClinicRoleId:null,
    ClinicRole:'',
    Enable:true,
    Remark:'',
  }
  const validatePhone = async (_rule, value) => {
    if (!value) {
      return Promise.reject('请输入手机号')
    }
    if (!/^1\d{10}$/.test(String(value))) {
      return Promise.reject('请输入11位数字手机号')
    }
    return Promise.resolve()
  }
  const doctorModal=ref({
    loading:false,
    visible:false,
    isEdit:false,
    form:cloneDeep(doctorDefaultForm),
    rules:{
      Name: [{required: true,trigger: 'blur',message: '请输入姓名',type:'string'}],
      Phone: [{required: true,trigger: ['blur', 'change'], validator: validatePhone}],
      ClinicRoleId: [{required: true,trigger: 'change',message: '请选择角色',type:'string'}],
    }
  })

  const handleAdd=()=>{
    doctorModal.value.isEdit=false
    doctorModal.value.form=cloneDeep(doctorDefaultForm)
    doctorModal.value.visible=true
  }

  const handleRoleChange=(val)=>{
    const role = roleList.value.find(item=>item.Id===val)
    doctorModal.value.form.ClinicRole = role ? role.Name : ''
  }

  const handleEdit=(record)=>{
    doctorModal.value.isEdit=true
    doctorModal.value.form=cloneDeep({
      ...doctorDefaultForm,
      ...record,
      DoctorId:record.Id || record.DoctorId,
      ClinicRoleId:record.RoleId || record.ClinicRoleId,
      ClinicRole:record.RoleName || record.ClinicRole,
      Enable:record.Status?true:false
    })
    doctorModal.value.visible=true
  }

  const handleSave=()=>{
    formIns.value.validate().then(() => {
      doctorModal.value.loading=true
      const formData = cloneDeep(doctorModal.value.form)
      if(!formData.Password){
        delete formData.Password
      }
      StaffApiCtrl.StaffSave(formData).then(()=>{
        createMessage.success('保存成功')
        doctorModal.value.visible=false
        doctorModal.value.loading=false
        getStaffList()
      }).catch(()=>{
        doctorModal.value.loading=false
      })
    })
  }

  const handleToggle=(record)=>{
    let enable=record.Status==1?false:true
    StaffApiCtrl.StaffToggle({doctorId:record.Id,enable}).then(()=>{
      createMessage.success('操作成功')
      getStaffList()
    })
  }

  onMounted(() => {
    getRoleList()
    getStaffList()
  })

  const getRoleList=()=>{
    StaffApiCtrl.RoleList({}).then(data=>{
      roleList.value=data
    })
  }

  const handleResetFilter=()=>{
    searchParams.value={
      keyword:'',
      roleId:null,
    }
    getStaffList(true)
  }

  // 获取列表
  const getStaffList=(isSearch=false)=>{
    if(isSearch){
      pagination.current=1
    }
    table.value.loading=true
    const query =cloneDeep(searchParams.value)
    StaffApiCtrl.StaffList({
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
.personnel-page {
  .personnel-card {
    padding: 18px;
    overflow: hidden;
    border-radius: 12px;
    background: #fff;
  }

  .personnel-filter-panel {
    padding: 16px 18px 4px;
    margin-bottom: 14px;
    border: 1px solid #E8EEF7;
    border-radius: 12px;
    background: #F9FBFD;
  }

  .personnel-filter-title {
    margin-bottom: 14px;
    color: #1F2B3D;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }

  .personnel-filter-fields {
    flex: 1 1 auto;
  }

  .personnel-filter-actions {
    padding-top: 1px;
  }

  .personnel-add-button {
    border-radius: 8px;
  }

  :deep(.personnel-filter-panel .ant-form-item) {
    margin-bottom: 12px;
  }

  :deep(.personnel-filter-panel .ant-input-affix-wrapper),
  :deep(.personnel-filter-panel .ant-input),
  :deep(.personnel-filter-panel .ant-select-selector) {
    border-radius: 8px !important;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  :deep(.personnel-filter-panel .ant-input-affix-wrapper .ant-input),
  :deep(.personnel-filter-panel .ant-input-affix-wrapper .ant-input:hover),
  :deep(.personnel-filter-panel .ant-input-affix-wrapper .ant-input:focus) {
    border-color: transparent !important;
    box-shadow: none !important;
  }

  :deep(.personnel-filter-panel .ant-input-affix-wrapper:hover),
  :deep(.personnel-filter-panel .ant-input-affix-wrapper-focused),
  :deep(.personnel-filter-panel > .ant-input:hover),
  :deep(.personnel-filter-panel > .ant-input:focus),
  :deep(.personnel-filter-panel .ant-select:not(.ant-select-disabled):hover .ant-select-selector),
  :deep(.personnel-filter-panel .ant-select-focused .ant-select-selector) {
    border-color: @primary-color !important;
    box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
  }

  .personnel-table-scroll-shell {
    max-height: calc(100vh - 254px);
    overflow-y: auto;
    padding-right: 10px;
    scrollbar-gutter: stable;
  }

  .personnel-table-scroll-shell::-webkit-scrollbar {
    width: 8px;
  }

  .personnel-table-scroll-shell::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: #C7D7F0;
  }

  .personnel-table-scroll-shell::-webkit-scrollbar-track {
    background: transparent;
  }

  :deep(.personnel-table .ant-table) {
    border-radius: 12px;
    background: transparent;
  }

  :deep(.personnel-table .ant-table-container) {
    border: 1px solid #E8EEF7 !important;
    border-radius: 12px;
  }

  :deep(.personnel-table .ant-table-thead > tr > th) {
    color: #5F6A7A;
    font-weight: 500;
    background: #F9FBFD;
    border-color: #E8EEF7 !important;
  }

  :deep(.personnel-table .ant-table-tbody > tr > td) {
    padding-top: 13px;
    padding-bottom: 13px;
    border-color: #F0F3F8 !important;
    transition: background-color 0.2s ease;
  }

  :deep(.personnel-table .ant-table-tbody > tr:hover > td) {
    background: #F7FAFF !important;
  }

  :deep(.personnel-table .ant-pagination) {
    margin: 16px 0 2px;
  }
}

.personnel-member-cell {
  display: flex;
  align-items: center;
  min-width: 0;
}

.personnel-avatar {
  flex: 0 0 40px;
  box-shadow: 0 4px 10px rgba(32, 48, 75, 0.08);
}

.personnel-member-info {
  min-width: 0;
  margin-left: 10px;
}

.personnel-member-name {
  max-width: 126px;
  overflow: hidden;
  color: #1F2B3D;
  font-weight: 400;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.personnel-member-phone {
  margin-top: 2px;
  overflow: hidden;
  color: #858D98;
  font-size: 13px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.personnel-role-tag,
.personnel-text,
.personnel-phone-text,
.personnel-status-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 400;
  line-height: 28px;
  border-radius: 8px;
}

.personnel-role-tag {
  color: #0A5AFF;
  border: 1px solid #D8E6FF;
  background: #EEF5FF;
}

.personnel-text,
.personnel-phone-text {
  color: #313947;
  border: 1px solid #E4EBF6;
  background: #F9FBFD;
}

.personnel-phone-text {
  min-width: 104px;
  justify-content: center;
}

.personnel-status-enabled {
  color: #14804A;
  border: 1px solid #CDEEDB;
  background: #ECFDF3;
}

.personnel-status-disabled {
  color: #C43B3B;
  border: 1px solid #F4D4D4;
  background: #FFF1F1;
}

.personnel-action-group {
  white-space: nowrap;
}

.personnel-action-button {
  height: 28px;
  padding: 0 8px;
  border-radius: 8px;
  font-weight: 400;
}

:deep(.personnel-select-dropdown) {
  overflow: hidden;
  padding: 8px;
  border: 1px solid #E5EDF8;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 14px 32px rgba(31, 43, 61, 0.12);
}

:deep(.personnel-select-dropdown .ant-select-item) {
  min-height: 34px;
  margin: 2px 0;
  padding: 6px 10px;
  color: #313947;
  border-radius: 8px;
  transition: background-color 0.16s ease, color 0.16s ease;
}

:deep(.personnel-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled)) {
  background: #EEF5FF;
}

:deep(.personnel-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled)) {
  color: @primary-color;
  font-weight: 500;
  background: #E8F1FF;
}

:deep(.personnel-select-dropdown .rc-virtual-list-scrollbar-thumb) {
  background: #C7D7F0 !important;
  border-radius: 999px !important;
}

:deep(.personnel-doctor-modal .ant-modal-content) {
  overflow: hidden;
  padding: 0;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 24px 56px rgba(31, 43, 61, 0.16);
}

:deep(.personnel-doctor-modal .ant-modal-close) {
  top: 20px;
  right: 20px;
  border-radius: 8px;
}

:deep(.personnel-doctor-modal .ant-modal-close:hover) {
  background: #EEF5FF;
}

:deep(.personnel-doctor-modal .ant-modal-body) {
  padding: 0;
}

.personnel-doctor-dialog {
  padding: 30px 32px 26px;
  background:
    linear-gradient(180deg, #F9FBFD 0%, #fff 34%),
    #fff;
}

.personnel-doctor-dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 0 36px 22px 0;
  border-bottom: 1px dashed #DCE6F5;
}

.personnel-doctor-dialog-title {
  color: #1D2533;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}

.personnel-doctor-dialog-subtitle {
  margin-top: 5px;
  color: #5F6A7A;
  font-size: 13px;
  line-height: 20px;
}

.personnel-doctor-dialog-badge {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  color: #0A5AFF;
  font-size: 13px;
  border: 1px solid #D8E6FF;
  border-radius: 999px;
  background: #EEF5FF;
}

:deep(.personnel-doctor-form .ant-form-item) {
  margin-bottom: 14px;
}

.personnel-doctor-form {
  padding-top: 20px;
}

.personnel-doctor-section {
  padding: 16px 18px 2px;
  margin-bottom: 14px;
  border: 1px solid #E8EEF7;
  border-radius: 12px;
  background: #fff;
}

.personnel-doctor-section.is-profile {
  background: #F9FBFD;
}

.personnel-doctor-section-title {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  color: #1D2533;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
}

.personnel-doctor-section-title::before {
  width: 4px;
  height: 16px;
  margin-right: 8px;
  border-radius: 999px;
  background: #0A5AFF;
  content: '';
}

.personnel-doctor-profile-grid {
  display: grid;
  grid-template-columns: 144px 1fr;
  gap: 18px;
}

.personnel-doctor-avatar-panel {
  min-height: 178px;
  padding: 14px 12px;
  border: 1px dashed #DCE6F5;
  border-radius: 12px;
  background: #fff;
}

.personnel-doctor-avatar-label {
  margin-bottom: 12px;
  color: #5F6A7A;
  font-size: 13px;
  line-height: 20px;
  text-align: center;
}

.personnel-doctor-avatar-item {
  margin-bottom: 0 !important;
}

.personnel-doctor-avatar-item :deep(.ant-form-item-control-input-content) {
  display: flex;
  justify-content: center;
}

.personnel-doctor-field-grid,
.personnel-doctor-auth-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 14px;
}

.personnel-doctor-switch-item {
  grid-column: span 2;
}

.personnel-doctor-switch-item :deep(.ant-form-item-control-input-content) {
  display: flex;
  align-items: center;
  min-height: 34px;
}

.personnel-doctor-switch-text {
  margin-left: 10px;
  color: #5F6A7A;
  font-size: 13px;
}

.personnel-doctor-remark-item {
  margin-bottom: 14px !important;
}

:deep(.personnel-doctor-form .ant-input),
:deep(.personnel-doctor-form .ant-input-affix-wrapper),
:deep(.personnel-doctor-form .ant-select-selector),
:deep(.personnel-doctor-form .ant-input-number),
:deep(.personnel-doctor-form textarea.ant-input) {
  border-radius: 8px !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

:deep(.personnel-doctor-form .ant-input-affix-wrapper .ant-input),
:deep(.personnel-doctor-form .ant-input-affix-wrapper .ant-input:hover),
:deep(.personnel-doctor-form .ant-input-affix-wrapper .ant-input:focus) {
  border-color: transparent !important;
  box-shadow: none !important;
}

:deep(.personnel-doctor-form .ant-input:hover),
:deep(.personnel-doctor-form .ant-input:focus),
:deep(.personnel-doctor-form .ant-input-affix-wrapper:hover),
:deep(.personnel-doctor-form .ant-input-affix-wrapper-focused),
:deep(.personnel-doctor-form .ant-select:not(.ant-select-disabled):hover .ant-select-selector),
:deep(.personnel-doctor-form .ant-select-focused .ant-select-selector),
:deep(.personnel-doctor-form textarea.ant-input:hover),
:deep(.personnel-doctor-form textarea.ant-input:focus) {
  border-color: @primary-color !important;
  box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
}

:deep(.personnel-doctor-form .ant-form-item-label > label) {
  color: #5F6A7A;
  font-weight: 400;
}

.personnel-doctor-dialog-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px dashed #DCE6F5;
}

.personnel-doctor-dialog-button {
  height: 40px;
  border-radius: 8px;
  font-weight: 400;
}

.personnel-doctor-dialog-primary {
  background: #0A5AFF;
}
</style>
