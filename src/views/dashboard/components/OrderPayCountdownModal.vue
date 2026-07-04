<template>
  <a-modal
    v-model:open="modalVisible"
    centered
    width="640px"
    wrapClassName="order-pay-countdown-modal"
    :footer="null"
    :maskClosable="false"
    :closable="false"
    destroyOnClose
  >
    <div class="order-pay-countdown">
      <div class="order-pay-countdown__header">
        <div class="order-pay-countdown__status">订单创建成功</div>
        <div class="order-pay-countdown__title">即将进入收费管理收款</div>
        <div class="order-pay-countdown__desc">系统会自动打开本次订单的去收款窗口</div>
      </div>
      <div class="order-pay-countdown__panel">
        <div class="order-pay-countdown__timer">
          <span>{{ currentSeconds }}</span>
          <em>秒后自动进入</em>
        </div>
        <div class="order-pay-countdown__divider"></div>
        <div class="order-pay-countdown__meta">
          <span>订单编号</span>
          <strong>{{ orderCode || '--' }}</strong>
        </div>
      </div>
      <div class="order-pay-countdown__actions">
        <a-button class="order-pay-countdown__btn" type="primary" @click="handleConfirm">立即去收款</a-button>
        <a-button class="order-pay-countdown__btn order-pay-countdown__btn--cancel" @click="handleCancel">取消，留在当前接诊</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, ref, watch } from 'vue';

  const props = defineProps({
    visible: { type: Boolean, default: false },
    orderCode: { type: String, default: '' },
    seconds: { type: Number, default: 8 },
  });

  const emit = defineEmits(['update:visible', 'confirm', 'cancel']);
  const currentSeconds = ref(props.seconds);
  let countdownTimer: ReturnType<typeof window.setInterval> | null = null;

  const modalVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value),
  });

  const clearCountdown = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  };

  const startCountdown = () => {
    clearCountdown();
    currentSeconds.value = props.seconds;
    countdownTimer = window.setInterval(() => {
      currentSeconds.value -= 1;
      if (currentSeconds.value <= 0) {
        handleConfirm();
      }
    }, 1000);
  };

  const handleConfirm = () => {
    clearCountdown();
    emit('update:visible', false);
    emit('confirm');
  };

  const handleCancel = () => {
    clearCountdown();
    emit('update:visible', false);
    emit('cancel');
  };

  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        startCountdown();
      } else {
        clearCountdown();
      }
    },
  );

  onBeforeUnmount(clearCountdown);
</script>

<style lang="less" scoped>
:global(.order-pay-countdown-modal .ant-modal-content) {
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 18px 42px rgb(32 56 85 / 16%);
}

:global(.order-pay-countdown-modal .ant-modal-body) {
  padding: 34px 42px 36px;
}

.order-pay-countdown {
  display: flex;
  min-height: 480px;
  flex-direction: column;
  text-align: center;
}

.order-pay-countdown__header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.order-pay-countdown__status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 14px;
  border-radius: 8px;
  background: #eef5ff;
  color: #0a5aff;
  font-size: 13px;
}

.order-pay-countdown__title {
  margin-top: 16px;
  color: #263241;
  font-size: 22px;
  font-weight: 400;
  line-height: 1.35;
}

.order-pay-countdown__desc {
  margin-top: 8px;
  color: #5f6a7a;
  font-size: 14px;
  line-height: 1.6;
}

.order-pay-countdown__panel {
  margin-top: 26px;
  padding: 26px 32px 24px;
  border: 1px solid #e1ebff;
  border-radius: 12px;
  background: #f9fbfd;
}

.order-pay-countdown__timer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  min-height: 88px;

  span {
    color: #0a5aff;
    font-size: 68px;
    font-weight: 400;
    line-height: 1;
  }

  em {
    color: #263241;
    font-style: normal;
    font-size: 17px;
  }
}

.order-pay-countdown__divider {
  height: 1px;
  margin: 18px 0 16px;
  border-top: 1px dashed #d8e4f7;
}

.order-pay-countdown__meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: #5f6a7a;
  font-size: 14px;

  strong {
    color: #263241;
    font-weight: 400;
  }
}

.order-pay-countdown__actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 22px;
  padding-bottom: 22px;
}

.order-pay-countdown__btn {
  width: 248px;
  height: 38px;
  border-radius: 8px;
  font-size: 14px;
}

.order-pay-countdown__btn--cancel {
  color: #5f6a7a;
  border-color: #d8e4f7;
  background: #fff;
}
</style>
