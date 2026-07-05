<template>
  <div>
    <a-modal v-model:open="feeDetailModal.visible" centered width="820px" wrapClassName="fee-preview-modal" :maskClosable="false" destroyOnClose>
      <template #title>
        <a-space class="fee-preview-title" :size="12">
          <img class="fee-preview-title__icon" src="../../../assets/images/FeeIcon.png" alt="">
          <div class="fee-preview-title__content">
            <div class="fee-preview-title__text">费用预览</div>
            <div class="fee-preview-title__desc">此处可预览药费明细，也可修改整单药费金额，修改后系统自动调整各个药材的均价</div>
          </div>
        </a-space>
      </template>
      <section class="fee-preview-body">
        <div class="fee-preview-table-scroll">
          <a-table :data-source="table.list"
                    class="fee-preview-table"
                    :columns="columns"
                    row-key="Id"
                    :loading="feeDetailModal.loading"
                    :pagination="false">
            <template #bodyCell="{ column, record,index}">
              <template v-if="column.dataIndex == 'Sort'">
                <span>{{index+1}}</span>
              </template>
              <template v-if="column.dataIndex == 'Price'">
                <span>{{formatAmount(record.Price)}}</span>
              </template>
              <template v-if="column.dataIndex == 'Count'">
                <span>{{record.Count}}g</span>
              </template>
              <template v-if="column.dataIndex == 'AdjustedAmount'">
                <span class="fee-preview-table__amount">{{formatAmount(record.AdjustedAmount)}}</span>
              </template>
            </template>
          </a-table>
        </div>
      </section>
      <template #footer>
        <div class="fee-preview-footer">
          <div class="fee-preview-amount-panel">
            <div class="fee-preview-amount-panel__label">整单药费</div>
            <div class="fee-preview-amount-panel__input">
              <span>￥</span>
              <a-input-number
                ref="premiumAmountInputRef"
                id="inputNumber"
                size="small"
                :controls="false"
                v-model:value="premiumAmount"
                :bordered="false"
                :min="minimumAmount"
                :max="maximumAmount"
                :precision="2"
                :parser="amountParser"
                @focus="selectPremiumAmount"
                @blur="normalizePremiumAmount"
                @pressEnter="normalizePremiumAmount"
              />
              <span>元</span>
            </div>
          </div>
          <a-space :size="12">
            <a-button class="fee-preview-footer__btn" type="primary" ghost @click="resetAmount">重置金额</a-button>
            <a-button class="fee-preview-footer__btn" type="primary" @click="confirm">确认修改</a-button>
          </a-space>
        </div>
      </template>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { nextTick, onBeforeUnmount, ref, watch} from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { message } from 'ant-design-vue';
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
    {title: '序号',dataIndex: 'Sort',width: 80,align:'center'},
    {title: '药材名称',dataIndex: 'MaterialName',width: 210},
    {title: '单价',dataIndex: 'Price',width: 130,align:'right'},
    {title: '数量',dataIndex: 'Count',width: 120,align:'right'},
    {title: '金额',dataIndex: 'AdjustedAmount',width: 150,align:'right'},
  ])
  const feeInfo=ref({})
  const premiumAmount=ref(0)
  const minimumAmount=ref(0)
  const maximumAmount=ref(0)
  const premiumAmountInputRef=ref()
  let confirmSaveTimer: ReturnType<typeof window.setTimeout> | null = null

  const toFixedAmount=(value)=>{
    const amount=Number(value)
    if(!Number.isFinite(amount)){
      return 0
    }
    return Number(amount.toFixed(2))
  }

  const syncAmountRange=(amount)=>{
    minimumAmount.value=toFixedAmount(amount)
    maximumAmount.value=toFixedAmount(minimumAmount.value*5)
  }

  const getOriginalMedicineAmount=(fee)=>{
    return toFixedAmount((fee?.OriginalAmount || 0) + (fee?.RetailMarkupAmount || 0))
  }

  const formatAmount=(value)=>{
    return toFixedAmount(value).toFixed(2)
  }

  const amountParser=(value)=>{
    const normalized=String(value || '').replace(/[^\d.]/g, '')
    const parts=normalized.split('.')
    return parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : normalized
  }

  const normalizePremiumAmount=()=>{
    let nextAmount=toFixedAmount(premiumAmount.value)
    if(nextAmount < minimumAmount.value){
      nextAmount=minimumAmount.value
    }
    if(nextAmount > maximumAmount.value){
      message.warning('溢价金额不能超过5倍')
      nextAmount=maximumAmount.value
    }
    premiumAmount.value=nextAmount
    return nextAmount
  }

  const clearConfirmSaveTimer=()=>{
    if(confirmSaveTimer){
      clearTimeout(confirmSaveTimer)
      confirmSaveTimer=null
    }
  }

  const selectPremiumAmount=(event)=>{
    nextTick(() => {
      const input = event?.target || premiumAmountInputRef.value?.$el?.querySelector?.('input')
      input?.select?.()
    })
  }

  watch(() => props.listData, (newVal) => {
    if (newVal) table.value.list = newVal;
  }, { immediate: true })

  watch(() => props.fee, (newVal) => {
    if (newVal){
      feeInfo.value = newVal
      const medicineAmount=toFixedAmount(feeInfo.value.OriginalAmount+feeInfo.value.RetailMarkupAmount+feeInfo.value.PremiumAmount)
      syncAmountRange(getOriginalMedicineAmount(feeInfo.value))
      premiumAmount.value=medicineAmount
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
      clearConfirmSaveTimer()
      emit('update:visible', false)
    }
  })

  const calculateFee=(saveAfterCalculate=false)=>{
    normalizePremiumAmount()
    feeDetailModal.value.loading=true
    PrescriptApiCtrl.CalculateFee({
      items:table.value.list,
      premiumAmount:premiumAmount.value,
      registrationFee:feeInfo.value.RegistrationFee
    }).then(data=>{
      table.value.list=data.Items
      feeInfo.value=data.Fee
      const medicineAmount=toFixedAmount(feeInfo.value.OriginalAmount+feeInfo.value.RetailMarkupAmount+feeInfo.value.PremiumAmount)
      premiumAmount.value=medicineAmount
      if(saveAfterCalculate){
        clearConfirmSaveTimer()
        confirmSaveTimer=window.setTimeout(() => {
          confirmSave()
        }, 1000)
      }
    }).catch(() => {}).finally(() => {feeDetailModal.value.loading=false})
  }

  const confirm=()=>{
    calculateFee(true)
  }

  const confirmSave=()=>{
    feeDetailModal.value.visible=false
    emit('confirm',{
      Items:table.value.list,
      Fee:feeInfo.value
    })
  }

  const resetAmount=()=>{
    premiumAmount.value=minimumAmount.value
    calculateFee(false)
  }

  onBeforeUnmount(clearConfirmSaveTimer)
