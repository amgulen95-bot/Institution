<template>
  <button type="button" :class="menuItemClass" @click="$emit('select', itemKey)">
    <span class="vben-header-user-dropdown__item flex items-center justify-between">
      <span class="vben-header-user-dropdown__item-left flex items-center">
        <span class="vben-header-user-dropdown__item-icon">
          <component :is="iconComponent" />
        </span>
        <span class="vben-header-user-dropdown__item-text whitespace-nowrap">{{ text }}</span>
      </span>
      <span class="vben-header-user-dropdown__item-right flex items-center" v-if="subText">
        <span class="vben-header-user-dropdown__item-sub">{{ subText }}</span>
        <RightOutlined class="vben-header-user-dropdown__item-arrow" />
      </span>
    </span>
  </button>
</template>
<script lang="ts" setup>
  import { computed, getCurrentInstance } from 'vue';
  import { propTypes } from '@/utils/propTypes';
  import {
    LockOutlined,
    MobileOutlined,
    PoweroffOutlined,
    RightOutlined,
    SwapOutlined,
  } from '@ant-design/icons-vue';

  defineOptions({ name: 'DropdownMenuItem' });
  defineEmits(['select']);

  const props = defineProps({
    // eslint-disable-next-line
    itemKey:propTypes.string,
    // key: propTypes.string,
    text: propTypes.string,
    icon: propTypes.string,
    subText:propTypes.string,
  });

  const instance = getCurrentInstance();
  const itemKey = computed(() => props.itemKey || instance?.vnode?.props?.key);
  const menuItemClass = computed(() => [
    'vben-header-user-dropdown__menu-item',
    itemKey.value ? `vben-header-user-dropdown__menu-item--${itemKey.value}` : '',
  ]);
  const iconComponent = computed(() => {
    const iconMap: Record<string, typeof LockOutlined> = {
      'ant-design:mobile-outlined': MobileOutlined,
      'ant-design:lock-outlined': LockOutlined,
      'ant-design:swap-outlined': SwapOutlined,
      'ion:lock-closed-outline': LockOutlined,
      'ion:power-outline': PoweroffOutlined,
    };
    return iconMap[props.icon || ''] || LockOutlined;
  });
</script>
