<template>
  <div class="login-shell">
    <img class="login-shell__bg" :src="commandCenterImage" alt="" />
    <div class="login-shell__wash"></div>

    <section class="login-cockpit">
      <div class="login-cockpit__top">
        <div>
          <div class="login-cockpit__eyebrow">MENGYIYUN OPERATION COMMAND</div>
          <div class="login-cockpit__title">蒙医云互联网医院运营中枢</div>
          <div class="login-cockpit__desc">互联网医院、在线开方、中央智慧蒙药房与收费经营数据实时联动</div>
        </div>
        <div class="login-cockpit__meta">
          <div class="login-cockpit__clock">
            <strong>{{ timeText }}</strong>
            <span>{{ dateText }}</span>
            <em>{{ weekdayText }}</em>
          </div>
          <div class="login-cockpit__weather">
            <i :class="['login-weather-icon', weatherIconClass]"></i>
            <div>
              <strong>{{ locationInfo.city }}</strong>
              <span>{{ locationInfo.weather }} {{ locationInfo.temperature }}</span>
            </div>
          </div>
          <div class="login-cockpit__status">
            <span></span>
            实时运行
          </div>
        </div>
      </div>

      <div class="login-data-stage">
        <div
          v-for="(page, pageIndex) in dashboardPages"
          :key="page.key"
          class="login-data-page"
          :class="{ active: activeDashboardPageIndex === pageIndex }"
        >
          <div class="login-data-page__header">
            <span>{{ page.kicker }}</span>
            <strong>{{ page.title }}</strong>
            <em>{{ page.summary }}</em>
          </div>

          <div class="login-kpi-grid">
            <div v-for="item in page.metrics" :key="item.label" class="login-kpi">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <em>{{ item.delta }}</em>
            </div>
          </div>

          <div class="login-analytics">
            <div class="login-trend">
              <div class="login-panel-title">
                <span>{{ page.chartTitle }}</span>
                <em>{{ page.chartMeta }}</em>
              </div>
              <div class="login-trend__bars">
                <i v-for="(bar, index) in page.bars" :key="index" :style="{ height: `${bar}%` }"></i>
              </div>
            </div>

            <div class="login-flow">
              <div class="login-panel-title">
                <span>{{ page.flowTitle }}</span>
                <em>{{ page.flowMeta }}</em>
              </div>
              <div v-for="item in page.flows" :key="item.label" class="login-flow__row">
                <div>
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
                <i><b :style="{ width: `${item.rate}%` }"></b></i>
              </div>
            </div>

            <div class="login-index">
              <div class="login-panel-title">
                <span>{{ page.indexTitle }}</span>
                <em>{{ page.indexMeta }}</em>
              </div>
              <div class="login-index__orb">
                <strong>{{ page.indexValue }}</strong>
                <span>{{ page.indexLabel }}</span>
              </div>
            </div>
          </div>

          <div class="login-stream">
            <div v-for="item in page.stream" :key="item" class="login-stream__item">{{ item }}</div>
          </div>
        </div>
      </div>

      <div class="login-page-dots">
        <span
          v-for="(page, pageIndex) in dashboardPages"
          :key="page.key"
          :class="{ active: activeDashboardPageIndex === pageIndex }"
        ></span>
      </div>
    </section>

    <aside class="login-card">
      <div class="login-card__header">
        <div class="login-card__eyebrow">安全登录</div>
        <div class="login-card__title">欢迎回到蒙医云诊室</div>
        <div class="login-card__desc">在线开方、云药房、收费管理一体协同</div>
      </div>

      <div class="login-tabs">
        <button type="button" :class="{ active: loginType === 'password' }" @click="loginType = 'password'">
          密码登录
        </button>
        <button type="button" :class="{ active: loginType === 'sms' }" @click="loginType = 'sms'">
          验证码登录
        </button>
      </div>

      <a-form class="login-form" :model="loginForm" :layout="'vertical'" @keypress.enter="toLogin">
        <a-form-item label="手机号码">
          <a-input
            v-model:value="loginForm.phone"
            class="login-input"
            placeholder="请输入手机号"
            allow-clear
            :maxlength="11"
          >
            <template #prefix><MobileOutlined /></template>
          </a-input>
        </a-form-item>

        <a-form-item v-if="loginType === 'password'" label="登录密码">
          <a-input-password
            v-model:value="loginForm.password"
            class="login-input"
            placeholder="请输入登录密码"
            allow-clear
          >
            <template #prefix><LockOutlined /></template>
          </a-input-password>
        </a-form-item>

        <a-form-item v-else label="短信验证码">
          <div class="login-code-row">
            <a-input
              v-model:value="loginForm.code"
              class="login-input login-code-input"
              placeholder="请输入验证码"
              allow-clear
              :maxlength="6"
            >
              <template #prefix><SafetyCertificateOutlined /></template>
            </a-input>
            <a-button class="login-code-btn" :disabled="codeSending || !canSendCode" @click="sendCode">
              {{ codeButtonText }}
            </a-button>
          </div>
        </a-form-item>
      </a-form>

      <div class="login-options">
        <a-checkbox v-model:checked="autoLogin">3天内自动登录</a-checkbox>
        <button type="button">忘记密码?</button>
      </div>

      <a-button
        type="primary"
        class="login-submit"
        :loading="loading"
        :disabled="!canSubmit"
        @click="toLogin"
      >
        登录系统
      </a-button>

      <div class="login-security">
        <SafetyCertificateOutlined />
        <span>登录即代表您同意《用户服务协议》与《隐私政策》</span>
      </div>
    </aside>

    <transition name="login-welcome-fade">
      <section
        v-if="welcomeVisible"
        class="login-welcome"
        :class="{ 'login-welcome--leaving': welcomeLeaving }"
      >
        <div class="login-welcome__panel">
          <div class="login-welcome__halo"></div>
          <div class="login-welcome__topline">
            <span>MENGYIYUN</span>
            <em>机构端</em>
          </div>
          <div class="login-welcome__hero">
            <div class="login-welcome__copy">
              <h1>欢迎回到蒙医云诊室</h1>
              <p>{{ welcomeUserName }}，正在进入工作台</p>
            </div>
          </div>
          <div class="login-welcome__progress">
            <i></i>
          </div>
        </div>
      </section>
    </transition>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
  import { MobileOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons-vue';
  import { useUserStore } from '@/store/modules/user';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useDesign } from '@/hooks/web/useDesign';
  import { router } from '@/router';
  import { PageEnum } from '@/enums/pageEnum';
  import { AccountApiCtrl } from '/@/api/myy/account';
  import commandCenterImage from '../../../assets/images/login-command-center.png';

  localStorage.removeItem('GID')

  const { prefixCls } = useDesign('login');
  const { t } = useI18n();
  const { createErrorModal, createMessage } = useMessage();
  const userStore = useUserStore();
  const loading = ref(false)
  const autoLogin = ref(false)
  const loginType = ref<'password' | 'sms'>('password')
  const codeSending = ref(false)
  const codeCountdown = ref(0)
  const commandPulse = ref(0)
  const nowTime = ref(new Date())
  const welcomeVisible = ref(false)
  const welcomeLeaving = ref(false)
  const welcomeUserName = ref('')
  const locationInfo = ref({
    city: '成都',
    weather: '多云',
    temperature: '24℃',
  })
  let codeTimer: ReturnType<typeof window.setInterval> | null = null
  let commandTimer: ReturnType<typeof window.setInterval> | null = null
  let clockTimer: ReturnType<typeof window.setInterval> | null = null
  let welcomeTimer: ReturnType<typeof window.setTimeout> | null = null

  const loginForm = ref({
    phone:'',
    password:'',
    code:'',
  })

  const padTime = (value: number) => String(value).padStart(2, '0')
  const weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const dateText = computed(() => {
    const value = nowTime.value
    return `${value.getFullYear()}年${padTime(value.getMonth() + 1)}月${padTime(value.getDate())}日`
  })
  const timeText = computed(() => {
    const value = nowTime.value
    return `${padTime(value.getHours())}:${padTime(value.getMinutes())}:${padTime(value.getSeconds())}`
  })
  const weekdayText = computed(() => weekdayNames[nowTime.value.getDay()])
  const weatherIconClass = computed(() => {
    const weather = locationInfo.value.weather
    if (/雨|阵雨|雷/.test(weather)) return 'is-rainy'
    if (/雪|冰/.test(weather)) return 'is-snowy'
    if (/阴|云|雾|霾/.test(weather)) return 'is-cloudy'
    return 'is-sunny'
  })
  const activeDashboardPageIndex = computed(() => Math.floor(commandPulse.value / 5) % dashboardPages.value.length)
  const metric = (base: number, mod = 10) => base + (commandPulse.value % mod)

  const dashboardPages = computed(() => {
    const pulse = commandPulse.value
    return [
      {
        key: 'internet-hospital',
        kicker: 'INTERNET HOSPITAL',
        title: '互联网医院实时接诊看板',
        summary: '线上咨询、复诊续方、电子病历与处方审方统一进入同一运营节奏',
        chartTitle: '在线问诊活跃趋势',
        chartMeta: '近 10 个时段',
        flowTitle: '在线服务闭环',
        flowMeta: '自动刷新',
        indexTitle: '服务响应指数',
        indexMeta: 'SLA',
        indexValue: `${metric(94, 5)}%`,
        indexLabel: '响应稳定',
        metrics: [
          { label: '在线咨询', value: `${metric(186, 24)}`, delta: `+${metric(12, 6)}` },
          { label: '远程复诊', value: `${metric(62, 13)}`, delta: '滚动' },
          { label: '续方申请', value: `${metric(48, 11)}`, delta: `+${metric(5, 4)}` },
          { label: '待响应', value: `${metric(5, 4)}`, delta: '低等待' },
          { label: '病历同步', value: `${metric(95, 4)}%`, delta: '同步' },
        ],
        bars: [42, 58, 51, 72, 63, 78, 66, 86, 60, 74].map((item, index) => item + ((pulse + index) % 5) * 3),
        flows: [
          { label: '咨询接入', value: `${metric(88, 8)}%`, rate: metric(88, 8) },
          { label: '医生响应', value: `${metric(78, 12)}%`, rate: metric(78, 12) },
          { label: '服务归档', value: `${metric(72, 14)}%`, rate: metric(72, 14) },
        ],
        stream: ['患者主诉已结构化', '复诊病历自动关联', '电子处方进入审方队列', '在线服务状态同步完成'],
      },
      {
        key: 'prescription',
        kicker: 'E-PRESCRIPTION',
        title: '在线开方与审方协同看板',
        summary: '处方模板、药材用量、审方提示与云药房调配链路实时联动',
        chartTitle: '处方流转趋势',
        chartMeta: '实时处方',
        flowTitle: '审方协同链路',
        flowMeta: '药师在线',
        indexTitle: '处方安全指数',
        indexMeta: '质控',
        indexValue: `${metric(96, 4)}%`,
        indexLabel: '安全开方',
        metrics: [
          { label: '今日处方', value: `${metric(218, 36)}`, delta: `+${metric(16, 8)}` },
          { label: '待审方', value: `${metric(7, 6)}`, delta: '可控' },
          { label: '审方通过', value: `${metric(94, 5)}%`, delta: '稳定' },
          { label: '模板调用', value: `${metric(68, 12)}%`, delta: '提升' },
          { label: '风险提示', value: `${metric(2, 3)}`, delta: '低风险' },
        ],
        bars: [52, 70, 62, 78, 74, 88, 79, 92, 82, 90].map((item, index) => item + ((pulse + index) % 3) * 3),
        flows: [
          { label: '医生提交', value: `${metric(90, 7)}%`, rate: metric(90, 7) },
          { label: '药师审方', value: `${metric(80, 10)}%`, rate: metric(80, 10) },
          { label: '发药准备', value: `${metric(70, 16)}%`, rate: metric(70, 16) },
        ],
        stream: ['经典验方模板已加载', '药材库存联动校验', '剂量规则自动复核', '处方进入云药房调配'],
      },
      {
        key: 'cloud-pharmacy',
        kicker: 'CLOUD PHARMACY',
        title: '中央智慧蒙药房调配看板',
        summary: '审方、称量、复核、打包、配送交接形成可追踪调配链路',
        chartTitle: '实时调配负载趋势',
        chartMeta: '云药房',
        flowTitle: '调配配送链路',
        flowMeta: '动态队列',
        indexTitle: '调配稳定指数',
        indexMeta: '负载',
        indexValue: `${metric(92, 7)}%`,
        indexLabel: '有序调配',
        metrics: [
          { label: '调配任务', value: `${metric(76, 22)}`, delta: `+${metric(9, 5)}` },
          { label: '打包完成', value: `${metric(38, 16)}`, delta: '实时' },
          { label: '配送中', value: `${metric(21, 11)}`, delta: '联动' },
          { label: '库存预警', value: `${metric(3, 3)}`, delta: '可控' },
          { label: '平均出库', value: `${metric(18, 6)}分`, delta: '顺畅' },
        ],
        bars: [55, 72, 66, 81, 77, 90, 70, 86, 74, 92].map((item, index) => item + ((pulse + index) % 4) * 2),
        flows: [
          { label: '药材称量', value: `${metric(82, 9)}%`, rate: metric(82, 9) },
          { label: '复核打包', value: `${metric(74, 13)}%`, rate: metric(74, 13) },
          { label: '配送交接', value: `${metric(62, 18)}%`, rate: metric(62, 18) },
        ],
        stream: ['药材称量任务分配', '复核台状态已同步', '配送轨迹写入订单', '异常调配自动拦截'],
      },
      {
        key: 'pharmacy-stock',
        kicker: 'HERBAL INVENTORY',
        title: '蒙药材库存与产能调度看板',
        summary: '药材库存、批次效期、煎配产能与缺药预警持续滚动监测',
        chartTitle: '库存安全水位趋势',
        chartMeta: '药材批次',
        flowTitle: '产能分配进度',
        flowMeta: '智能排程',
        indexTitle: '库存健康指数',
        indexMeta: '预警',
        indexValue: `${metric(90, 8)}%`,
        indexLabel: '库存稳定',
        metrics: [
          { label: '药材品规', value: `${metric(428, 32)}`, delta: '在线' },
          { label: '安全库存', value: `${metric(91, 6)}%`, delta: '稳定' },
          { label: '近效批次', value: `${metric(6, 5)}`, delta: '跟进' },
          { label: '煎配产能', value: `${metric(84, 10)}%`, delta: '调度' },
          { label: '缺药预警', value: `${metric(2, 3)}`, delta: '低位' },
        ],
        bars: [64, 72, 68, 82, 76, 88, 80, 92, 84, 90].map((item, index) => item + ((pulse + index) % 4) * 2),
        flows: [
          { label: '库存校验', value: `${metric(92, 5)}%`, rate: metric(92, 5) },
          { label: '批次锁定', value: `${metric(82, 9)}%`, rate: metric(82, 9) },
          { label: '产能分配', value: `${metric(72, 16)}%`, rate: metric(72, 16) },
        ],
        stream: ['药材批次效期已复核', '库存安全线动态更新', '煎配产能自动排程', '缺药预警进入跟进列表'],
      },
      {
        key: 'dispatch',
        kicker: 'FULFILLMENT',
        title: '云药房配送履约实时看板',
        summary: '处方打包、物流交接、患者收货与异常履约形成全链路追踪',
        chartTitle: '配送履约趋势',
        chartMeta: '近 10 批次',
        flowTitle: '订单履约节点',
        flowMeta: '配送联动',
        indexTitle: '履约准时指数',
        indexMeta: '物流',
        indexValue: `${metric(93, 6)}%`,
        indexLabel: '准时履约',
        metrics: [
          { label: '待交接', value: `${metric(18, 9)}`, delta: '配送' },
          { label: '运输中', value: `${metric(42, 13)}`, delta: '追踪' },
          { label: '已签收', value: `${metric(118, 24)}`, delta: '完成' },
          { label: '异常件', value: `${metric(1, 3)}`, delta: '低风险' },
          { label: '准时率', value: `${metric(94, 5)}%`, delta: '稳定' },
        ],
        bars: [48, 66, 60, 76, 70, 84, 78, 90, 82, 88].map((item, index) => item + ((pulse + index) % 5) * 2),
        flows: [
          { label: '打包出库', value: `${metric(86, 8)}%`, rate: metric(86, 8) },
          { label: '物流交接', value: `${metric(78, 12)}%`, rate: metric(78, 12) },
          { label: '患者签收', value: `${metric(70, 16)}%`, rate: metric(70, 16) },
        ],
        stream: ['打包复核完成写入', '配送交接单已生成', '患者签收状态同步', '异常履约进入提醒'],
      },
      {
        key: 'finance',
        kicker: 'FINANCE LOOP',
        title: '收费订单与经营数据看板',
        summary: '费用明细、订单收款、药费溢价与经营趋势统一呈现',
        chartTitle: '收款趋势指数',
        chartMeta: '经营数据',
        flowTitle: '订单闭环进度',
        flowMeta: '收费管理',
        indexTitle: '经营健康指数',
        indexMeta: '实时',
        indexValue: `${metric(91, 6)}%`,
        indexLabel: '健康运行',
        metrics: [
          { label: '药费收入', value: `¥${(4.2 + pulse / 30).toFixed(1)}万`, delta: '实时' },
          { label: '收款完成', value: `${metric(92, 5)}%`, delta: '稳定' },
          { label: '待收款', value: `${metric(7, 5)}`, delta: '跟进' },
          { label: '订单完成', value: `${metric(86, 9)}%`, delta: '闭环' },
          { label: '退款处理', value: `${metric(1, 2)}`, delta: '低风险' },
        ],
        bars: [50, 66, 58, 74, 69, 84, 73, 90, 78, 86].map((item, index) => item + ((pulse + index) % 4) * 3),
        flows: [
          { label: '生成订单', value: `${metric(88, 8)}%`, rate: metric(88, 8) },
          { label: '完成收款', value: `${metric(78, 10)}%`, rate: metric(78, 10) },
          { label: '进入归档', value: `${metric(68, 16)}%`, rate: metric(68, 16) },
        ],
        stream: ['订单金额完成确认', '收款窗口已联动', '经营数据刷新完成', '费用明细进入归档'],
      },
      {
        key: 'quality',
        kicker: 'QUALITY & SAFETY',
        title: '医疗质量与运营安全看板',
        summary: '病历完整性、处方合规、数据同步、安全登录与运营审计持续监测',
        chartTitle: '质量安全趋势',
        chartMeta: '质控',
        flowTitle: '风险处置进度',
        flowMeta: '安全审计',
        indexTitle: '质控健康指数',
        indexMeta: '在线',
        indexValue: `${metric(97, 3)}%`,
        indexLabel: '安全运行',
        metrics: [
          { label: '质控通过', value: `${metric(96, 4)}%`, delta: '稳定' },
          { label: '病历完整', value: `${metric(93, 5)}%`, delta: '同步' },
          { label: '处方合规', value: `${98 - pulse % 3}%`, delta: '高位' },
          { label: '同步延迟', value: `${metric(2, 3)}s`, delta: '正常' },
          { label: '系统可用', value: `99.${6 + pulse % 4}%`, delta: '在线' },
        ],
        bars: [62, 76, 70, 84, 80, 92, 86, 94, 88, 96].map((item, index) => item + ((pulse + index) % 3) * 2),
        flows: [
          { label: '病历质控', value: `${metric(88, 8)}%`, rate: metric(88, 8) },
          { label: '处方质控', value: `${metric(90, 7)}%`, rate: metric(90, 7) },
          { label: '运营审计', value: `${metric(76, 14)}%`, rate: metric(76, 14) },
        ],
        stream: ['处方合规策略通过', '病历必填项完成复核', '数据同步延迟正常', '登录安全审计完成'],
      },
    ]
  })

  const isPhoneValid = computed(() => /^1[3-9]\d{9}$/.test(loginForm.value.phone))
  const canSendCode = computed(() => isPhoneValid.value && codeCountdown.value === 0)
  const codeButtonText = computed(() => codeCountdown.value > 0 ? `${codeCountdown.value}s 后重发` : '获取验证码')
  const canSubmit = computed(() => {
    if (!isPhoneValid.value) return false
    if (loginType.value === 'password') {
      return Boolean(loginForm.value.password)
    }
    return /^\d{4,6}$/.test(loginForm.value.code)
  })

  const startCodeCountdown = () => {
    codeCountdown.value = 60
    if (codeTimer) {
      clearInterval(codeTimer)
    }
    codeTimer = window.setInterval(() => {
      codeCountdown.value -= 1
      if (codeCountdown.value <= 0 && codeTimer) {
        clearInterval(codeTimer)
        codeTimer = null
      }
    }, 1000)
  }

  const sendCode = async () => {
    if (!isPhoneValid.value) {
      createMessage.warning('请输入11位有效手机号')
      return
    }
    try {
      codeSending.value = true
      await AccountApiCtrl.SendVerifyCode({
        Phone: loginForm.value.phone,
        phone: loginForm.value.phone,
      }, 'none')
      createMessage.success('验证码已发送')
      startCodeCountdown()
    } catch (error) {
      createErrorModal({
        title: t('sys.api.errorTip'),
        content: (error as unknown as Error).message || t('sys.api.networkExceptionMsg'),
        getContainer: () => document.body.querySelector(`.${prefixCls}`) || document.body,
      });
    } finally {
      codeSending.value = false
    }
  }

  const clearWelcomeTimer = () => {
    if (welcomeTimer) {
      clearTimeout(welcomeTimer)
      welcomeTimer = null
    }
  }

  const showLoginWelcome = (userInfo) => {
    clearWelcomeTimer()
    welcomeUserName.value = userInfo?.Doctor?.DoctorName || userInfo?.AccountName || '欢迎回来'
    welcomeLeaving.value = false
    welcomeVisible.value = true

    welcomeTimer = window.setTimeout(async () => {
      welcomeLeaving.value = true
      welcomeTimer = window.setTimeout(async () => {
        await router.replace(userInfo?.homePath || PageEnum.BASE_HOME)
      }, 620)
    }, 2200)
  }

  const toLogin = async () => {
    if (!isPhoneValid.value) {
      createMessage.warning('请输入11位有效手机号')
      return
    }
    if (loginType.value === 'password' && !loginForm.value.password) {
      createMessage.warning('请输入登录密码')
      return
    }
    if (loginType.value === 'sms' && !/^\d{4,6}$/.test(loginForm.value.code)) {
      createMessage.warning('请输入有效验证码')
      return
    }

    try {
      loading.value = true;
      const userInfo = loginType.value === 'password'
        ? await userStore.login({
            password: loginForm.value.password,
            phone: loginForm.value.phone,
            goHome: false,
            mode: 'none',
          })
        : await userStore.loginBySms({
            phone: loginForm.value.phone,
            code: loginForm.value.code,
            goHome: false,
            mode: 'none',
          });
      if (userInfo) {
        showLoginWelcome(userInfo)
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

  const getFallbackWeather = (city = '成都') => {
    const hour = nowTime.value.getHours()
    const isDaytime = hour >= 7 && hour < 19
    return {
      city,
      weather: isDaytime ? '多云' : '晴',
      temperature: isDaytime ? '24℃' : '18℃',
    }
  }

  const fetchWithTimeout = async (url: string, timeout = 3200) => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), timeout)
    try {
      return await fetch(url, {
        signal: controller.signal,
        cache: 'no-store',
      })
    } finally {
      window.clearTimeout(timer)
    }
  }

  const loadLocationWeather = async () => {
    try {
      const ipResponse = await fetchWithTimeout('https://ipapi.co/json/', 3000)
      if (!ipResponse.ok) throw new Error('location failed')
      const ipData = await ipResponse.json()
      const city = String(ipData?.city || ipData?.region || ipData?.country_name || '成都').trim()
      locationInfo.value = getFallbackWeather(city || '成都')

      try {
        const weatherResponse = await fetchWithTimeout(
          `https://wttr.in/${encodeURIComponent(locationInfo.value.city)}?format=j1&lang=zh`,
          3600,
        )
        if (!weatherResponse.ok) throw new Error('weather failed')
        const weatherData = await weatherResponse.json()
        const current = weatherData?.current_condition?.[0]
        const weather =
          current?.lang_zh?.[0]?.value ||
          current?.weatherDesc?.[0]?.value ||
          locationInfo.value.weather
        const temperature = current?.temp_C ? `${current.temp_C}℃` : locationInfo.value.temperature
        locationInfo.value = {
          city: locationInfo.value.city,
          weather,
          temperature,
        }
      } catch {
        locationInfo.value = getFallbackWeather(locationInfo.value.city)
      }
    } catch {
      locationInfo.value = getFallbackWeather()
    }
  }

  onMounted(() => {
    nowTime.value = new Date()
    clockTimer = window.setInterval(() => {
      nowTime.value = new Date()
    }, 1000)
    loadLocationWeather()
    commandTimer = window.setInterval(() => {
      commandPulse.value = (commandPulse.value + 1) % 300
    }, 1700)
  })

  onBeforeUnmount(() => {
    if (codeTimer) {
      clearInterval(codeTimer)
      codeTimer = null
    }
    if (commandTimer) {
      clearInterval(commandTimer)
      commandTimer = null
    }
    if (clockTimer) {
      clearInterval(clockTimer)
      clockTimer = null
    }
    clearWelcomeTimer()
  })
