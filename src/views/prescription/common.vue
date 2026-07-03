<template>
  <div class="p-4">
    <a-card>
      <PrescriptionTemplate :activeKey="3"></PrescriptionTemplate>
    </a-card>
  </div>
</template>
<script lang="ts" setup>
  import { ref,onMounted} from 'vue';
  import PrescriptionTemplate from '/@/components/PrescriptionTemplate.vue';
</script>
<style lang="less" scoped>

</style>