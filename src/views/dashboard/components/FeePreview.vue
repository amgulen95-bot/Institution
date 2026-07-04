<template>
  <div>
    <a-modal v-model:open="feeDetailModal.visible" centered width="700px" :maskClosable="false" destroyOnClose>
      <template #title>
        <a-space :size="12">
          <img class="w48px h48px" src="../../../assets/images/FeeIcon.png" alt="">
          <div>
            <div class="text-20px text-bold">费用预览</div>
            <div class="color-[#D1A03D] text-normal">此处可预览费用，也可修改整单金额，修改后系统自动调整各个药材的均价</div>
          </div>
        </a-space>
      </template>
      <section class="padding-lr32">
        <a-table :data-source="table.list"
                  :columns="columns"
                  row-key="Id"
                  :loading="feeDetailModal.loading"
                  :pagination="false"
                  :scroll="{x:550,y:`calc(100vh - 300px)`}">
          <template #bodyCell="{ column, record,index}">
            <template v-if="column.dataIndex == 'Sort'">
              <span>{{index+1}}</span>
            </template>
            <template v-if="column.dataIndex == 'Count'">
              <span>{{record.Count}}g</span>
            </template>
          </template>
        </a-table>
      </section>
      <template #footer>
        <div class="flex justify-between align-center">
          <div class="flex align-center border border-color-[#F6F8FC] border-rd-8px pr12px">
            <div class="bg-[#F6F8FC] p8px">整单金额</div>
            <a-input-number style="width: 100px !important;" id="inputNumber" size="small" :controls="false" v-model:value="premiumAmount" :bordered="false" :min="originallyAmount" />
            <div>元</div>
          </div>
          <a-space>
            <a-button type="primary" ghost @click="resetAmount">重置金额</a-button>
            <a-button type="primary" @click="confirm">确认修改</a-button>
            <a-button type="primary" @click="confirmSave">保存</a-button>
          </a-space>
        </div>
      </template>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { ref,watch} from 'vue';
  import { cloneDeep } from 'lodash-es';
  import {PrescriptApiCtrl} from '/@/api/myy/prescript';

  const props = defineProps({
    listData: Array,
    fee: Object,
    originallyAmount:{ type: Number, default: 0 },
    visible: { type: Boolean, default: false },
  });
  const emit = defineEmits(['update:visible', 'confirm'])
  const table = ref({ list: [] as any[] })
  const columns=ref([
    {title: '序号',dataIndex: 'Sort',width: 80},
    {title: '药材名称',dataIndex: 'MaterialName',width: 140},
    {title: '单价',dataIndex: 'Price',width: 120},
    {title: '数量',dataIndex: 'Count',width: 120},
    {title: '金额',dataIndex: 'AdjustedAmount',width: 120},
  ])
  const feeInfo=ref({})
  const premiumAmount=ref(0)

  watch(() => props.listData, (newVal) => {
    if (newVal) table.value.list = newVal;
  }, { immediate: true })

  watch(() => props.fee, (newVal) => {
    if (newVal){
      feeInfo.value = newVal
      premiumAmount.value=(feeInfo.value.OriginalAmount+feeInfo.value.RetailMarkupAmount+feeInfo.value.PremiumAmount).toFixed(2)
    }
  }, { immediate: true })

  const feeDetailModal=ref({
    loading:false,
    visible:false,
  })
  
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      feeDetailModal.value.visible = true
    }
  })

  watch(() => feeDetailModal.value.visible, (newVal) => {
    if (!newVal) {
      emit('update:visible', false)
    }
  })

  const confirm=()=>{
    feeDetailModal.value.loading=true
    PrescriptApiCtrl.CalculateFee({
      items:table.value.list,
      premiumAmount:premiumAmount.value,
      registrationFee:feeInfo.value.RegistrationFee
    }).then(data=>{
      table.value.list=data.Items
      feeInfo.value=data.Fee
    }).catch(() => {}).finally(() => {feeDetailModal.value.loading=false})
  }

  const confirmSave=()=>{
    feeDetailModal.value.visible=false
    emit('confirm',{
      Items:table.value.list,
      Fee:feeInfo.value
    })
  }

  const resetAmount=()=>{
    premiumAmount.value=props.originallyAmount
    confirm()
  }
</script>
<style lang="less" scoped>
</style>
