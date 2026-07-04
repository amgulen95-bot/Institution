<template>
  <div>
    <a-table class="material-list-table"
              :data-source="props.listData"
              :columns="columns"
              row-key="Id"
              :loading="false"
              :pagination="false"
              :scroll="{x:550,y:320}"
              size="small"
              :customRow="customRow">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex == 'Stock'">
          <span class="material-list-cell-right">{{record.Stock}}</span>
        </template>
        <template v-if="column.dataIndex == 'Price'">
          <span class="material-list-cell-right">{{record.Price}}/{{record.DanWei}}</span>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
  import { ref,reactive,watch} from 'vue';

  const props = defineProps({
    listData: Array,
    loading: Boolean,
    total: Number
  })
  const emit = defineEmits<{
    (e: 'page-change', page: number, pageSize: number): void;
    (e: 'row-click', record: any): void;
  }>();
  const loadingState = ref(false)
  const table = ref({ list: [] as any[] })

  watch(() => props.listData, (newVal) => {
    if (newVal) table.value.list = newVal;
  }, { immediate: true })

  watch(() => props.loading, (val) => {
    loadingState.value = val
  }, { immediate: true })

  const columns=ref([
    {title: '药材名',dataIndex: 'Name',width: 140},
    {title: '规格',dataIndex: 'DanWei',width: 60},
    {title: '库存',dataIndex: 'Stock',width: 100,align: 'right'},
    {title: '价格',dataIndex: 'Price',width: 100,align: 'right'},
    {title: '产地厂家',dataIndex: 'Factory',width: 180}
  ])

  const pagination = reactive({
    total: 0,
    current: 1,
    pageSize: 6,
    showQuickJumper:false,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`, 
    onShowSizeChange: (current,size) => {
      pagination.pageSize = size
      pagination.current = 1
      emit('page-change', 1, size)
    },
    onChange: (page,pageSize) => {
      pagination.current = page
      emit('page-change', page, pageSize)
    }
  })

  watch(() => props.total, (val) => {
    if (val !== undefined) pagination.total = val;
  }, { immediate: true })

  const customRow = (record: any, index: number) => {
    return {
      onClick: (event: MouseEvent) => {
        emit('row-click', record)
      }
    }
  }
</script>
<style lang="less" scoped>
.material-list-table {
  :deep(.ant-table-thead > tr > th) {
    background: #FFFDEC !important;
  }

  :deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
    background: #EEF5FF !important;
  }

  .material-list-cell-right {
    display: block;
    text-align: right;
  }
}
</style>
