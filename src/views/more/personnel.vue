<template>
  <div class="p-4">
    <div class="page-height SmallCard">
      <a-flex justify="space-between" align="flex-start">
        <a-space :size="[24,0]" wrap>
          <a-form-item label="成员">
            <a-input v-model:value="searchParams.keyword" placeholder="姓名/手机号" allowClear />
          </a-form-item>
          <a-form-item label="人员角色" class="w240px">
            <a-select v-model:value="searchParams.roleId" placeholder="请选择" allowClear showSearch optionFilterProp="title">
              <a-select-option :value="item.Id" v-for="(item,index) in roleList" :key="index" :title="item.Name">{{item.Name}}</a-select-option>
            </a-select>
          </a-form-item>
        </a-space>
        <a-space>
          <a-button @click="handleResetFilter">重置筛选</a-button>
          <a-button type="primary" @click="getStaffList(true)">筛选查询</a-button>
          <a-button type="primary" @click="handleAdd">新增医生</a-button>
        </a-space>
      </a-flex>
      <a-table :data-source="table.list"
                :columns="columns"
                row-key="Id"
                :loading="table.loading"
                :pagination="pagination"
                :scroll="{x:1000,y:'calc(100vh - 285px)'}">
        <template #bodyCell="{column,record}">
          <template v-if="column.dataIndex == 'Name'">
            <div class="flex align-center">
              <a-avatar :size="40" :src="record.Avatar" />
              <div class="ml8px">{{record.Name}}</div>
            </div>
          </template>
          <template v-if="column.dataIndex == 'Status'">
            <a-badge color="green" text="启用" v-if="record.Status==1" />
            <a-badge color="red" text="禁用" v-else />
          </template>
          <template v-else-if="column.dataIndex == 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" size="small" :danger="record.Status==1" @click="handleToggle(record)">{{record.Status==1?'禁用':'启用'}}</a-button>
            </a-space>
          </template>
        </template>
      </a-table>

      <a-modal v-model:open="doctorModal.visible" :title="doctorModal.isEdit ? '编辑医生' : '新增医生'" centered width="640px" @ok="handleSave" :confirmLoading="doctorModal.loading" destroyOnClose>
        <a-form :model="doctorModal.form" :rules="doctorModal.rules" ref="formIns" :labelCol="{ style: 'width: 100px' }" :wrapperCol="{span:16}">
          <a-form-item label="头像" name="Avatar">
            <MediaPicker :max="1" formType="string" text="上传图片" :size="{height:104,width:104}" v-model:images="doctorModal.form.Avatar" />
          </a-form-item>
          <a-form-item label="姓名" name="Name">
            <a-input v-model:value="doctorModal.form.Name" placeholder="请输入姓名" />
          </a-form-item>
          <a-form-item label="手机号" name="Phone">
            <a-input v-model:value="doctorModal.form.Phone" placeholder="请输入手机号" />
          </a-form-item>
          <a-form-item label="密码" name="Password">
            <a-input-password v-model:value="doctorModal.form.Password" :placeholder="doctorModal.isEdit ? '留空则不修改密码' : '为空时默认手机号后6位'" />
          </a-form-item>
          <a-form-item label="科室" name="Department">
            <a-input v-model:value="doctorModal.form.Department" placeholder="请输入科室" />
          </a-form-item>
          <a-form-item label="职位" name="Position">
            <a-input v-model:value="doctorModal.form.Position" placeholder="请输入职位" />
          </a-form-item>
          <a-form-item label="角色" name="ClinicRoleId">
            <a-select v-model:value="doctorModal.form.ClinicRoleId" placeholder="请选择角色" allowClear showSearch optionFilterProp="title" @change="handleRoleChange">
              <a-select-option :value="item.Id" v-for="(item,index) in roleList" :key="index" :title="item.Name">{{item.Name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="启用" name="Enable">
            <a-switch v-model:checked="doctorModal.form.Enable" />
          </a-form-item>
          <a-form-item label="备注" name="Remark">
            <a-textarea v-model:value="doctorModal.form.Remark" placeholder="请输入备注" :rows="3" />
          </a-form-item>
        </a-form>
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
  const doctorModal=ref({
    loading:false,
    visible:false,
    isEdit:false,
    form:cloneDeep(doctorDefaultForm),
    rules:{
      Name: [{required: true,trigger: 'blur',message: '请输入姓名',type:'string'}],
      Phone: [{required: true,trigger: 'blur',message: '请输入手机号',type:'string'}],
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
</style>
