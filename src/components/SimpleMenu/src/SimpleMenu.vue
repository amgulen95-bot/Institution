<template>
  <div ref="menuWrapperRef" :class="getWrapperClass">
    <Menu
      v-bind="getBindValues"
      :activeName="menuState.activeName"
      :openNames="getOpenKeys"
      :class="prefixCls"
      :activeSubMenuNames="menuState.activeSubMenuNames"
      @select="handleSelect"
    >
      <template v-for="item in items" :key="item.path">
        <SimpleSubMenu
          :item="item"
          :parent="true"
          :collapsedShowTitle="collapsedShowTitle"
          :collapse="collapse"
          :countList="orderCountList"
        />
      </template>
    </Menu>
    <div
      v-if="getShowActiveIndicator"
      :class="`${prefixCls}-active-indicator`"
      :style="activeIndicatorStyle"
    />
  </div>
</template>
<script lang="ts" setup>
  import type { MenuState } from './types';
  import type { Menu as MenuType } from '@/router/types';
  import type { RouteLocationNormalizedLoaded } from 'vue-router';
  import type { CSSProperties } from 'vue';
  import { computed, ref, unref, reactive, toRefs, watch, PropType, useAttrs,onMounted,nextTick,onBeforeUnmount} from 'vue';
  import { useDesign } from '@/hooks/web/useDesign';
  import Menu from './components/Menu.vue';
  import SimpleSubMenu from './SimpleSubMenu.vue';
  import { listenerRouteChange } from '@/logics/mitt/routeChange';
  import { propTypes } from '@/utils/propTypes';
  import { REDIRECT_NAME } from '@/router/constant';
  import { useRouter } from 'vue-router';
  import { isFunction, isHttpUrl } from '@/utils/is';
  import { openWindow } from '@/utils';
  import { useOpenKeys } from './useOpenKeys';

  defineOptions({ name: 'SimpleMenu', inheritAttrs: false });
  
  const props = defineProps({
    items: {
      type: Array as PropType<MenuType[]>,
      default: () => [],
    },
    collapse: propTypes.bool,
    mixSider: propTypes.bool,
    theme: propTypes.string,
    accordion: propTypes.bool.def(true),
    collapsedShowTitle: propTypes.bool,
    beforeClickFn: {
      type: Function as PropType<(key: string) => Promise<boolean>>,
    },
    isSplitMenu: propTypes.bool,
  });

  const emit = defineEmits(['menuClick']);
  const orderCountList=ref([])
  const attrs = useAttrs();

  const currentActiveMenu = ref('');
  const isClickGo = ref(false);
  const menuWrapperRef = ref<HTMLElement | null>(null);
  const activeIndicatorStyle = ref<CSSProperties>({
    opacity: 0,
    transform: 'translateY(0px)',
    height: '0px',
  });

  const menuState = reactive<MenuState>({
    activeName: '',
    openNames: [],
    activeSubMenuNames: [],
  });

  const { currentRoute } = useRouter();
  const { prefixCls } = useDesign('simple-menu');
  const { items, accordion, mixSider, collapse } = toRefs(props);

  const { setOpenKeys, getOpenKeys } = useOpenKeys(
    menuState,
    items,
    accordion,
    mixSider as any,
    collapse as any,
  );

  const getBindValues = computed(() => ({ ...attrs, ...props }));
  const getShowActiveIndicator = computed(() => props.mixSider || props.isSplitMenu);
  const getWrapperClass = computed(() => [
    `${prefixCls}-wrapper`,
    {
      [`${prefixCls}-wrapper--indicator`]: unref(getShowActiveIndicator),
    },
  ]);

  watch(
    () => props.collapse,
    (collapse) => {
      if (collapse) {
        menuState.openNames = [];
      } else {
        setOpenKeys(currentRoute.value.path);
      }
    },
    { immediate: true },
  );

  watch(
    () => props.items,
    () => {
      if (!props.isSplitMenu) {
        return;
      }
      setOpenKeys(currentRoute.value.path);
    },
    { flush: 'post' },
  );

  listenerRouteChange((route) => {
    if (route.name === REDIRECT_NAME) return;

    currentActiveMenu.value = route.meta?.currentActiveMenu as string;
    handleMenuChange(route);

    if (unref(currentActiveMenu)) {
      setActiveMenu(unref(currentActiveMenu));
    }
  });

  async function handleMenuChange(route?: RouteLocationNormalizedLoaded) {
    if (unref(isClickGo)) {
      isClickGo.value = false;
      return;
    }
    const path = (route || unref(currentRoute)).path;

    setActiveMenu(path);
  }

  async function handleSelect(key: string) {
    if (isHttpUrl(key)) {
      openWindow(key);
      return;
    }
    const { beforeClickFn } = props;
    if (beforeClickFn && isFunction(beforeClickFn)) {
      const flag = await beforeClickFn(key);
      if (!flag) return;
    }

    emit('menuClick', key);

    isClickGo.value = true;
    setActiveMenu(key);
  }

  onMounted(()=>{
    updateActiveIndicator();
    window.addEventListener('resize', updateActiveIndicator);
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateActiveIndicator);
  });

  function setActiveMenu(path: string) {
    setOpenKeys(path);
    menuState.activeName = path;
    updateActiveIndicator();
  }

  watch(
    () => menuState.activeName,
    () => updateActiveIndicator(),
  );

  watch(
    () => props.items,
    () => updateActiveIndicator(),
    { flush: 'post' },
  );

  watch(
    () => unref(getShowActiveIndicator),
    () => updateActiveIndicator(),
  );

  function updateActiveIndicator() {
    if (!unref(getShowActiveIndicator)) return;

    nextTick(() => {
      requestAnimationFrame(() => {
        const wrapper = unref(menuWrapperRef);
        if (!wrapper) return;

        const activeEl =
          (wrapper.querySelector(
            '.vben-menu-vertical .vben-menu-item-active:not(.vben-menu-submenu)',
          ) as HTMLElement | null) ||
          (wrapper.querySelector('.vben-menu-vertical .vben-menu-submenu-active') as HTMLElement | null);

        if (!activeEl) {
          activeIndicatorStyle.value = {
            ...unref(activeIndicatorStyle),
            opacity: 0,
          };
          return;
        }

        const wrapperRect = wrapper.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        const offsetY = activeRect.top - wrapperRect.top;

        activeIndicatorStyle.value = {
          opacity: 1,
          transform: `translateY(${offsetY}px)`,
          height: `${activeRect.height}px`,
        };
      });
    });
  }
</script>
<style lang="less">
  @import url('./index.less');
</style>
