<template>
  <div>
    <a-modal v-model:open="VerifyCurrentModal.visible" centered width="620px" :footer="null" :maskClosable="false" destroyOnClose wrapClassName="change-phone-modal">
      <section class="change-phone-dialog">
        <div class="change-phone-header">
          <div>
            <div class="change-phone-title">修改手机号</div>
            <div class="change-phone-subtitle">更换手机号前，需要先验证当前账号身份</div>
          </div>
          <span class="change-phone-step">1 / 2</span>
        </div>
        <div class="change-phone-safe-note">
          <span></span>
          <p>验证码将发送至当前绑定手机号，请确认本人操作后继续。</p>
        </div>
        <a-form class="change-phone-form" layout="vertical" :model="VerifyCurrentModal.form" :rules="VerifyCurrentModal.rules" ref="formIns">
          <a-form-item label="当前绑定手机号">
            <a-input class="change-phone-input" v-model:value="Phone" disabled placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item label="短信验证码" name="Code">
            <div class="change-phone-code-control">
              <a-input class="change-phone-input change-phone-code-input" v-model:value="VerifyCurrentModal.form.Code" placeholder="请输入短信验证码" />
              <a-button class="change-phone-code-button" type="primary" @click="handleSendVerifyCode(1)" :disabled="verifyCode.sending">{{ verifyCode.btnText }}</a-button>
            </div>
          </a-form-item>
        </a-form>
        <div class="change-phone-helper">原手机号已遗失？请联系机构管理员或客服处理。</div>
        <div class="change-phone-actions">
          <a-button class="change-phone-action" @click="VerifyCurrentModal.visible=false">取消</a-button>
          <a-button class="change-phone-action change-phone-primary" type="primary" :loading="VerifyCurrentModal.loading" @click="confirm">下一步</a-button>
        </div>
      </section>
    </a-modal>

    <a-modal v-model:open="ChangeModal.visible" centered width="620px" :footer="null" :maskClosable="false" destroyOnClose wrapClassName="change-phone-modal">
      <section class="change-phone-dialog">
        <div class="change-phone-header">
          <div>
            <div class="change-phone-title">换绑新的手机号</div>
            <div class="change-phone-subtitle">换绑成功后，原手机号将不再用于登录和接收验证码</div>
          </div>
          <span class="change-phone-step">2 / 2</span>
        </div>
        <div class="change-phone-safe-note">
          <span></span>
          <p>请填写新的 11 位手机号，并完成短信验证码确认。</p>
        </div>
        <a-form class="change-phone-form" layout="vertical" :model="ChangeModal.form" :rules="ChangeModal.rules" ref="ChangeFormIns">
          <a-form-item label="新的手机号" name="NewPhone">
            <a-input class="change-phone-input" v-model:value="ChangeModal.form.NewPhone" placeholder="请输入新的手机号" :maxlength="11" @input="handleNewPhoneInput"></a-input>
          </a-form-item>
          <a-form-item label="短信验证码" name="Code">
            <div class="change-phone-code-control">
              <a-input class="change-phone-input change-phone-code-input" v-model:value="ChangeModal.form.Code" placeholder="请输入短信验证码" />
              <a-button class="change-phone-code-button" type="primary" @click="handleSendVerifyCode(2)" :disabled="verifyCode.sending">{{ verifyCode.btnText }}</a-button>
            </div>
          </a-form-item>
        </a-form>
        <div class="change-phone-actions">
          <a-button class="change-phone-action" @click="ChangeModal.visible=false">取消</a-button>
          <a-button class="change-phone-action change-phone-primary" type="primary" :loading="ChangeModal.loading" @click="confirmChange">确认换绑</a-button>
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
  const ChangeFormIns=ref()
  const Phone=ref('')
  const userStore = useUserStore();
  const verifyCode = ref({
    type:1,
    sending: false,
    btnText: '发送验证码',
    intervalId: 0,
    timeoutValue: 30,
  });
  const VerifyCurrentModal=ref({
    loading:false,
    visible:false,
    form:{
      Code:'',
      Secret:'',
    },
    rules: {
      Code: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
    }
  })
  const ChangeModal=ref({
    loading:false,
    visible:false,
    form:{
      VerifyToken:'',
      NewPhone:'',
      Code:'',
      Secret:'',
    },
    rules: {
      NewPhone: [{required: true,trigger: ['blur', 'change'],validator: validateNewPhone}],
      Code: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      Secret: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
    }
  })
  
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      VerifyCurrentModal.value.visible = true
    }
  })
  watch(() => VerifyCurrentModal.value.visible, (newVal) => {
    if (!newVal) {
      emit('update:visible', false)
      formIns.value?.resetFields()
    }
  })
  watch(() => ChangeModal.value.visible, (newVal) => {
    if (!newVal) {
      ChangeFormIns.value?.resetFields()
      resetVerifyCode()
    }
  })

  onMounted(()=>{
    Phone.value=userStore.getUserInfo.Doctor.Phone
  })

  const handleSendVerifyCode=(type)=>{
    verifyCode.value.type=type
    if(type==2){
      normalizeNewPhone()
      if(!/^1\d{10}$/.test(ChangeModal.value.form.NewPhone)){
        createMessage.warning('请输入11位数字手机号')
        return
      }
    }
    countDown();
    AccountApiCtrl.SendVerifyCode({ Phone:type==1?Phone.value:ChangeModal.value.form.NewPhone,Scene:type}).then((data) => {
      if(verifyCode.value.type==1){
        VerifyCurrentModal.value.form.Secret = data.secret
      }else{
        ChangeModal.value.form.Secret= data.secret
      }
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
        if(verifyCode.value.type==1){
          VerifyCurrentModal.value.form.Code = ''
        }else{
          ChangeModal.value.form.Code = ''
        }
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

  const normalizeNewPhone = () => {
    ChangeModal.value.form.NewPhone = String(ChangeModal.value.form.NewPhone || '').replace(/\D/g, '').slice(0, 11)
  }

  function validateNewPhone(_rule, value) {
    const phone = String(value || '').trim()
    if(!phone){
      return Promise.reject('该项必须填写')
    }
    if(!/^1\d{10}$/.test(phone)){
      return Promise.reject('请输入11位数字手机号')
    }
    return Promise.resolve()
  }

  const handleNewPhoneInput = () => {
    normalizeNewPhone()
    if(ChangeModal.value.form.NewPhone.length < 11){
      ChangeFormIns.value?.clearValidate?.(['NewPhone'])
    }
  }
  
  const confirm=()=>{
    formIns.value.validate().then(() => {
      VerifyCurrentModal.value.loading = true
      const formData = cloneDeep(VerifyCurrentModal.value.form)
      AccountApiCtrl.VerifyCurrentPhone(formData).then(data=>{
        VerifyCurrentModal.value.visible = false
        resetVerifyCode()
        ChangeModal.value.form={
          VerifyToken:data?.VerifyToken || data?.verifyToken || data?.token || '',
          NewPhone:'',
          Code:'',
          Secret:'',
        }
        ChangeModal.value.visible=true
      }).catch(() => {}).finally(() => { VerifyCurrentModal.value.loading = false })
    })
  }

  const confirmChange=()=>{
    ChangeFormIns.value.validate().then(() => {
      ChangeModal.value.loading = true
      const formData = cloneDeep(ChangeModal.value.form)
      AccountApiCtrl.ChangePhone(formData).then(data=>{
        createMessage.success('操作成功')
        ChangeModal.value.visible = false
      }).catch(() => {}).finally(() => { ChangeModal.value.loading = false })
    })
  }
</script>
<style lang="less" scoped>
:global(.change-phone-modal .ant-modal-content) {
  overflow: hidden;
  padding: 0;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 24px 56px rgba(31, 43, 61, 0.16);
}

:global(.change-phone-modal .ant-modal-close) {
  top: 18px;
  right: 18px;
  border-radius: 8px;
}

:global(.change-phone-modal .ant-modal-close:hover) {
  background: #eef5ff;
}

:global(.change-phone-modal .ant-modal-body) {
  padding: 0;
}

.change-phone-dialog {
  padding: 32px 34px 28px;
  background:
    linear-gradient(180deg, #f9fbfd 0%, #fff 42%),
    #fff;
}

.change-phone-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding-right: 36px;
  padding-bottom: 22px;
  border-bottom: 1px dashed #dce6f5;
}

.change-phone-title {
  color: #1d2533;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}

.change-phone-subtitle {
  margin-top: 5px;
  color: #5f6a7a;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
}

.change-phone-step {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  flex: 0 0 auto;
  color: #0a5aff;
  font-size: 13px;
  font-weight: 400;
  border: 1px solid #d8e6ff;
  border-radius: 8px;
  background: #eef5ff;
}

.change-phone-safe-note {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding: 12px 14px;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #fffdec;
}

.change-phone-safe-note span {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  margin-top: 7px;
  border-radius: 50%;
  background: #f5b849;
}

.change-phone-safe-note p {
  margin: 0;
  color: #5f6a7a;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
}

.change-phone-form {
  padding-top: 18px;
}

:deep(.change-phone-form .ant-form-item) {
  margin-bottom: 16px;
}

:deep(.change-phone-form .ant-form-item-label > label) {
  color: #5f6a7a;
  font-weight: 400;
}

.change-phone-input,
:deep(.change-phone-input.ant-input-disabled),
:deep(.change-phone-code-control .ant-input) {
  height: 40px;
  color: #1d2533;
  font-weight: 400;
  border-color: #dce6f5 !important;
  border-radius: 8px !important;
  background: #fff;
  box-shadow: none !important;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

:deep(.change-phone-input.ant-input-disabled) {
  color: #5f6a7a;
  background: #f9fbfd;
}

.change-phone-input:hover,
.change-phone-input:focus,
:deep(.change-phone-code-control .ant-input:hover),
:deep(.change-phone-code-control .ant-input:focus) {
  border-color: #0a5aff !important;
  box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
}

.change-phone-code-control {
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

.change-phone-code-control:hover,
.change-phone-code-control:focus-within {
  border-color: #0a5aff;
  box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08);
}

.change-phone-code-input {
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

.change-phone-code-input:hover,
.change-phone-code-input:focus {
  border: 0 !important;
  box-shadow: none !important;
}

:deep(.change-phone-code-control .change-phone-code-input:hover),
:deep(.change-phone-code-control .change-phone-code-input:focus),
:deep(.change-phone-code-control .change-phone-code-input:active),
:deep(.change-phone-code-control .change-phone-code-input.ant-input:hover),
:deep(.change-phone-code-control .change-phone-code-input.ant-input:focus),
:deep(.change-phone-code-control .change-phone-code-input.ant-input:active) {
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
}

:deep(.change-phone-code-input.ant-input-focused),
:deep(.change-phone-code-input.ant-input:focus),
:deep(.change-phone-code-input.ant-input-focused:focus) {
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
}

:deep(.change-phone-code-input::placeholder) {
  color: #8a95a6;
}

.change-phone-code-button {
  width: 112px;
  height: 36px;
  flex: 0 0 112px;
  border-radius: 8px !important;
  font-weight: 400;
}

.change-phone-helper {
  margin-top: 2px;
  color: #858d98;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  text-align: center;
}

.change-phone-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
}

.change-phone-action {
  height: 40px;
  border-radius: 8px;
  font-weight: 400;
}

.change-phone-primary {
  background: #0a5aff;
}
</style>
