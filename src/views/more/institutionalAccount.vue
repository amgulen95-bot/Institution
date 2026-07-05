<template>
  <div class="p-4">
    <a-card>
      <div class="flex" v-loading="loading">
        <div class="flex-sub">
          <div class="text-18px text-bold">资金概览</div> 
          <div class="flex mt12px">
            <div class="flex-sub p-16px border-rd-12px bg-[#FAFBFE]">
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
            <div class="flex-sub p-16px border-rd-12px bg-[#FAFBFE] ml12px">
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
            <div class="flex-sub p-16px border-rd-12px bg-[#FAFBFE] ml12px">
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
        <div class="w540px ml24px">
          <div class="flex align-center">
            <div class="text-18px text-bold">收款信息</div>
            <div class="text-14px color-[#858D98]">（用于利润提现到账）</div>
          </div>
          <a-card class="mt12px">
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
      <div class="mt24px">
        <div class="flex align-center mb12px">
          <div class="w6px h18px bg-[#0A5AFF]"></div>
          <div class="text-18px text-bold ml4px">资金流水明细</div>
        </div>
        <a-flex justify="space-between" align="flex-start">
          <a-space :size="[24,0]" wrap>
            <a-form-item label="时间范围">
              <a-range-picker v-model:value="searchParams.Date" :placeholder="['开始日期', '结束日期']" valueFormat="YYYY-MM-DD" :get-popup-container="(trigger) => trigger.parentElement" />
            </a-form-item>
            <a-form-item label="利润信息">
              <a-input v-model:value="searchParams.keyword" placeholder="流水号/关联订单号/提现单号/备注" allowClear />
            </a-form-item>
            <a-form-item label="资金状态" class="w240px">
              <a-select v-model:value="searchParams.status" placeholder="请选择" allowClear>
                <a-select-option :value="item.id" v-for="(item,index) in ClinicIncomeFlowStatus" :key="index">{{item.name}}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="利润类型" class="w240px">
              <a-select v-model:value="searchParams.flowType" placeholder="请选择" allowClear>
                <a-select-option :value="item.id" v-for="(item,index) in ClinicIncomeFlowType" :key="index">{{item.name}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-space>
          <a-space>
            <a-button @click="handleResetFilter">重置筛选</a-button>
            <a-button type="primary" @click="getFlowList(true)">筛选查询</a-button>
            <a-button type="primary" ghost @click="handleExport">导出</a-button>
          </a-space>
        </a-flex>
        <a-table :data-source="table.list"
                  :columns="columns"
                  row-key="Id"
                  :loading="table.loading"
                  :pagination="pagination"
                  :scroll="{x:1000,y:'calc(100vh - 550px)'}">
          <template #bodyCell="{column,record,index}">
            <template v-if="column.dataIndex == 'TypeName'">
              <a-tag :bordered="false" :color="record.Type==0?'processing':record.Type==1?'success':record.Type==2?'orange':'red'">{{record.TypeName}}</a-tag>
            </template>
            <template v-if="column.dataIndex == 'Amount'">
              <span class="text-bold">￥{{ record.Amount }}</span>
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
    </a-card>

    <a-modal v-model:open="withdrawModal.visible" title="提现申请" centered width="600px" @ok="confirmApplication" :maskClosable="false" destroyOnClose>
      <section class="padding-lr32 formModal">
        <a-form :model="withdrawModal.form" :labelCol="{ style: 'width: 100px' }" :wrapperCol="{span:16}" :rules="withdrawModal.rules" ref="formIns">
          <a-form-item label="提现金额" name="Amount" :extra="`当前可提现金额${summaryInfo.AvailableIncomeAmount}元`">
            <a-input-number id="inputNumber" v-model:value="withdrawModal.form.Amount" :min="0"  />
          </a-form-item>
          <a-form-item label="备注" name="Remark">
            <a-textarea v-model:value="withdrawModal.form.Remark" placeholder="请填写" :rows="2" />
          </a-form-item>
        </a-form>
      </section>
    </a-modal>

    <a-modal v-model:open="bankAccountModal.visible" title="提现申请" centered width="600px" @ok="confirmBankAccount" :maskClosable="false" destroyOnClose>
      <section class="padding-lr32 formModal">
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
              <a-select v-model:value="bankAccountModal.form.BranchName" placeholder="请选择" allowClear showSearch optionFilterProp="title" @select="(e,b)=>{bankAccountModal.form.CnapsCode=b.ChannelNo}" @search="searchBranch">
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
            <a-select v-model:value="bankAccountModal.form.BankName" placeholder="请选择" allowClear showSearch optionFilterProp="title">
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
  </div>
</template>
<script lang="ts" setup>
  import { ref,onMounted,reactive,} from 'vue';
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
  const columns=ref([
    {title: '流水号',dataIndex: 'FlowNo',width: 210},
    {title: '利润类型',dataIndex: 'FlowTypeName',width: 140},
    {title: '类型',dataIndex: 'TypeName',width: 140},
    {title: '关联订单号',dataIndex: 'OrderCode',width: 200},
    {title: '金额（元）',dataIndex: 'Amount',width: 120},
    {title: '状态&到账日期',dataIndex:'StatusName',width: 200},
    {title: '到账账户',dataIndex: 'BankName',width: 180},
    {title: '备注',dataIndex: 'Remark',width: 160}
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
        FinanceApiCtrl.ExportFlow(query).then(data=>{
          const link = document.createElement('a');
          link.setAttribute('target', "_blank")
          link.style.display = 'none';
          link.href = `${location.origin}${data.File}`;
          link.download = '资金流水明细.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          createMessage.success('导出成功',1.5);
        }).catch(() => {}).finally(() => { table.value.loading=false })
      }
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
</style>
