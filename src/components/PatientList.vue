<template>
  <div>
    <a-table
      class="patient-list-table"
      :data-source="table.list"
      :columns="columns"
      row-key="Id"
      :loading="false"
      :pagination="false"
      :scroll="{ y: 320 }"
      size="small"
      :customRow="customRow"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex == 'Gender'">
          <span>{{ record.Gender == 1 ? '男' : '女' }}</span>
        </template>
        <template v-if="column.dataIndex == 'LastVisitTime'">
          <span class="ellipsis">{{ record.LastVisitTime ? record.LastVisitTime : '--' }}</span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';

  const props = defineProps({
    listData: Array,
    loading: Boolean,
  });

  const emit = defineEmits<{
    (e: 'data-change', hasData: boolean): void;
    (e: 'row-click', record: any): void;
  }>();

  const table = ref({ list: [] as any[] });

  watch(
    () => props.listData,
    (newVal) => {
      if (newVal) table.value.list = newVal;
    },
    { immediate: true },
  );

  const columns = ref([
    { title: '姓名', dataIndex: 'Name', width: 140 },
    { title: '性别', dataIndex: 'Gender', width: 80, align: 'center' },
    { title: '年龄', dataIndex: 'Age', width: 80, align: 'center' },
    { title: '手机号', dataIndex: 'Phone', width: 140, align: 'center' },
    { title: '上次就诊', dataIndex: 'LastVisitTime', width: 160 },
  ]);

  const customRow = (record: any) => {
    return {
      onClick: () => {
        emit('row-click', record);
      },
    };
  };
</script>

<style lang="less" scoped>
.patient-list-table {
  width: 700px;

  :deep(.ant-table-thead > tr > th) {
    background: #FFFDEC !important;
  }

  :deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
    background: #EEF5FF !important;
  }

  :deep(.ant-table-cell) {
    transition: background-color 0.18s ease;
  }
}
</style>
