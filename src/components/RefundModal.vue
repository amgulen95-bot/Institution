<template>
  <div>
    <a-modal
      v-model:open="refundModal.visible"
      centered
      width="860px"
      wrapClassName="refund-apply-modal"
      :footer="null"
      :closable="false"
      :maskClosable="false"
      destroyOnClose
    >
      <section class="refund-apply-panel">
        <div class="refund-apply-header">
          <div>
            <span class="refund-apply-badge">申请售后</span>
            <h3>提交订单售后申请</h3>
            <p>请核对订单信息并填写退款原因，提交后将进入售后审核流程。</p>
          </div>
          <button class="refund-apply-close" type="button" @click="refundModal.visible=false" aria-label="关闭">×</button>
        </div>

        <div class="refund-apply-body">
          <div class="refund-order-card" v-if="orderInfo.Order.OrderCode">
            <div class="refund-patient-row">
              <div class="refund-patient-main">
                <img src="../assets/images/userAvatar1.png" alt="">
                <div>
                  <div class="refund-patient-name">
                    <span>{{orderInfo.Visit.PatientName || '--'}}</span>
                    <ManOutlined class="is-male" v-if="orderInfo.Visit.PatientGender==1" />
                    <WomanOutlined class="is-female" v-else />
                  </div>
                  <p>{{orderInfo.Visit.PatientAge || '--'}}岁 · {{orderInfo.Order.DocName || '--'}}</p>
                </div>
              </div>
              <div class="refund-amount-box">
                <span>退款金额</span>
                <strong>￥{{moneyText(orderInfo.Order.TotalPay || orderInfo.Order.Total)}}</strong>
              </div>
            </div>
            <div class="refund-order-grid">
              <div>
                <span>订单编号</span>
                <strong>{{orderInfo.Order.OrderCode || '--'}}</strong>
              </div>
              <div>
                <span>开方日期</span>
                <strong>{{orderInfo.Order.CreateTime || '--'}}</strong>
              </div>
              <div class="is-wide">
                <span>收货信息</span>
                <strong>{{receiverText}}</strong>
              </div>
            </div>
          </div>

          <a-form
            class="refund-form"
            :model="refundModal.form"
            :labelCol="{ style: 'width: 92px' }"
            :wrapperCol="{span:24}"
            :rules="refundModal.rules"
            ref="refundFormIns"
          >
            <div class="refund-form-section">
              <div class="refund-section-title">售后说明</div>
              <a-form-item label="退款原因" name="Remark">
                <a-textarea v-model:value="refundModal.form.Remark" placeholder="请输入退款原因" :rows="1" />
              </a-form-item>
            </div>
            <div class="refund-form-section">
              <div class="refund-section-title">退款附件</div>
              <a-form-item label="附件图片" name="AttachImgs">
                <MediaPicker :max="6" text="上传图片" :size="{height:104,width:104}" v-model:images="refundModal.form.AttachImgs"/>
              </a-form-item>
            </div>
          </a-form>
        </div>

        <div class="refund-apply-actions">
          <a-button size="large" @click="refundModal.visible=false">取消</a-button>
          <a-button size="large" type="primary" :loading="refundModal.loading" @click="confirm">提交售后申请</a-button>
        </div>
      </section>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { ref,watch,computed} from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {WomanOutlined,ManOutlined} from '@ant-design/icons-vue';
  import MediaPicker from '/@/components/AJ/MediaBrowser/MediaPicker.vue'
  import {ChargeApiCtrl} from '/@/api/myy/charge';
  import { cloneDeep } from 'lodash-es';

  const props = defineProps({
    orderInfo:{ type:Object, default:{
      Details:[],
      Income:{},
      Order:{},
      Patient:{},
      PeachOrder:null,
      Visit:{},
    }},
    visible: { type: Boolean, default: false },
  });
  const { createMessage } = useMessage()
  const emit = defineEmits(['update:visible', 'confirm'])
  const refundFormIns=ref()
  const refundModal=ref({
    loading:false,
    visible:false,
    form:{
      OrderCode:'',
      Remark:'',
      AttachImgs:[],
    },
    rules: {
      Remark: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
    }
  })
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      refundModal.value.visible = true
    }
  })

  watch(() => refundModal.value.visible, (newVal) => {
    if (!newVal) {
      emit('update:visible',false)
    }
  })

  const computeRegionData=computed(()=>{
    return (val)=>{
      let text = ''
      if (val){
        try {
          JSON.parse(val).forEach(item => {
            text += item.Name
          })
        } catch (error) {}
      } 
      return text
    }
  })

  const receiverText=computed(()=>{
    const order:any = props.orderInfo.Order || {}
    const receiver = order.ReceiverName ? `${order.ReceiverName}(${order.ReceiverPhone || '--'})` : '--'
    const address = `${computeRegionData.value(order.RegionData)}${order.ReceiverAddress || ''}`
    return address ? `${receiver}${address}` : receiver
  })

  const moneyText=(value)=>{
    const number = Number(value || 0)
    return Number.isFinite(number) ? number.toFixed(2) : '0.00'
  }

  const confirm=()=>{
    refundFormIns.value.validate().then(() => {
      refundModal.value.loading = true
      const formData=cloneDeep(refundModal.value.form)
      formData.AttachImgs=JSON.stringify(formData.AttachImgs)
      formData.OrderCode=props.orderInfo.Order.OrderCode
      ChargeApiCtrl.ApplyRefund(formData).then(data => {
        createMessage.success(`操作成功`);
        refundModal.value.visible=false
        emit('update:visible',false);
        emit('confirm')
      }).catch(() => {
      }).finally(() => {refundModal.value.loading= false })
    }).catch(() => { })
  }
