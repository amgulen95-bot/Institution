<template>
  <div class="p-4">
    <ChargeList :chargeStatus="1"></ChargeList>
  </div>
</template>
<script lang="ts" setup>
  import {onMounted} from 'vue';
  import ChargeList from './components/ChargeList.vue';

  onMounted(() => {

  })
</script>
<style lang="less" scoped>
</style>