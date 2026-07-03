<template>
  <LayoutFooter>
    <div class="copy-right">
      <a-divider>
        <small class="text-grey">一码达 • 知识产品与用户服务的数字化工具</small>
      </a-divider>
    </div>
    <div class="text-center">
      <small class="text-gray"
        >Copyright © 2015-2022 重庆一码达网络科技有限公司 All Rights Reserved.</small
      >
    </div>
  </LayoutFooter>
</template>

<script lang="ts">
import {  defineComponent } from 'vue';

import { LayoutFooter } from 'ant-design-vue';

export default defineComponent({
  name: 'register-footer',
  components: { LayoutFooter },
  setup() {
    return {};
  },
});
</script>
