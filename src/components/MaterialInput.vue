<template>
  <div
    class="material-input-wrapper flex justify-between align-center border border-rd-4px border-color-[#E9ECEF] pt7px pb7px pr12px pl5px position-relative"
    @mouseenter="cancelClosePopover"
    @mouseleave="scheduleClosePopover">
    <a-popover 
      v-model:open="visible" 
      placement="bottomLeft"
      :trigger="[]" 
      :autoAdjustOverflow="false"
      :destroyTooltipOnHide="false" 
      @openChange="handlePopoverChange">
      
      <template #content>
        <div class="w650px" @mouseenter="cancelClosePopover" @mouseleave="scheduleClosePopover">
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
        @click="handleInputClick"
        @input="handleInputChange"
        :bordered="false"
        placeholder="药材名称" />
    </a-popover>
    
    <a-divider type="vertical" />
    <a-input-number ref="weightInputRef" size="small" :controls="false" v-model:value="localWeight" :bordered="false" :min="0" placeholder="用量" />
    <span>g</span>

    <CloseCircleOutlined class="position-absolute top--7px right--7px color-[#c8cdd4]" v-if="showDelete" @click="handleDelete" />
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
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
const weightInputRef = ref<any>(null);
const MATERIAL_VISIBLE_PAGE_SIZE = 8;
const MATERIAL_POPOVER_SAFE_HEIGHT = 430;
const MATERIAL_POPOVER_SHOW_DELAY = 120;
const MATERIAL_POPOVER_CLOSE_DELAY = 120;
const MATERIAL_POPOVER_SCROLL_GAP = 16;
const MATERIAL_POPOVER_SCROLL_WAIT = 220;
const MATERIAL_ACTIVE_EVENT = 'material-input-active';
let materialRequestKey = 0;
let showPopoverTimer: any = null;
let closePopoverTimer: any = null;
const materialInstanceId = Symbol('materialInput');
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
  const currentRequestKey = ++materialRequestKey;
  clearTimeout(showPopoverTimer);
  clearTimeout(closePopoverTimer);
  visible.value = false;
  loading.value = true;
  try {
    const data = await PrescriptApiCtrl.MaterialList({ page, limit: pageSize, name: keyword });
    if (currentRequestKey !== materialRequestKey) return;

    const rows = data.Rows || [];
    const totalCount = data.TotalItemCount || rows.length;
    let nextRows = rows;
    let nextTotal = totalCount;

    if (page === 1 && totalCount > rows.length) {
      const fullData = await PrescriptApiCtrl.MaterialList({ page: 1, limit: totalCount, name: keyword });
      if (currentRequestKey !== materialRequestKey) return;

      nextRows = fullData.Rows || [];
      nextTotal = fullData.TotalItemCount || nextRows.length;
    }

    list.value = nextRows;
    total.value = nextTotal;
    await nextTick();
    showPopoverTimer = setTimeout(async () => {
      if (currentRequestKey === materialRequestKey && list.value.length > 0) {
        await ensurePopoverSpace();
      }
      if (currentRequestKey === materialRequestKey) {
        visible.value = list.value.length > 0;
      }
    }, MATERIAL_POPOVER_SHOW_DELAY);
  } catch (error) {
    if (currentRequestKey !== materialRequestKey) return;

    clearTimeout(showPopoverTimer);
    visible.value = false;
  } finally {
    if (currentRequestKey === materialRequestKey) {
      loading.value = false;
    }
  }
};

const handleInputFocus = async () => {
  window.dispatchEvent(new CustomEvent(MATERIAL_ACTIVE_EVENT, { detail: materialInstanceId }));
  isConfirmed.value = false;
  originalValue.value = localMaterialName.value || '';
  await fetchMaterialList(1, MATERIAL_VISIBLE_PAGE_SIZE, '');
};

const handleInputClick = async () => {
  window.dispatchEvent(new CustomEvent(MATERIAL_ACTIVE_EVENT, { detail: materialInstanceId }));
  cancelClosePopover();
  if (visible.value || loading.value) return;
  isConfirmed.value = false;
  originalValue.value = localMaterialName.value || '';
  await fetchMaterialList(1, MATERIAL_VISIBLE_PAGE_SIZE, '');
};

const closePopover = () => {
  materialRequestKey++;
  clearTimeout(showPopoverTimer);
  clearTimeout(closePopoverTimer);
  visible.value = false;
  loading.value = false;
  list.value = [];
  total.value = 0;
};

