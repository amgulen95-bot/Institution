<template>
  <div>
    <a-modal v-model:open="logisticsModal.visible" title="查看物流" centered width="800px" :footer="null" :maskClosable="false" destroyOnClose>
      <section class="padding-lr32 pb24px">
        <div class="flex">
          <img class="w56px h56px" :src="'/Areas/Web/Images/LogisticsVehicle.png'" />
          <div class="ml16px">
            <div>物流公司 <span class="ml12px">{{ logisticsDetailInfo.com }}</span></div>
            <div class="mt8px">
              <span>快递单号</span>
              <span class="ml12px">{{ logisticsDetailInfo.nu }}</span>
              <CopyOutlined class="ml12px" v-if="logisticsDetailInfo.nu != null" @click="handleCopy(logisticsDetailInfo.nu)" />
            </div>
          </div>
        </div>
        <div class="DividingLine"></div>
        <div class="h500px overflow-y-scroll scrollbar-none" v-if="logisticsDetail.length">
          <a-steps progress-dot :current="locationLength" direction="vertical" style="margin-top: 24px" v-if="locationLength" class="VerticalShape" >
            <a-step v-for="(item, index) in logisticsDetail" :key="index" :title="item.context" :description="item.location + item.time" />
          </a-steps>
        </div>
        <div v-if="!locationLength">
          <img class="logisticsDefault" :src="'/Areas/Web/Images/logisticsDefault.png'" />
          <div class="tips">暂无物流信息</div>
        </div>
      </section>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { ref,watch} from 'vue';
  import {OrderApiCtrl} from '/@/api/myy/order';
  import {CopyOutlined} from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { createMessage} = useMessage()
  const props = defineProps({
    orderCode:{ type:String, default:''},
    visible: { type: Boolean, default: false },
  });
  const emit = defineEmits(['update:visible'])
  const logisticsDetailInfo=ref({})
  const logisticsDetail = ref([])
  const locationLength = ref(0)
  const logisticsModal=ref({
    loading:false,
    visible:false,
  })
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      logisticsModal.value.visible = true
    }
  })
  watch(() => props.orderCode, (newVal) => {
    if (newVal) {
      getLogisticsDetail()
    }
  })
  watch(() => logisticsModal.value.visible, (newVal) => {
    if (!newVal) {
      emit('update:visible',false)
    }
  })

  const getLogisticsDetail=()=>{
    logisticsModal.value.loading=true
    OrderApiCtrl.Logistics({orderCode:props.orderCode}).then(data=>{
      logisticsDetailInfo.value=data
      logisticsDetail.value = data.data;
      if (data.data) {
        locationLength.value = logisticsDetail.value.length;
      }
    }).catch(() => {}).finally(() => {logisticsModal.value.loading=false})
  }

  const handleCopy=(value)=>{
    navigator.clipboard.writeText(value)
    createMessage.success('复制成功');
  }
</script>
<style lang="less" scoped>
.DividingLine {
  width: 100%;
  height: 16px;
  background-color: #f7f8fa;
  margin-top: 24px;
}
.VerticalShape .ant-steps-item-content {
  width: 92% !important;
}
.logisticsDefault {
  width: 240px;
  height: 240px;
  margin: 0 auto;
  display: block;
}
.tips {
  font-size: 14px;
  line-height: 18px;
  text-align: center;
  color: #5e6166;
  padding-bottom: 40px;
}
</style>