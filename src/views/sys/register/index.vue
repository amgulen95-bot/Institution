<template>
  <div  class="login-container">
    <div class="left" >
      <img :src="loginBg" alt="" style="width: 100%;height:100%;object-fit:cover">
    </div>
    <div class="right" >
      <div class="login-form">
        <div class="title">注册账号</div>
        <div class="gap1"></div>
        <a-form :model="registerForm.form" ref="formRef" :rules="registerForm.rules" :layout="'vertical'">
          <a-form-item label="账号" name="phone" >
            <a-input class="ipt" v-model:value="registerForm.form.phone" placeholder="请输入手机号" allow-clear></a-input>
          </a-form-item>
          <a-form-item label="验证码" name="code">
            <a-input class="ipt" placeholder="请输入短信验证码" v-model:value="registerForm.form.code">
              <template #suffix>
                <a-button type="link" class="sendOutBtn" size="small" @click="sendCode" :disabled="verifyCode.sending">{{verifyCode.btnText}}</a-button>
              </template>
            </a-input>
          </a-form-item>
        </a-form>
        <div class="gap2"></div>
        <a-button type="primary" class="loginbtn" @click="Createstore" :loading="registerForm.loading" :disabled="!registerForm.form.phone || !registerForm.form.code">创建店铺</a-button>
        <div class="gap2"></div>
        <div class="gap1"></div>
        <div class="other-login">
          <div class="otherTitle">
            <div class="line"></div>
            <span class="doubt">已有账户？</span>
            <div class="line"></div>
          </div>
          <div class="registerBtn">
            <a-tooltip>
              <template #title>去登录</template>
              <LoginOutlined @click="toLogin" />
            </a-tooltip>
          </div>
        </div>
        <div class="xieyi">登录即代表您同意<span>《用户服务协议》</span>与<span>《隐私政策》</span></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref,unref,toRaw } from 'vue';
  import { useUserStore } from '@/store/modules/user';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useDesign } from '@/hooks/web/useDesign';
  import { LoginOutlined } from '@ant-design/icons-vue';
  import { registerByPhone, sendVerifyCode } from '/@/api/platform';
  import { commonRegex, validators } from '/@/utils/common';
  import { useGo } from '/@/hooks/web/usePage';
  import { useRoute, useRouter } from 'vue-router';

  localStorage.removeItem('GID')
  const router = useRouter();
  const loginBg = location.origin + '/' + location.hostname.replaceAll('.','') + '/loginbg.png'
  const { prefixCls } = useDesign('login');
  const { t } = useI18n();
  const { notification, createErrorModal,createSuccessModal,createMessage } = useMessage();
  const userStore = useUserStore();
  const loading = ref(false)
  const autoLogin = ref(false)
  const formRef = ref()
  const go = useGo();
  

  const verifyCode = ref({
    sending: false,
    btnText: '发送验证码',
    intervalId: 0,
    timeoutValue: 30,
  });
  const registerForm = ref({
    loading: false,
    form: {
      phone: '',
      code: '',
      agree: false,
      secret: '',
    },
    rules: {
      phone: [
        {
          required: true,
          trigger: 'blur',
          regex: commonRegex.phone,
          validator: validators.regex,
        },
      ],
      code: [
        {
          required: true,
          trigger: 'blur',
          regex: commonRegex.code,
          validator: validators.regex,
        },
      ],
    },
  });

  const sendCode = () => {
    formRef.value.validateFields(['phone']).then(() => {
      countDown();
      sendVerifyCode({ phone: registerForm.value.form.phone }).then((data) => {
        registerForm.value.form.secret = data.secret;
        createSuccessModal({
          title: '验证码已发送',
          content: `请注意查收${data.debug}`,
        });
      }).catch(() => {}).finally(() => {});
    }).catch(() => {});
  };

  const countDown = () => {
    verifyCode.value.sending = true;
    verifyCode.value.intervalId = setInterval(() => {
      verifyCode.value.timeoutValue -= 1;
      if (verifyCode.value.timeoutValue === 0) {
        clearInterval(verifyCode.value.intervalId);
        verifyCode.value.timeoutValue = 30;
        verifyCode.value.sending = false;
        verifyCode.value.btnText = '获取验证码';
        registerForm.value.form.code = '';
      } else {
        verifyCode.value.sending = true;
        verifyCode.value.btnText = `请稍等 ${verifyCode.value.timeoutValue} `;
      }
    }, 1000);
  };

  const toLogin=()=>{
    go('/login');
  }

  const Createstore=()=>{
    formRef.value.validate() .then(() => {
      registerForm.value.loading = true;
      registerByPhone({
        ...toRaw(unref(registerForm.value.form)),
      }).then((token) => {
        go({name: 'RegisterSet',state: {token:token}});
      }).catch(() => {}).finally(() => {registerForm.value.loading = false;});
    }).catch((err) => {});
  }
</script>
<style lang="less" scoped>
  .login-container {
    width: 100%;
    height: 100vh;
    display: flex;
    .left {
      width: 50%;
      height: 100%;
      background-color: #000;
      position: relative;
    }
    .right {
      width: 50%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      .login-form {
        width: 80%;
        height: 100%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-size: 14px;
        color: #2F3033;
        .title {
          color: #000;
          font-family: PingFang SC;
          font-size: 28px;
          font-style: normal;
          font-weight: 600;
        }
      
        .forgetpwd {
          display: flex;
          justify-content: space-between;
          // margin-bottom: 1.95vh;
          margin-bottom: 16px;
          margin-top: -8px;
        }
        .ipt {
          height: 48px;
          padding: 0px 16px;
          box-sizing: border-box;
        }
        .loginbtn {
          border-radius: 8px;
          height: 48px;
          font-size: 16px;
        }
        .xieyi {
          color:#8D9199;
          text-align: center;
          width: 100%;
          font-family: PingFang SC;
          font-size: 14px;
          font-style: normal;
          font-weight: 400;
          span {
            color: #2F3033;
            font-weight: 500;
            cursor: pointer;
          }
        }
        .other-login {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          .otherTitle {
            width: 100%;
            display: flex;
            align-items: center;
            .line {
              height: 1px;
              flex: 1;
              background: linear-gradient(270deg, #D9D9D9 0.67%, rgba(217, 217, 217, 0.00) 100%);
              transform: rotate(-180deg);
            }
            .line:nth-child(1){
              transform: rotate(0deg);
            }
            .doubt {
              margin: 0 16px;
              color:#8D9199;
            }
          }
        }
        .gap1 {
          width: 100%;
          height: 7.8vh;
          height: 64px;
        }
        .gap2 {
          width: 100%;
          height: 2.9vh;
          height: 24px;
        }
      }
    }
  }
  .coverText{
    width: 100%;
    text-align: center;
    color: #fff;
    position: absolute;
    bottom: 52px;
    left: 0;
    z-index: 999;
  }
  .sysTitle{
    font-size: 24px;
    font-weight: 400;
    line-height: 34px;
  }
  .Abbreviation{
    margin-top: 16px;
    font-size: 24px;
    font-weight: 400;
    line-height: 34px;
  }
  .describe{
    font-size: 14px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 3.36px;
    opacity: 0.6;
  }
  .registerBtn{
    max-width: 40px;
    width:40px;
    height:40px;
    border-radius: 50%;
    border: 1px solid #2f3033;
    text-align: center;
    line-height: 40px;
    margin: 16px 0 24px 0;
    font-size: 24px;
  }
  .sendOutBtn{
    border-left:1px solid #f2f3f5;
    height: 22px;
  }
</style>
