<template>
  <div class="flex justify-between align-center border border-rd-4px border-color-[#E9ECEF] pt7px pb7px pr12px pl5px position-relative">
    <a-popover 
      v-model:open="visible" 
      placement="bottomLeft"
      trigger="focus" 
      :autoAdjustOverflow="false"
      :destroyTooltipOnHide="true" 
      @openChange="handlePopoverChange">
      
      <template #content>
        <div class="w650px">
          <MaterialList 
            :list-data="list" 
            :loading="loading" 
            :total="total" 
            @row-click="handleSelectMaterial" 
            @page-change="handlePageChange" />
        </div>
      </template>
      
      <a-input 
        :ref="(el) => setInputRef(el, selfIndex)"
        class="w180px" 
        size="small" 
        v-model:value="localMaterialName"
        @blur="handleInputBlur"
        @focus="handleInputFocus"
        @input="handleInputChange"
        :bordered="false"
        placeholder="药材名称" />
    </a-popover>
    
    <a-divider type="vertical" />
    <a-input-number size="small" :controls="false" v-model:value="localWeight" :bordered="false" :min="0" placeholder="用量" />
    <span>g</span>

    <CloseCircleOutlined class="position-absolute top--7px right--7px color-[#c8cdd4]" v-if="showDelete" @click="handleDelete" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { PrescriptApiCtrl } from '/@/api/myy/prescript';
import { useMessage } from '/@/hooks/web/useMessage';
import MaterialList from './MaterialList.vue';
import { CloseCircleOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  materialId: String,
  materialName: String,
  weight: [Number, null],
  groupMaterials: Array as () => any[], 
  selfIndex: Number,
  showDelete: { type: Boolean, default: true }
});

const emit = defineEmits(['update:materialId', 'update:materialName', 'update:weight', 'delete', 'add-new']);
const { createMessage} = useMessage()
const visible = ref(false);
const loading = ref(false);
const list = ref([]);
const total = ref(0);
const originalValue = ref('');
const isConfirmed = ref(false);
const localMaterialName = ref(props.materialName || '');
const localWeight = ref(props.weight || null)
// 改动：使用 Map 来存储循环中每个 a-input 的真实 DOM 元素
const inputRefsMap = ref<Map<number, any>>(new Map());

// 动态 ref 绑定函数，将 DOM 元素存入 Map
const setInputRef = (el: any, index: number) => {
  if (el) {
    inputRefsMap.value.set(index, el);
  }
};

watch(() => props.materialName, (val) => { localMaterialName.value = val; });
watch(localWeight, (newVal) => {
  emit('update:weight', newVal);
});
watch(() => props.weight, (val) => { 
  localWeight.value = val ?? null; 
});

const fetchMaterialList = async (page: number, pageSize: number, keyword: string) => {
  loading.value = true;
  try {
    const data = await PrescriptApiCtrl.MaterialList({ page, limit: pageSize, name: keyword });
    list.value = data.Rows || [];
    total.value = data.TotalItemCount || 0;
    visible.value = list.value.length > 0;
  } catch (error) {
    visible.value = false;
  } finally {
    loading.value = false;
  }
};

const handleInputFocus = async () => {
  isConfirmed.value = false;
  originalValue.value = localMaterialName.value || '';
  await fetchMaterialList(1, 6, '');
};

let timer: any = null;
const handleInputChange = () => {
  clearTimeout(timer);
  const keyword = localMaterialName.value?.trim() || '';
  timer = setTimeout(() => {
    fetchMaterialList(1, 6, keyword);
  }, 300);
};

const handlePageChange = (page: number, pageSize: number) => {
  const keyword = localMaterialName.value?.trim() || '';
  fetchMaterialList(page, pageSize, keyword);
};

const handleSelectMaterial = (record: any) => {
  const isExist = props.groupMaterials.some(
    (item, index) => item.MaterialName === record.Name && index !== props.selfIndex
  );
  
  if (isExist) {
    createMessage.warning(`当前处方组中已添加【${record.Name}】`);
    visible.value = false;
    list.value = [];
    total.value = 0;
    return;
  }
  
  emit('update:materialId', record.Id);
  emit('update:materialName', record.Name);
  localMaterialName.value = record.Name;
  
  visible.value = false;
  list.value = [];
  total.value = 0;
  originalValue.value = record.Name;
  isConfirmed.value = true;
  emit('add-new');
};

const handleInputBlur = () => {
  if (!isConfirmed.value && localMaterialName.value !== originalValue.value) {
    localMaterialName.value = originalValue.value;
    emit('update:materialName', originalValue.value);
  }
};

const handlePopoverChange = (val: boolean) => {
  if (!val) {
    list.value = [];
    total.value = 0;
  } else {
    const componentInstance = inputRefsMap.value.get(props.selfIndex);
    if (!componentInstance) return;
    const triggerNode = componentInstance.$el;
    if (!triggerNode) return;
    const rect = triggerNode.getBoundingClientRect();
    const scrollContainer = document.querySelector('.receptionPanel');
    const containerHeight = scrollContainer ? scrollContainer.clientHeight : window.innerHeight;
    if (rect.bottom > containerHeight - 330) {
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollTop + 300,
          behavior: 'smooth'
        });
      }
    }
  }
};

const handleDelete = () => {
  emit('delete');
};
</script>
<style lang="less" scoped>
.ant-input {
  &-number,
  &-number-group-wrapper {
    width:50px !important;
    min-width: 50px;
    max-width: 100%;
  }
}
</style>