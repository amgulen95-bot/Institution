<template>
  <div>
    <a-modal v-model:open="changePasswordModal.visible"  centered width="700px" @ok="confirm" :maskClosable="false" okText="确认修改" destroyOnClose>
      <template #title>
        <div class="text-24px text-bold">修改密码</div>
        <div class="color-[#7A807C] text-14px text-normal mt4px">为确保账户安全，请先发送验证码至您绑定的手机</div>
      </template>
      <section class="padding-lr32 formModal">
        <a-form layout="vertical" :model="changePasswordModal.form" :wrapperCol="{span:20}" :rules="changePasswordModal.rules" ref="formIns">
          <a-form-item label="验证码" name="Code">
            <a-input-group compact>
              <a-input v-model:value="changePasswordModal.form.Code" placeholder="请输入短信验证码" style="width: calc(100% - 105px)" />
              <a-button type="primary" @click="handleSendVerifyCode" :disabled="verifyCode.sending">{{ verifyCode.btnText }}</a-button>
            </a-input-group>
          </a-form-item>
          <a-form-item label="新的密码" name="Password">
            <a-input-password v-model:value="changePasswordModal.form.Password" placeholder="请输入6~12位数密码，支持数字/字母" />
          </a-form-item>
          <a-form-item label="再次确认" name="ConfirmPassword">
            <a-input-password v-model:value="changePasswordModal.form.ConfirmPassword" placeholder="请再一次输入密码" />
          </a-form-item>
        </a-form>
      </section>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { ref,onMounted,watch} from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { useUserStore } from '@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {AccountApiCtrl} from '/@/api/myy/account';

  const { createSuccessModal, createMessage } = useMessage();
  const props = defineProps({
    visible: { type: Boolean, default: false },
  });
  const emit = defineEmits(['update:visible', 'confirm'])
  const formIns=ref()
  const Phone=ref('')
  const userStore = useUserStore();
  const verifyCode = ref({
    type:1,
    sending: false,
    btnText: '发送验证码',
    intervalId: 0,
    timeoutValue: 30,
  });
  const changePasswordModal=ref({
    loading:false,
    visible:false,
    form:{
      Code:'',
      Secret:'',
      Password:'',
      ConfirmPassword:'',
    },
    rules: {
      Code: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      Password: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      ConfirmPassword: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
    }
  })
  
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      changePasswordModal.value.visible = true
    }
  })
  watch(() => changePasswordModal.value.visible, (newVal) => {
    if (!newVal) {
      emit('update:visible', false)
      formIns.value?.resetFields()
    }
  })

  onMounted(()=>{
    Phone.value=userStore.getUserInfo.Doctor.Phone
  })

  const handleSendVerifyCode=()=>{
    countDown();
    AccountApiCtrl.SendVerifyCode({ Phone:Phone.value,Scene:3}).then((data) => {
      changePasswordModal.value.form.Secret = data.secret
      createSuccessModal({
        title: '验证码已发送',
        content: `请注意查收${data.debug}`,
      });
    }).catch(() => {}).finally(() => {});
  }

  const countDown = () => {
    verifyCode.value.sending = true;
    verifyCode.value.intervalId = setInterval(() => {
      verifyCode.value.timeoutValue -= 1;
      if (verifyCode.value.timeoutValue === 0) {
        clearInterval(verifyCode.value.intervalId);
        verifyCode.value.timeoutValue = 30;
        verifyCode.value.sending = false;
        verifyCode.value.btnText = '获取验证码';
        changePasswordModal.value.form.Code = ''
      } else {
        verifyCode.value.sending = true;
        verifyCode.value.btnText = `请稍等 ${verifyCode.value.timeoutValue} `;
      }
    }, 1000);
  };
  
  const confirm=()=>{
    formIns.value.validate().then(() => {
      changePasswordModal.value.loading = true
      const formData = cloneDeep(changePasswordModal.value.form)
      AccountApiCtrl.ChangePassword(formData).then(data=>{
        createMessage.success('修改成功')
        changePasswordModal.value.visible = false
      }).catch(() => {}).finally(() => { changePasswordModal.value.loading = false })
    })
  }
</script>
<style lang="less" scoped>
</style>