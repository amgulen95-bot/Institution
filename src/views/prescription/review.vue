<template>
  <div class="p-4">
    <div class="page-height SmallCard">
      <a-flex justify="space-between" align="flex-start">
        <a-space :size="[24,0]" wrap>
          <a-form-item label="关键字">
            <a-input v-model:value="searchParams.keyword" placeholder="请输入关键字" allowClear />
          </a-form-item>
          <a-form-item label="模板分类" class="w240px">
            <a-select v-model:value="searchParams.categoryId" placeholder="请选择" allowClear showSearch optionFilterProp="title">
              <a-select-option :value="item.Id" v-for="(item,index) in categoryList" :key="index" :title="item.Name">{{item.Name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="所属医生" class="w240px">
            <a-select v-model:value="searchParams.doctorId" placeholder="请选择" allowClear showSearch optionFilterProp="title">
              <a-select-option :value="item.id" v-for="(item,index) in physicianList" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="审核状态" class="w240px">
            <a-select v-model:value="searchParams.auditStatus" placeholder="请选择" allowClear showSearch optionFilterProp="title">
              <a-select-option :value="item.id" v-for="(item,index) in ClinicPrescriptAuditStatus" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
        </a-space>
        <a-space>
          <a-button @click="handleResetFilter">重置筛选</a-button>
          <a-button type="primary" @click="getPrescriptList(true)">筛选查询</a-button>
        </a-space>
      </a-flex>
      <a-table :data-source="table.list"
                :columns="columns"
                row-key="Id"
                :loading="table.loading"
                :pagination="pagination"
                :scroll="{x:1000,y:'calc(100vh - 300px)'}">
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
          <template v-if="column.dataIndex == 'CreateTime'">
            <div>创建时间：{{ record.CreateTime }}</div>
            <div>审核时间：{{ record.AuditTime||'--' }}</div>
          </template>
          <template v-if="column.dataIndex == 'operation'">
            <a-button type="link" size="small" :disabled="record.AuditStatusName!='待审核'" @click="openAudit(record)">审核</a-button>
          </template>
        </template>
      </a-table>
    </div>

    <a-modal v-model:open="auditModal.visible" title="审核处方" centered width="700px" @ok="handleAudit" :confirmLoading="auditModal.loading" :maskClosable="false" destroyOnClose>
      <section class="padding-lr32 formModal">
        <a-form :model="auditModal.form">
          <a-form-item label="审核结果">
            <a-radio-group v-model:value="auditModal.form.AuditStatus">
              <a-radio :value="1">通过</a-radio>
              <a-radio :value="2">拒绝</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="拒绝原因" v-if="auditModal.form.AuditStatus == 2" :rules="[{ required: true, message: '请填写拒绝原因' }]">
            <a-textarea v-model:value="auditModal.form.Remark" placeholder="请填写拒绝原因" :rows="4" />
          </a-form-item>
        </a-form>
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
    {title: '审核备注',dataIndex: 'AuditRemark',width: 160},
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
</style>