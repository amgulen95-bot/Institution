<template>
  <div class="aj-sku-picker">
    <div class="aj-flex aj-aligen-center aj-justify-between">
      <div>
        <a-tag size="small" v-for="item in formData.skuArray" color="blue">{{
          computeSkuName(item.Value)
        }}</a-tag>
      </div>

      <a-popover title="" trigger="click">
        <template #content>
          <div style="min-width: 320px">
            <a-form
              :model="formData"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 20 }"
              ref="formIns"
            >
              <a-form-item
                v-for="(item, index) in formData.skuArray"
                :key="item.Id"
                :label="item.Title"
                :name="['skuArray', index, 'Value']"
                :rules="{
                  required: true,
                  trigger: 'change',
                  message: '请选择一个规格',
                  type: 'number',
                }"
              >
                <a-radio-group
                  :name="item.Title"
                  v-model:value="item.Value"
                  @change="changeHandler"
                >
                  <a-radio :value="op.Id" v-for="op in item.Options">{{ op.Title }}</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-form>
          </div>
        </template>
        <a-button type="link" size="small">
          <i class="iconfont wk-edit"></i>
        </a-button>
      </a-popover>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';


export default defineComponent({
  name: 'aj-sku-picker',
  emits: ['update:value', 'change'],
  components: {},
  props: {
    value: {
      type: String,
      default: '',
    },
    skuList: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  setup(props, ctx) {
    // data
    const formData = ref({
      skuArray: [],
    });
    if (props.value) {
      const array = props.value.split('_').map((p) => Number(p));

      formData.value.skuArray = props.skuList.map((p) => {
        const selected = p.Children.find((a) => array.includes(a.Id));
        return {
          Id: p.Id,
          Title: p.Title,
          Value: selected ? selected.Id : '',
          Options: p.Children,
        };
      });
    }

    // 生命周期
    onMounted(() => {});

    // 计算,监听
    const computeSkuName = computed(() => {
      return (id) => {
        const array = props.skuList
          .map((p) => p.Children)
          .reduce((p, n) => {
            return [...p, ...n];
          });
        const item = array.find((p) => p.Id == id);
        if (item) {
          return item.Title;
        }
        return '--';
      };
    });

    const changeHandler = () => {
      const array = formData.value.skuArray.map((p) => p.Value);
      array.sort((p, n) => {
        return p - n;
      });
      ctx.emit('update:value', array.join('_'));
      ctx.emit('change');
    };

    return {
      formData,
      changeHandler,
      computeSkuName,
    };
  },
});
</script>
<style scoped>
</style>
