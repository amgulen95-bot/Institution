<template>
  <div>
    <a-table :data-source="table.list"
              :columns="columns"
              row-key="Id"
              :loading="loadingState"
              :pagination="pagination"
              :scroll="{x:550,y:600}"
              :customRow="customRow">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex == 'Gender'">
          <span>{{record.Gender==1?'男':'女'}}</span>
        </template>
        <template v-if="column.dataIndex == 'LastVisitTime'">
          <span class="ellipsis">{{record.LastVisitTime?record.LastVisitTime:'--'}}</span>
        </template>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
  import { ref,reactive,watch} from 'vue';
  import {PrescriptApiCtrl} from '/@/api/myy/prescript';

  const props = defineProps({
    listData: Array,
    loading: Boolean
  })
  const emit = defineEmits<{
    (e: 'data-change', hasData: boolean): void;
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
    {title: '姓名',dataIndex: 'Name',width: 140},
    {title: '性别',dataIndex: 'Gender',width: 80},
    {title: '年龄',dataIndex: 'Age',width: 80},
    {title: '手机号',dataIndex: 'Phone',width: 140},
    {title: '上次就诊',dataIndex: 'LastVisitTime',width: 160},
  ])

  const pagination = reactive({
    total: 0,
    current: 1,
    pageSize: 10,
    showQuickJumper:true,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`, 
    onShowSizeChange: (current,size) => {
      pagination.pageSize = size
      pagination.current = 1
      getRenewalList()
    },
    onChange: (page) => {
      pagination.current = page
      getRenewalList()
    }
  })

  const getRenewalList = async (isSearch = false) => {
    if (isSearch){
      pagination.current = 1
    }
    loadingState.value = true
    try {
      const data = await PrescriptApiCtrl.SearchPatient({
        page: pagination.current,
        limit: pagination.pageSize,
        keyword: ''
      });
      table.value.list = data.Rows || []
      pagination.total = data.TotalItemCount
    } catch (error) {} finally {loadingState.value = false}
  }

  const customRow = (record: any, index: number) => {
    return {
      onClick: (event: MouseEvent) => {
        emit('row-click', record)
      }
    }
  }
</script>
<style lang="less" scoped>
</style>