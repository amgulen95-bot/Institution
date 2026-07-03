<template>
  <BasicModal
    v-bind="$attrs"
    :title="title"
    :canFullscreen="false"
    :okText="okText"
    :height="type == 'input' ? 100 : 140"
    :minHeight="type == 'input' ? 100 : 140"
    :destroyOnClose="true"
    @ok="submit"
    @register="register"
    @visible-change="handleVisibleChange"
  >
    <div class="aj-padding">
      <a-form :model="model" layout="vertical" :rules="rulesData" ref="formIns">
        <a-form-item name="text">
          <a-input
            v-model:value="model.text"
            :placeholder="placeholder"
            v-if="type == 'input'"
          ></a-input>
          <a-textarea v-else v-model:value="model.text" :rows="4"></a-textarea>
        </a-form-item>
      </a-form>
    </div>
  </BasicModal>
</template>
<script lang="ts">
import { defineComponent, ref, nextTick } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';

export default defineComponent({
  name: 'aj-prompt',
  components: { BasicModal },
  props: {
    title: {
      type: String,
      default: '输入内容',
    },
    okText: {
      type: String,
      default: '确认',
    },
    placeholder: {
      type: String,
      default: '请输入',
    },
    type: {
      type: String,
      default: 'input', // input or textarea
    },
    required: {
      type: Boolean,
      default: false,
    },
    defaultValue: {
      type: String,
      default: '',
    },
    rules: {
      type: Object,
    },
    submitHandler: {
      type: Function,
    },
  },
  setup(props, context) {
    const formIns = ref();
    const modelRef = ref({ text: '' });
    const rulesData = ref({
      text: [],
    });

    rulesData.value.text = props.rules || [];

    const [register, { closeModal, setModalProps }] = useModalInner((data) => {
      data && onDataReceive(data);
    });

    function handleVisibleChange(v) {
      v && props.defaultValue && nextTick(() => onDataReceive(props.defaultValue));
    }

    function onDataReceive(data) {
      // 方式1;
      // setFieldsValue({
      //   field2: data.data,
      //   field1: data.info,
      // });

      // // 方式2
      modelRef.value.text = data;

      // setProps({
      //   model:{ field2: data.data, field1: data.info }
      // })
    }

    const submit = () => {
      formIns.value
        .validate()
        .then(() => {
          if (props.submitHandler) {
            const emitData = { value: modelRef.value.text };
            setModalProps({
              okButtonProps: {
                loading: true,
              },
            });
            props
              .submitHandler(emitData)
              .then(() => {
                context.emit('submit', emitData);
                closeModal();
                modelRef.value.text = '';
              })
              .catch(() => {})
              .finally(() => {
                setModalProps({
                  okButtonProps: {
                    loading: false,
                  },
                });
              });
          } else {
            context.emit('submit', { value: modelRef.value.text });
            closeModal();
            modelRef.value.text = '';
          }
        })
        .catch(() => {});
    };

    const save = (values) => {};

    return {
      register,
      rulesData,
      formIns,
      model: modelRef,
      handleVisibleChange,
      save,
      submit,
    };
  },
});
</script>
