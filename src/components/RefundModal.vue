<template>
  <div>
    <a-modal v-model:open="refundModal.visible" title="申请售后" centered width="800px" @ok="confirm" :maskClosable="false" destroyOnClose>
      <section class="padding-lr32">
        <div class="p-16px border-rd-8px flex border border-color-[#E9ECEF]" v-if="orderInfo.Order.OrderCode">
          <img class="w40px h40px border-rd-50%" src="../assets/images/userAvatar1.png" alt="">
          <div class="ml8px flex-sub">
            <div class="flex justify-between align-center">
              <div class="flex align-center">
                <div class="text-16px text-bold">{{orderInfo.Visit.PatientName}}</div>
                <ManOutlined class="color-[#0A5AFF] ml4px" v-if="orderInfo.Visit.PatientGender==1" />
                <WomanOutlined class="color-[#f52468] ml4px" v-else />
                <div class="color-[#858D98] ml8px ">{{orderInfo.Visit.PatientAge}}岁</div>
              </div>
              <div class="color-[#F74344] text-bold flex align-end">
                <div class="text-12px">￥</div>
                <div class="text-18px">{{orderInfo.Order.Total}}</div>
              </div>
            </div>
            <div class="flex align-center mt16px">
              <div class="flex-sub">
                <span class="color-[#4E5766]">订单编号：</span>
                <span>{{orderInfo.Order.OrderCode}}</span>
              </div>
              <div class="flex-sub">
                <span class="color-[#4E5766]">开方日期：</span>
                <span>{{ orderInfo.Order.CreateTime }}</span>
              </div>
            </div>
            <div class="flex align-center mt4px">
              <div class="flex-sub">
                <span class="color-[#4E5766]">开单医师：</span>
                <span>{{orderInfo.Order.DocName}}</span>
              </div>
              <div class="flex-sub flex align-center">
                <span class="color-[#4E5766] whitespace-nowrap">收货信息：</span>
                <span class="ellipsis">{{orderInfo.Order.ReceiverName}}({{orderInfo.Order.ReceiverPhone}}){{computeRegionData(orderInfo.Order.RegionData)}}{{orderInfo.Order.ReceiverAddress}}</span>
              </div>
            </div>
          </div>
        </div>
        <a-form class="mt24px" :model="refundModal.form" :labelCol="{ style: 'width: 100px' }" :wrapperCol="{span:16}" :rules="refundModal.rules" ref="refundFormIns">
          <a-form-item label="退款金额">
            <a-input-number id="inputNumber" v-model:value="orderInfo.Order.TotalPay" disabled />
          </a-form-item>
          <a-form-item label="退款原因" name="Remark">
            <a-textarea v-model:value="refundModal.form.Remark" placeholder="请输入退款原因" :rows="4" />
          </a-form-item>
          <a-form-item label="退款附件" name="AttachImgs">
            <MediaPicker :max="6" text="上传图片" :size="{height:104,width:104}" v-model:images="refundModal.form.AttachImgs"/>
          </a-form-item>
        </a-form>
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
</style>