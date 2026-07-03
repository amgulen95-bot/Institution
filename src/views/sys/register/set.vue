<template>
  <a-layout class="content">
    <a-layout>
      <div class="welcome-title">请选择适合您的店铺版本</div>
      <div class="listContent">
        <div class="listItem" v-for="item in setList" :key="item.id">
          <div class="header" v-if="item.id==1">
            <div class="title">{{ item.name }}</div>
            <div class="describe">试用期7天，可体验后台各个功能</div>
          </div>
          <div class="header1" v-if="item.id==3">
            <div class="title">{{ item.name }}</div>
            <div class="describe">可满足商品销售、运营基础需求</div>
          </div>
          <div class="header2" v-if="item.id==2">
            <div class="title">{{ item.name }}</div>
            <div class="describe">满足推广获客，复购增购核心需求</div>
          </div>
          <div class="header3" v-if="item.id==4">
            <div class="title">{{ item.name }}</div>
            <div class="describe">满足绝大部分需求，年版特划算</div>
          </div>
          <div class="editionContent">
            <ul>
              <li class="featuresItem" v-for="(itm, index) in item.features" :key="index">{{ itm }}</li>
            </ul>
            <div>
              <div class="price">
                <span class="mark">&yen;</span>
                <span class="priceNum">{{ item.sellPrice }}</span>/
                <span class="company">{{item.id==1?'元':'年'}}</span>
              </div>
              <div>
                <a-button class="serviceBtn" type="primary" block size="large" round v-if="item.canCreate" @click="showPrompt(item)" >免费试用</a-button>
                <a-button class="serviceBtn" block size="large" type="primary" ghost v-else>咨询详情</a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="text-sm text-gray text-center aj-margin-top">
        <span class="aj-margin-right-sm">如果您有任何疑问，请拨打咨询热线：</span
        ><Icon icon="ant-design:phone-outlined"></Icon> <span>132-8888-3007</span>
      </div>
    </a-layout>
    <register-footer></register-footer>

    <aj-prompt
      v-model:open="promptModal.visible"
      title="请输入您的店铺名称"
      required
      placeholder="4至6字以内,简洁易懂的名称"
      :rules="{ required: true, message: '该项必须填写', trigger: 'blur' }"
      @submit="brandNameConfirm"
    ></aj-prompt>
  </a-layout>
</template>
<script lang="ts">
import { computed, defineComponent, ref, unref, toRaw, onMounted, nextTick } from 'vue';

import RegisterFooter from './components/footer.vue';

import AJPrompt from '/@/components/AJ/Modal/PromptModal.vue';

import { useMessage } from '/@/hooks/web/useMessage';

import { useRoute } from 'vue-router';

import { useGo } from '/@/hooks/web/usePage';

import { useUserStore } from '/@/store/modules/user';

import { getSets } from '/@/api/platform';

export default defineComponent({
  components: {
    [RegisterFooter.name]: RegisterFooter,
    [AJPrompt.name]: AJPrompt,
  },
  setup() {
    // data

    const setList = ref([]);

    const promptModal = ref({
      visible: false,
      setId: 0,
      brand: '',
    });

    let token = '';

    const userStore = useUserStore();
    const go = useGo();
    const route = useRoute();
    const { notification, createSuccessModal, createMessage } = useMessage();

    // 生命周期

    onMounted(() => {
      nextTick(() => {
        token = history.state.token;
        createMessage.loading({
          content: '请稍后...',
          key: 'loading',
          duration: 0,
        });
        getSets()
          .then((list) => {
            setList.value = list;
          })
          .catch(() => {})
          .finally(() => {
            createMessage.loading({
              content: '请稍后...',
              key: 'loading',
              duration: 1,
            });
          });
      });
    });

    // methods

    const showPrompt = (record) => {
      // 弹窗填写品牌
      promptModal.value.setId = record.id;
      promptModal.value.brand = '';
      promptModal.value.visible = true;
    };

    const brandNameConfirm = (name) => {
      promptModal.value.brand = name.value;
      setTimeout(() => {
        go(
          {
            name: 'RegisterInit',
            state: {
              id: promptModal.value.setId,
              brand: name.value,
              token,
            },
            query: {
              id: promptModal.value.setId,
            },
          },
          true,
        );
      }, 600);
    };

    return { setList, promptModal, showPrompt, brandNameConfirm };
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
.welcome-title {
  text-align: center;
  padding-top:80px;
  font-weight: 700;
  font-size: 32px;
  line-height: 38px;
  color: #2F3033;
}
.set-item .title {
  font-size: 20px;
}
.listContent{
  padding:96px 332px 0 332px;
  display: flex;
  justify-content: space-between;
}
.listItem{
  width: 280px;
  height: 580px;
  border-radius: 12px;
  overflow: hidden;
}
.header{
  background: linear-gradient(95.91deg, #B4BED9 9.13%, #727D97 101.08%), #0A5AFF;
  height: 98px;
  padding: 24px;
  box-sizing: border-box;
  text-align: center;
}
.title{
  font-weight: 700;
  font-size: 24px;
  line-height: 28px;
  color: #FFFFFF;
}
.describe{
  margin-top: 6px;
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  color: #FFFFFF;
}
.header1{
  background: linear-gradient(95.91deg, #739CEF 9.13%, #1A60F1 101.08%), linear-gradient(95.91deg, #4DA1F6 9.13%, #4487FF 101.08%), #0A5AFF;
  height: 98px;
  padding: 24px;
  box-sizing: border-box;
  text-align: center;
}
.header2{
  background: linear-gradient(95.91deg, #F5BB8F 9.13%, #D17845 101.08%), linear-gradient(95.91deg, #F5AE8F 9.13%, #DB7950 101.08%), #0A5AFF;
  height: 98px;
  padding: 24px;
  box-sizing: border-box;
  text-align: center;
}
.header3{
  background: linear-gradient(95.91deg, #ED7F86 9.13%, #D92A29 101.08%), linear-gradient(95.91deg, #FA5453 9.13%, #D83015 101.08%), #0A5AFF;
  height: 98px;
  padding: 24px;
  box-sizing: border-box;
  text-align: center;
}
.editionContent{
  height: 482px;
  background-color: #FFFFFF;
  padding: 0 16px 24px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.featuresItem{
  font-weight: 400;
  font-size: 14px;
  line-height:18px;
  color: #5E6166;
  margin-top: 24px;
}
.price{
  text-align: center;
  padding-bottom: 12px;
}
.mark{
  font-weight:bold;
  font-size: 14px;
  line-height: 16px;
  color: #2F3033;
}
.priceNum{
  font-weight: 500;
  font-size: 32px;
  line-height: 38px;
  color: #2F3033;
}
.company{
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  color: #8D9199;
}
.serviceBtn{
  background: #0A5AFF;
  border-radius: 4px;
}
</style>
