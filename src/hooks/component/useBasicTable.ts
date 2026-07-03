
import {reactive, ref , readonly,computed,getCurrentInstance,watchEffect, toRaw,nextTick,} from 'vue';


export function useBasicTable(getDataSource:Function) {
  const table = ref({
    dataSource:[],
    loading:false,
    pagination:{
      total: 0,
      current: 1,
      pageSize: 10,
      showQuickJumper:true,
      showSizeChanger:true,
      pageSizeOptions: ['10', '20', '30'],
      showTotal: (total) => `共 ${total} 条`, 
      onShowSizeChange: (current,size) => {
        table.value.pagination.pageSize = size
        table.value.pagination.current = 1
        getDataSource()
      },
      onChange: (page) => {
        table.value.pagination.current = page
        getDataSource()
      }
    },
    setDataSource (res) {
      table.value.loading = false
      table.value.dataSource = res.Rows
      table.value.pagination.total = res.TotalItemCount
      table.value.selectedRowKeys = []
      // element && element.scrollTo(0, 0)
    },
    
    searchHandle(){
      table.value.pagination.current = 1
      getDataSource()
    },
    
    selectedRowKeys:[],
    selectedRowChange(selectedRowKey){
      table.value.selectedRowKeys = selectedRowKey;
    }
  })

  return {
    table,
  };
}
