<template>
  <div>
    <a-modal v-model:open="payModal.visible" :title="payInfo.PayType==1?'授信扣除':'收款'" centered width="700px" @ok="confirm" :maskClosable="false" destroyOnClose>
      <section class="padding-lr32">
        <div class="text-center text-16px pt12px">{{payInfo.PayType==1?'请确认授信金额':'请使用扫码枪，扫描患者付款码'}}</div>
        <div class="color-[#F74344] text-bold text-center text-32px mb24px">
          <span class="text-16px">￥</span>
          <span>{{ payInfo.Amount }}</span>
        </div>
        <div class="flex flex-direction align-center" v-if="payInfo.PayType!=1">
          <img class="w160px h160px" src="../assets/images/barcodeScanner.png" alt="">
          <a-input class="mt8px w260px" v-model:value="code" placeholder="或手动输入付款码" />
          <div class="flex align-center mt24px justify-around">
            <div class="flex align-center">
              <img class="w20px h20px" src="../assets/images/weixinPay.png" alt="">
              <div class="ml4px color-[#858D98]">微信支付</div>
            </div>
            <div class="flex align-center ml24px">
              <img class="w20px h20px" src="../assets/images/zhifubaoPay.png" alt="">
              <div class="ml4px color-[#858D98]">支付宝支付</div>
            </div>
          </div>
        </div>
      </section>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { ref,watch} from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';

  const props = defineProps({
    payInfo:{ type:Object, default:{
      OrderCode:'',
      PayType:1,
      Amount:0,
    }},
    visible: { type: Boolean, default: false },
    isPrintReceipt: { type: Boolean, default: false },
  });
  const emit = defineEmits(['update:visible', 'confirm'])
  const code=ref('')
  const payModal=ref({
    loading:false,
    visible:false,
  })
  
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      payModal.value.visible = true
    }
  })

  watch(() => payModal.value.visible, (newVal) => {
    if (!newVal) {
      emit('update:visible',false)
    }
  })

  const confirm=()=>{
    payModal.value.visible=false
    emit('confirm',code.value)
  }
</script>
<style lang="less" scoped>
</style>