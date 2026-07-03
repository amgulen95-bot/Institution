<template>
  <div class="giveaway-prod-selector">
    <div class="aj-margin-bottom">
      <a-space>
        <a-select
          placeholder="选择赠品"
          style="width: 200px"
          :disabled="!currentPId"
          v-model:value="selectedProd"
          showSearch
          optionFilterProp="title"
        >
          <a-select-option v-for="item in prodDropdown" :value="item.ID" :title="item.ProName">
            {{ item.ProName }}
          </a-select-option>
        </a-select>
        <a-button type="primary" :disabled="!selectedProd" @click="addProd">添加</a-button>
      </a-space>
    </div>

    <a-table
      :data-source="list"
      row-key="ProId"
      size="small"
      class="ant-table-striped border"
      :rowClassName="(record, index) => (index % 2 === 1 ? 'table-striped' : null)"
      :pagination="pageConfig"
      :scroll="{ y: availableHeight, x: 1024 }"
    >
      <a-table-column data-index="ProName" title="产品名称" :width="200" ellipsis></a-table-column>
      <a-table-column data-index="ProPrice" title="零售价" :width="100"></a-table-column>
      <a-table-column title="赠送规格" :width="120">
        <template #default="{ record }">
          <aj-sku-picker
            v-model:value="record.SkuStockId"
            :skuList="record.SKUList"
          ></aj-sku-picker>
        </template>
      </a-table-column>
      <a-table-column data-index="Count" title="赠送数量" :width="120">
        <template #default="{ record }">
          <a-input-number :min="1" :max="99999" v-model:value="record.Count"></a-input-number>
        </template>
      </a-table-column>
      <a-table-column data-index="Id" title="操作" :width="90" fixed="right" align="right">
        <template #default="{ record }">
          <a-space>
            <a-popconfirm title="确定删除该赠品?" @confirm="deleteProd(record)">
              <a-button type="primary" danger size="small">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table-column>
    </a-table>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed,unref,toRaw, onMounted ,watch} from 'vue';
import AJSkuPicker from './aj-sku-picker.vue';
// import { useAppStore } from '/@/store/modules/app';
import {  message } from 'ant-design-vue';

export default defineComponent({
  name: 'giveaway-prod-selector',
  emits: ['update:list', 'change'],
  components: {
    'aj-sku-picker': AJSkuPicker,
  },
  props: {
    prods: {
      type: Array,
      default: () => {
        return [];
      },
    },
    list: {
      type: Array,
      default: () => {
        return [];
      },
    },
    pid: {
      type: [Number, String],
      default: 0,
    },
  },
  setup(props, ctx) {
    // data
    // const appStore = useAppStore();
    const selectedProd = ref('');
    const currentPId = ref(0);

    const prodDropdown = ref([...props.prods.filter((p) => p.ID != props.pid)]);

    if (props.pid) {
      currentPId.value = props.pid;
    }

    const pageConfig = ref({
      size: 'small',
      showTotal: (total) => {
        return `共 ${total}`;
      },
    });

    // 生命周期
    onMounted(() => {
      //nextTick(() => {
      //    if (props.src) {
      //        url.value = props.src
      //    }
      //})
    });

    // 计算,监听
    
    const availableHeight = 333
    watch(
      () => props.pid,
      (val) => {
        currentPId.value = val;
        // 可以赠送自己 --阿吉 2022年3月7日11点16分
        //prodDropdown.value = [...props.prods.filter(p => p.ID != val)]
        selectedProd.value = '';
      },
    );

    // methods

    const fillSkuList = () => {
      props.list.forEach((i) => {
        const prod = props.prods.find((p) => p.ID == i.ProId);
        if (prod) {
          i.SKUList = [...prod.SKUList];
        }
      });
    };

    const deleteProd = (record) => {
      const index = props.list.findIndex((p) => p.ProId == record.ProId);
      if (index != -1) {
        props.list.splice(index, 1);
        ctx.emit('update:list', toRaw(unref([...props.list])));
        ctx.emit('change');
      }
    };

    const addProd = () => {
      const prod = props.prods.find((p) => p.ID == selectedProd.value);
      const exists = props.list.findIndex((p) => p.ProId == selectedProd.value);
      if (exists != -1) {
        message.warning('已添加相同赠品');
        return;
      }

      let defaultSkuId = '';

      if (prod.SKUList[0] && prod.SKUList[0].Children[0]) {
        defaultSkuId = prod.SKUList[0].Children[0].Id + '';
      }

      props.list.push({
        Id: 0,
        ProId: selectedProd.value,
        ProName: prod.ProName,
        ProCover: prod.Img,
        ProPrice: prod.ProPrice,
        Count: 1,
        SkuStockId: defaultSkuId,
        SKUList: [...prod.SKUList],
      });
      ctx.emit('update:list', toRaw(unref([...props.list])));
      ctx.emit('change');
    };

    fillSkuList();

    return {
      availableHeight,
      pageConfig,
      deleteProd,
      selectedProd,
      addProd,
      prodDropdown,
      currentPId,
    };
  },
});
</script>
<style scoped>
</style>
