<template>
  <div ref="menuWrapperRef" :class="getMenuWrapperClass">
    <Menu
      :selectedKeys="menuState.selectedKeys"
      :defaultSelectedKeys="menuState.defaultSelectedKeys"
      :mode="mode"
      :openKeys="getOpenKeys"
      :inlineIndent="inlineIndent"
      :theme="theme"
      @open-change="handleOpenChange"
      :class="getMenuClass"
      @click="handleMenuClick"
      :subMenuOpenDelay="0.2"
      v-bind="getInlineCollapseOptions"
      style="background-color:transparent;"
    >
      <template v-for="item in items" :key="item.path">
        <BasicSubMenuItem :item="item" :theme="theme" :isHorizontal="isHorizontal" />
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
  import type { CSSProperties } from 'vue';
  import {
    computed,
    unref,
    reactive,
    watch,
    toRefs,
    ref,
    nextTick,
    onMounted,
    onBeforeUnmount,
  } from 'vue';
  import { Menu, MenuProps } from 'ant-design-vue';
  import BasicSubMenuItem from './components/BasicSubMenuItem.vue';
  import { MenuModeEnum, MenuTypeEnum } from '@/enums/menuEnum';
  import { useOpenKeys } from './useOpenKeys';
  import { RouteLocationNormalizedLoaded, useRouter } from 'vue-router';
  import { isFunction } from '@/utils/is';
  import { basicProps } from './props';
  import { useMenuSetting } from '@/hooks/setting/useMenuSetting';
  import { REDIRECT_NAME } from '@/router/constant';
  import { useDesign } from '@/hooks/web/useDesign';
  import { getCurrentParentPath } from '@/router/menus';
  import { listenerRouteChange } from '@/logics/mitt/routeChange';
  import { getAllParentPath } from '@/router/helper/menuHelper';

  defineOptions({ name: 'BasicMenu' });

  const props = defineProps(basicProps);

  const emit = defineEmits(['menuClick']);

  const isClickGo = ref(false);
  const currentActiveMenu = ref('');
  const menuWrapperRef = ref<HTMLElement | null>(null);
  const activeIndicatorStyle = ref<CSSProperties>({
    opacity: 0,
    transform: 'translateX(0px)',
    width: '0px',
  });

  const menuState = reactive<MenuState>({
    defaultSelectedKeys: [],
    openKeys: [],
    selectedKeys: [],
    collapsedOpenKeys: [],
  });

  const { prefixCls } = useDesign('basic-menu');
  const { items, mode, accordion } = toRefs(props);

  const { getCollapsed, getTopMenuAlign, getSplit } = useMenuSetting();

  const { currentRoute } = useRouter();

  const { handleOpenChange, setOpenKeys, getOpenKeys } = useOpenKeys(
    menuState,
    items,
    mode as any,
    accordion,
  );

  const getIsTopMenu = computed(() => {
    const { type, mode } = props;

    return (
      (type === MenuTypeEnum.TOP_MENU && mode === MenuModeEnum.HORIZONTAL) ||
      (props.isHorizontal && unref(getSplit))
    );
  });

  const getMenuClass = computed(() => {
    const align = props.isHorizontal && unref(getSplit) ? 'start' : unref(getTopMenuAlign);
    return [
      prefixCls,
      `justify-${align}`,
      {
        [`${prefixCls}__second`]: !props.isHorizontal && unref(getSplit),
        [`${prefixCls}__sidebar-hor`]: unref(getIsTopMenu),
      },
    ];
  });

  const getShowActiveIndicator = computed(() => {
    return props.isHorizontal && props.mode === MenuModeEnum.HORIZONTAL && unref(getIsTopMenu);
  });

  const getMenuWrapperClass = computed(() => {
    return [
      `${prefixCls}-wrapper`,
      {
        [`${prefixCls}-wrapper--top`]: unref(getShowActiveIndicator),
      },
    ];
  });

  const getInlineCollapseOptions = computed(() => {
    const isInline = props.mode === MenuModeEnum.INLINE;

    const inlineCollapseOptions: { inlineCollapsed?: boolean } = {};
    if (isInline) {
      inlineCollapseOptions.inlineCollapsed = props.mixSider ? false : unref(getCollapsed);
    }
    return inlineCollapseOptions;
  });

  listenerRouteChange((route) => {
    if (route.name === REDIRECT_NAME) return;
    handleMenuChange(route);
    currentActiveMenu.value = route.meta?.currentActiveMenu as string;

    if (unref(currentActiveMenu)) {
      menuState.selectedKeys = [unref(currentActiveMenu)];
      setOpenKeys(unref(currentActiveMenu));
    }
    updateActiveIndicator();
  });

  !props.mixSider &&
    watch(
      () => props.items,
      () => {
        handleMenuChange();
        updateActiveIndicator();
      },
    );

  const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
    const { beforeClickFn } = props;
    if (beforeClickFn && isFunction(beforeClickFn)) {
      const flag = await beforeClickFn(key);
      if (!flag) return;
    }
    emit('menuClick', key);

    isClickGo.value = true;
    menuState.selectedKeys = [key];
    updateActiveIndicator();
  };

  async function handleMenuChange(route?: RouteLocationNormalizedLoaded) {
    if (unref(isClickGo)) {
      isClickGo.value = false;
      return;
    }
    const path =
      (route || unref(currentRoute)).meta?.currentActiveMenu || (route || unref(currentRoute)).path;
    setOpenKeys(path);
    if (unref(currentActiveMenu)) return;
    if (props.isHorizontal && unref(getSplit)) {
      const parentPath = await getCurrentParentPath(path);
      menuState.selectedKeys = [parentPath];
    } else {
      const parentPaths = await getAllParentPath(props.items, path);
      menuState.selectedKeys = parentPaths;
    }
    updateActiveIndicator();
  }

  function updateActiveIndicator() {
    if (!unref(getShowActiveIndicator)) return;

    nextTick(() => {
      const wrapper = unref(menuWrapperRef);
      if (!wrapper) return;

      const selectedEl = wrapper.querySelector(
        '.ant-menu-horizontal > .ant-menu-item-selected, .ant-menu-horizontal > .ant-menu-submenu-selected',
      ) as HTMLElement | null;

      if (!selectedEl) {
        activeIndicatorStyle.value = {
          ...unref(activeIndicatorStyle),
          opacity: 0,
        };
        return;
      }

      const wrapperRect = wrapper.getBoundingClientRect();
      const selectedRect = selectedEl.getBoundingClientRect();
      const offsetX = selectedRect.left - wrapperRect.left;

      activeIndicatorStyle.value = {
        opacity: 1,
        transform: `translateX(${offsetX}px)`,
        width: `${selectedRect.width}px`,
      };
    });
  }

  watch(
    () => menuState.selectedKeys.join('|'),
    () => updateActiveIndicator(),
  );

  watch(
    () => unref(getShowActiveIndicator),
    () => updateActiveIndicator(),
  );

  onMounted(() => {
    updateActiveIndicator();
    window.addEventListener('resize', updateActiveIndicator);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateActiveIndicator);
  });
</script>
<style lang="less">
  @import url('./index.less');
</style>
