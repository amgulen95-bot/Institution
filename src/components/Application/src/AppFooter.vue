<template>
  <div class="menuFooter" @click="goSystem">
    <!-- <DoubleLeftOutlined />
    去操作端 -->
  </div>
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import {DoubleLeftOutlined} from '@ant-design/icons-vue';
  
  function goSystem() {
    // window.open('https://cpas.yimahulian.com/admin/index.html#/dashboard')
    // window.open('/admin/index.html#/dashboard')
  }
</script>
<style lang="less" scoped>
.menuFooter{
  text-align: center;
  height: 42px;
  line-height: 42px;
  cursor: pointer;
  color:@primary-color;
  border-top: 1px solid @border-color-base;
}
</style>
