<template>
  <div class="institution-account-page p-4">
    <a-card class="institution-account-card">
      <div class="institution-account-top flex" v-loading="loading">
        <div class="institution-account-overview flex-sub">
          <div class="institution-account-section-title text-18px text-bold">资金概览</div>
          <div class="institution-account-overview-grid flex mt12px">
            <div class="institution-account-stat-card flex-sub p-16px border-rd-12px bg-[#FAFBFE]">
              <div class="flex align-center">
                <img class="w18px h18px" src="../../assets/images/overviewIcon1.png" alt="">
                <div class="ml4px">利润未提现金额</div>
              </div>
              <div class="text-bold">
                <span class="text-16px">￥</span>
                <span class="text-32px">{{ summaryInfo.AvailableIncomeAmount }}</span>
              </div>
              <div class="mt24px flex align-center justify-between">
                <!-- <div class="flex align-center">
                  <div class="color-[#4E5766]">较上期</div>
                  <div class="ml15px text-bold">
                    <span class="color-[#F74344]" v-if="summaryInfo.AvailableIncomePeriodRate>=0">↑</span>
                    <span class="color-[#24B265]" v-else>↓</span>
                    <span class="ml4px" :class="summaryInfo.AvailableIncomePeriodRate>=0?'color-[#F74344]':'color-[#24B265]'">{{ summaryInfo.AvailableIncomePeriodRate }}%</span>
                  </div>
                </div> -->
                <a-button type="primary" @click="handleApplication">我要提现</a-button>
              </div>
            </div>
            <div class="institution-account-stat-card flex-sub p-16px border-rd-12px bg-[#FAFBFE] ml12px">
              <div class="flex align-center">
                <img class="w18px h18px" src="../../assets/images/overviewIcon2.png" alt="">
                <div class="ml4px">本月已提现金额</div>
              </div>
              <div class="text-bold">
                <span class="text-16px">￥</span>
                <span class="text-32px">{{ summaryInfo.WithdrawMonthAmount }}</span>
              </div>
              <div class="mt24px flex align-center justify-between">
                <div class="flex align-center">
                  <div class="color-[#4E5766]">较上月</div>
                  <div class="ml15px text-bold">
                    <span class="color-[#F74344]" v-if="summaryInfo.WithdrawMonthRate>=0">↑</span>
                    <span class="color-[#24B265]" v-else>↓</span>
                    <span class="ml4px" :class="summaryInfo.WithdrawMonthRate>=0?'color-[#F74344]':'color-[#24B265]'">{{ summaryInfo.WithdrawMonthRate }}%</span>
                  </div>
                </div>
                <a-button type="primary" ghost @click="recordVisible=true">提现记录</a-button>
              </div>
            </div>
            <div class="institution-account-stat-card flex-sub p-16px border-rd-12px bg-[#FAFBFE] ml12px">
              <div class="flex align-center">
                <img class="w18px h18px" src="../../assets/images/overviewIcon3.png" alt="">
                <div class="ml4px">可用小云币</div>
              </div>
              <div class="text-bold">
                <span class="text-16px">￥</span>
                <span class="text-32px">{{summaryInfo.CreditBalance}}</span>
              </div>
              <div class="mt24px flex align-center justify-between">
                <div class="flex align-center">
                  <div class="color-[#4E5766]">较上月</div>
                  <div class="ml15px text-bold">
                    <span class="color-[#F74344]" v-if="summaryInfo.CreditMonthRate>=0">↑</span>
                    <span class="color-[#24B265]" v-else>↓</span>
                    <span class="ml4px" :class="summaryInfo.CreditMonthRate>=0?'color-[#F74344]':'color-[#24B265]'">{{ summaryInfo.CreditMonthRate }}%</span>
                  </div>
                </div>
                <a-button type="primary" ghost @click="logsVisible=true">查看明细</a-button>
              </div>
            </div>
          </div>
        </div>
        <div class="institution-account-payment w540px ml24px">
          <div class="flex align-center">
            <div class="text-18px text-bold">收款信息</div>
            <div class="text-14px color-[#858D98]">（用于利润提现到账）</div>
          </div>
          <a-card class="institution-account-payment-card mt12px">
            <div class="flex" v-if="bankAccounts.Id">
              <img class="w52px h52px" src="../../assets/images/PaymentInfo.png" alt="">
              <div class="ml12px flex-sub">
                <div class="flex align-center justify-between">
                  <div class="text-18px text-bold">{{bankAccounts.BankName}}(尾号{{bankAccounts.BankCardNo.slice(-4)}})</div>
                  <div class="flex">
                    <a-button type="link" size="small" @click="handleBankAccount(2)">修改</a-button>
                    <a-divider type="vertical" />
                    <a-button type="link" size="small" @click="handleUnbind">解除绑定</a-button>
                  </div>
                </div>
                <div class="mt12px color-[#4E5766]">
                  <span>户      名：</span>
                  <span>{{bankAccounts.AccountName}}</span>
                </div>
                <div class="mt4px color-[#4E5766]">
                  <span>开户行：</span>
                  <span>{{bankAccounts.BankName}}</span>
                </div>
                <div class="mt12px color-[#4E5766]">
                  <span>绑定时间：</span>
                  <span>{{ bankAccounts.CreateTime }}</span>
                </div>
              </div>
            </div>

            <div class="h147px flex flex-direction align-center justify-center" v-else>
              <a-button type="primary" @click="handleBankAccount(1)">绑定收款信息</a-button>
              <div class="mt8px">支持对公账户 / 个人银行卡</div>
            </div>
          </a-card>
        </div>
      </div>
      <div class="institution-account-flow mt24px">
        <div class="flex align-center mb12px">
          <div class="w6px h18px bg-[#0A5AFF]"></div>
          <div class="text-18px text-bold ml4px">资金流水明细</div>
        </div>
        <a-flex class="institution-account-main-filter" justify="space-between" align="center">
          <a-space :size="[24,0]" wrap>
            <a-form-item label="时间范围">
              <a-range-picker v-model:value="searchParams.Date" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" :get-popup-container="(trigger) => trigger.parentElement" />
            </a-form-item>
            <a-form-item label="利润信息">
              <a-input class="institution-account-keyword" v-model:value="searchParams.keyword" placeholder="流水号/关联订单号/提现单号/备注" allowClear />
            </a-form-item>
            <a-form-item label="资金状态" class="institution-account-filter-select">
              <a-select v-model:value="searchParams.status" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="institution-account-select-dropdown" :listHeight="220" :virtual="false" :get-popup-container="(trigger) => trigger.parentElement">
                <a-select-option :value="item.id" v-for="(item,index) in ClinicIncomeFlowStatus" :key="index">{{item.name}}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="利润类型" class="institution-account-filter-select">
              <a-select v-model:value="searchParams.flowType" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="institution-account-select-dropdown" :listHeight="220" :virtual="false" :get-popup-container="(trigger) => trigger.parentElement">
                <a-select-option :value="item.id" v-for="(item,index) in ClinicIncomeFlowType" :key="index">{{item.name}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-space>
          <a-space class="institution-account-filter-actions">
            <a-button class="institution-account-button" @click="handleResetFilter">重置筛选</a-button>
            <a-button class="institution-account-button" type="primary" @click="getFlowList(true)">筛选查询</a-button>
            <a-button class="institution-account-button" type="primary" ghost @click="handleExport">导出</a-button>
          </a-space>
        </a-flex>
        <div class="institution-account-flow-table-scroll">
        <a-table class="institution-account-main-table"
                  :data-source="table.list"
                  :columns="columns"
                  row-key="Id"
                  :loading="table.loading"
                  :pagination="pagination"
                  :scroll="{x:1340}">
          <template #bodyCell="{column,record,index}">
            <template v-if="column.dataIndex == 'TypeName'">
              <a-tag :bordered="false" :color="record.Type==0?'processing':record.Type==1?'success':record.Type==2?'orange':'red'">{{record.TypeName}}</a-tag>
            </template>
            <template v-if="column.dataIndex == 'Amount'">
              <span class="institution-account-table-amount">￥{{ formatAmount(record.Amount) }}</span>
            </template>
            <template v-if="column.dataIndex == 'StatusName'">
              <a-badge :color="record.Status==0?'yellow':record.Status==4?'blue':'green'" :text="record.StatusName" />
              <div class="text-12px color-[#858D98] mt4px">到账时间：{{ record.ArriveTime }}</div>
            </template>
            <template v-if="column.dataIndex == 'BankName'">
              <span>{{ record.BankName }}</span>
              <span v-if="record.BankCardNo">（{{ record.BankCardNo.slice(-4) }}）</span>
            </template>
          </template>
        </a-table>
        </div>
      </div>
    </a-card>

    <a-modal v-model:open="withdrawModal.visible" title="提现申请" centered width="640px" @ok="confirmApplication" :maskClosable="false" destroyOnClose wrapClassName="institution-account-form-modal">
      <section class="institution-account-form-modal-body padding-lr32 formModal">
        <a-form :model="withdrawModal.form" :labelCol="{ style: 'width: 100px' }" :wrapperCol="{span:16}" :rules="withdrawModal.rules" ref="formIns">
          <a-form-item label="提现金额" name="Amount" :extra="`当前可提现金额${summaryInfo.AvailableIncomeAmount}元`">
            <a-input-number class="institution-account-input-number" v-model:value="withdrawModal.form.Amount" :min="0"  />
          </a-form-item>
          <a-form-item label="备注" name="Remark">
            <a-textarea v-model:value="withdrawModal.form.Remark" placeholder="请填写" :rows="2" />
          </a-form-item>
        </a-form>
      </section>
    </a-modal>

    <a-modal v-model:open="bankAccountModal.visible" title="提现申请" centered width="680px" @ok="confirmBankAccount" :maskClosable="false" destroyOnClose wrapClassName="institution-account-form-modal">
      <section class="institution-account-form-modal-body padding-lr32 formModal">
        <a-form :model="bankAccountModal.form" :labelCol="{ style: 'width: 120px' }" :wrapperCol="{span:16}" :rules="bankAccountModal.rules" ref="bankAccountFormIns">
          <a-form-item label="账户类型" name="AccountType">
            <a-radio-group v-model:value="bankAccountModal.form.AccountType">
              <a-radio :value="item.id" v-for="(item,index) in ClinicBankAccountType" :key="index">{{ item.name }}</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="账户名称" name="AccountName">
            <a-input v-model:value="bankAccountModal.form.AccountName" placeholder="请填写" allowClear />
          </a-form-item>
          <template v-if="bankAccountModal.form.AccountType==204">
            <a-form-item label="开户支行" name="BranchName">
              <a-select v-model:value="bankAccountModal.form.BranchName" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="institution-account-select-dropdown" :listHeight="220" :virtual="false" @select="(e,b)=>{bankAccountModal.form.CnapsCode=b.ChannelNo}" @search="searchBranch">
                <a-select-option :value="item.Name" v-for="(item,index) in bankChannel" :key="index" :title="item.Name" :ChannelNo="item.ChannelNo">{{item.Name}}</a-select-option>
              </a-select>
            </a-form-item>
          </template>
          <template v-if="bankAccountModal.form.AccountType==201">
            <a-form-item label="身份证号" name="IdCardNo">
              <a-input v-model:value="bankAccountModal.form.IdCardNo" placeholder="请填写" allowClear />
            </a-form-item>
          </template>
          <a-form-item label="开户行" name="BankName">
            <a-select v-model:value="bankAccountModal.form.BankName" placeholder="请选择" allowClear showSearch optionFilterProp="title" dropdownClassName="institution-account-select-dropdown" :listHeight="220" :virtual="false">
              <a-select-option :value="item.Name" v-for="(item,index) in banksList" :key="index" :title="item.Name">{{item.Name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="银行卡号" name="BankCardNo">
            <a-input v-model:value="bankAccountModal.form.BankCardNo" placeholder="请填写" allowClear />
          </a-form-item>
          <a-form-item label="银行预留手机号" name="BankReservedPhone">
            <a-input v-model:value="bankAccountModal.form.BankReservedPhone" placeholder="请填写" allowClear />
          </a-form-item>
          <a-form-item label="备注" name="Remark">
            <a-textarea v-model:value="bankAccountModal.form.Remark" placeholder="请填写" :rows="2" />
          </a-form-item>
        </a-form>
      </section>
    </a-modal>

    <a-modal v-model:open="recordVisible" title="提现记录" centered width="1480px" :footer="null" :maskClosable="false" wrapClassName="institution-account-list-modal" forceRender>
      <WithdrawalHistory></WithdrawalHistory>
    </a-modal>

    <a-modal v-model:open="logsVisible" title="小云币明细" centered width="1120px" :footer="null" :maskClosable="false" wrapClassName="institution-account-list-modal" forceRender>
      <CreditLogs></CreditLogs>
    </a-modal>

    <a-modal
      v-model:open="exportModal.visible"
      centered
      width="580px"
      :footer="null"
      :maskClosable="false"
      destroyOnClose
      wrapClassName="institution-account-export-modal"
    >
      <section class="institution-account-export-dialog">
        <div class="institution-account-export-header">
          <div>
            <div class="institution-account-export-title">导出资金流水明细</div>
            <div class="institution-account-export-subtitle">系统将按照当前筛选条件生成 Excel 文件</div>
          </div>
        </div>
        <div class="institution-account-export-summary">
          <div class="institution-account-export-item">
            <span>时间范围</span>
            <strong>{{ exportDateText }}</strong>
          </div>
          <div class="institution-account-export-item">
            <span>利润信息</span>
            <strong>{{ exportKeywordText }}</strong>
          </div>
          <div class="institution-account-export-item">
            <span>资金状态</span>
            <strong>{{ exportStatusText }}</strong>
          </div>
          <div class="institution-account-export-item">
            <span>利润类型</span>
            <strong>{{ exportFlowTypeText }}</strong>
          </div>
          <div class="institution-account-export-item">
            <span>当前数据</span>
            <strong>{{ pagination.total }} 条</strong>
          </div>
        </div>
        <div class="institution-account-export-note">
          <span></span>
          <p>导出内容为当前筛选后的资金流水明细，数据量较大时请耐心等待。</p>
        </div>
        <div class="institution-account-export-actions">
          <a-button class="institution-account-export-button" @click="exportModal.visible=false">取消</a-button>
          <a-button class="institution-account-export-button institution-account-export-primary" type="primary" :loading="exportModal.loading" @click="confirmExport">确认导出</a-button>
        </div>
      </section>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { ref,onMounted,reactive,computed,} from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { cloneDeep } from 'lodash-es';
  import {FinanceApiCtrl} from '/@/api/myy/finance';
  import {basicEnum,banksDropdown} from '/@/api/platform/common';
  import {GetBankChannel} from '/@/api/platform/joinPay';
  import WithdrawalHistory from './components/WithdrawalHistory.vue';
  import CreditLogs from './components/CreditLogs.vue';

  const { createMessage,createConfirm} = useMessage()
  const loading=ref(false)
  const formIns=ref()
  const ClinicIncomeFlowType=ref([])
  const ClinicIncomeFlowStatus=ref([])
  const ClinicBankAccountType=ref([])
  const summaryInfo=ref({})
  const bankAccountFormIns=ref()
  const banksList=ref([])
  const recordVisible=ref(false)
  const logsVisible=ref(false)
  const bankChannel=ref([])
  const bankAccounts=ref({
    Id:''
  })
  const searchParams = ref({
    Date:[],
    keyword:'',
    flowType:null,
    status:null,
  })
  const table =ref({
    list: [],
    loading:false,
  })
  const exportModal=ref({
    visible:false,
    loading:false,
  })
  const columns=ref([
    {title: '流水号',dataIndex: 'FlowNo',width: 220},
    {title: '利润类型',dataIndex: 'FlowTypeName',width: 140},
    {title: '类型',dataIndex: 'TypeName',width: 130},
    {title: '关联订单号',dataIndex: 'OrderCode',width: 230},
    {title: '金额（元）',dataIndex: 'Amount',width: 130,align:'right',className:'institution-account-number-column',customHeaderCell: () => ({ class: 'institution-account-number-column' })},
    {title: '状态&到账日期',dataIndex:'StatusName',width: 210},
    {title: '到账账户',dataIndex: 'BankName',width: 180},
    {title: '备注',dataIndex: 'Remark',width: 180}
  ])
  const withdrawModal=ref({
    visible:false,
    loading:false,
    form:{
      BankAccountId:null,
      Amount:null,
      Remark:'',
    },
    rules: {
      Amount: [{required: true,trigger: 'blur',message: '该项必须填写',type:'number'}],
    }
  })
  const bankAccountForm={
    Id: 0,
    AccountType: 204,
    BankName:null,
    BranchName:null,
    AccountName:'',
    BankCardNo:'',
    BankReservedPhone:'',
    CnapsCode:'',
    IdCardNo:'',
    IsDefault:true,
    Remark:''
  }
  const bankAccountModal=ref({
    visible:false,
    loading:false,
    type:1,
    form:cloneDeep(bankAccountForm),
    rules: {
      AccountType: [{required: true,trigger: 'change',message: '该项必须选择',type:'number'}],
      BankName: [{ required: true, trigger: 'change', message: '该项必须选择', type: 'string' }],
      BranchName: [{ required: true, trigger: 'change', message: '该项必须选择', type: 'string' }],
      AccountName: [{ required: true, trigger: 'blur', message: '该项必须填写', type: 'string' }],
      BankCardNo: [{ required: true, trigger: 'blur', message: '该项必须填写', type: 'string' }],
      BankReservedPhone: [{ required: true, trigger: 'blur', message: '该项必须填写', type: 'string' }],
      CnapsCode: [{ required: true, trigger: 'change', message: '该项必须选择', type: 'string' }],
      IdCardNo: [{ required: true, trigger: 'blur', message: '该项必须填写', type: 'string' }],
    }
  })

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
      getFlowList()
    },
    onChange: (page) => {
      pagination.current = page
      getFlowList()
    }
  })

  onMounted(() => {
    getFinanceAccount()
    getBankChannelList()
    getBasicEnum()
    getFlowList()
    getBanksDropdown()
    getBankAccounts()
  })

  const formatAmount=(value)=>{
    const amount = Number(value)
    if (!Number.isFinite(amount)) {
      return '0.00'
    }
    return amount.toFixed(2)
  }

  const getBasicEnum=()=>{
    basicEnum({name:'ClinicIncomeFlowStatus'}).then(data=>{
      ClinicIncomeFlowStatus.value=data
    })
    basicEnum({name:'ClinicIncomeFlowType'}).then(data=>{
      ClinicIncomeFlowType.value=data
    })
    basicEnum({name:'ClinicBankAccountType'}).then(data=>{
      ClinicBankAccountType.value=data
    })
  }

  const getBanksDropdown=()=>{
    banksDropdown().then(data=>{
      banksList.value=data
    })
  }

  const searchBranch=(e)=>{
    getBankChannelList(e)
  }

  const getBankChannelList=(name='')=>{
    GetBankChannel({name:name,page:1,limit:100}).then(data=>{
      bankChannel.value=data.Rows
    })
  }

  const getBankAccounts=()=>{
    FinanceApiCtrl.BankAccounts({}).then(data=>{
      if(data.Rows.length){
        bankAccounts.value=data.Rows[0]
      }else{
        bankAccounts.value={
          Id:'',
        }
      }
    }).catch(() => {}).finally(() => {})
  }

  const getFinanceAccount=()=>{
    loading.value=true
    FinanceApiCtrl.Account({}).then(data=>{
      summaryInfo.value=data.Overview
    }).catch(() => {}).finally(() => {loading.value=false })
  }

  const handleResetFilter=()=>{
    searchParams.value={
      Date:[],
      keyword:'',
      flowType:null,
      status:null,
    }
    getFlowList(true)
  }


  // 获取列表
  const getFlowList=(isSearch=false)=>{
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
    FinanceApiCtrl.FlowList({
      page:pagination.current,
      limit:pagination.pageSize,
      ...query
    }).then(data=>{
      table.value.loading=false
      table.value.list=data.Rows
      pagination.total=data.TotalItemCount
    }).catch(() => {}).finally(() => { table.value.loading=false })
  }

  const exportDateText = computed(() => {
    const date = searchParams.value.Date || []
    if (date[0] && date[1]) {
      return `${date[0]} 至 ${date[1]}`
    }
    return '全部时间'
  })

  const exportKeywordText = computed(() => searchParams.value.keyword || '全部流水')

  const exportStatusText = computed(() => {
    const status = ClinicIncomeFlowStatus.value.find((item) => item.id === searchParams.value.status)
    return status?.name || '全部状态'
  })

  const exportFlowTypeText = computed(() => {
    const flowType = ClinicIncomeFlowType.value.find((item) => item.id === searchParams.value.flowType)
    return flowType?.name || '全部类型'
  })

  const handleExport=()=>{
    exportModal.value.visible=true
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
    FinanceApiCtrl.ExportFlow(query).then(data=>{
      const link = document.createElement('a');
      link.setAttribute('target', "_blank")
      link.style.display = 'none';
      link.href = `${location.origin}${data.File}`;
      link.download = '资金流水明细.xlsx';
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

  const handleBankAccount=(type)=>{
    if(type==1){
      bankAccountModal.value.form=cloneDeep(bankAccountForm)
    }else{
      bankAccountModal.value.form=cloneDeep(bankAccounts.value)
    }
    bankAccountModal.value.visible=true
  }

  const confirmBankAccount=()=>{
    bankAccountFormIns.value.validate().then(() => {
      bankAccountModal.value.loading = true
      const formData = cloneDeep(bankAccountModal.value.form)
      FinanceApiCtrl.SaveBankAccount(formData).then(data=>{
        createMessage.success('保存成功')
        bankAccountModal.value.visible=false
        getBankAccounts()
      }).catch(() => {}).finally(() => {bankAccountModal.value.loading = false })
    })
  }

  const handleUnbind=()=>{
    createConfirm({
      iconType: 'warning',
      title: '该收款信息确定解除绑定吗？',
      onOk :() => {
        loading.value=true
        FinanceApiCtrl.DeleteBankAccount({id:bankAccounts.value.Id}).then(data=>{
          createMessage.success('操作成功')
          getBankAccounts()
        }).catch(() => {}).finally(() => { loading.value=false })
      }
    })
  }
  
  const handleApplication=()=>{
    if(summaryInfo.value.AvailableIncomeAmount==0){
      createMessage.warning('暂无可提现金额')
      return
    }
    if(!bankAccounts.value.Id){
      createMessage.warning('请先绑定收款信息')
      return
    }
    withdrawModal.value.form={
      BankAccountId:bankAccounts.value.Id,
      Amount:null,
      Remark:'',
    }
    withdrawModal.value.visible=true
  }

  const confirmApplication=()=>{
    formIns.value.validate().then(() => {
      withdrawModal.value.loading = true
      const formData = cloneDeep(withdrawModal.value.form)
      FinanceApiCtrl.ApplyWithdraw(formData).then(data=>{
        createMessage.success('操作成功')
        withdrawModal.value.visible=false
        getFinanceAccount()
      }).catch(() => {}).finally(() => {withdrawModal.value.loading = false })
    })
  }
</script>
<style lang="less" scoped>
.institution-account-page {
  background: #f4f7f9;
}

.institution-account-card {
  overflow: hidden;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #fff;

  :deep(.ant-card-body) {
    padding: 18px;
  }
}

.institution-account-top {
  align-items: stretch;
  gap: 24px;
}

.institution-account-overview {
  min-width: 0;
}

.institution-account-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1d2533;
  font-size: 18px;
  font-weight: 500;
  line-height: 26px;

  &::before {
    display: inline-block;
    width: 5px;
    height: 18px;
    border-radius: 999px;
    background: #0a5aff;
    content: '';
  }

  em {
    color: #858d98;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
  }
}

.institution-account-overview-grid {
  gap: 12px;
}

.institution-account-stat-card {
  min-height: 166px;
  margin-left: 0 !important;
  border: 1px solid #e8eef7;
  background: #f9fbfd !important;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;

  &:hover {
    border-color: #cfe0ff;
    box-shadow: 0 10px 26px rgba(32, 48, 75, 0.08);
    transform: translateY(-1px);
  }

  .flex.align-center:first-child {
    gap: 6px;
    color: #5f6a7a;
    font-weight: 400;
  }

  > .text-bold {
    margin-top: 10px;
    color: #1d2533;
    font-variant-numeric: tabular-nums;
  }

  .text-16px {
    color: #5f6a7a;
    font-weight: 400;
  }

  .text-32px {
    font-weight: 500;
  }

  > .mt24px {
    align-items: center;
  }

  > .mt24px .flex.align-center {
    align-items: center;
  }

  > .mt24px .ml15px.text-bold {
    display: inline-flex;
    align-items: center;
    margin-top: 0;
    line-height: 20px;
  }

  > .mt24px .ml15px.text-bold .ml4px {
    display: inline-flex;
    align-items: center;
    line-height: 20px;
  }
}

.institution-account-stat-card + .institution-account-stat-card {
  margin-left: 0 !important;
}

.institution-account-rate {
  color: #5f6a7a;
  font-weight: 400;

  .text-bold,
  .ml15px {
    font-weight: 500;
  }
}

.institution-account-payment {
  flex-shrink: 0;
}

.institution-account-payment-card {
  height: calc(100% - 38px);
  overflow: hidden;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #f9fbfd;

  :deep(.ant-card-body) {
    height: 100%;
    min-height: 166px;
    padding: 18px;
  }
}

.institution-account-payment-card .flex[v-if],
.institution-account-payment-card .flex {
  min-width: 0;
}

.institution-account-payment-card :deep(.ant-btn-link) {
  height: 26px;
  padding: 0 4px;
  border-radius: 8px;
  font-weight: 400;

  &:hover {
    background: #eef5ff;
  }
}

.institution-account-payment-card .text-18px {
  color: #1d2533;
  font-weight: 500;
}

.institution-account-payment-card .color-\[\#4E5766\] {
  color: #5f6a7a !important;
  line-height: 24px;
}

.institution-account-flow {
  padding-top: 18px;
  border-top: 1px dashed #dce6f5;
}

.institution-account-flow .flex.align-center.mb12px {
  margin-bottom: 12px;

  .w6px {
    display: none;
  }
}

.institution-account-main-filter {
  align-items: center !important;
  margin-bottom: 14px;
  padding: 14px;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #f9fbfd;

  :deep(.ant-form-item) {
    margin-bottom: 0;
  }

  :deep(.ant-form-item-label > label) {
    color: #5f6a7a;
    font-weight: 400;
  }
}

.institution-account-keyword {
  width: 300px;
}

.institution-account-filter-select {
  width: 220px;
}

.institution-account-filter-actions {
  align-self: center;
}

.institution-account-button {
  min-width: 86px;
  border-radius: 8px;
}

.institution-account-flow-table-scroll {
  max-height: calc(100vh - 420px);
  padding-right: 8px;
  overflow-x: hidden;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: #cdd8ea;
  }

  &::-webkit-scrollbar-track {
    border-radius: 999px;
    background: #f4f7fb;
  }
}

.institution-account-main-table {
  overflow: hidden;
  border: 1px solid #e8eef7;
  border-radius: 12px;

  :deep(.ant-table) {
    border-radius: 12px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #f9fbfd !important;
    border-bottom: 1px solid #e8eef7 !important;
    color: #5f6a7a;
    font-weight: 400;
  }

  :deep(.ant-table-tbody > tr > td) {
    border-bottom: 1px dashed #dce6f5 !important;
    color: #1d2533;
  }

  :deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
    background: #eef5ff !important;
  }

  :deep(.ant-pagination) {
    margin: 14px 4px 2px;
  }
}

