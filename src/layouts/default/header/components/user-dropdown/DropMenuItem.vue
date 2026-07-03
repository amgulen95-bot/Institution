<template>
  <Menu.Item :key="itemKey">
    <span class="flex items-center justify-between">
      <div class="flex items-center">
        <Icon :icon="icon" class="mr-1" />
        <span class="whitespace-nowrap">{{ text }}</span>
      </div>
      <div class="flex items-center" v-if="subText">
        <span class="ml8px" >{{ subText }}</span>
        <Icon class="ml4px" style="font-size: 10px;" icon="ant-design:right-outlined"  />
      </div>
    </span>
  </Menu.Item>
</template>
<script lang="ts" setup>
  import { Menu } from 'ant-design-vue';
  import { computed, getCurrentInstance } from 'vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { propTypes } from '@/utils/propTypes';

  defineOptions({ name: 'DropdownMenuItem' });

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
</script>
