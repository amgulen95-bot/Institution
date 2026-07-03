<template>
  <div>
    <a-modal v-model:open="paymentModal.visible" title="请确认收款" centered width="800px" @ok="confirm" :maskClosable="false" destroyOnClose>
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
        <div class="flex align-center gap12px mt24px">
          <div class="flex-sub p-12px border-rd-8px border border-color-[#E2E5EB] flex justify-center align-center pointer" :class="payChannel==item.Value?'activePay':''" v-for="(item,index) in payChannelList" :key="index" @click="ChoosePay(item)">
            <img class="w24px h24px" v-if="item.Value==1" src="../assets/images/xianxiaPay.png" alt="">
            <img class="w24px h24px" v-if="item.Value==4" src="../assets/images/weixinPay.png" alt="">
            <img class="w24px h24px" v-if="item.Value==6" src="../assets/images/zhifubaoPay.png" alt="">
            <div class="ml8px">{{item.Name}}</div>
          </div>
        </div>

        <div class="mt24px">
          <a-checkbox v-model:checked="isPrintReceipt">
            <span>同时打印</span>
            <span class="color-[#858D98]"> (收款成功之后，自动触发收费小票打印)</span>
          </a-checkbox>
        </div>
      </section>
    </a-modal>

    <ConfirmPayment v-model:visible="payModal.visible" :payInfo="payModal.info" :isPrintReceipt="isPrintReceipt" @confirm="confirmPay"></ConfirmPayment>
  </div>
</template>
<script lang="ts" setup>
  import { ref,watch,onMounted,computed} from 'vue';
  import { cloneDeep } from 'lodash-es';
  import {ConfigApiCtrl} from '/@/api/myy/config';
  import {PrintApiCtrl} from '/@/api/myy/print';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {WomanOutlined,ManOutlined} from '@ant-design/icons-vue';
  import ConfirmPayment from '/@/components/ConfirmPayment.vue';
  import {ChargeApiCtrl} from '/@/api/myy/charge';


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
  const payChannelList=ref([])
  const payChannel=ref(null)
  const isPrintReceipt=ref(false)
  const defaultConfig = {
    headerName: '蒙医云蒙医医院',
    headerSubtitle:'',
    headerInfo: ['address', 'phone'], 
    patientInfo: ['gender', 'age', 'mobile', 'diagnosisNo', 'doctor', 'issuer'], 
    privacy: ['hideMobile'], 
    showChargeItems: false,
    cashierInfo: ['total', 'discount', 'payable', 'paid'],
  };
  const config =ref(cloneDeep(defaultConfig))
  const paymentModal=ref({
    loading:false,
    visible:false,
  })
  const payModal=ref({
    visible:false,
    info:{},
  })
  
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      paymentModal.value.visible = true
    }
  })

  watch(() => paymentModal.value.visible, (newVal) => {
    if (!newVal) {
      emit('update:visible',false)
    }
  })
  
  onMounted(()=>{
    getPayChannels()
    getPrintConfig()
  })

  const getPrintConfig=()=>{
    PrintApiCtrl.PrintConfig({}).then(data=>{
      config.value=cloneDeep(JSON.parse(data.ReceiptTemplate))
    }).catch(() => {}).finally(() => {})
  }

  const getPayChannels=()=>{
    paymentModal.value.loading=true
    ConfigApiCtrl.PayChannels({}).then(data=>{
      payChannelList.value=data
    }).catch(() => {}).finally(() => {paymentModal.value.loading=false })
  }

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

  const ChoosePay=(record)=>{
    payChannel.value=record.Value
  }

  const confirm=()=>{
    if(!payChannel.value){
      createMessage.warning('请选择支付方式')
      return
    }
    payModal.value.info={
      OrderCode:props.orderInfo.Order.OrderCode,
      PayType:payChannel.value,
      Amount:props.orderInfo.Order.Total,
    }
    payModal.value.visible=true
  }

  const confirmPay=async (e)=>{
    try {
      if(payModal.value.info.PayType==1){
        await ChargeApiCtrl.ChargePayOrder(payModal.value.info)
        createMessage.success('收款成功')
      }else{
        //扫码枪 e为扫码获取到的code
      }
    } catch(_e) {
      // 支付失败仍继续关闭
    }
    if(isPrintReceipt.value){
      await handlePrintReceipt()
    }
    payModal.value.visible=false
    paymentModal.value.visible=false
    emit('update:visible',false)
    emit('confirm')
  }
  async function handlePrintReceipt() {
    const BASE_URL = 'http://127.0.0.1:5132'
    const order = props.orderInfo
    const esc = String.fromCharCode(0x1b)
    const gs = String.fromCharCode(0x1d)

    const sex = order.Visit.PatientGender == 1 ? '男' : '女'
    const age = order.Visit.PatientAge ? `${order.Visit.PatientAge}岁` : ''

    const lines = []
    lines.push(config.value.headerName || '蒙医云蒙医医院')
    lines.push('收费小票')
    lines.push('--------------------------------')
    lines.push(`订单编号：${order.Order.OrderCode}`)
    lines.push(`下单时间：${order.Order.CreateTime}`)
    lines.push(`医生：${order.Order.DocName || ''}`)
    lines.push('--------------------------------')
    lines.push(`${esc}E\x01${gs}!\x11${order.Visit.PatientName}${gs}!\x00${esc}E\x00 ${sex} ${age}`)
    lines.push(`电话：${order.Visit.PatientPhone || ''}`)
    lines.push('--------------------------------')

    if (order.Details && order.Details.length) {
      lines.push('药品明细：')
      for (const item of order.Details) {
        lines.push(`  ${item.ProName}  ${item.SpecName || ''}  x${item.Count}  ¥${(item.ProPrice || 0).toFixed(2)}`)
        if (item.material && item.material.length) {
          lines.push(`    组成：${item.material.map(m => `${m.Name}${m.Weight}g`).join('、')}`)
        }
      }
      lines.push('--------------------------------')
    }

    lines.push(`${esc}!\x11合计：¥${(order.Order.Total || 0).toFixed(2)}${esc}!\x00`)
    lines.push('--------------------------------')
    lines.push('感谢您的信任，祝您早日康复')
    lines.push('')

    try {
      const res = await fetch(`${BASE_URL}/api/print/raw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          printerName: '',
          documentName: `receipt-${order.Order.OrderCode}`,
          encoding: 'GB18030',
          template: 'escpos',
          properties: { copies: 1, initialize: true, align: 'left', feedLines: 3, cut: true },
          content: lines.join('\n'),
        }),
      })
      const data = await res.json()
      if (data.success) {
        createMessage.success('小票打印成功')
      } else {
        createMessage.warning('小票打印失败：' + (data.message || '未知错误'))
      }
    } catch (e) {
      createMessage.error('打印请求失败，请确认打印中间件(http://127.0.0.1:5132)已启动')
    }
  }
</script>
<style lang="less" scoped>
.activePay{
  border: 1px solid #0A5AFF;
  background: rgba(10, 90, 255, 0.08);
  font-weight: bold;
  color:#0A5AFF;
}
</style>