const scheduleClosePopover = () => {
  clearTimeout(closePopoverTimer);
  closePopoverTimer = setTimeout(() => {
    closePopover();
  }, MATERIAL_POPOVER_CLOSE_DELAY);
};

const cancelClosePopover = () => {
  clearTimeout(closePopoverTimer);
};

const handleActiveMaterialInput = (event: Event) => {
  if ((event as CustomEvent).detail !== materialInstanceId) {
    closePopover();
  }
};

onMounted(() => {
  window.addEventListener(MATERIAL_ACTIVE_EVENT, handleActiveMaterialInput);
});

onBeforeUnmount(() => {
  window.removeEventListener(MATERIAL_ACTIVE_EVENT, handleActiveMaterialInput);
  clearTimeout(showPopoverTimer);
  clearTimeout(closePopoverTimer);
});

let timer: any = null;
const handleInputChange = () => {
  clearTimeout(timer);
  const keyword = localMaterialName.value?.trim() || '';
  timer = setTimeout(() => {
    fetchMaterialList(1, MATERIAL_VISIBLE_PAGE_SIZE, keyword);
  }, 300);
};

const handlePageChange = (page: number, pageSize: number) => {
  const keyword = localMaterialName.value?.trim() || '';
  fetchMaterialList(page, pageSize, keyword);
};

const wait = (delay: number) => new Promise<void>((resolve) => setTimeout(resolve, delay));

const getInputTriggerNode = () => {
  const componentInstance = inputRefsMap.value.get(props.selfIndex);
  return componentInstance?.$el as HTMLElement | undefined;
};

const ensurePopoverSpace = async () => {
  const triggerNode = getInputTriggerNode();
  if (!triggerNode) return;

  const scrollContainer = document.querySelector('.receptionPanel') as HTMLElement | null;
  const triggerRect = triggerNode.getBoundingClientRect();
  const containerRect = scrollContainer?.getBoundingClientRect();
  const viewportBottom = containerRect?.bottom ?? window.innerHeight;
  const availableBelow = viewportBottom - triggerRect.bottom;
  const requiredBelow = MATERIAL_POPOVER_SAFE_HEIGHT + MATERIAL_POPOVER_SCROLL_GAP;

  if (availableBelow >= requiredBelow) return;

  const scrollDistance = requiredBelow - availableBelow;

  if (scrollContainer) {
    const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    const nextTop = Math.min(maxScrollTop, scrollContainer.scrollTop + scrollDistance);
    if (nextTop > scrollContainer.scrollTop) {
      scrollContainer.scrollTo({ top: nextTop, behavior: 'smooth' });
      await wait(MATERIAL_POPOVER_SCROLL_WAIT);
    }
    return;
  }

  const maxWindowScrollTop = document.documentElement.scrollHeight - window.innerHeight;
  const nextWindowTop = Math.min(maxWindowScrollTop, window.scrollY + scrollDistance);
  if (nextWindowTop > window.scrollY) {
    window.scrollTo({ top: nextWindowTop, behavior: 'smooth' });
    await wait(MATERIAL_POPOVER_SCROLL_WAIT);
  }
};

const focusWeightInput = async () => {
  await nextTick();
  const inputInstance = weightInputRef.value;
  inputInstance?.focus?.();
  inputInstance?.$el?.querySelector?.('input')?.focus?.();
};

const handleSelectMaterial = async (record: any) => {
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
  await focusWeightInput();
};

const handleInputBlur = () => {
  if (!isConfirmed.value && localMaterialName.value !== originalValue.value) {
    localMaterialName.value = originalValue.value;
    emit('update:materialName', originalValue.value);
  }
};

const handlePopoverChange = (val: boolean) => {
  if (!val) {
    clearTimeout(showPopoverTimer);
    list.value = [];
    total.value = 0;
  }
};

const handleDelete = () => {
  emit('delete');
};
</script>
<style lang="less" scoped>
.material-input-wrapper {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover,
  &:focus-within {
    border-color: @primary-color !important;
    box-shadow: 0 0 0 2px fade(@primary-color, 20%);
  }
}

.ant-input {
  &-number,
  &-number-group-wrapper {
    width:50px !important;
    min-width: 50px;
    max-width: 100%;
  }
}

:deep(.ant-input-number-input) {
  text-align: right;
}
</style>
