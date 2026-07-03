<template>
  <div>
    <a-form-item-rest>
      <a-drawer
        v-model:open="props.visible"
        :title="title"
        width="75vw"
        placement="right"
        @close="cancel"
      >
        <div class="richtext">
          <Tinymce2 v-model="value" width="100%" :height="height"/>
        </div>
      </a-drawer>
    </a-form-item-rest>
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
  import { ref,computed} from 'vue';
  import { Tinymce2 } from '/@/components/Tinymce2/index';
  const props = defineProps({
    title: { type: String , default: '富文本编辑器' },
    modelValue: { type: String , default: '' },
    visible: { type: Boolean, default: false },
  });
  const emit = defineEmits(['update:visible','update:modelValue']);
  const value = computed({
    get() {
      return props.modelValue;
    },
    set(val) {
      emit('update:modelValue', val);
    }
  })
  const cancel = () => {
    emit('update:visible',false);
  }
  let height = document.body.clientHeight - 200;

</script>
<style lang="less" scoped>
.richtext {
  padding: 0 30px;
  width: 72vw;
  box-sizing: border-box;
}
</style>