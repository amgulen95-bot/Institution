<template>
  <section
    class="full-loading"
    :class="{ absolute, [`${theme}`]: !!theme }"
    :style="[background ? `background-color: ${background}` : '']"
    v-show="getVisible"
  >
    <div class="myy-loading-panel" :class="`myy-loading-panel-${size}`">
      <div class="myy-loading-mark">
        <span class="myy-loading-ring"></span>
        <span class="myy-loading-logo-shell">
          <img :src="healthLogo" alt="蒙医云诊室" />
        </span>
      </div>
      <div class="myy-loading-line"><span></span></div>
      <div class="myy-loading-tip">{{ tip || '诊室数据准备中，请稍候...' }}</div>
    </div>
  </section>
</template>
<script lang="ts" setup>
  import { computed, onUnmounted, ref, watch } from 'vue';
  import type { PropType } from 'vue';
  import { SizeEnum } from '@/enums/sizeEnum';
  import healthLogo from '@/assets/images/health-logo-system.png';

  defineOptions({ name: 'Loading' });

  const props = defineProps({
    tip: {
      type: String as PropType<string>,
      default: '',
    },
    size: {
      type: String as PropType<SizeEnum>,
      default: SizeEnum.LARGE,
      validator: (v: SizeEnum): boolean => {
        return [SizeEnum.DEFAULT, SizeEnum.SMALL, SizeEnum.LARGE].includes(v);
      },
    },
    absolute: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    loading: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    background: {
      type: String as PropType<string>,
    },
    theme: {
      type: String as PropType<'dark' | 'light'>,
    },
  });

  let delayTimer: TimeoutHandle;
  const delayedLoading = ref(false);
  const getVisible = computed(() => props.loading && delayedLoading.value);

  watch(
    () => props.loading,
    (loading) => {
      clearTimeout(delayTimer);
      if (!loading) {
        delayedLoading.value = false;
        return;
      }

      delayTimer = setTimeout(() => {
        delayedLoading.value = true;
      }, 180);
    },
    { immediate: true },
  );

  onUnmounted(() => {
    clearTimeout(delayTimer);
  });
</script>
<style lang="less" scoped>
  .full-loading {
    display: flex;
    position: fixed;
    z-index: 200;
    top: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: rgb(244 247 249 / 64%);
    backdrop-filter: blur(2px);

    &.absolute {
      position: absolute;
      z-index: 300;
      top: 0;
      left: 0;
    }
  }

  html[data-theme='dark'] {
    .full-loading:not(.light) {
      background-color: @modal-mask-bg;
    }
  }

  .full-loading.dark {
    background-color: @modal-mask-bg;
  }

  .myy-loading-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 178px;
    padding: 22px 24px 18px;
    flex-direction: column;
    border: 1px solid #dce6f5;
    border-radius: 24px;
    background: linear-gradient(180deg, #ffffff 0%, #f9fbfd 100%);
    box-shadow: 0 18px 42px rgba(31, 43, 61, 0.12);
  }

  .myy-loading-panel-small {
    min-width: 132px;
    padding: 16px 18px 14px;
    border-radius: 18px;
  }

  .myy-loading-panel-default {
    min-width: 154px;
    padding: 18px 20px 15px;
    border-radius: 20px;
  }

  .myy-loading-mark {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    width: 74px;
    height: 74px;
  }

  .myy-loading-panel-small .myy-loading-mark {
    width: 56px;
    height: 56px;
  }

  .myy-loading-panel-default .myy-loading-mark {
    width: 64px;
    height: 64px;
  }

  .myy-loading-ring {
    position: absolute;
    inset: 8px;
    border: 1px solid rgba(10, 90, 255, 0.12);
    border-radius: 18px;
    animation: myyLoadingBreath 1.9s ease-in-out infinite;
  }

  .myy-loading-logo-shell {
    display: flex;
    position: relative;
    z-index: 1;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid #d8e6ff;
    border-radius: 14px;
    background: #eef5ff;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 72%);
    overflow: hidden;
    animation: myyLogoFloat 2.4s ease-in-out infinite;
  }

  .myy-loading-logo-shell::after {
    content: '';
    position: absolute;
    top: -35%;
    left: -60%;
    width: 42%;
    height: 170%;
    transform: rotate(22deg);
    background: linear-gradient(90deg, transparent, rgb(255 255 255 / 62%), transparent);
    animation: myyLogoSheen 2.8s ease-in-out infinite;
  }

  .myy-loading-panel-small .myy-loading-logo-shell {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }

  .myy-loading-panel-default .myy-loading-logo-shell {
    width: 38px;
    height: 38px;
    border-radius: 12px;
  }

  .myy-loading-logo-shell img {
    display: block;
    width: 28px;
    height: 28px;
    position: relative;
    z-index: 1;
    object-fit: contain;
  }

  .myy-loading-panel-small .myy-loading-logo-shell img {
    width: 22px;
    height: 22px;
  }

  .myy-loading-panel-default .myy-loading-logo-shell img {
    width: 24px;
    height: 24px;
  }

  .myy-loading-line {
    width: 96px;
    height: 3px;
    margin-top: 12px;
    overflow: hidden;
    border-radius: 999px;
    background: #e8eef7;
  }

  .myy-loading-panel-small .myy-loading-line {
    width: 72px;
    margin-top: 9px;
  }

  .myy-loading-line span {
    display: block;
    width: 44%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, rgb(10 90 255 / 8%), #0a5aff, rgb(10 90 255 / 8%));
    animation: myyLoadingFlow 1.55s ease-in-out infinite;
  }

  .myy-loading-tip {
    margin-top: 10px;
    color: #5f6a7a;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    white-space: nowrap;
  }

  .myy-loading-panel-small .myy-loading-tip {
    margin-top: 8px;
    font-size: 12px;
    line-height: 18px;
  }

  @keyframes myyLoadingBreath {
    0%,
    100% {
      opacity: 0.55;
      transform: scale(0.98);
    }

    50% {
      opacity: 1;
      transform: scale(1.02);
    }
  }

  @keyframes myyLoadingFlow {
    0% {
      transform: translateX(-110%);
    }

    100% {
      transform: translateX(260%);
    }
  }

  @keyframes myyLogoFloat {
    0%,
    100% {
      transform: translateY(0);
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / 72%), 0 8px 20px rgb(10 90 255 / 8%);
    }

    50% {
      transform: translateY(-2px);
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / 78%), 0 10px 24px rgb(10 90 255 / 12%);
    }
  }

  @keyframes myyLogoSheen {
    0%,
    52% {
      transform: translateX(0) rotate(22deg);
      opacity: 0;
    }

    62% {
      opacity: 1;
    }

    100% {
      transform: translateX(360%) rotate(22deg);
      opacity: 0;
    }
  }
</style>
