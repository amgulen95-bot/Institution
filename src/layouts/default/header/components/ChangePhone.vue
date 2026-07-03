<template>
  <div>
    <a-modal v-model:open="VerifyCurrentModal.visible"  centered width="700px" @ok="confirm" :maskClosable="false" okText="下一步" destroyOnClose>
      <template #title>
        <div class="text-24px text-bold">修改手机号</div>
        <div class="color-[#7A807C] text-14px text-normal mt4px">更换手机号，需要进行身份验证</div>
      </template>
      <section class="padding-lr32 formModal">
        <a-form layout="vertical" :model="VerifyCurrentModal.form" :wrapperCol="{span:20}" :rules="VerifyCurrentModal.rules" ref="formIns">
          <a-form-item label="原手机号">
            <a-input v-model:value="Phone" disabled placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item label="验证码" name="Code">
            <a-input-group compact>
              <a-input v-model:value="VerifyCurrentModal.form.Code" placeholder="请输入短信验证码" style="width: calc(100% - 105px)" />
              <a-button type="primary" @click="handleSendVerifyCode(1)" :disabled="verifyCode.sending">{{ verifyCode.btnText }}</a-button>
            </a-input-group>
          </a-form-item>
        </a-form>
        <div class="text-center">原手机号已遗失？请联系客服处理</div>
      </section>
    </a-modal>

    <a-modal v-model:open="ChangeModal.visible"  centered width="700px" @ok="confirmChange" :maskClosable="false" okText="确认换绑" destroyOnClose>
      <template #title>
        <div class="text-24px text-bold">换绑新的手机号</div>
        <div class="color-[#7A807C] text-14px text-normal mt4px">手机号修改成功后，原手机号将不支持登录</div>
      </template>
      <section class="padding-lr32 formModal">
        <a-form layout="vertical" :model="ChangeModal.form" :wrapperCol="{span:20}" :rules="ChangeModal.rules" ref="ChangeFormIns">
          <a-form-item label="原手机号" name="NewPhone">
            <a-input v-model:value="ChangeModal.form.NewPhone" disabled placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item label="验证码" name="Code">
            <a-input-group compact>
              <a-input v-model:value="ChangeModal.form.Code" style="width: calc(100% - 105px)" />
              <a-button type="primary" @click="handleSendVerifyCode(2)" :disabled="verifyCode.sending">{{ verifyCode.btnText }}</a-button>
            </a-input-group>
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

  onMounted(()=>{
    Phone.value=userStore.getUserInfo.Doctor.Phone
  })

  const handleSendVerifyCode=(type)=>{
    verifyCode.value.type=type
    if(type==2&&ChangeModal.value.form.NewPhone==''){
      createMessage.warning('请填写新的手机号')
      return
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
  
  const confirm=()=>{
    formIns.value.validate().then(() => {
      VerifyCurrentModal.value.loading = true
      const formData = cloneDeep(VerifyCurrentModal.value.form)
      AccountApiCtrl.VerifyCurrentPhone(formData).then(data=>{
        VerifyCurrentModal.value.visible = false
        ChangeModal.value.form={
          VerifyToken:'',
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
</style>