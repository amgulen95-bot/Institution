<template>
  <ConfigProvider :locale="getAntdLocale" :theme="themeConfig">
    <AppProvider>
      <RouterView />
    </AppProvider>
  </ConfigProvider>
</template>

<script lang="ts" setup>
  import { onMounted,ref } from 'vue';
  import { AppProvider } from '@/components/Application';
  import { useTitle } from '@/hooks/web/useTitle';
  import { useLocale } from '@/locales/useLocale';
  import { ConfigProvider } from 'ant-design-vue';
  import { useAppStore } from '/@/store/modules/app'
  import { useUserStore } from '/@/store/modules/user'
  import { useDarkModeTheme } from '@/hooks/setting/useDarkModeTheme';
  import 'dayjs/locale/zh-cn';
  import { computed } from 'vue';
  import { useWatermark } from '@/hooks/web/useWatermark';
  import { getToken ,getApiToken } from '@/utils/auth';

  const { getAntdLocale } = useLocale();
  const { isDark, darkTheme } = useDarkModeTheme();
  const themeConfig = computed(() =>
    Object.assign(
      {
        token: {
          colorPrimary: '#0A5AFF',
          colorSuccess: '#55D187',
          colorWarning: '#EFBD47',
          colorError: '#E02424',
          colorInfo: '#0A5AFF',
          borderRadius:8,  //按钮圆角
          colorBgLayout:'#EEF3FB',  //页面主背景
          borderRadiusLG:8,  //card圆角
          paddingLG:16,  //card基础padding
          colorFillQuaternary:'#FAFBFC',  //表格表头、悬浮色
          colorText:'#1F2229', //文本基础色
          padding:12,
          paddingContentVerticalLG:12,
          colorTextTertiary:'#858D98',
          lineHeight:1.286
        },
      },
      isDark.value ? darkTheme : {},
    ),
  );
  useTitle();
  const appStore = useAppStore()
  const userStore = useUserStore()
  const watermarkFormData=ref({
    Enable:false,
    EnablePlatform:[],
    Content:[],
    FontSize: 12,
    Color: "#000000",
    Transparency: 0.5,
    Width: 100,
    RowSpacing: 100,
    DipAngle: 0,
    Text:""
  })
  var regex = /token=([^&]+)/;
  var match = location.href.match(regex);
  
  if (match) {
    let token = match[1];
    var decodedToken = decodeURIComponent(token);
    var tokenWithoutHash = decodedToken.split("#")[0];
    userStore.registerLogin(tokenWithoutHash)
  } else {
  }
  const app = ref(document.body);
  
  onMounted(() => {
    appStore.setWindowAvailableHeight()
    window.onresize = () => {
      appStore.setWindowAvailableHeight()
    }
  })
</script>