</script>
<style lang="less" scoped>
.fee-preview-title {
  align-items: center;
}
.fee-preview-title__icon {
  width: 46px;
  height: 46px;
}
.fee-preview-title__content {
  padding-top: 2px;
}
.fee-preview-title__text {
  color: #1F2B3D;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
}
.fee-preview-title__desc {
  margin-top: 3px;
  color: #D1A03D;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}
.fee-preview-body {
  padding: 0 32px 12px;
}
.fee-preview-table-scroll {
  max-height: calc(100vh - 360px);
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: #D8E3F2;
  }
}
.fee-preview-table {
  overflow: hidden;
  border: 1px dashed #E8EEF7;
  border-radius: 8px;

  :deep(.ant-table) {
    border-radius: 8px;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #FFFDEC !important;
    border-right: 1px dashed #E8EEF7 !important;
    border-bottom: 1px dashed #E8EEF7 !important;
    color: #5F6A7A;
    font-weight: 400;
  }

  :deep(.ant-table-thead > tr > th:last-child),
  :deep(.ant-table-tbody > tr > td:last-child) {
    border-right: none !important;
  }

  :deep(.ant-table-tbody > tr > td) {
    border-right: 1px dashed #E8EEF7 !important;
    border-bottom: 1px dashed #E8EEF7 !important;
  }

  :deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
    background: #EEF5FF !important;
  }
}
.fee-preview-table__amount {
  color: #1F2B3D;
  font-weight: 600;
}
.fee-preview-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.fee-preview-amount-panel {
  display: flex;
  align-items: stretch;
  overflow: visible;
  border: 1px dashed #E8EEF7;
  border-radius: 8px;
  background: #fff;
}
.fee-preview-amount-panel__label {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  border-right: 1px dashed #E8EEF7;
  border-radius: 8px 0 0 8px;
  background: #FFFDEC;
  color: #5F6A7A;
}
.fee-preview-amount-panel__input {
  display: flex;
  align-items: center;
  min-width: 150px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 0 8px 8px 0;
  color: @primary-color;
  font-weight: 600;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover,
  &:focus-within {
    border-color: @primary-color;
    box-shadow: 0 0 0 2px fade(@primary-color, 20%);
  }

  :deep(.ant-input-number) {
    width: 92px !important;
    color: @primary-color;
  }

  :deep(.ant-input-number-input) {
    color: @primary-color;
    font-weight: 600;
    text-align: right;
  }
}
.fee-preview-footer__btn {
  border-radius: 8px;
}
:global(.fee-preview-modal .ant-modal-content) {
  overflow: hidden;
  border-radius: 28px;
  box-shadow: 0 16px 40px rgba(32, 48, 75, 0.14);
}
:global(.fee-preview-modal .ant-modal-header) {
  padding: 22px 32px 16px;
  border-bottom: none;
}
:global(.fee-preview-modal .ant-modal-body) {
  padding-top: 18px;
}
:global(.fee-preview-modal .ant-modal-footer) {
  padding: 16px 32px 22px;
  border-top: 1px dashed #E8EEF7;
}
</style>