</script>
<style lang="less" scoped>
:global(.refund-apply-modal .ant-modal-content) {
  overflow: hidden;
  border-radius: 28px;
  background: #FFFFFF;
  box-shadow: 0 22px 56px rgba(31, 43, 61, .18);
}

:global(.refund-apply-modal .ant-modal-body) {
  padding: 0;
}

.refund-apply-panel {
  overflow: hidden;
  border-radius: 28px;
  background: #FFFFFF;
}

.refund-apply-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 28px 30px 24px;
  border-bottom: 1px dashed #DCE7F5;
  background: #F9FBFD;

  h3 {
    margin: 12px 0 8px;
    color: #1F2B3D;
    font-size: 22px;
    line-height: 30px;
    font-weight: 500;
  }

  p {
    margin: 0;
    color: #6B7687;
    font-size: 14px;
    line-height: 22px;
  }
}

.refund-apply-badge {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 2px 12px;
  border: 1px solid #CFE0FF;
  border-radius: 8px;
  color: #0A5AFF;
  font-size: 13px;
  line-height: 20px;
  background: #EEF5FF;
}

.refund-apply-close {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  color: #5F6A7A;
  font-size: 24px;
  line-height: 32px;
  background: transparent;
  cursor: pointer;
  transition: background-color .18s ease, color .18s ease;

  &:hover {
    color: #0A5AFF;
    background: #EEF5FF;
  }
}

.refund-apply-body {
  max-height: calc(100vh - 230px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 22px 30px 0;
}

.refund-order-card {
  overflow: hidden;
  border: 1px solid #E7EEF8;
  border-radius: 12px;
  background: #FFFFFF;
}

.refund-patient-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px;
  border-bottom: 1px dashed #DCE7F5;
  background: #F9FBFD;
}

.refund-patient-main {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 12px;

  img {
    flex: 0 0 44px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
  }

  p {
    margin: 3px 0 0;
    color: #6B7687;
    font-size: 13px;
    line-height: 20px;
  }
}

.refund-patient-name {
  display: flex;
  align-items: center;
  min-width: 0;
  color: #1F2B3D;
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .is-male {
    flex: 0 0 auto;
    margin-left: 6px;
    color: #0A5AFF;
  }

  .is-female {
    flex: 0 0 auto;
    margin-left: 6px;
    color: #f52468;
  }
}

.refund-amount-box {
  flex: 0 0 auto;
  min-width: 160px;
  text-align: right;

  span {
    display: block;
    margin-bottom: 4px;
    color: #6B7687;
    font-size: 13px;
    line-height: 20px;
  }

  strong {
    color: #B7791F;
    font-size: 24px;
    line-height: 32px;
    font-weight: 600;
  }
}

.refund-order-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0;

  div {
    display: grid;
    grid-template-columns: 86px minmax(0, 1fr);
    min-height: 44px;
    border-right: 1px dashed #DCE7F5;
    border-bottom: 1px dashed #DCE7F5;
  }

  div:nth-child(2n),
  div:last-child {
    border-right: 0;
  }

  div:last-child {
    border-bottom: 0;
  }

  .is-wide {
    grid-column: 1 / -1;
  }

  span,
  strong {
    display: flex;
    align-items: center;
    min-width: 0;
    padding: 0 12px;
    color: #5F6A7A;
    font-size: 14px;
    line-height: 22px;
  }

  span {
    background: #F9FBFD;
  }

  strong {
    overflow: hidden;
    color: #1F2B3D;
    font-weight: 400;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.refund-form {
  margin-top: 18px;
}

.refund-form-section {
  overflow: hidden;
  margin-bottom: 18px;
  border: 1px solid #E7EEF8;
  border-radius: 12px;
  background: #FFFFFF;
}

.refund-section-title {
  padding: 12px 16px;
  border-bottom: 1px dashed #DCE7F5;
  color: #1F2B3D;
  font-size: 15px;
  line-height: 22px;
  font-weight: 500;
  background: #F9FBFD;
}

.refund-form-section :deep(.ant-form-item) {
  margin: 0;
  padding: 16px;
}

.refund-form-section :deep(.ant-form-item-label > label) {
  color: #5F6A7A;
  font-weight: 400;
}

.refund-form-section :deep(.ant-input) {
  border-radius: 8px;
  color: #1F2B3D;
  font-size: 14px;
  line-height: 22px;
  resize: none;
}

.refund-form-section :deep(.ant-input:hover),
.refund-form-section :deep(.ant-input:focus) {
  border-color: #7FA7F7;
  box-shadow: 0 0 0 3px rgba(10, 90, 255, .10);
}

.refund-apply-actions {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 14px;
  padding: 6px 30px 30px;
  background: #FFFFFF;

  :deep(.ant-btn) {
    height: 44px;
    border-radius: 8px;
    font-weight: 400;
  }
}
</style>
