<template>
  <div class="login-container">
    <div class="left" >
      <!-- <img :src="loginBg" alt="" style="width: 100%;height:100%;object-fit:cover"> -->
      <img src="../../../assets/images/loginBg.png" alt="" style="width: 100%;height:100%;object-fit:cover">
    </div>
    <div  class="right" >
      <div class="login-form">
        <div class="title">欢迎登录</div>
        <div class="gap1"></div>
        <a-form :model="loginForm"  ref="formRef"  :layout="'vertical'">
          <a-form-item label="账号" name="phone" :rules="[{ required: true ,trigger: 'change' }]">
            <a-input class="ipt" v-model:value="loginForm.phone" placeholder="请输入手机号" allow-clear></a-input>
          </a-form-item>
          <a-form-item label="密码" name="password" :rules="[{ required: true ,trigger: 'change' }]">
            <a-input-password  class="ipt" v-model:value="loginForm.password" placeholder="请输入登录密码" allow-clear></a-input-password>
          </a-form-item>
        </a-form>
        <div class="forgetpwd">
          <a-space><label><a-checkbox v-model:checkbox="autoLogin" ></a-checkbox>&nbsp;3天内自动登录</label></a-space>
          <div>忘记密码?</div>
        </div>
        <div class="gap2"></div>
        <a-button type="primary" class="loginbtn"  @click="toLogin" :loading="loading" :disabled="!loginForm.password || !loginForm.phone">登&nbsp;录</a-button>
        <div class="gap2"></div>
        <div class="gap1"></div>
        <!-- <div class="other-login">
          <div class="otherTitle">
            <div class="line"></div>
            <span class="doubt">没有账户？</span>
            <div class="line"></div>
          </div>
          <div class="registerBtn">
            <a-tooltip>
              <template #title>去注册</template>
              <UserAddOutlined @click="toRegister" />
            </a-tooltip>
          </div>
        </div> -->
        <div class="xieyi">登录即代表您同意<span>《用户服务协议》</span>与<span>《隐私政策》</span></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useUserStore } from '@/store/modules/user';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useDesign } from '@/hooks/web/useDesign';
  import { useGo } from '/@/hooks/web/usePage';
  localStorage.removeItem('GID')
  const loginBg = location.origin + '/' + location.hostname.replaceAll('.','') + '/loginbg.png'
  const { prefixCls } = useDesign('login');
  const { t } = useI18n();
  const { notification, createErrorModal } = useMessage();
  const userStore = useUserStore();
  const loading = ref(false)
  const autoLogin = ref(false)
  const formRef = ref()
  const go = useGo();
  import { UserAddOutlined } from '@ant-design/icons-vue';
  const loginForm = ref({
    phone:'',
    password:'',
  })
  const toLogin = async () => {
    try {
      loading.value = true;
      const userInfo = await userStore.login({
        password: loginForm.value.password,
        phone: loginForm.value.phone,
        mode: 'none',
      });
      if (userInfo) {
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${userInfo.Doctor.DoctorName}`,
          duration: 3,
        });
      }
    } catch (error) {
      createErrorModal({
        title: t('sys.api.errorTip'),
        content: (error as unknown as Error).message || t('sys.api.networkExceptionMsg'),
        getContainer: () => document.body.querySelector(`.${prefixCls}`) || document.body,
      });
    } finally {
      loading.value = false;
    }
  }

  const toRegister=()=>{
    go('/register/index', true);
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
</style>