</script>

<style lang="less" scoped>
  .login-shell {
    position: relative;
    width: 100%;
    min-height: 100vh;
    overflow: hidden;
    background: #f4f7f9;
  }

  .login-shell__bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
  }

  .login-shell__wash {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, #f4f7f9 0%, #f8fafc 48%, #f4f7f9 100%);
  }

  .login-welcome {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background:
      linear-gradient(180deg, rgba(244, 247, 249, 0.28) 0%, rgba(244, 247, 249, 0.62) 100%),
      rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(18px);
  }

  .login-welcome__panel {
    position: relative;
    width: 100vw;
    min-height: 330px;
    padding: 46px clamp(48px, 8vw, 132px) 50px;
    overflow: hidden;
    text-align: left;
    background:
      linear-gradient(90deg, rgba(255, 255, 255, 0.84) 0%, rgba(249, 251, 253, 0.7) 58%, rgba(244, 247, 249, 0.62) 100%);
    border-top: 1px solid rgba(214, 224, 236, 0.9);
    border-right: 0;
    border-bottom: 1px solid rgba(214, 224, 236, 0.92);
    border-left: 0;
    border-radius: 0;
    box-shadow: 0 28px 90px rgba(38, 52, 78, 0.12);
    animation: login-welcome-rise 0.64s ease both;
    backdrop-filter: blur(20px);

    &::before {
      position: absolute;
      top: 28px;
      right: clamp(48px, 8vw, 132px);
      left: clamp(48px, 8vw, 132px);
      height: 1px;
      background-image: linear-gradient(to right, rgba(202, 214, 229, 0.9) 50%, transparent 50%);
      background-repeat: repeat-x;
      background-size: 8px 1px;
      content: '';
      pointer-events: none;
    }

    &::after {
      position: absolute;
      right: clamp(48px, 8vw, 132px);
      bottom: 28px;
      left: clamp(48px, 8vw, 132px);
      height: 1px;
      background-image: linear-gradient(to right, rgba(202, 214, 229, 0.78) 50%, transparent 50%);
      background-repeat: repeat-x;
      background-size: 8px 1px;
      content: '';
      pointer-events: none;
    }
  }

  .login-welcome--leaving .login-welcome__panel {
    animation: login-welcome-leave 0.62s ease both;
  }

  .login-welcome__halo {
    position: absolute;
    top: 50%;
    right: 10vw;
    width: min(36vw, 420px);
    height: 1px;
    background: linear-gradient(90deg, rgba(47, 111, 237, 0), rgba(47, 111, 237, 0.22), rgba(47, 111, 237, 0));
    transform: translateY(-50%);
    pointer-events: none;
  }

  .login-welcome__topline {
    display: flex;
    position: relative;
    z-index: 1;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 0;
    color: #7a8798;
    font-size: 12px;
    line-height: 18px;

    span {
      color: #2f6fed;
      font-weight: 500;
      letter-spacing: 0;
    }

    em {
      color: #5f6a7a;
      font-style: normal;
    }
  }

  .login-welcome__hero {
    display: grid;
    position: relative;
    z-index: 1;
    grid-template-columns: minmax(420px, 0.72fr) minmax(260px, 0.28fr);
    align-items: center;
    gap: 48px;
    margin-top: 58px;
  }

  .login-welcome__copy {
    min-width: 0;
    grid-column: 1 / 2;
  }

  .login-welcome h1 {
    position: relative;
    z-index: 1;
    margin: 8px 0 0;
    color: #152033;
    font-size: clamp(40px, 4.6vw, 64px);
    font-weight: 500;
    line-height: 1.16;
    letter-spacing: 0;
  }

  .login-welcome p {
    position: relative;
    z-index: 1;
    max-width: 660px;
    margin: 16px 0 0;
    color: #5f6a7a;
    font-size: 17px;
    line-height: 28px;
  }

  .login-welcome__divider {
    display: none;
  }

  .login-welcome__progress {
    position: relative;
    z-index: 1;
    grid-column: 2 / 3;
    height: 3px;
    margin: 0 0 0 auto;
    width: min(360px, 28vw);
    overflow: hidden;
    background: rgba(222, 231, 242, 0.88);
    border-radius: 999px;

    i {
      display: block;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #2f6fed 0%, #7aa5ff 100%);
      border-radius: inherit;
      transform-origin: left center;
      animation: login-welcome-progress 2.82s linear both;
    }
  }

  .login-welcome-fade-enter-active,
  .login-welcome-fade-leave-active {
    transition: opacity 0.32s ease;
  }

  .login-welcome-fade-enter-from,
  .login-welcome-fade-leave-to {
    opacity: 0;
  }

  .login-cockpit {
    position: absolute;
    inset: 34px 538px 34px 54px;
    z-index: 1;
    display: flex;
    min-width: 0;
    flex-direction: column;
    justify-content: space-between;
    padding: 26px 30px 24px;
    border: 1px solid rgba(216, 227, 242, 0.92);
    border-radius: 28px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(249, 251, 253, 0.92) 100%),
      #fff;
    box-shadow: 0 24px 72px rgba(32, 56, 85, 0.1);
    backdrop-filter: blur(12px);

    &::before {
      position: absolute;
      inset: 18px;
      border: 1px dashed rgba(196, 212, 232, 0.82);
      border-radius: 22px;
      content: '';
      pointer-events: none;
    }

    &::after {
      position: absolute;
      inset: auto 0 0;
      height: 28%;
      border-radius: 0 0 28px 28px;
      background: linear-gradient(180deg, rgba(244, 247, 249, 0) 0%, rgba(244, 247, 249, 0.86) 100%);
      content: '';
      pointer-events: none;
    }
  }

  .login-cockpit__top {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    max-width: none;
  }

  .login-cockpit__eyebrow {
    color: #0a5aff;
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
  }

  .login-cockpit__title {
    margin-top: 8px;
    color: #172033;
    font-size: 36px;
    font-weight: 500;
    line-height: 46px;
  }

  .login-cockpit__desc {
    max-width: 560px;
    margin-top: 8px;
    color: #5f6a7a;
    font-size: 14px;
    line-height: 24px;
  }

  .login-cockpit__status {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 8px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid rgba(10, 90, 255, 0.14);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.58);
    color: #4f5d72;
    font-size: 12px;
    backdrop-filter: blur(12px);

    span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #0a5aff;
      box-shadow: 0 0 0 5px rgba(10, 90, 255, 0.1);
    }
  }

  .login-cockpit__meta {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: minmax(142px, auto) minmax(156px, auto);
    align-items: stretch;
    gap: 10px;
    max-width: 390px;
  }

  .login-cockpit__clock,
  .login-cockpit__weather {
    min-width: 0;
    padding: 11px 13px;
    border: 1px solid rgba(216, 227, 242, 0.9);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.72);
    box-shadow: 0 12px 30px rgba(32, 56, 85, 0.06);
  }

  .login-cockpit__clock {
    strong {
      display: block;
      color: #172033;
      font-family: DIN, 'Arial', sans-serif;
      font-size: 24px;
      font-weight: 600;
      line-height: 28px;
    }

    span,
    em {
      display: block;
      margin-top: 3px;
      color: #6c7788;
      font-size: 12px;
      font-style: normal;
      line-height: 16px;
      white-space: nowrap;
    }
  }

  .login-cockpit__weather {
    display: flex;
    align-items: center;
    gap: 10px;

    strong {
      display: block;
      color: #172033;
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      white-space: nowrap;
    }

    span {
      display: block;
      color: #6c7788;
      font-size: 12px;
      line-height: 18px;
      white-space: nowrap;
    }
  }

  .login-cockpit__meta .login-cockpit__status {
    grid-column: 1 / -1;
    justify-content: center;
    height: 30px;
  }

  .login-weather-icon {
    position: relative;
    display: inline-flex;
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: #eef5ff;

    &::before,
    &::after {
      position: absolute;
      content: '';
    }

    &.is-sunny::before {
      width: 17px;
      height: 17px;
      border-radius: 50%;
      background: #ffbd4a;
      box-shadow: 0 0 0 5px rgba(255, 189, 74, 0.18);
    }

    &.is-cloudy::before {
      width: 22px;
      height: 12px;
      border-radius: 999px;
      background: #7aa5ff;
      box-shadow: -7px 2px 0 -1px #a9c6ff, 8px 2px 0 -2px #4f8cff;
    }

    &.is-rainy::before {
      top: 12px;
      width: 23px;
      height: 11px;
      border-radius: 999px;
      background: #5f8fe8;
      box-shadow: -7px 2px 0 -1px #a9c6ff;
    }

    &.is-rainy::after {
      bottom: 8px;
      width: 18px;
      height: 7px;
      border-right: 2px solid #5f8fe8;
      border-left: 2px solid #5f8fe8;
      transform: skewX(-14deg);
    }

    &.is-snowy::before {
      width: 22px;
      height: 12px;
      border-radius: 999px;
      background: #8db6ef;
      box-shadow: -7px 2px 0 -1px #c8dcff;
    }

    &.is-snowy::after {
      bottom: 8px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #8db6ef;
      box-shadow: -7px 0 0 #8db6ef, 7px 0 0 #8db6ef;
    }
  }

  .login-data-stage {
    position: relative;
    z-index: 1;
    flex: 1;
    min-height: 0;
    margin-top: 26px;
  }

  .login-data-page {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    opacity: 0;
    filter: blur(16px);
    transform: translateY(18px) scale(0.988);
    transition: opacity 2.2s ease, filter 2.2s ease, transform 2.2s ease;
    pointer-events: none;

    &.active {
      opacity: 1;
      filter: blur(0);
      transform: translateY(0) scale(1);
      animation: login-dashboard-breathe 5.6s ease-in-out infinite;
    }
  }

  .login-data-page__header {
    max-width: 760px;

    span {
      display: inline-flex;
      height: 28px;
      align-items: center;
      padding: 0 12px;
      border: 1px solid rgba(10, 90, 255, 0.15);
      border-radius: 9px;
      background: rgba(238, 245, 255, 0.72);
      color: #0a5aff;
      font-size: 12px;
      font-weight: 600;
    }

    strong {
      display: block;
      margin-top: 12px;
      color: #172033;
      font-size: 30px;
      font-weight: 500;
      line-height: 40px;
    }

    em {
      display: block;
      max-width: 720px;
      margin-top: 8px;
      color: #5f6a7a;
      font-size: 14px;
      font-style: normal;
      line-height: 24px;
    }
  }

  .login-kpi-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
    margin-top: 24px;
    max-width: none;
  }

  .login-kpi,
  .login-trend,
  .login-flow,
  .login-index {
    border: 1px solid rgba(216, 227, 242, 0.86);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 16px 38px rgba(32, 56, 85, 0.07);
    backdrop-filter: blur(12px);
  }

  .login-kpi {
    position: relative;
    min-width: 0;
    padding: 14px 15px 18px;

    &::after {
      position: absolute;
      right: 14px;
      bottom: 12px;
      left: 14px;
      height: 1px;
      border-bottom: 1px dashed rgba(189, 210, 245, 0.72);
      content: '';
    }

    span {
      display: block;
      overflow: hidden;
      color: #5f6a7a;
      font-size: 12px;
      line-height: 18px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      display: inline-flex;
      margin-top: 5px;
      color: #0a5aff;
      font-size: 26px;
      font-weight: 600;
      line-height: 32px;
    }

    em {
      margin-left: 8px;
      color: #7f8b9c;
      font-size: 12px;
      font-style: normal;
    }
  }

  .login-analytics {
    display: grid;
    max-width: none;
    grid-template-columns: minmax(0, 1.24fr) minmax(250px, 0.7fr) 198px;
    gap: 14px;
    margin-top: 16px;
  }

  .login-trend,
  .login-flow,
  .login-index {
    min-width: 0;
    padding: 16px;
  }

  .login-panel-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    span {
      color: #172033;
      font-size: 13px;
      font-weight: 500;
      line-height: 18px;
    }

    em {
      color: #7f8b9c;
      font-size: 12px;
      font-style: normal;
      line-height: 18px;
    }
  }

  .login-trend__bars {
    display: flex;
    align-items: end;
    gap: 9px;
    height: clamp(136px, 20vh, 178px);
    margin-top: 16px;
    padding: 18px 4px 0;
    border-top: 1px dashed #d8e3f2;

    i {
      flex: 1;
      min-width: 0;
      border-radius: 10px 10px 4px 4px;
      background: linear-gradient(180deg, #0a5aff 0%, #8cb7ff 100%);
      box-shadow: 0 10px 22px rgba(10, 90, 255, 0.15);
      transition: height 1.2s ease;
    }
  }

  .login-flow__row {
    margin-top: 13px;
    padding-top: 12px;
    border-top: 1px dashed #d8e3f2;

    div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }

    span,
    strong {
      font-size: 12px;
      line-height: 18px;
    }

    span {
      color: #5f6a7a;
    }

    strong {
      color: #172033;
      font-weight: 500;
    }

    i {
      display: block;
      height: 7px;
      margin-top: 8px;
      overflow: hidden;
      border-radius: 999px;
      background: rgba(225, 235, 255, 0.72);

      b {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #0a5aff 0%, #8cb7ff 100%);
        transition: width 1s ease;
      }
    }
  }

  .login-index__orb {
    display: flex;
    width: 132px;
    height: 132px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 20px auto 0;
    border: 1px dashed #bdd2f5;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(238, 245, 255, 0.92) 0%, rgba(255, 255, 255, 0.5) 68%);
    box-shadow: inset 0 0 0 10px rgba(225, 235, 255, 0.45), 0 12px 30px rgba(10, 90, 255, 0.08);

    strong {
      color: #0a5aff;
      font-size: 26px;
      font-weight: 600;
      line-height: 32px;
    }

    span {
      margin-top: 3px;
      color: #5f6a7a;
      font-size: 12px;
      line-height: 18px;
    }
  }

  .login-stream {
    display: grid;
    max-width: none;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed rgba(216, 227, 242, 0.9);
    mask-image: linear-gradient(90deg, rgba(0, 0, 0, 0.22) 0%, #000 14%, #000 86%, rgba(0, 0, 0, 0.22) 100%);
  }

  .login-stream__item {
    overflow: hidden;
    height: 38px;
    padding: 0 12px;
    border: 1px solid rgba(216, 227, 242, 0.7);
    border-radius: 13px;
    background: rgba(255, 255, 255, 0.56);
    color: #5f6a7a;
    font-size: 12px;
    line-height: 34px;
    text-overflow: ellipsis;
    white-space: nowrap;
    backdrop-filter: blur(10px);
  }

  .login-page-dots {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 8px;
    margin-top: 18px;

    span {
      width: 20px;
      height: 4px;
      border-radius: 999px;
      background: rgba(95, 106, 122, 0.22);
      transition: width 0.35s ease, background-color 0.35s ease;

      &.active {
        width: 46px;
        background: #0a5aff;
      }
    }
  }

  .login-card {
    position: absolute;
    top: 34px;
    right: 54px;
    bottom: 34px;
    z-index: 2;
    display: flex;
    width: 430px;
    flex-direction: column;
    justify-content: center;
    padding: 42px 36px 38px;
    border: 1px solid rgba(225, 235, 255, 0.96);
    border-radius: 28px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 251, 253, 0.94) 100%),
      #fff;
    box-shadow: 0 24px 72px rgba(32, 56, 85, 0.12);
    backdrop-filter: blur(20px);

    &::before {
      position: absolute;
      inset: 16px;
      border: 1px dashed rgba(216, 227, 242, 0.9);
      border-radius: 22px;
      content: '';
      pointer-events: none;
    }

    > * {
      position: relative;
      z-index: 1;
    }
  }

  .login-card__eyebrow {
    color: #0a5aff;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }

  .login-card__title {
    margin-top: 6px;
    color: #172033;
    font-size: 28px;
    font-weight: 500;
    line-height: 38px;
  }

  .login-card__desc {
    margin-top: 6px;
    color: #5f6a7a;
    font-size: 14px;
    line-height: 22px;
  }

  .login-tabs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    margin-top: 24px;
    padding: 4px;
    border: 1px solid #e7eef8;
    border-radius: 12px;
    background: #f9fbfd;

    button {
      height: 38px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: #5f6a7a;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;

      &.active {
        background: #fff;
        color: #0a5aff;
        box-shadow: 0 6px 16px rgba(32, 56, 85, 0.08);
      }
    }
  }

  .login-form {
    margin-top: 20px;

    :deep(.ant-form-item) {
      margin-bottom: 15px;
    }

    :deep(.ant-form-item-label > label) {
      color: #5f6a7a;
      font-size: 13px;
      font-weight: 400;
    }
  }

  .login-input {
    height: 46px;
    border-radius: 8px;
    background: #fff;

    :deep(.ant-input),
    :deep(.ant-input-password) {
      font-size: 14px;
    }

    :deep(.anticon) {
      color: #8a96a8;
    }
  }

  .login-code-row {
    display: flex;
    gap: 10px;
  }

  .login-code-input {
    flex: 1;
    min-width: 0;
  }

  .login-code-btn {
    width: 116px;
    height: 46px;
    border-radius: 8px;
    color: #0a5aff;
    border-color: #cfe0ff;
    background: #eef5ff;
  }

  .login-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: -2px;
    color: #5f6a7a;
    font-size: 13px;

    button {
      padding: 0;
      border: 0;
      background: transparent;
      color: #5f6a7a;
      cursor: pointer;
    }
  }

  .login-submit {
    width: 100%;
    height: 46px;
    margin-top: 20px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    box-shadow: 0 12px 24px rgba(10, 90, 255, 0.18);
  }

  .login-security {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px dashed #e3ebf5;
    color: #858d98;
    font-size: 12px;
    line-height: 18px;

    :deep(.anticon) {
      color: #0a5aff;
    }
  }

  @media (max-width: 1180px) {
    .login-shell {
      overflow-y: auto;
      padding: 24px;
    }

    .login-cockpit {
      position: relative;
      inset: auto;
      min-height: 680px;
      margin-bottom: 24px;
    }

    .login-card {
      position: relative;
      top: auto;
      right: auto;
      bottom: auto;
      width: 430px;
      max-width: 100%;
      margin: 0 auto 24px;
      transform: none;
    }

    .login-welcome__panel {
      width: 100vw;
      padding: 38px 42px 42px;
    }

    .login-welcome__hero {
      grid-template-columns: 1fr;
      margin-top: 58px;
    }

    .login-welcome__progress {
      grid-column: 1;
      width: min(360px, 100%);
      margin: 30px 0 0;
    }
  }

  @media (max-width: 760px) {
    .login-shell {
      padding: 20px;
    }

    .login-cockpit {
      display: none;
    }

    .login-card {
      width: 100%;
      margin-top: 0;
      padding: 28px 22px 24px;
    }

    .login-welcome__panel {
      width: 100vw;
      min-height: auto;
      padding: 30px 22px 32px;
    }

    .login-welcome__topline {
      display: block;
      text-align: center;

      em {
        display: block;
        margin-top: 4px;
      }
    }

    .login-welcome__hero {
      grid-template-columns: 1fr;
      margin-top: 38px;
      text-align: center;
    }

    .login-welcome h1 {
      font-size: 28px;
      line-height: 38px;
    }

    .login-welcome p {
      margin-right: auto;
      margin-left: auto;
      font-size: 14px;
      line-height: 23px;
    }

    .login-welcome__divider {
      margin: 28px 0 18px;
    }

    .login-welcome__progress {
      grid-column: 1;
      width: 100%;
      margin: 24px 0 0;
    }
  }

  @keyframes login-welcome-rise {
    0% {
      opacity: 0;
      transform: translateY(16px) scale(0.985);
    }

    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes login-welcome-leave {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    100% {
      opacity: 0;
      transform: translateY(-10px) scale(0.99);
    }
  }

  @keyframes login-welcome-progress {
    0% {
      transform: scaleX(0);
    }

    100% {
      transform: scaleX(1);
    }
  }

  @keyframes login-dashboard-breathe {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }

    50% {
      transform: translateY(-2px) scale(1.002);
    }
  }
</style>
