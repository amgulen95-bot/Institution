<template>
  <RouterView>
    <template #default="{ Component, route }">
      <div class="page-transition-stage">
        <transition
          mode="out-in"
          :css="false"
          @enter="handlePageEnter"
          @leave="handlePageLeave"
        >
          <div class="page-transition-view" :key="route.fullPath">
            <keep-alive v-if="openCache" :include="getCaches">
              <component :is="Component" />
            </keep-alive>
            <component v-else :is="Component" />
          </div>
        </transition>
      </div>
    </template>
  </RouterView>
  <FrameLayout v-if="getCanEmbedIFramePage" />
</template>

<script lang="ts" setup>
  import { computed, nextTick, unref, watch } from 'vue';
  import { useRoute } from 'vue-router';

  import FrameLayout from '@/layouts/iframe/index.vue';

  import { useRootSetting } from '@/hooks/setting/useRootSetting';

  import { useMultipleTabSetting } from '@/hooks/setting/useMultipleTabSetting';
  import {
    markPageTransitionReady,
    markPageTransitionStart,
    waitForPageRequestIdle,
  } from '@/utils/http/axios/pageRequestTracker';

  import { useMultipleTabStore } from '@/store/modules/multipleTab';

  defineOptions({ name: 'PageLayout' });

  const { getShowMultipleTab } = useMultipleTabSetting();
  const tabStore = useMultipleTabStore();

  const { getOpenKeepAlive, getCanEmbedIFramePage } = useRootSetting();

  const openCache = computed(() => unref(getOpenKeepAlive) && unref(getShowMultipleTab));
  const route = useRoute();
  let readyToken = 0;
  let leaveDone = Promise.resolve();
  let resolveLeaveDone: Nullable<() => void> = null;

  const getCaches = computed((): string[] => {
    if (!unref(getOpenKeepAlive)) {
      return [];
    }
    return tabStore.getCachedTabList;
  });

  const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  watch(
    () => route.fullPath,
    () => {
      readyToken += 1;
      markPageTransitionStart();
    },
    { immediate: true },
  );

  async function handlePageEnter(el: Element, done: () => void) {
    const target = el as HTMLElement;
    const token = readyToken;

    target.style.opacity = '0';
    target.style.position = 'absolute';
    target.style.top = '0';
    target.style.left = '0';
    target.style.width = '100%';
    target.style.pointerEvents = 'none';

    await leaveDone;
    await nextTick();
    await nextFrame();
    await waitForPageRequestIdle();
    await nextTick();
    await nextFrame();

    if (token !== readyToken) {
      done();
      return;
    }

    markPageTransitionReady();
    await nextTick();
    await nextFrame();

    requestAnimationFrame(() => {
      target.style.position = '';
      target.style.top = '';
      target.style.left = '';
      target.style.width = '';
      target.style.pointerEvents = '';
      target.style.transition = 'opacity 160ms ease-out';
      requestAnimationFrame(() => {
        target.style.opacity = '1';
        setTimeout(() => {
          target.style.transition = '';
          target.style.opacity = '';
          done();
        }, 170);
      });
    });
  }

  async function handlePageLeave(el: Element, done: () => void) {
    const target = el as HTMLElement;
    leaveDone = new Promise<void>((resolve) => {
      resolveLeaveDone = resolve;
    });
    target.style.pointerEvents = 'none';
    target.style.transition = 'opacity 90ms ease-out';
    target.style.opacity = '1';

    requestAnimationFrame(() => {
      target.style.opacity = '0';
      setTimeout(() => {
        done();
        resolveLeaveDone?.();
        resolveLeaveDone = null;
      }, 100);
    });
  }
</script>

<style lang="less">
  .page-transition-stage {
    position: relative;
    min-height: 100%;
    background-color: #f4f7f9;
  }

  .page-transition-view {
    min-height: 100%;
  }
</style>
