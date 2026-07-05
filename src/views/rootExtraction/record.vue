<template>
  <div class="p-4">
    <div class="page-height SmallCard">
      <a-flex justify="space-between" align="flex-start">
        <a-space :size="[24,0]" wrap>
          <a-form-item label="开方日期">
            <a-range-picker v-model:value="searchParams.Date" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" :get-popup-container="(trigger) => trigger.parentElement" />
          </a-form-item>
          <a-form-item label="患者信息">
            <a-input v-model:value="searchParams.keyword" placeholder="姓名/手机号/患者号" allowClear />
          </a-form-item>
          <a-form-item label="接诊医师" class="w240px" v-if="ClinicRole==1">
            <a-select  v-model:value="searchParams.docId" placeholder="请选择" allowClear showSearch optionFilterProp="title">
              <a-select-option :value="item.id" v-for="(item,index) in physicianList" :key="index" :title="item.name">{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
        </a-space>
        <a-space>
          <a-button @click="handleResetFilter">重置筛选</a-button>
          <a-button type="primary" @click="getRootExtractionRecord(true)">筛选查询</a-button>
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
              <div class="ml8px">{{record.PatientName}}</div>
              <ManOutlined class="color-[#0A5AFF] ml4px" v-if="record.PatientGender==1" />
              <WomanOutlined class="color-[#f52468] ml4px" v-else />
              <div class="color-[#858D98] ml8px ">{{record.PatientAge}}岁</div>
            </div>
          </template>
          <template v-if="column.dataIndex == 'OrderCode'">
            <span>{{ record.OrderCode }}</span>
            <a-button v-if="record.OrderStatus==1" type="link" size="small" @click="operateOrder(record)">去收款</a-button>
          </template>
          <template v-if="column.dataIndex == 'operation'">
            <a-button type="link" size="small" @click="seeDetail(record,1)">查看</a-button>
            <a-divider type="vertical" />
            <a-button type="link" size="small" @click="seeDetail(record,2)">打印</a-button>
          </template>
        </template>
      </a-table>
    </div>

    <PaymentModal v-model:visible="paymentVisible" :orderInfo="orderInfo" @confirm="completeOperate"></PaymentModal>
  </div>
</template>
<script lang="ts" setup>
  import { ref,reactive,onMounted} from 'vue';
  import {WomanOutlined,ManOutlined} from '@ant-design/icons-vue';
  import { cloneDeep } from 'lodash-es';
  import {PatientApiCtrl} from '/@/api/myy/patient';
  import {AccountApiCtrl} from '/@/api/myy/account';
  import { useGo } from '/@/hooks/web/usePage';
  import { useRoute } from 'vue-router';
  import { useUserStore } from '@/store/modules/user';
  import {ChargeApiCtrl} from '/@/api/myy/charge';
  import PaymentModal from '/@/components/PaymentModal.vue';
  
  const go = useGo();
  const route = useRoute();
  const physicianList=ref([])
  const userStore = useUserStore()
  const ClinicRole=ref(1)
  const orderInfo=ref({})
  const paymentVisible=ref(false)
  const searchParams = ref({
    Date:[],
    keyword:'',
    docId:null,
    patientId:'',
    hasOrder:true,
  })
  const table =ref({
    list: [],
    loading:false,
  })
  const columns=ref([
    {title: '病历号',dataIndex: 'Id',width: 160},
    {title: '患者信息',dataIndex: 'PatientName',width: 220},
    {title: '手机号',dataIndex: 'PatientPhone',width: 140},
    {title: '接诊医师',dataIndex: 'DoctorName',width: 140},
    {title: '开方日期',dataIndex: 'CreateTime',width: 160},
    {title: '订单编号',dataIndex: 'OrderCode',width: 300},
    {title: '订单状态',dataIndex: 'OrderStatusName',width: 140},
    {title: '操作',width: 140 ,dataIndex: 'operation',align:'center',fixed:'right'}
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
      getRootExtractionRecord()
    },
    onChange: (page) => {
      pagination.current = page
      getRootExtractionRecord()
    }
  })

  onMounted(() => {
    searchParams.value.patientId = route.query.patientId ? String(route.query.patientId) : ''
    ClinicRole.value=userStore.getUserInfo.Doctor.ClinicRole
    if(ClinicRole.value==2){
      searchParams.value.docId=userStore.getUserInfo.Doctor.DoctorId
    }
    getStaffList()
    getRootExtractionRecord()
  })

  const getStaffList=()=>{
    AccountApiCtrl.DoctorOptions({}).then(data=>{
      physicianList.value=data
    })
  }

  const handleResetFilter=()=>{
    searchParams.value={
      Date:[],
      keyword:'',
      docId:null,
      patientId:'',
      hasOrder:true,
    }
    getRootExtractionRecord(true)
  }

  // 获取列表
  const getRootExtractionRecord=(isSearch=false)=>{
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
    PatientApiCtrl.VisitList({
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

  const seeDetail=(record,type)=>{
    go('/rootExtraction/detail?orderId='+record.OrderId+'&type='+type)
  }

  const operateOrder=(record,type)=>{
    ChargeApiCtrl.ChargeDetail({orderCode:record.OrderCode}).then(data=>{
      orderInfo.value=data
      paymentVisible.value=true
    }).catch(() => {}).finally(() => {})
  }

  const completeOperate=()=>{
    paymentVisible.value=false
    getRootExtractionRecord()
  }
</script>
<style lang="less" scoped>
</style>
