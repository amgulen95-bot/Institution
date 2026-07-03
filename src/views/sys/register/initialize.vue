<template>
  <a-layout class="content">
    <a-layout>
      <div class="loading aj-flex aj-justify-center aj-align-center text-center">
        <div class="loading-box">
          <div class="loading-gif">
            <a-progress
              :width="210"
              type="circle"
              :percent="progress.value"
              :status="progress.status"
            />
          </div>
          <div class="progress aj-margin-top aj-flex aj-align-center aj-justify-center">
            <div class="aj-margin-right">
              <a-spin :indicator="loadingIcon" v-if="progress.value != 100"></a-spin>
            </div>
            <div>{{ progress.step }}</div>
          </div>
          <div v-if="progress.value == 100" class="aj-margin-top">
            <a-button type="primary" block size="large" @click="toLogin">登录后台</a-button>
          </div>
        </div>
      </div>
    </a-layout>
    <register-footer></register-footer>
  </a-layout>
</template>
<script lang="ts">
import { computed, defineComponent, ref, unref, toRaw, onMounted, nextTick, h } from 'vue';

import { LoadingOutlined } from '@ant-design/icons-vue';

import RegisterFooter from './components/footer.vue';

import { useMessage } from '/@/hooks/web/useMessage';

import { useRoute } from 'vue-router';

import { useGo } from '/@/hooks/web/usePage';

import { useUserStore } from '/@/store/modules/user';

import {confirmSet,createAdmAccount,createBrandLevel,createWebConfig,createAgentConfig,} from '/@/api/platform';

export default defineComponent({
  components: {
    [RegisterFooter.name]: RegisterFooter,
  },
  setup() {
    // data

    const loadingIcon = h(LoadingOutlined, {
      style: {
        fontSize: '24px',
      },
      spin: true,
    });
    const progress = ref({
      value: 0,
      status: 'normal',
      step: '正在初始化...', // 设置套餐(模式)→创建账户/角色→创建品牌/级别→配置基本信息(运费模板和webconfig)→代理配置/其他配置→完成
    });

    const form = ref({
      id: 0,
      token: '',
      actToken: '',
      name: '',
    });

    const userStore = useUserStore();
    const go = useGo();
    const route = useRoute();
    const { notification, createSuccessModal, createMessage } = useMessage();

    // 生命周期

    onMounted(() => {
      nextTick(() => {
        form.value.id = history.state.id;
        form.value.token = history.state.token;
        form.value.name = history.state.brand;
        setTimeout(() => {
          init();
        }, 1000);
      });
    });

    // methods

    const init = () => {
      progress.value.value = Number(Math.floor((1 / 5) * 100).toFixed(2));
      progress.value.step = '设置套餐...';
      confirmSet({ token: form.value.token, name: form.value.name, id: form.value.id })
        .then(() => {
          progress.value.value = Number(Math.floor((2 / 5) * 100).toFixed(2));
          progress.value.step = '创建账户和角色...';

          createAdmAccount({ token: form.value.token })
            .then(() => {
              progress.value.value = Number(Math.floor((3 / 5) * 100).toFixed(2));
              progress.value.step = '创建品牌和级别...';

              createBrandLevel({ token: form.value.token, name: form.value.name })
                .then(() => {
                  progress.value.value = Number(Math.floor((4 / 5) * 100).toFixed(2));
                  progress.value.step = '配置基本信息...';

                  createWebConfig({ token: form.value.token, name: form.value.name })
                    .then(() => {
                      progress.value.value = Number(Math.floor((4.5 / 5) * 100).toFixed(2));
                      progress.value.step = '马上完成...';

                      createAgentConfig({ token: form.value.token, name: form.value.name })
                        .then((data) => {
                          progress.value.value = 100;
                          progress.value.status = 'success';
                          progress.value.step = '创建成功!';
                          form.value.actToken = data.token;
                        })
                        .catch(() => {
                          progress.value.status = 'exception';
                        });
                    })
                    .catch(() => {
                      progress.value.status = 'exception';
                    });
                })
                .catch(() => {
                  progress.value.status = 'exception';
                });
            })
            .catch(() => {
              progress.value.status = 'exception';
            });
        })
        .catch(() => {
          progress.value.status = 'exception';
        });
    };

    const toLogin = () => {
      userStore
        .registerLogin(form.value.actToken)
        .then(() => {})
        .catch(() => {
          createMessage.error('登录失败!');
        });
    };

    return { progress, loadingIcon, toLogin };
  },
});
</script>
<style lang="css" scoped>
.ant-layout,
.ant-layout-footer {
  background: transparent;
}
.content {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: url('https://v9.emd315.com/content/images/register/register-bg.png') no-repeat;
  background-size: cover;
}

.loading {
  height: 50%;
}
.loading-box {
  margin-top: 20%;
  height: 100%;
  width: 24%;
}
</style>
