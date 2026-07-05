<template>
  <div>
    <a-modal v-model:open="changePasswordModal.visible" centered width="620px" :footer="null" :maskClosable="false" destroyOnClose wrapClassName="change-password-modal">
      <section class="change-password-dialog">
        <div class="change-password-header">
          <div>
            <div class="change-password-title">修改密码</div>
            <div class="change-password-subtitle">为确保账户安全，请先完成短信验证码确认</div>
          </div>
        </div>
        <div class="change-password-safe-note">
          <span></span>
          <p>验证码将发送至当前绑定手机号，确认本人操作后再设置新的登录密码。</p>
        </div>
        <a-form class="change-password-form" layout="vertical" :model="changePasswordModal.form" :rules="changePasswordModal.rules" ref="formIns">
          <a-form-item label="验证码" name="Code">
            <div class="change-password-code-control">
              <a-input class="change-password-input change-password-code-input" v-model:value="changePasswordModal.form.Code" placeholder="请输入短信验证码" />
              <a-button class="change-password-code-button" type="primary" @click="handleSendVerifyCode" :disabled="verifyCode.sending">{{ verifyCode.btnText }}</a-button>
            </div>
          </a-form-item>
          <a-form-item label="新的密码" name="Password">
            <a-input-password class="change-password-input change-password-password-input" v-model:value="changePasswordModal.form.Password" placeholder="请输入6~12位数密码，支持数字/字母" />
          </a-form-item>
          <a-form-item label="再次确认" name="ConfirmPassword">
            <a-input-password class="change-password-input change-password-password-input" v-model:value="changePasswordModal.form.ConfirmPassword" placeholder="请再一次输入密码" />
          </a-form-item>
        </a-form>
        <div class="change-password-actions">
          <a-button class="change-password-action" @click="changePasswordModal.visible=false">取消</a-button>
          <a-button class="change-password-action change-password-primary" type="primary" :loading="changePasswordModal.loading" @click="confirm">确认修改</a-button>
        </div>
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
      resetVerifyCode()
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

  const resetVerifyCode = () => {
    if(verifyCode.value.intervalId){
      clearInterval(verifyCode.value.intervalId)
    }
    verifyCode.value.sending = false
    verifyCode.value.btnText = '发送验证码'
    verifyCode.value.timeoutValue = 30
  }
  
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
:global(.change-password-modal .ant-modal-content) {
  overflow: hidden;
  padding: 0;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 24px 56px rgba(31, 43, 61, 0.16);
}

:global(.change-password-modal .ant-modal-close) {
  top: 18px;
  right: 18px;
  border-radius: 8px;
}

:global(.change-password-modal .ant-modal-close:hover) {
  background: #eef5ff;
}

:global(.change-password-modal .ant-modal-body) {
  padding: 0;
}

.change-password-dialog {
  padding: 32px 34px 28px;
  background:
    linear-gradient(180deg, #f9fbfd 0%, #fff 42%),
    #fff;
}

.change-password-header {
  padding-right: 36px;
  padding-bottom: 22px;
  border-bottom: 1px dashed #dce6f5;
}

.change-password-title {
  color: #1d2533;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}

.change-password-subtitle {
  margin-top: 5px;
  color: #5f6a7a;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
}

.change-password-safe-note {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding: 12px 14px;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #fffdec;
}

.change-password-safe-note span {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  margin-top: 7px;
  border-radius: 50%;
  background: #f5b849;
}

.change-password-safe-note p {
  margin: 0;
  color: #5f6a7a;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
}

.change-password-form {
  padding-top: 18px;
}

:deep(.change-password-form .ant-form-item) {
  margin-bottom: 16px;
}

:deep(.change-password-form .ant-form-item-label > label) {
  color: #5f6a7a;
  font-weight: 400;
}

.change-password-input,
:deep(.change-password-password-input.ant-input-affix-wrapper),
:deep(.change-password-code-control .ant-input) {
  height: 40px;
  color: #1d2533;
  font-weight: 400;
  border-color: #dce6f5 !important;
  border-radius: 8px !important;
  background: #fff;
  box-shadow: none !important;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.change-password-input:hover,
.change-password-input:focus,
:deep(.change-password-password-input.ant-input-affix-wrapper:hover),
:deep(.change-password-password-input.ant-input-affix-wrapper-focused),
:deep(.change-password-code-control .ant-input:hover),
:deep(.change-password-code-control .ant-input:focus) {
  border-color: #0a5aff !important;
  box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
}

:deep(.change-password-password-input .ant-input),
:deep(.change-password-password-input .ant-input:hover),
:deep(.change-password-password-input .ant-input:focus) {
  border: 0 !important;
  box-shadow: none !important;
}

.change-password-code-control {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 3px 4px 3px 12px;
  border: 1px solid #dce6f5;
  border-radius: 10px;
  background: #fff;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.change-password-code-control:hover,
.change-password-code-control:focus-within {
  border-color: #0a5aff;
  box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08);
}

.change-password-code-input {
  flex: 1 1 auto;
  min-width: 0;
  width: 100% !important;
  height: 38px !important;
  padding-left: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.change-password-code-input:hover,
.change-password-code-input:focus {
  border: 0 !important;
  box-shadow: none !important;
}

:deep(.change-password-code-control .change-password-code-input:hover),
:deep(.change-password-code-control .change-password-code-input:focus),
:deep(.change-password-code-control .change-password-code-input:active),
:deep(.change-password-code-control .change-password-code-input.ant-input:hover),
:deep(.change-password-code-control .change-password-code-input.ant-input:focus),
:deep(.change-password-code-control .change-password-code-input.ant-input:active) {
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
}

:deep(.change-password-code-input.ant-input-focused),
:deep(.change-password-code-input.ant-input:focus),
:deep(.change-password-code-input.ant-input-focused:focus) {
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
}

:deep(.change-password-code-input::placeholder),
:deep(.change-password-password-input input::placeholder) {
  color: #8a95a6;
}

.change-password-code-button {
  width: 112px;
  height: 36px;
  flex: 0 0 112px;
  border-radius: 8px !important;
  font-weight: 400;
}

.change-password-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
}

.change-password-action {
  height: 40px;
  border-radius: 8px;
  font-weight: 400;
}

.change-password-primary {
  background: #0a5aff;
}
</style>