.institution-account-table-amount {
  display: block;
  color: #1d2533;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

:deep(.institution-account-number-column) {
  text-align: right;
}

:deep(th.institution-account-number-column .ant-table-column-title) {
  display: block;
  text-align: right;
}

.institution-account-type-tag {
  min-width: 58px;
  border-radius: 8px;
  text-align: center;
  font-weight: 400;
}

:deep(.institution-account-main-filter .ant-input-affix-wrapper),
:deep(.institution-account-main-filter .ant-picker),
:deep(.institution-account-main-filter .ant-select-selector),
:deep(.institution-account-form-modal-body .ant-input-affix-wrapper),
:deep(.institution-account-form-modal-body .ant-input),
:deep(.institution-account-form-modal-body .ant-input-number),
:deep(.institution-account-form-modal-body .ant-select-selector),
:deep(.institution-account-form-modal-body textarea.ant-input) {
  border-color: #dce6f5 !important;
  border-radius: 8px !important;
  background: #fff;
  box-shadow: none !important;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

:deep(.institution-account-main-filter .ant-input-affix-wrapper:hover),
:deep(.institution-account-main-filter .ant-input-affix-wrapper-focused),
:deep(.institution-account-main-filter .ant-picker:hover),
:deep(.institution-account-main-filter .ant-picker-focused),
:deep(.institution-account-main-filter .ant-select:hover .ant-select-selector),
:deep(.institution-account-main-filter .ant-select-focused .ant-select-selector),
:deep(.institution-account-form-modal-body .ant-input-affix-wrapper:hover),
:deep(.institution-account-form-modal-body .ant-input-affix-wrapper-focused),
:deep(.institution-account-form-modal-body .ant-input:hover),
:deep(.institution-account-form-modal-body .ant-input:focus),
:deep(.institution-account-form-modal-body .ant-input-number:hover),
:deep(.institution-account-form-modal-body .ant-input-number-focused),
:deep(.institution-account-form-modal-body .ant-select:hover .ant-select-selector),
:deep(.institution-account-form-modal-body .ant-select-focused .ant-select-selector),
:deep(.institution-account-form-modal-body textarea.ant-input:hover),
:deep(.institution-account-form-modal-body textarea.ant-input:focus) {
  border-color: #0a5aff !important;
  box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
}

:deep(.institution-account-main-filter .ant-input-affix-wrapper .ant-input),
:deep(.institution-account-main-filter .ant-input-affix-wrapper .ant-input:hover),
:deep(.institution-account-main-filter .ant-input-affix-wrapper .ant-input:focus),
:deep(.institution-account-form-modal-body .ant-input-affix-wrapper .ant-input),
:deep(.institution-account-form-modal-body .ant-input-affix-wrapper .ant-input:hover),
:deep(.institution-account-form-modal-body .ant-input-affix-wrapper .ant-input:focus) {
  border-color: transparent !important;
  background: transparent !important;
  box-shadow: none !important;
}

.institution-account-input-number {
  width: 220px;

  :deep(.ant-input-number-input) {
    padding-right: 34px;
    text-align: right;
  }
}

:deep(.institution-account-select-dropdown) {
  padding: 6px;
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(29, 37, 51, 0.12);
}

:deep(.institution-account-select-dropdown .ant-select-item) {
  min-height: 34px;
  border-radius: 8px;
  transition: background-color 0.16s ease, color 0.16s ease;
}

:deep(.institution-account-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled)) {
  background: #eef5ff;
}

:global(.institution-account-form-modal .ant-modal-content) {
  overflow: hidden;
  border-radius: 28px;
  box-shadow: 0 16px 40px rgba(32, 48, 75, 0.14);
}

:global(.institution-account-form-modal .ant-modal-header) {
  padding: 22px 32px 16px;
  border-bottom: none;
}

:global(.institution-account-form-modal .ant-modal-body) {
  padding: 8px 28px 24px;
}

:global(.institution-account-export-modal .ant-modal-content) {
  overflow: hidden;
  padding: 0;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 24px 56px rgba(31, 43, 61, 0.16);
}

:global(.institution-account-export-modal .ant-modal-close) {
  top: 18px;
  right: 18px;
  border-radius: 8px;
}

:global(.institution-account-export-modal .ant-modal-close:hover) {
  background: #eef5ff;
}

:global(.institution-account-export-modal .ant-modal-body) {
  padding: 0;
}

.institution-account-export-dialog {
  padding: 32px 34px 28px;
  background:
    linear-gradient(180deg, #f9fbfd 0%, #fff 40%),
    #fff;
}

.institution-account-export-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 22px;
  border-bottom: 1px dashed #dce6f5;
}

.institution-account-export-title {
  color: #1d2533;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}

.institution-account-export-subtitle {
  margin-top: 5px;
  color: #5f6a7a;
  font-size: 13px;
  line-height: 20px;
}

.institution-account-export-summary {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 20px 0 18px;
  border-bottom: 1px dashed #dce6f5;
}

.institution-account-export-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid #e8eef7;
  border-radius: 10px;
  background: #f9fbfd;
}

.institution-account-export-item span {
  color: #5f6a7a;
  font-size: 13px;
  font-weight: 400;
}

.institution-account-export-item strong {
  max-width: 350px;
  overflow: hidden;
  color: #1d2533;
  font-size: 14px;
  font-weight: 500;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.institution-account-export-note {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding: 12px 14px;
  border: 1px solid #e8eef7;
  border-radius: 10px;
  background: #fffdec;
}

.institution-account-export-note span {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  margin-top: 7px;
  border-radius: 50%;
  background: #f5b849;
}

.institution-account-export-note p {
  margin: 0;
  color: #5f6a7a;
  font-size: 13px;
  line-height: 20px;
}

.institution-account-export-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
}

.institution-account-export-button {
  height: 40px;
  border-radius: 8px;
  font-weight: 400;
}

.institution-account-export-primary {
  background: #0a5aff;
}
</style>
