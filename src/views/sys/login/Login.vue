<template>
  <div class="login-shell">
    <img class="login-shell__bg" :src="commandCenterImage" alt="" />
    <div class="login-shell__mesh"></div>
    <div class="login-shell__aurora login-shell__aurora--one"></div>
    <div class="login-shell__aurora login-shell__aurora--two"></div>

    <main class="login-board">
      <section class="login-command" :class="{ 'is-breathing': boardBreathing }" :style="boardThemeStyle">
        <div
          ref="boardSafeRef"
          class="login-concept"
          @mouseenter="pauseBoardRotation"
          @mouseleave="resumeBoardRotation"
        >
          <div class="login-health-mark" aria-label="蒙医云诊室">
            <img class="login-health-mark__logo" :src="healthLogo" alt="" />
          </div>

          <div class="login-concept__meta">
            <strong>{{ currentClock }}</strong>
            <em>{{ currentDateText }} {{ currentWeekdayText }}</em>
          </div>

          <div class="login-concept__visual" :class="`login-concept__visual--${activeBoard.key}`">
            <div class="login-concept__blob" :class="`login-concept__blob--${activeBoard.key}`"></div>
            <div class="login-concept__ribbon login-concept__ribbon--one"></div>
            <div class="login-concept__ribbon login-concept__ribbon--two"></div>

            <div v-if="activeBoard.key === 'command'" class="login-widget login-widget--chart">
              <div class="login-widget__head">
                <div>
                  <span>{{ activeBoard.shortTitle }}趋势</span>
                  <strong>{{ activeBoard.chartSummary }}</strong>
                </div>
                <em>{{ boardRefreshing ? 'SYNC' : 'LIVE' }}</em>
              </div>
              <div ref="trendChartRef" class="login-widget__chart"></div>
            </div>

            <div v-else-if="activeBoard.key === 'hospital'" class="login-widget login-widget--queue">
              <div class="login-widget__head">
                <div>
                  <span>接诊队列</span>
                  <strong>医生在线 / 候诊分流</strong>
                </div>
                <em>LIVE</em>
              </div>
              <div class="login-queue">
                <div v-for="item in activeBoard.flows.slice(0, 3)" :key="item.label">
                  <span>{{ item.label }}</span>
                  <i><b :style="{ width: `${item.rate}%` }"></b></i>
                  <strong>{{ item.value }}</strong>
                </div>
              </div>
            </div>

            <div v-else-if="activeBoard.key === 'trace'" class="login-widget login-widget--trace">
              <div class="login-widget__head">
                <div>
                  <span>码上放心</span>
                  <strong>追溯码采集 / 上传</strong>
                </div>
                <em>TRACE</em>
              </div>
              <div class="login-trace">
                <div class="login-trace__scanner">
                  <div class="login-trace__label">
                    <span>药品追溯码</span>
                  </div>
                  <div class="login-trace__barcode" aria-hidden="true"></div>
                  <div class="login-trace__digits">81236904519703628415</div>
                  <i></i>
                  <em></em>
                </div>
                <div class="login-trace__nodes">
                  <b v-for="item in activeBoard.flows.slice(0, 4)" :key="item.label">
                    <span></span>
                    <em>{{ item.label }}</em>
                  </b>
                </div>
              </div>
            </div>

            <div v-else class="login-widget login-widget--review">
              <div class="login-widget__head">
                <div>
                  <span>审方质控</span>
                  <strong>处方审核闭环</strong>
                </div>
                <em>SAFE</em>
              </div>
              <div class="login-review-ring" :style="{ '--review-rate': `${activeBoard.flows[0]?.rate || 86}%` }">
                <strong>{{ activeBoard.flows[0]?.value }}</strong>
                <span>{{ activeBoard.flows[0]?.label }}</span>
              </div>
            </div>

            <div class="login-widget login-widget--metric">
              <span>{{ activeBoard.metrics[0]?.label }}</span>
              <strong>{{ activeBoard.metrics[0]?.value }}</strong>
              <em :class="{ down: (activeBoard.metrics[0]?.trend || 0) < 0 }">
                {{ formatTrend(activeBoard.metrics[0]?.trend || 0) }}
              </em>
            </div>

            <div class="login-widget login-widget--flow">
              <div>
                <span>{{ activeBoard.metrics[1]?.label }}</span>
                <strong>{{ activeBoard.metrics[1]?.value }}</strong>
              </div>
              <i><b :style="{ width: `${activeBoard.flows[0]?.rate || 0}%` }"></b></i>
              <small>{{ activeBoard.stream[0]?.label }}</small>
            </div>
          </div>

          <div class="login-concept__footer">
            <div class="login-concept__dots">
              <button
                v-for="(board, index) in featuredBoards"
                :key="board.key"
                type="button"
                :class="{ active: index === activeBoardIndex }"
                @click="switchBoard(index)"
              ></button>
            </div>
          </div>
        </div>
      </section>

      <aside class="login-card">
        <div class="login-card__glow"></div>
        <div class="login-card__header">
          <span class="login-card__eyebrow">SECURE ACCESS</span>
          <h2>欢迎来到蒙医云诊室</h2>
          <p>云连接医生、诊所、药房与患者。</p>
        </div>

        <div class="login-tabs">
          <button type="button" :class="{ active: loginType === 'password' }" @click="loginType = 'password'">
            密码登录
          </button>
          <button type="button" :class="{ active: loginType === 'sms' }" @click="loginType = 'sms'">
            验证码登录
          </button>
          <button type="button" :class="{ active: loginType === 'wechat' }" @click="loginType = 'wechat'">
            微信扫码
          </button>
        </div>

        <a-form v-if="loginType !== 'wechat'" class="login-form" :model="loginForm" layout="vertical" @keypress.enter="toLogin">
          <a-form-item label="手机号码">
            <a-input
              v-model:value="loginForm.phone"
              class="login-input"
              placeholder="请输入手机号"
              allow-clear
              :maxlength="11"
              @input="handlePhoneInput"
              @blur="validateLoginPhone"
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

        <div v-else class="login-wechat-panel">
          <div class="login-wechat-qr">
            <div class="login-wechat-qr__grid" aria-hidden="true"></div>
            <WechatOutlined class="login-wechat-qr__icon" />
          </div>
          <div class="login-wechat-copy">
            <strong>微信扫码登录</strong>
            <span>请使用绑定机构账号的微信扫码确认登录</span>
          </div>
          <div class="login-wechat-status">
            <span></span>
            <em>等待扫码，接口接入后将自动刷新二维码状态</em>
          </div>
        </div>

        <div v-if="loginType !== 'wechat'" class="login-options">
          <a-checkbox v-model:checked="autoLogin">3天内自动登录</a-checkbox>
          <button type="button">忘记密码?</button>
        </div>

        <a-button
          type="primary"
          class="login-submit"
          :loading="loading"
          @click="toLogin"
        >
          {{ loginType === 'wechat' ? '等待扫码确认' : '登录系统' }}
        </a-button>

        <div class="login-card__footer">
          <SafetyCertificateOutlined />
          <span>登录即代表您同意《用户服务协议》与《隐私政策》</span>
        </div>

        <div class="login-card__legal">
          <span>© 2026 蒙医云 版权所有</span>
          <i>·</i>
          <span>数据安全加密传输</span>
        </div>
      </aside>
    </main>

    <transition name="login-welcome-fade">
      <section
        v-if="welcomeVisible"
        class="login-welcome"
        :class="{ 'login-welcome--leaving': welcomeLeaving }"
      >
        <div class="login-welcome__surface">
          <div class="login-welcome__line"></div>
          <div class="login-welcome__inner">
            <div class="login-welcome__mark">
              <img :src="healthLogo" alt="" />
            </div>
            <div class="login-welcome__copy">
              <span>MENGYIYUN CLINIC</span>
              <h1>欢迎回到蒙医云诊室</h1>
              <p>{{ welcomeUserName }}，正在为您进入机构工作台</p>
            </div>
          </div>
          <div class="login-welcome__progress"><i></i></div>
        </div>
      </section>
    </transition>
  </div>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { MobileOutlined, LockOutlined, SafetyCertificateOutlined, WechatOutlined } from '@ant-design/icons-vue';
  import * as echarts from 'echarts';
  import { useUserStore } from '@/store/modules/user';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useDesign } from '@/hooks/web/useDesign';
  import { router } from '@/router';
  import { PageEnum } from '@/enums/pageEnum';
  import { AccountApiCtrl } from '/@/api/myy/account';
  import commandCenterImage from '../../../assets/images/login-command-center.png';
  import healthLogo from '../../../assets/images/health-logo-system.png';

  type ChartInstance = echarts.ECharts | null;
  type BoardMetric = { label: string; value: string; trend: number };
  type BoardFlow = { label: string; value: string; rate: number };
  type BoardStream = { label: string; time: string };
  type BoardFeatureType = 'radar' | 'gauge' | 'donut';
  type BoardMainChartType = 'area' | 'scatter' | 'stack';
  type BoardLayout = 'hero' | 'split' | 'feature-left';
  type BoardTheme = {
    accent: string;
    alt: string;
    warm: string;
    soft: string;
    glow: string;
  };
  type BoardKey = 'command' | 'hospital' | 'review' | 'trace';
  type LoginBoard = {
    key: BoardKey;
    shortTitle: string;
    kicker: string;
    title: string;
    chartTitle: string;
    chartSummary: string;
    mainChartType: BoardMainChartType;
    radarTitle: string;
    radarValue: number;
    featureType: BoardFeatureType;
    layout: BoardLayout;
    flowTitle: string;
    flowSummary: string;
    streamTitle: string;
    metrics: BoardMetric[];
    flows: BoardFlow[];
    stream: BoardStream[];
  };

  localStorage.removeItem('GID');

  const { prefixCls } = useDesign('login');
  const { t } = useI18n();
  const { createErrorModal, createMessage } = useMessage();
  const userStore = useUserStore();

  const loading = ref(false);
  const autoLogin = ref(false);
  const loginType = ref<'password' | 'sms' | 'wechat'>('password');
  const codeSending = ref(false);
  const codeCountdown = ref(0);
  const phoneErrorLocked = ref(false);
  const commandPulse = ref(0);
  const boardRefreshing = ref(false);
  const activeBoardIndex = ref(0);
  const boardBreathing = ref(false);
  const boardRotationPaused = ref(false);
  const currentClock = ref('--:--:--');
  const currentDateText = ref('--');
  const currentWeekdayText = ref('--');
  const welcomeVisible = ref(false);
  const welcomeLeaving = ref(false);
  const welcomeUserName = ref('');
  const boardScale = ref(1);
  const boardSafeRef = ref<HTMLDivElement>();
  const trendChartRef = ref<HTMLDivElement>();
  const radarChartRef = ref<HTMLDivElement>();

  let codeTimer: ReturnType<typeof window.setInterval> | null = null;
  let commandTimer: ReturnType<typeof window.setInterval> | null = null;
  let clockTimer: ReturnType<typeof window.setInterval> | null = null;
  let boardTimer: ReturnType<typeof window.setInterval> | null = null;
  let boardSwitchTimer: ReturnType<typeof window.setInterval> | null = null;
  let boardBreathTimer: ReturnType<typeof window.setTimeout> | null = null;
  let welcomeTimer: ReturnType<typeof window.setTimeout> | null = null;
  let boardResizeObserver: ResizeObserver | null = null;
  let trendChart: ChartInstance = null;
  let radarChart: ChartInstance = null;

  const BOARD_STAGE_WIDTH = 860;
  const BOARD_STAGE_HEIGHT = 500;
  const BOARD_STAGE_PADDING = 28;

  const loginForm = ref({
    phone: '',
    password: '',
    code: '',
  });

  const boardThemes: Record<BoardKey, BoardTheme> = {
    command: {
      accent: '#6c63ff',
      alt: '#20c7a8',
      warm: '#ffb36b',
      soft: 'rgba(108, 99, 255, 0.1)',
      glow: 'rgba(108, 99, 255, 0.2)',
    },
    hospital: {
      accent: '#2f80ed',
      alt: '#12b5cb',
      warm: '#7bd88f',
      soft: 'rgba(47, 128, 237, 0.1)',
      glow: 'rgba(47, 128, 237, 0.22)',
    },
    review: {
      accent: '#8a63d2',
      alt: '#29b6a6',
      warm: '#f7b955',
      soft: 'rgba(138, 99, 210, 0.11)',
      glow: 'rgba(138, 99, 210, 0.22)',
    },
    trace: {
      accent: '#0077b6',
      alt: '#00b4d8',
      warm: '#90be6d',
      soft: 'rgba(0, 119, 182, 0.1)',
      glow: 'rgba(0, 119, 182, 0.2)',
    },
  };

  const phoneReg = /^1[3-9]\d{9}$/;
  const isPhoneValid = computed(() => phoneReg.test(loginForm.value.phone));
  const canSendCode = computed(() => isPhoneValid.value && codeCountdown.value === 0);
  const codeButtonText = computed(() => (codeCountdown.value > 0 ? `${codeCountdown.value}s 后重发` : '获取验证码'));
  const canSubmit = computed(() => {
    if (loginType.value === 'wechat') {
      return true;
    }
    if (!isPhoneValid.value) return false;
    if (loginType.value === 'password') {
      return Boolean(loginForm.value.password);
    }
    return /^\d{4,6}$/.test(loginForm.value.code);
  });

  const showPhoneError = () => {
    if (phoneErrorLocked.value) return;
    phoneErrorLocked.value = true;
    createMessage.warning('请输入11位有效手机号');
    window.setTimeout(() => {
      phoneErrorLocked.value = false;
    }, 600);
  };

  const clearInvalidPhone = () => {
    loginForm.value.phone = '';
    showPhoneError();
  };

  const normalizePhone = (value = loginForm.value.phone) => String(value || '').replace(/\D/g, '').slice(0, 11);
  const getInputValue = (event?: Event) => (event?.target instanceof HTMLInputElement ? event.target.value : loginForm.value.phone);

  const handlePhoneInput = (event?: Event) => {
    const rawValue = String(getInputValue(event) || '');
    const nextValue = normalizePhone(rawValue);
    if (rawValue !== nextValue) {
      loginForm.value.phone = '';
      showPhoneError();
      return;
    }
    loginForm.value.phone = nextValue;
    if (nextValue.length === 11 && !phoneReg.test(nextValue)) {
      clearInvalidPhone();
    }
  };

  const validateLoginPhone = () => {
    const nextValue = normalizePhone();
    loginForm.value.phone = nextValue;
    if (!nextValue) return false;
    if (!phoneReg.test(nextValue)) {
      clearInvalidPhone();
      return false;
    }
    return true;
  };

  const countText = (value: number) => String(Math.round(value));
  const percentText = (value: number) => `${Math.round(value)}%`;
  const minutesText = (value: number) => `${Math.max(1, Math.round(value))}分钟`;
  const secondsText = (value: number) => `${Math.max(20, Math.round(value))}秒`;
  const animatedValue = (base: number, mod: number) => base + (commandPulse.value % mod);
  const todaySeed = () => {
    const now = new Date();
    return Number(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`);
  };
  const seededRatio = (variant = 1) => {
    const seed = Math.sin(todaySeed() * 12.9898 + variant * 78.233) * 43758.5453;
    return seed - Math.floor(seed);
  };
  const timeBandWeights = [
    { start: 0, end: 390, share: 0.008, intensity: 0.12 },
    { start: 390, end: 480, share: 0.045, intensity: 0.48 },
    { start: 480, end: 540, share: 0.1, intensity: 1.35 },
    { start: 540, end: 690, share: 0.4, intensity: 2.1 },
    { start: 690, end: 810, share: 0.1, intensity: 0.78 },
    { start: 810, end: 990, share: 0.26, intensity: 1.34 },
    { start: 990, end: 1110, share: 0.1, intensity: 0.86 },
    { start: 1110, end: 1350, share: 0.055, intensity: 0.38 },
    { start: 1350, end: 1440, share: 0.017, intensity: 0.2 },
  ];
  const weekdayMultiplier = (variant = 1) => {
    const weekday = new Date().getDay();
    const ratio = seededRatio(variant);
    if (weekday === 1) return 1.08 + ratio * 0.1;
    if (weekday >= 2 && weekday <= 4) return 1 + ratio * 0.1;
    if (weekday === 5) return 0.95 + ratio * 0.1;
    if (weekday === 6) return 0.65 + ratio * 0.2;
    return 0.55 + ratio * 0.2;
  };
  const dailyMultiplier = (variant = 1) => {
    return weekdayMultiplier(variant) * (0.96 + seededRatio(variant + 3) * 0.08);
  };
  const boardVolumeMultiplier = 4.14;
  const growthSpeedMultiplier = 1.58;
  const todayPeak = (min: number, max: number, variant = 1) => {
    const base = min + Math.round((max - min) * seededRatio(variant));
    return Math.round(base * dailyMultiplier(variant) * boardVolumeMultiplier);
  };
  const todayTarget = todayPeak;
  const currentBandWeight = () => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return timeBandWeights.find((band) => minutes >= band.start && minutes < band.end)?.intensity || 0.12;
  };
  const cumulativeRateAt = (minutes: number) => {
    let elapsedShare = 0;
    for (const band of timeBandWeights) {
      if (minutes >= band.end) {
        elapsedShare += band.share;
        continue;
      }
      if (minutes > band.start) {
        elapsedShare += band.share * ((minutes - band.start) / (band.end - band.start));
      }
      break;
    }
    return Math.min(1, Math.max(0, elapsedShare));
  };
  const todayCumulative = (dailyPeak: number, variant = 1, floor = 0, speed = 1) => {
    commandPulse.value;
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    return Math.min(dailyPeak, Math.max(floor, Math.floor(dailyPeak * Math.min(1, cumulativeRateAt(minutes) * speed * growthSpeedMultiplier))));
  };
  const todayTrend = (variant = 1) => {
    const rate = currentBandWeight() * (0.9 + ((todaySeed() + variant) % 9) / 18);
    return Number((rate * 13.8).toFixed(1));
  };
  const acceleratedTodayTrend = (variant = 1, speed = 1.4) => Number((todayTrend(variant) * speed).toFixed(1));

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const virtualTodayData = computed(() => {
    const pulse = commandPulse.value;
    const band = currentBandWeight();
    const visitRatio = 0.72 + seededRatio(21) * 0.1;
    const reviewRatio = 0.9 + seededRatio(22) * 0.06;
    const orderRatio = 0.82 + seededRatio(23) * 0.08;
    const tracePerPrescription = 18 + Math.round(seededRatio(24) * 9);

    const visits = todayCumulative(todayTarget(240, 620, 1), 1, 0, 2.45);
    const rawPrescriptions = todayCumulative(todayTarget(180, 470, 2), 2, 0, 2.18);
    const prescriptions = Math.min(rawPrescriptions, Math.round(visits * visitRatio));
    const rawReviews = todayCumulative(Math.max(680, Math.round(todayTarget(180, 470, 7) * 0.9)), 7, 0, 2.08);
    const reviews = Math.min(rawReviews, Math.round(prescriptions * reviewRatio));
    const rawOrders = todayCumulative(todayTarget(150, 410, 3), 3, 0, 2.02);
    const orders = Math.min(rawOrders, Math.round(reviews * orderRatio));
    const rawTrace = todayCumulative(todayTarget(3200, 9800, 5), 5, 0, 2.72);
    const traceCount = Math.max(rawTrace, Math.round(prescriptions * tracePerPrescription));
    const pendingReview = clamp(Math.round((prescriptions - reviews) * 0.24 + band * 8 + (pulse % 4)), 12, 186);
    const pendingOrders = clamp(Math.round((reviews - orders) * 0.2 + band * 7 + (pulse % 3)), 9, 142);
    const traceException = clamp(Math.round(traceCount * 0.0018 + band * 4 + (pulse % 3)), 8, 96);
    const onlineDoctors = clamp(Math.round(118 + band * 26 + seededRatio(26) * 18 + (pulse % 5)), 96, 196);
    const waitingPatients = clamp(Math.round(visits * 0.018 + band * 12 + (pulse % 5)), 18, 168);
    const avgResponseSeconds = clamp(Math.round(96 - band * 13 - (pulse % 9)), 32, 112);
    const opsIndex = clamp(Math.round(86 + band * 3 + seededRatio(27) * 5), 86, 99);
    const healthScore = clamp(Math.round(92 + band * 2 + seededRatio(28) * 4), 92, 99);

    return {
      visits,
      prescriptions,
      reviews,
      orders,
      traceCount,
      pendingReview,
      pendingOrders,
      traceException,
      onlineDoctors,
      waitingPatients,
      avgResponseSeconds,
      opsIndex,
      healthScore,
    };
  });

  const baseMetrics = computed(() => {
    const data = virtualTodayData.value;

    return [
      { label: '今日接诊', value: countText(data.visits), trend: acceleratedTodayTrend(1, 1.62) },
      { label: '今日处方', value: countText(data.prescriptions), trend: acceleratedTodayTrend(2, 1.48) },
      { label: '今日经营指数', value: countText(data.opsIndex), trend: acceleratedTodayTrend(3, 1.18) },
      { label: '待处理订单', value: countText(data.pendingOrders), trend: -acceleratedTodayTrend(4, 0.42) },
    ];
  });

  const boardSeries = computed<LoginBoard[]>(() => {
    const data = virtualTodayData.value;
    const pulse = commandPulse.value;

    const makeStream = (events: string[]): BoardStream[] =>
      events.map((label, index) => ({
        label,
        time: `${String((8 + index * 2 + pulse) % 24).padStart(2, '0')}:${String((14 + index * 9 + pulse) % 60).padStart(2, '0')}`,
      }));
    const makeFlows = (items: Array<[string, number]>): BoardFlow[] =>
      items.map(([label, rate]) => ({
        label,
        value: percentText(Math.min(99, Math.round(rate + currentBandWeight() * 2))),
        rate: Math.min(99, Math.round(rate + currentBandWeight() * 2)),
      }));

    return [
      {
        key: 'command',
        shortTitle: '总控',
        kicker: 'COMMAND CENTER',
        title: '多系统实时指控中心',
        chartTitle: '全链路业务趋势',
        chartSummary: '接诊 / 处方 / 履约',
        mainChartType: 'area',
        radarTitle: '六维联动指数',
        radarValue: data.healthScore,
        featureType: 'radar',
        layout: 'hero',
        flowTitle: '业务闭环',
        flowSummary: '接诊到收货',
        streamTitle: '实时事件流',
        metrics: baseMetrics.value,
        flows: makeFlows([
          ['在线接诊', 91],
          ['处方流转', 86],
          ['调配发货', 82],
          ['质量留痕', 94],
        ]),
        stream: makeStream(['多系统运营数据已同步', '处方支付链路保持通畅', '云药房履约状态完成刷新', '追溯接口健康度完成校验', '运营安全指数维持稳定']),
      },
      {
        key: 'hospital',
        shortTitle: '接诊',
        kicker: 'INTERNET HOSPITAL',
        title: '互联网医院实时接诊看板',
        chartTitle: '接诊响应趋势',
        chartSummary: '问诊 / 处方 / 响应',
        mainChartType: 'scatter',
        radarTitle: '候诊压力仪表',
        radarValue: animatedValue(94, 3),
        featureType: 'gauge',
        layout: 'split',
        flowTitle: '接诊协同',
        flowSummary: '候诊到完成',
        streamTitle: '接诊动态',
        metrics: [
          { label: '今日接诊', value: countText(data.visits), trend: acceleratedTodayTrend(4, 1.68) },
          { label: '在线医生', value: countText(data.onlineDoctors), trend: 6.8 },
          { label: '候诊患者', value: countText(data.waitingPatients), trend: -3.6 },
          { label: '平均响应', value: secondsText(data.avgResponseSeconds), trend: -7.4 },
        ],
        flows: makeFlows([
          ['图文问诊', 88],
          ['视频问诊', 76],
          ['复诊闭环', 92],
          ['超时控制', 96],
        ]),
        stream: makeStream(['互联网医院接诊队列刷新', '医生在线状态完成同步', '候诊患者进入自动分流', '问诊完成率更新', '超时响应风险已复核']),
      },
      {
        key: 'review',
        shortTitle: '审方',
        kicker: 'PRESCRIPTION REVIEW',
        title: '在线开方与审方协同看板',
        chartTitle: '处方审方趋势',
        chartSummary: '开方 / 审方 / 风险拦截',
        mainChartType: 'stack',
        radarTitle: '审方构成环图',
        radarValue: animatedValue(96, 2),
        featureType: 'donut',
        layout: 'feature-left',
        flowTitle: '药师协同',
        flowSummary: '待审到通过',
        streamTitle: '审方动态',
        metrics: [
          { label: '今日处方', value: countText(data.prescriptions), trend: acceleratedTodayTrend(5, 1.5) },
          { label: '今日审方', value: countText(data.reviews), trend: acceleratedTodayTrend(6, 1.66) },
          { label: '待审方', value: countText(data.pendingReview), trend: -5.2 },
          { label: '平均审方', value: minutesText(3), trend: -4.4 },
        ],
        flows: makeFlows([
          ['自动校验', 95],
          ['药师审核', 89],
          ['风险拦截', 78],
          ['医生协同', 84],
        ]),
        stream: makeStream(['审方策略完成校验', '高风险处方完成拦截统计', '药师协同队列刷新', '处方修改建议已归档', '审方通过率同步更新']),
      },
      {
        key: 'trace',
        shortTitle: '追溯',
        kicker: 'TRACEABILITY',
        title: '码上放心追溯码监管看板',
        chartTitle: '追溯上传趋势',
        chartSummary: '采集 / 上传 / 异常',
        mainChartType: 'stack',
        radarTitle: '追溯状态占比',
        radarValue: animatedValue(98, 1),
        featureType: 'donut',
        layout: 'split',
        flowTitle: '扫码链路',
        flowSummary: '入库到出库',
        streamTitle: '追溯动态',
        metrics: [
          { label: '今日采集', value: countText(data.traceCount), trend: acceleratedTodayTrend(8, 1.85) },
          { label: '上传成功率', value: '99.2%', trend: 1.4 },
          { label: '异常码', value: countText(data.traceException), trend: -2.1 },
          { label: '接口健康', value: '99.7%', trend: 0.9 },
        ],
        flows: makeFlows([
          ['入库', 93],
          ['出库', 91],
          ['上传', 99],
          ['异常', 88],
        ]),
        stream: makeStream(['码上放心接口状态正常', '追溯码批量上传完成', '异常码处理队列刷新', '入库出库扫码链路同步', '最近同步时间已更新']),
      },
    ];
  });

  const featuredBoards = computed(() => boardSeries.value);
  const activeBoard = computed(() => featuredBoards.value[activeBoardIndex.value] || featuredBoards.value[0] || boardSeries.value[0]);
  const activeBoardTheme = computed(() => boardThemes[activeBoard.value.key]);
  const boardThemeStyle = computed(() => ({
    '--board-accent': activeBoardTheme.value.accent,
    '--board-alt': activeBoardTheme.value.alt,
    '--board-warm': activeBoardTheme.value.warm,
    '--board-soft': activeBoardTheme.value.soft,
    '--board-glow': activeBoardTheme.value.glow,
  }));
  const boardStageStyle = computed(() => ({
    width: `${BOARD_STAGE_WIDTH}px`,
    height: `${BOARD_STAGE_HEIGHT}px`,
    transform: `translate(-50%, -50%) scale(${boardScale.value})`,
  }));

  function formatTrend(value: number) {
    if (!Number.isFinite(value) || value === 0) return '持平';
    return `${value > 0 ? '↑' : '↓'}${Math.abs(value).toFixed(1)}%`;
  }

  function switchBoard(index: number) {
    if (index === activeBoardIndex.value || !featuredBoards.value[index]) return;
    if (boardBreathTimer) {
      clearTimeout(boardBreathTimer);
    }
    boardBreathing.value = true;
    activeBoardIndex.value = index;
    boardBreathTimer = window.setTimeout(() => {
      boardBreathing.value = false;
      boardBreathTimer = null;
    }, 980);
  }

  function rotateBoard() {
    if (boardRotationPaused.value || featuredBoards.value.length <= 1) return;
    switchBoard((activeBoardIndex.value + 1) % featuredBoards.value.length);
  }

  function pauseBoardRotation() {
    boardRotationPaused.value = true;
  }

  function resumeBoardRotation() {
    boardRotationPaused.value = false;
  }

  function updateBoardScale() {
    const target = boardSafeRef.value;
    if (!target) return;
    const width = Math.max(0, target.clientWidth - BOARD_STAGE_PADDING);
    const height = Math.max(0, target.clientHeight - BOARD_STAGE_PADDING);
    if (!width || !height) return;
    boardScale.value = Math.max(0.48, Math.min(width / BOARD_STAGE_WIDTH, height / BOARD_STAGE_HEIGHT));
  }

  function buildTodayTimeline() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const startMinutes = Math.max(0, currentMinutes - 480);
    return Array.from({ length: 9 }, (_, index) => {
      const minutes = Math.min(currentMinutes, startMinutes + ((currentMinutes - startMinutes) / 8) * index);
      const hour = Math.floor(minutes / 60);
      const minute = Math.floor(minutes % 60);
      return {
        minutes,
        label: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      };
    });
  }

  function buildTrendSeries(timeline: Array<{ minutes: number; label: string }>) {
    const boardMultipliers: Record<BoardKey, [number, number, number]> = {
      command: [1, 1, 1],
      hospital: [1.18, 0.72, 0.84],
      review: [0.76, 0.68, 1.16],
      trace: [0.7, 0.58, 2.1],
    };
    const [visitRate, chargeRate, orderRate] = boardMultipliers[activeBoard.value.key];
    const toTimelineValues = (dailyTarget: number) =>
      timeline.map((point) => Math.max(1, Math.floor(dailyTarget * Math.min(1, cumulativeRateAt(point.minutes) * growthSpeedMultiplier))));

    return {
      visits: toTimelineValues(todayTarget(160, 420, 11) * visitRate),
      charges: toTimelineValues(todayTarget(100, 280, 12) * chargeRate),
      orders: toTimelineValues(todayTarget(120, 320, 13) * orderRate),
    };
  }

  function buildFeatureOption(chartColors: string[]) {
    const board = activeBoard.value;
    const featureData = board.flows.map((item) => ({
      name: item.label,
      value: item.rate,
    }));
    const commonText = { color: 'rgba(64, 78, 112, .68)', fontSize: 10 };

    if (board.featureType === 'gauge') {
      return {
        series: [
          {
            type: 'gauge',
            radius: '86%',
            center: ['50%', '58%'],
            min: 0,
            max: 100,
            progress: { show: true, roundCap: true, width: 12, itemStyle: { color: chartColors[0] } },
            axisLine: { roundCap: true, lineStyle: { width: 12, color: [[1, activeBoardTheme.value.soft]] } },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            pointer: { show: true, length: '54%', width: 4, itemStyle: { color: chartColors[0] } },
            detail: {
              valueAnimation: true,
              formatter: '{value}%',
              color: '#171f3a',
              fontSize: 24,
              fontWeight: 900,
              offsetCenter: [0, '42%'],
            },
            title: { offsetCenter: [0, '68%'], color: 'rgba(64, 78, 112, .62)', fontSize: 11 },
            data: [{ value: board.radarValue, name: board.shortTitle }],
          },
        ],
      };
    }

    if (board.featureType === 'donut') {
      return {
        color: chartColors,
        tooltip: { trigger: 'item', backgroundColor: 'rgba(255,255,255,.95)', borderColor: activeBoardTheme.value.glow },
        series: [
          {
            type: 'pie',
            radius: ['48%', '72%'],
            center: ['50%', '52%'],
            avoidLabelOverlap: true,
            label: { color: '#4c5874', fontSize: 10, formatter: '{b}' },
            labelLine: { length: 8, length2: 5 },
            itemStyle: { borderColor: 'rgba(255,255,255,.86)', borderWidth: 2 },
            data: featureData,
          },
        ],
      };
    }

    return {
      color: [chartColors[0]],
      radar: {
        radius: '62%',
        indicator: featureData.map((item) => ({ name: item.name, max: 100 })),
        axisName: commonText,
        splitLine: { lineStyle: { color: activeBoardTheme.value.glow } },
        splitArea: { areaStyle: { color: [activeBoardTheme.value.soft, 'rgba(255, 255, 255, .28)'] } },
        axisLine: { lineStyle: { color: activeBoardTheme.value.glow } },
      },
      series: [
        {
          type: 'radar',
          data: [{ value: featureData.map((item) => item.value) }],
          areaStyle: { color: activeBoardTheme.value.soft },
          lineStyle: { width: 2 },
          symbolSize: 4,
        },
      ],
    };
  }

  function buildMainChartOption(chartColors: string[]) {
    const timeline = buildTodayTimeline();
    const series = buildTrendSeries(timeline);
    const labels = timeline.map((item) => item.label);
    const names: Record<BoardKey, [string, string, string]> = {
      command: ['接诊', '经营', '处方'],
      hospital: ['响应', '候诊', '问诊'],
      review: ['开方', '审方', '风险'],
      trace: ['采集', '上传', '异常'],
    };
    const [firstName, secondName, thirdName] = names[activeBoard.value.key];
    const baseGrid = { top: 30, right: 20, bottom: 28, left: 38 };
    const axisText = { color: 'rgba(64, 78, 112, .56)', fontSize: 10 };
    const tooltip = {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, .95)',
      borderColor: activeBoardTheme.value.glow,
      textStyle: { color: '#24324b' },
    };

    if (activeBoard.value.mainChartType === 'scatter') {
      return {
        color: chartColors,
        tooltip,
        grid: baseGrid,
        xAxis: { type: 'category', data: labels, axisTick: { show: false }, axisLabel: axisText, axisLine: { lineStyle: { color: 'rgba(64, 78, 112, .14)' } } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(64, 78, 112, .1)' } }, axisLabel: axisText },
        series: [
          { name: firstName, type: 'line', smooth: true, showSymbol: false, data: series.visits },
          { name: secondName, type: 'scatter', symbolSize: 12, data: series.orders },
          { name: thirdName, type: 'effectScatter', symbolSize: 9, rippleEffect: { scale: 3 }, data: series.charges },
        ],
      };
    }

    if (activeBoard.value.mainChartType === 'stack') {
      return {
        color: chartColors,
        tooltip,
        grid: baseGrid,
        xAxis: { type: 'category', data: labels, axisTick: { show: false }, axisLabel: axisText, axisLine: { lineStyle: { color: 'rgba(64, 78, 112, .14)' } } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(64, 78, 112, .1)' } }, axisLabel: axisText },
        series: [
          { name: firstName, type: 'bar', stack: 'total', barWidth: 12, data: series.visits },
          { name: secondName, type: 'bar', stack: 'total', barWidth: 12, data: series.orders },
          { name: thirdName, type: 'line', smooth: true, showSymbol: false, data: series.charges },
        ],
      };
    }

    return {
      color: chartColors,
      tooltip,
      grid: baseGrid,
      xAxis: { type: 'category', boundaryGap: false, data: labels, axisLine: { lineStyle: { color: 'rgba(64, 78, 112, .14)' } }, axisTick: { show: false }, axisLabel: axisText },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(64, 78, 112, .1)' } }, axisLabel: axisText },
      series: [
        { name: firstName, type: 'line', smooth: true, showSymbol: false, areaStyle: { opacity: 0.16 }, data: series.visits },
        { name: secondName, type: 'line', smooth: true, showSymbol: false, areaStyle: { opacity: 0.14 }, data: series.charges },
        { name: thirdName, type: 'bar', barWidth: 8, data: series.orders },
      ],
    };
  }

  function renderCharts() {
    if (!trendChartRef.value) {
      if (trendChart) {
        trendChart.dispose();
        trendChart = null;
      }
      return;
    }

    trendChart = trendChart || echarts.init(trendChartRef.value);

    const chartColors = [activeBoardTheme.value.accent, activeBoardTheme.value.alt, activeBoardTheme.value.warm];

    trendChart.clear();
    trendChart.setOption(buildMainChartOption(chartColors));

    if (radarChartRef.value) {
      radarChart = radarChart || echarts.init(radarChartRef.value);
      radarChart.clear();
      radarChart.setOption(buildFeatureOption(chartColors));
    } else if (radarChart) {
      radarChart.dispose();
      radarChart = null;
    }

    requestAnimationFrame(() => {
      trendChart?.resize();
      radarChart?.resize();
    });
  }

  function refreshVirtualBoardData() {
    boardRefreshing.value = true;
    window.setTimeout(() => {
      boardRefreshing.value = false;
      nextTick(renderCharts);
    }, 220);
  }

  function updateClock() {
    const now = new Date();
    currentClock.value = now.toLocaleTimeString('zh-CN', { hour12: false });
    currentWeekdayText.value = now.toLocaleDateString('zh-CN', { weekday: 'short' });
    currentDateText.value = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
  }

  const startCodeCountdown = () => {
    codeCountdown.value = 60;
    if (codeTimer) {
      clearInterval(codeTimer);
    }
    codeTimer = window.setInterval(() => {
      codeCountdown.value -= 1;
      if (codeCountdown.value <= 0 && codeTimer) {
        clearInterval(codeTimer);
        codeTimer = null;
      }
    }, 1000);
  };

  const sendCode = async () => {
    if (!validateLoginPhone()) return;
    try {
      codeSending.value = true;
      await AccountApiCtrl.SendVerifyCode(
        {
          Phone: loginForm.value.phone,
          phone: loginForm.value.phone,
        },
        'none',
      );
      createMessage.success('验证码已发送');
      startCodeCountdown();
    } catch (error) {
      createErrorModal({
        title: t('sys.api.errorTip'),
        content: (error as unknown as Error).message || t('sys.api.networkExceptionMsg'),
        getContainer: () => document.body.querySelector(`.${prefixCls}`) || document.body,
      });
    } finally {
      codeSending.value = false;
    }
  };

  const showLoginWelcome = (userInfo) => {
    if (welcomeTimer) {
      clearTimeout(welcomeTimer);
      welcomeTimer = null;
    }
    welcomeUserName.value = userInfo?.Doctor?.DoctorName || userInfo?.AccountName || '您好';
    welcomeLeaving.value = false;
    welcomeVisible.value = true;
    welcomeTimer = window.setTimeout(async () => {
      welcomeTimer = null;
      await router.replace(userInfo?.homePath || PageEnum.BASE_HOME);
      welcomeLeaving.value = true;
      window.setTimeout(() => {
        welcomeVisible.value = false;
      }, 120);
    }, 3000);
  };

  const toLogin = async () => {
    if (loginType.value === 'wechat') {
      createMessage.info('微信扫码登录接口待接入');
      return;
    }
    if (!validateLoginPhone()) return;
    if (loginType.value === 'password' && !loginForm.value.password) {
      createMessage.warning('请输入登录密码');
      return;
    }
    if (loginType.value === 'sms' && !/^\d{4,6}$/.test(loginForm.value.code)) {
      createMessage.warning('请输入有效验证码');
      return;
    }

    try {
      loading.value = true;
      const userInfo =
        loginType.value === 'password'
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
        showLoginWelcome(userInfo);
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
  };

  watch(activeBoardIndex, () => {
    nextTick(renderCharts);
  });

  onMounted(() => {
    refreshVirtualBoardData();
    updateClock();
    nextTick(() => {
      updateBoardScale();
      renderCharts();
    });
    if (boardSafeRef.value) {
      boardResizeObserver = new ResizeObserver(() => {
        updateBoardScale();
      });
      boardResizeObserver.observe(boardSafeRef.value);
    }
    commandTimer = window.setInterval(() => {
      commandPulse.value = (commandPulse.value + 1) % 300;
    }, 900);
    clockTimer = window.setInterval(() => {
      updateClock();
    }, 1000);
    boardTimer = window.setInterval(refreshVirtualBoardData, 15000);
    boardSwitchTimer = window.setInterval(rotateBoard, 5000);
    window.addEventListener('resize', updateBoardScale);
    window.addEventListener('resize', renderCharts);
  });

  onBeforeUnmount(() => {
    if (codeTimer) clearInterval(codeTimer);
    if (commandTimer) clearInterval(commandTimer);
    if (clockTimer) clearInterval(clockTimer);
    if (boardTimer) clearInterval(boardTimer);
    if (boardSwitchTimer) clearInterval(boardSwitchTimer);
    if (boardBreathTimer) clearTimeout(boardBreathTimer);
    if (welcomeTimer) clearTimeout(welcomeTimer);
    boardResizeObserver?.disconnect();
    window.removeEventListener('resize', renderCharts);
    window.removeEventListener('resize', updateBoardScale);
    trendChart?.dispose();
    radarChart?.dispose();
  });
</script>

<style lang="less" scoped>
  .login-shell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    overflow: hidden;
    padding: 32px;
    background: #f4f8ff;
    color: #1b2440;
  }

  .login-shell__bg,
  .login-shell__mesh,
  .login-shell__aurora {
    position: absolute;
    pointer-events: none;
  }

  .login-shell__bg {
    inset: auto -4% -9% auto;
    width: 66vw;
    height: 82vh;
    object-fit: cover;
    border-radius: 44px;
    opacity: 0.18;
    filter: saturate(0.92) contrast(1.02);
  }

  .login-shell__mesh {
    inset: 0;
    background:
      radial-gradient(circle at 12% 10%, rgba(10, 90, 255, 0.16), transparent 24%),
      radial-gradient(circle at 82% 18%, rgba(9, 96, 189, 0.12), transparent 24%),
      radial-gradient(circle at 56% 86%, rgba(112, 166, 255, 0.12), transparent 30%),
      linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(236, 244, 255, 0.78)),
      linear-gradient(rgba(10, 90, 255, 0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(10, 90, 255, 0.045) 1px, transparent 1px);
    background-size: auto, auto, auto, auto, 44px 44px, 44px 44px;
  }

  .login-shell__aurora {
    width: 430px;
    height: 430px;
    border-radius: 999px;
    opacity: 0.36;
    filter: blur(18px);
    animation: auroraDrift 9s ease-in-out infinite alternate;
  }

  .login-shell__aurora--one {
    left: -130px;
    top: 80px;
    background: radial-gradient(circle, rgba(10, 90, 255, 0.34), transparent 68%);
  }

  .login-shell__aurora--two {
    right: 6%;
    bottom: -180px;
    background: radial-gradient(circle, rgba(9, 96, 189, 0.26), transparent 70%);
    animation-delay: -2s;
  }

  .login-board {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(360px, 0.9fr);
    gap: 24px;
    width: min(1440px, 100%);
    height: min(860px, calc(100vh - 64px));
    min-height: 720px;
    padding: 18px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.76);
    border-radius: 36px;
    background: rgba(255, 255, 255, 0.34);
    box-shadow: 0 32px 90px rgba(40, 88, 160, 0.18);
    backdrop-filter: blur(18px);
  }

  .login-command,
  .login-card,
  .login-panel,
  .login-metric,
  .login-context-card {
    border: 1px solid rgba(255, 255, 255, 0.78);
    background: rgba(255, 255, 255, 0.72);
    box-shadow: 0 24px 70px rgba(96, 111, 169, 0.18);
    backdrop-filter: blur(24px);
  }

  .login-command {
    --board-accent: #6c63ff;
    --board-alt: #20c7a8;
    --board-warm: #ffb36b;
    --board-soft: rgba(108, 99, 255, 0.1);
    --board-glow: rgba(108, 99, 255, 0.2);
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    min-height: 0;
    padding: 0;
    border-radius: 28px;
    background:
      radial-gradient(circle at 18% 14%, rgba(255, 255, 255, 0.82), transparent 25%),
      linear-gradient(145deg, #f7f3ff 0%, #eee9ff 48%, #e4dcff 100%);
  }

  .login-command.is-breathing {
    animation: commandBoardBreath 0.98s ease both;
  }

  .login-concept {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    padding: 36px;
    border-radius: 28px;
  }

  .login-concept::before {
    position: absolute;
    inset: 18px;
    content: '';
    border: 1px solid rgba(255, 255, 255, 0.74);
    border-radius: 26px;
    pointer-events: none;
  }

  .login-health-mark {
    position: relative;
    z-index: 3;
    display: grid;
    place-items: center;
    width: 92px;
    height: 92px;
    border: 1px solid rgba(255, 255, 255, 0.92);
    border-radius: 26px;
    background: #fff;
    box-shadow:
      0 18px 38px rgba(96, 111, 169, 0.13),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .login-health-mark__logo {
    position: relative;
    z-index: 1;
    display: block;
    width: 72px;
    height: 72px;
    object-fit: contain;
    filter: drop-shadow(0 8px 14px rgba(10, 90, 255, 0.12));
  }

  .login-concept__meta {
    position: absolute;
    z-index: 3;
    top: 34px;
    right: 34px;
    width: 198px;
    min-height: 104px;
    padding: 18px 16px;
    border: 1px solid rgba(255, 255, 255, 0.76);
    border-radius: 30px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.48)),
      radial-gradient(circle at 50% 0%, rgba(108, 99, 255, 0.18), transparent 58%);
    text-align: center;
    box-shadow: 0 20px 44px rgba(121, 99, 191, 0.12);
    backdrop-filter: blur(18px);
  }

  .login-concept__meta span,
  .login-widget span,
  .login-widget__head span {
    display: block;
    color: #897fa8;
    font-size: 12px;
  }

  .login-concept__meta strong {
    display: block;
    margin-top: 4px;
    color: #2b2552;
    font-size: 32px;
    line-height: 1.1;
    font-weight: 900;
  }

  .login-concept__meta em {
    display: block;
    margin-top: 12px;
    overflow: hidden;
    color: #756f93;
    font-size: 13px;
    font-style: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .login-concept__visual {
    position: absolute;
    inset: 170px 34px 70px;
  }

  .login-concept__blob {
    position: absolute;
    inset: 10px 64px 8px 52px;
    border-radius: 44% 56% 46% 54% / 54% 46% 54% 46%;
    background:
      radial-gradient(circle at 35% 28%, rgba(255, 255, 255, 0.72), transparent 18%),
      linear-gradient(140deg, var(--board-accent) 0%, var(--board-warm) 48%, var(--board-alt) 100%);
    box-shadow:
      inset 18px 18px 44px rgba(255, 255, 255, 0.28),
      0 42px 90px rgba(112, 91, 194, 0.32);
    transform: rotate(-8deg);
    animation: conceptFloat 7s ease-in-out infinite;
  }

  .login-concept__blob--command {
    border-radius: 42% 58% 48% 52% / 58% 42% 54% 46%;
    animation: conceptFloatCommand 7s ease-in-out infinite;
  }

  .login-concept__blob--hospital {
    inset: 16px 78px 0 42px;
    border-radius: 58% 42% 62% 38% / 38% 54% 46% 62%;
    background:
      radial-gradient(circle at 68% 24%, rgba(255, 255, 255, 0.72), transparent 17%),
      radial-gradient(circle at 22% 72%, rgba(255, 255, 255, 0.32), transparent 21%),
      linear-gradient(132deg, var(--board-alt) 0%, var(--board-accent) 52%, var(--board-warm) 100%);
    animation: conceptFloatHospital 7.4s ease-in-out infinite;
  }

  .login-concept__blob--review {
    inset: 4px 56px 16px 66px;
    border-radius: 64% 36% 44% 56% / 46% 64% 36% 54%;
    background:
      radial-gradient(circle at 22% 24%, rgba(255, 255, 255, 0.62), transparent 18%),
      radial-gradient(circle at 78% 72%, rgba(255, 255, 255, 0.28), transparent 24%),
      linear-gradient(128deg, var(--board-accent) 0%, #7ad7c5 42%, var(--board-warm) 100%);
    animation: conceptFloatReview 8s ease-in-out infinite;
  }

  .login-concept__blob--trace {
    inset: 18px 54px 6px 58px;
    border-radius: 52% 48% 34% 66% / 48% 38% 62% 52%;
    background:
      linear-gradient(118deg, rgba(255, 255, 255, 0.24) 0 9%, transparent 9% 18%, rgba(255, 255, 255, 0.18) 18% 27%, transparent 27% 100%),
      radial-gradient(circle at 72% 68%, rgba(255, 255, 255, 0.58), transparent 17%),
      linear-gradient(145deg, var(--board-accent) 0%, var(--board-alt) 46%, var(--board-warm) 100%);
    animation: conceptFloatTrace 6.8s ease-in-out infinite;
  }

  .login-concept__ribbon {
    position: absolute;
    z-index: 1;
    border-radius: 999px;
    filter: blur(0.2px);
    opacity: 0.78;
  }

  .login-concept__ribbon--one {
    top: 52px;
    left: 18px;
    width: 240px;
    height: 46px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.64));
    transform: rotate(-18deg);
  }

  .login-concept__ribbon--two {
    right: 34px;
    bottom: 44px;
    width: 210px;
    height: 42px;
    background: linear-gradient(90deg, rgba(106, 226, 206, 0.22), rgba(255, 255, 255, 0.74));
    transform: rotate(-22deg);
  }

  .login-widget {
    position: absolute;
    z-index: 3;
    border: 1px solid rgba(255, 255, 255, 0.78);
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 24px 60px rgba(98, 82, 166, 0.18);
    backdrop-filter: blur(22px);
  }

  .login-widget--chart {
    left: 34px;
    bottom: 18px;
    width: 430px;
    height: 236px;
    padding: 18px;
  }

  .login-widget--queue,
  .login-widget--review,
  .login-widget--trace {
    left: 34px;
    bottom: 18px;
    width: 430px;
    height: 236px;
    padding: 18px;
  }

  .login-widget--metric {
    display: flex;
    flex-direction: column;
    justify-content: center;
    top: 10px;
    right: 38px;
    width: 188px;
    min-height: 126px;
    padding: 16px 18px;
  }

  .login-widget--flow {
    display: flex;
    flex-direction: column;
    justify-content: center;
    right: 128px;
    bottom: 0;
    width: 228px;
    min-height: 116px;
    padding: 16px 18px;
  }

  .login-concept__visual--hospital .login-widget--queue {
    top: 8px;
    right: 24px;
    bottom: auto;
    left: auto;
    width: 406px;
    height: 218px;
  }

  .login-concept__visual--hospital .login-widget--metric {
    top: auto;
    right: auto;
    bottom: 10px;
    left: 24px;
  }

  .login-concept__visual--hospital .login-widget--flow {
    right: 34px;
    bottom: 0;
  }

  .login-concept__visual--review .login-widget--review {
    top: 36px;
    right: 38px;
    bottom: auto;
    left: auto;
    width: 300px;
    height: 226px;
  }

  .login-concept__visual--review .login-widget--metric {
    top: 0;
    right: auto;
    left: 36px;
  }

  .login-concept__visual--review .login-widget--flow {
    right: auto;
    bottom: 10px;
    left: 92px;
  }

  .login-concept__visual--trace .login-widget--trace {
    top: 18px;
    bottom: auto;
    left: 22px;
    width: 430px;
    height: 236px;
  }

  .login-concept__visual--trace .login-widget--metric {
    top: 0;
    right: 22px;
  }

  .login-concept__visual--trace .login-widget--flow {
    right: 46px;
    bottom: 0;
  }

  .login-queue {
    position: relative;
    z-index: 2;
    display: grid;
    gap: 16px;
    margin-top: 22px;
  }

  .login-queue > div {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr) 42px;
    align-items: center;
    gap: 12px;
  }

  .login-queue span {
    color: #756f93;
    font-size: 12px;
    font-weight: 800;
  }

  .login-queue i {
    height: 10px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(117, 111, 147, 0.12);
  }

  .login-queue b {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--board-accent), var(--board-alt));
  }

  .login-queue strong {
    color: #2b2552;
    font-size: 13px;
    text-align: right;
  }

  .login-review-ring {
    position: relative;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 138px;
    height: 138px;
    margin: 20px auto 0;
    border-radius: 50%;
    background:
      radial-gradient(circle, rgba(255, 255, 255, 0.92) 0 54%, transparent 55%),
      conic-gradient(var(--board-accent) 0 var(--review-rate), rgba(117, 111, 147, 0.12) var(--review-rate) 100%);
    box-shadow: inset 0 0 0 12px rgba(255, 255, 255, 0.62);
  }

  .login-review-ring strong {
    margin-top: 0;
    color: #2b2552;
    font-size: 26px;
    line-height: 1;
  }

  .login-review-ring span {
    margin-top: -34px;
    color: #897fa8;
    font-size: 12px;
    font-weight: 800;
  }

  .login-trace {
    position: relative;
    z-index: 2;
    height: 162px;
    margin-top: 14px;
  }

  .login-trace__scanner {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    width: 226px;
    height: 150px;
    overflow: hidden;
    padding: 12px 14px;
    border: 1px solid rgba(255, 255, 255, 0.82);
    border-radius: 16px;
    background:
      linear-gradient(90deg, rgba(0, 119, 182, 0.1) 0 4px, transparent 4px 100%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 252, 255, 0.78)),
      radial-gradient(circle at 82% 18%, var(--board-soft), transparent 42%);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.72),
      0 18px 42px rgba(34, 139, 230, 0.16);
  }

  .login-trace__scanner::before {
    position: absolute;
    inset: 8px;
    content: '';
    border: 1px dashed rgba(0, 119, 182, 0.18);
    border-radius: 12px;
    pointer-events: none;
  }

  .login-trace__label {
    position: absolute;
    top: 14px;
    left: 16px;
    z-index: 2;
    display: grid;
    justify-items: center;
    width: 194px;
    gap: 2px;
    text-align: center;
  }

  .login-trace__label span {
    color: var(--board-accent);
    font-size: 15px;
    line-height: 1.1;
    font-weight: 900;
    letter-spacing: 0;
    white-space: nowrap;
  }

  .login-trace__label strong {
    color: #1f2d4d;
    font-size: 6px;
    line-height: 1.2;
    font-weight: 800;
    letter-spacing: 0;
    white-space: nowrap;
  }

  .login-trace__barcode {
    position: absolute;
    top: 48px;
    left: 16px;
    right: auto;
    width: 194px;
    height: 54px;
    border-radius: 3px;
    background:
      repeating-linear-gradient(
        90deg,
        #1f2d4d 0 2px,
        transparent 2px 4px,
        #1f2d4d 4px 5px,
        transparent 5px 8px,
        #1f2d4d 8px 12px,
        transparent 12px 15px,
        #1f2d4d 15px 16px,
        transparent 16px 19px
      );
    box-shadow: inset 0 -1px 0 rgba(31, 45, 77, 0.08);
  }

  .login-trace__digits {
    position: absolute;
    top: 112px;
    left: 16px;
    right: auto;
    width: 194px;
    color: #253454;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: 0.35px;
    text-align: center;
    white-space: nowrap;
  }

  .login-trace__scanner i {
    position: absolute;
    right: 12px;
    left: 12px;
    top: 44px;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, transparent, #ff4f78, #ff9fbd, transparent);
    box-shadow:
      0 0 14px rgba(255, 79, 120, 0.78),
      0 8px 24px rgba(255, 79, 120, 0.34);
    animation: traceScanner 2.4s ease-in-out infinite;
  }

  .login-trace__scanner em {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(90deg, transparent 0 18%, rgba(255, 255, 255, 0.72) 46%, transparent 72% 100%);
    font-style: normal;
    opacity: 0.62;
    transform: translateX(-120%);
    animation: traceSweep 3.2s ease-in-out infinite;
    pointer-events: none;
  }

  .login-trace__nodes {
    position: absolute;
    top: 0;
    right: 0;
    bottom: auto;
    left: 244px;
    display: grid;
    grid-template-columns: repeat(2, 70px);
    align-items: start;
    gap: 10px;
  }

  .login-trace__nodes::before {
    display: none;
  }

  .login-trace__nodes b {
    position: relative;
    display: grid;
    align-items: center;
    justify-items: center;
    gap: 5px;
    justify-content: center;
    min-width: 0;
    width: 70px;
    height: 70px;
    padding: 9px 6px;
    border: 1px solid rgba(255, 255, 255, 0.76);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.78);
    color: #2b2552;
    font-size: 13px;
    font-style: normal;
    font-weight: 900;
    box-shadow: 0 14px 28px rgba(39, 59, 96, 0.1);
  }

  .login-trace__nodes b:nth-child(1) {
    color: #00a86b;
  }

  .login-trace__nodes b:nth-child(2) {
    color: #1d4ed8;
  }

  .login-trace__nodes b:nth-child(3) {
    color: #0891b2;
  }

  .login-trace__nodes b:nth-child(4) {
    color: #dc2626;
  }

  .login-trace__nodes b span {
    position: relative;
    z-index: 1;
    flex: 0 0 auto;
    width: 10px;
    height: 10px;
    border: 0;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--board-accent), var(--board-alt));
    box-shadow: 0 0 0 6px var(--board-soft);
    animation: livePulse 1.8s ease-in-out infinite;
  }

  .login-trace__nodes b:nth-child(1) span {
    background: #00c781;
    box-shadow:
      0 0 0 6px rgba(0, 199, 129, 0.16),
      0 0 14px rgba(0, 199, 129, 0.46);
  }

  .login-trace__nodes b:nth-child(2) span {
    background: #2563eb;
    box-shadow:
      0 0 0 6px rgba(37, 99, 235, 0.16),
      0 0 14px rgba(37, 99, 235, 0.42);
  }

  .login-trace__nodes b:nth-child(3) span {
    background: #06b6d4;
    box-shadow:
      0 0 0 6px rgba(6, 182, 212, 0.16),
      0 0 14px rgba(6, 182, 212, 0.42);
  }

  .login-trace__nodes b:nth-child(4) span {
    background: #ef4444;
    box-shadow:
      0 0 0 6px rgba(239, 68, 68, 0.16),
      0 0 14px rgba(239, 68, 68, 0.46);
  }

  .login-trace__nodes b em {
    display: block;
    overflow: hidden;
    font-style: normal;
    letter-spacing: 0;
    line-height: 1;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .login-trace__status {
    position: absolute;
    top: 0;
    right: 0;
    box-sizing: border-box;
    width: 132px;
    padding: 10px 12px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.62);
  }

  .login-trace__status strong {
    display: block;
    color: #2b2552;
    font-size: 22px;
    line-height: 1;
  }

  .login-trace__status span {
    display: block;
    margin-top: 5px;
    color: #897fa8;
    font-size: 11px;
  }

  .login-widget__head {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .login-widget__head strong,
  .login-widget strong {
    display: block;
    margin-top: 5px;
    color: #2b2552;
    font-size: 17px;
    line-height: 1.15;
  }

  .login-widget--metric strong {
    margin-top: 8px;
    font-size: 30px;
    line-height: 1;
  }

  .login-widget em,
  .login-widget__head em {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    margin-top: 10px;
    padding: 5px 9px;
    border-radius: 999px;
    background: var(--board-soft);
    color: var(--board-accent);
    font-size: 12px;
    font-style: normal;
    font-weight: 800;
  }

  .login-widget em.down {
    color: #d77b20;
    background: rgba(255, 179, 107, 0.18);
  }

  .login-widget__chart {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 166px;
    margin-top: 8px;
  }

  .login-widget--flow i {
    display: block;
    height: 8px;
    margin: 12px 0 10px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(117, 111, 147, 0.12);
  }

  .login-widget--flow b {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--board-accent), var(--board-alt));
  }

  .login-widget--flow small {
    display: block;
    overflow: hidden;
    color: #897fa8;
    font-size: 12px;
    line-height: 1.5;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .login-concept__footer {
    position: absolute;
    z-index: 4;
    right: 36px;
    bottom: 32px;
    left: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #8b82a7;
    font-size: 12px;
  }

  .login-concept__dots {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .login-concept__dots button {
    width: 8px;
    height: 8px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: rgba(108, 99, 255, 0.22);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .login-concept__dots button.active {
    width: 26px;
    background: linear-gradient(90deg, var(--board-accent), var(--board-alt));
  }

  .login-command__top,
  .login-command__summary,
  .login-context-row,
  .login-board-nav,
  .login-series-title,
  .login-meta-stack,
  .login-panel__head,
  .login-stream__item,
  .login-flow__item > div,
  .login-options,
  .login-card__footer {
    display: flex;
    align-items: center;
  }

  .login-command__top {
    justify-content: space-between;
    gap: 24px;
  }

  .login-command__eyebrow,
  .login-card__eyebrow {
    color: var(--board-accent);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0;
  }

  .login-command h1 {
    margin: 8px 0;
    color: #171f3a;
    font-size: 42px;
    line-height: 1.08;
    font-weight: 900;
  }

  .login-command p,
  .login-card p {
    margin: 0;
    color: #6d7590;
    font-size: 15px;
    line-height: 1.7;
  }

  .login-meta-stack {
    align-items: flex-end;
    flex-direction: column;
    gap: 10px;
  }

  .login-clock {
    min-width: 150px;
    padding: 12px 14px;
    border: 1px solid rgba(108, 99, 255, 0.14);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.66);
    text-align: right;
    box-shadow: 0 14px 30px rgba(108, 99, 255, 0.1);
  }

  .login-clock span {
    display: block;
    color: #7b849d;
    font-size: 12px;
  }

  .login-clock strong {
    display: block;
    margin-top: 3px;
    color: #171f3a;
    font-size: 25px;
    line-height: 1.1;
  }

  .login-live {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 104px;
    padding: 8px 12px;
    border: 1px solid var(--board-glow);
    border-radius: 999px;
    background: var(--board-soft);
    color: var(--board-accent);
    font-size: 13px;
    white-space: nowrap;
  }

  .login-live span {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--board-alt);
    box-shadow: 0 0 0 6px var(--board-soft);
    animation: livePulse 1.6s ease-in-out infinite;
  }

  .login-context-row {
    gap: 14px;
    margin: 18px 0 14px;
  }

  .login-context-card {
    flex: 1;
    min-width: 0;
    padding: 14px 16px;
    border-radius: 20px;
  }

  .login-context-card span,
  .login-metric span,
  .login-panel__head span,
  .login-flow__item span,
  .login-stream__item span {
    display: block;
    color: #7b849d;
    font-size: 12px;
  }

  .login-context-card strong {
    display: block;
    margin-top: 7px;
    overflow: hidden;
    color: #232c48;
    font-size: 17px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .login-context-card em {
    display: block;
    margin-top: 5px;
    overflow: hidden;
    color: #8e96aa;
    font-size: 12px;
    font-style: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .login-board-nav {
    gap: 8px;
    max-width: 100%;
    padding: 6px;
    overflow: auto hidden;
    border: 1px solid var(--board-soft);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.52);
    scrollbar-width: none;
  }

  .login-board-nav::-webkit-scrollbar {
    display: none;
  }

  .login-board-nav button {
    flex: 0 0 auto;
    min-width: 54px;
    height: 34px;
    padding: 0 12px;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: #76819c;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.22s ease;
  }

  .login-board-nav button.active {
    background: linear-gradient(135deg, var(--board-accent), var(--board-alt));
    color: #fff;
    box-shadow: 0 10px 26px var(--board-glow);
  }

  .login-board-safe {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 360px;
    margin-top: 12px;
    padding: 14px;
    overflow: hidden;
    border: 1px solid var(--board-soft);
    border-radius: 28px;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.62), rgba(246, 249, 255, 0.5)),
      radial-gradient(circle at 15% 0%, var(--board-soft), transparent 34%),
      radial-gradient(circle at 88% 12%, color-mix(in srgb, var(--board-alt) 12%, transparent), transparent 30%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.84);
  }

  .login-board-stage {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    flex-direction: column;
    transform-origin: center center;
    transition: transform 0.22s ease;
    will-change: transform;
  }

  .login-board-safe.is-breathing {
    animation: boardDataBreath 0.98s ease both;
  }

  .login-series-title {
    justify-content: space-between;
    gap: 16px;
    min-height: 44px;
    margin-bottom: 12px;
    padding: 0 4px;
  }

  .login-series-title span {
    display: block;
    color: var(--board-accent);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0;
  }

  .login-series-title strong {
    display: block;
    margin-top: 4px;
    color: #171f3a;
    font-size: 20px;
    line-height: 1.18;
  }

  .login-series-title em {
    flex: 0 0 auto;
    padding: 7px 10px;
    border-radius: 999px;
    background: var(--board-soft);
    color: var(--board-accent);
    font-size: 12px;
    font-style: normal;
    font-weight: 900;
  }

  .login-command__summary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    height: 76px;
    margin-bottom: 12px;
  }

  .login-metric {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    padding: 12px 16px;
    border-radius: 18px;
    animation: floatSoft 5s ease-in-out infinite;
  }

  .login-metric:nth-child(2) {
    animation-delay: -1s;
  }

  .login-metric:nth-child(3) {
    animation-delay: -2s;
  }

  .login-metric strong {
    display: block;
    margin-top: 5px;
    color: #171f3a;
    font-size: 24px;
    line-height: 1.1;
  }

  .login-metric em {
    display: inline-block;
    margin-top: 6px;
    padding: 4px 8px;
    border-radius: 999px;
    background: var(--board-soft);
    color: var(--board-accent);
    font-style: normal;
    font-size: 12px;
  }

  .login-metric em.down {
    background: rgba(255, 179, 107, 0.15);
    color: #d77b20;
  }

  .login-command__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) 96px;
    flex: 1;
    gap: 12px;
    min-height: 0;
    overflow: hidden;
  }

  .login-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    padding: 14px;
    border-radius: 20px;
  }

  .login-panel::before {
    position: absolute;
    inset: 0;
    content: '';
    background: linear-gradient(110deg, transparent 0%, var(--board-soft) 38%, transparent 72%);
    transform: translateX(-100%);
    animation: shimmer 6s ease-in-out infinite;
  }

  .login-panel--chart {
    grid-column: 1;
    grid-row: 1;
    min-height: 0;
  }

  .login-panel--insight {
    grid-column: 1;
    grid-row: 2;
  }

  .login-panel--insight {
    min-height: 0;
  }

  .login-panel__head {
    position: relative;
    z-index: 1;
    justify-content: space-between;
    gap: 16px;
  }

  .login-panel__head strong {
    display: block;
    margin-top: 4px;
    color: #232c48;
    font-size: 16px;
  }

  .login-panel__head em {
    padding: 6px 9px;
    border-radius: 999px;
    background: var(--board-soft);
    color: var(--board-accent);
    font-size: 12px;
    font-style: normal;
  }

  .login-chart {
    position: relative;
    z-index: 1;
    width: 100%;
    flex: 1;
    height: 100%;
    min-height: 0;
  }

  .login-chart--radar {
    min-height: 0;
  }

  .login-flow,
  .login-stream {
    position: relative;
    z-index: 1;
    flex: 1;
    margin-top: 14px;
    overflow: hidden;
  }

  .login-insight {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 0.9fr 1.1fr;
    gap: 12px;
    flex: 1;
    min-height: 0;
    margin-top: 8px;
  }

  .login-insight__chips,
  .login-stream--compact {
    min-height: 0;
    overflow: hidden;
  }

  .login-insight__chip {
    padding: 6px 10px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.58);
  }

  .login-insight__chip + .login-insight__chip {
    margin-top: 5px;
  }

  .login-insight__chip span {
    display: block;
    color: #7b849d;
    font-size: 11px;
  }

  .login-insight__chip strong {
    display: block;
    margin-top: 2px;
    color: #232c48;
    font-size: 12px;
  }

  .login-insight__chip i {
    display: block;
    height: 3px;
    margin-top: 4px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--board-soft);
  }

  .login-insight__chip b {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--board-accent), var(--board-alt));
  }

  .login-flow__item + .login-flow__item {
    margin-top: 12px;
  }

  .login-flow__item > div {
    justify-content: space-between;
    margin-bottom: 7px;
  }

  .login-flow__item strong {
    color: #232c48;
    font-size: 13px;
  }

  .login-flow__item i {
    display: block;
    height: 8px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--board-soft);
  }

  .login-flow__item b {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--board-accent), var(--board-alt));
    transition: width 0.6s ease;
  }

  .login-stream__item {
    justify-content: space-between;
    gap: 12px;
    padding: 5px 0;
    border-bottom: 1px solid rgba(64, 78, 112, 0.1);
  }

  .login-flow__item:nth-child(n + 5),
  .login-stream__item:nth-child(n + 5) {
    display: none;
  }

  .login-stream__item strong {
    color: #232c48;
    font-size: 13px;
    font-weight: 700;
    text-align: right;
  }

  .login-card {
    position: relative;
    align-self: stretch;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 40px 36px;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.78);
  }

  .login-card__glow {
    position: absolute;
    top: -90px;
    right: -80px;
    width: 240px;
    height: 240px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(10, 90, 255, 0.18), transparent 70%);
    pointer-events: none;
  }

  .login-card__header,
  .login-form,
  .login-tabs,
  .login-options,
  .login-submit,
  .login-card__footer,
  .login-card__legal {
    position: relative;
    z-index: 1;
  }

  .login-card__header {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    justify-content: flex-start;
    margin-bottom: 16px;
  }

  .login-card h2 {
    margin: 8px 0;
    color: #171f3a;
    font-size: 30px;
    line-height: 1.2;
  }

  .login-tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin: 20px 0 24px;
    padding: 6px;
    border: 1px solid rgba(10, 90, 255, 0.12);
    border-radius: 16px;
    background: rgba(10, 90, 255, 0.06);
  }

  .login-tabs button,
  .login-options button {
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .login-tabs button {
    min-height: 42px;
    border-radius: 12px;
    color: #727b95;
    font-weight: 400;
    transition: all 0.2s ease;
  }

  .login-tabs button.active {
    background: #fff;
    color: #0a5aff;
    box-shadow: 0 12px 30px rgba(10, 90, 255, 0.14);
  }

  .login-form {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .login-wechat-panel {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 0 28px;
    padding: 20px 18px 18px;
    border: 1px solid rgba(10, 90, 255, 0.12);
    border-radius: 18px;
    background:
      linear-gradient(180deg, rgba(249, 251, 253, 0.96), rgba(255, 255, 255, 0.92)),
      #fff;
  }

  .login-wechat-qr {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 168px;
    height: 168px;
    padding: 12px;
    border: 1px solid #d8e6ff;
    border-radius: 20px;
    background: #fff;
    box-shadow: 0 14px 34px rgba(32, 48, 75, 0.08);
  }

  .login-wechat-qr__grid {
    width: 100%;
    height: 100%;
    border-radius: 14px;
    background:
      linear-gradient(90deg, #1f2b3d 10px, transparent 10px 18px, #1f2b3d 18px 26px, transparent 26px 34px, #1f2b3d 34px 42px, transparent 42px),
      linear-gradient(#1f2b3d 10px, transparent 10px 18px, #1f2b3d 18px 26px, transparent 26px 34px, #1f2b3d 34px 42px, transparent 42px),
      repeating-linear-gradient(45deg, rgba(31, 43, 61, 0.9) 0 6px, transparent 6px 12px),
      #f9fbfd;
    background-size: 52px 52px, 52px 52px, 18px 18px, auto;
    opacity: 0.82;
  }

  .login-wechat-qr__icon {
    position: absolute;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border: 4px solid #fff;
    border-radius: 50%;
    color: #19b36b;
    font-size: 28px;
    background: #fff;
    box-shadow: 0 8px 18px rgba(25, 179, 107, 0.18);
  }

  .login-wechat-copy {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 6px;
    margin-top: 16px;
    text-align: center;
  }

  .login-wechat-copy strong {
    color: #1f2944;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
  }

  .login-wechat-copy span {
    color: #6d7590;
    font-size: 13px;
    line-height: 20px;
  }

  .login-wechat-status {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    margin-top: 16px;
    padding: 10px 12px;
    border: 1px dashed #d8e6ff;
    border-radius: 12px;
    background: #eef5ff;
  }

  .login-wechat-status span {
    flex: 0 0 auto;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #19b36b;
    box-shadow: 0 0 0 5px rgba(25, 179, 107, 0.1);
  }

  .login-wechat-status em {
    min-width: 0;
    color: #5f6a7a;
    font-size: 12px;
    font-style: normal;
    line-height: 18px;
  }

  :deep(.ant-form-item) {
    margin-bottom: 18px;
  }

  :deep(.ant-form-item-label) {
    padding-bottom: 6px;
  }

  :deep(.ant-form-item-label > label) {
    color: #4c5874;
    font-weight: 400;
  }

  :deep(.ant-input-affix-wrapper),
  .login-code-btn {
    display: flex;
    align-items: center;
    width: 100%;
    height: 50px;
    border-color: rgba(61, 91, 138, 0.16);
    border-radius: 15px;
    background: rgba(250, 252, 255, 0.88);
    color: #1f2944;
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      background-color 0.18s ease;
  }

  :deep(.ant-input-affix-wrapper-focused),
  :deep(.ant-input-affix-wrapper:focus),
  :deep(.ant-input-affix-wrapper:hover) {
    border-color: #0a5aff;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 0 0 2px fade(@primary-color, 16%), 0 4px 10px rgba(32, 48, 75, 0.06);
  }

  :deep(.ant-input-affix-wrapper .ant-input),
  :deep(.ant-input-affix-wrapper input.ant-input),
  :deep(.ant-input-password input.ant-input) {
    width: 100%;
    height: 24px;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;
  }

  :deep(.ant-input:focus),
  :deep(.ant-input-focused),
  :deep(.ant-input-password input:focus),
  :deep(.ant-input-affix-wrapper input:focus),
  :deep(.ant-input-affix-wrapper-focused input),
  :deep(.ant-input-affix-wrapper .ant-input-focused) {
    border-color: transparent !important;
    outline: none !important;
    box-shadow: none !important;
  }

  :deep(.ant-input),
  :deep(.ant-input-password input) {
    height: 24px;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent;
    color: #1f2944;
    font-size: 14px;
    line-height: 24px;
    caret-color: #0a5aff;
    transition: color 0.18s ease;
  }

  :deep(.ant-input::placeholder),
  :deep(.ant-input-password input::placeholder) {
    color: #9aa7ba;
  }

  :deep(.ant-input-prefix),
  :deep(.ant-input-password-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    margin-right: 8px;
    color: #8a98ad;
    font-size: 16px;
    line-height: 1;
    transition: color 0.18s ease;
  }

  :deep(.ant-input-affix-wrapper-focused .ant-input-prefix),
  :deep(.ant-input-affix-wrapper:hover .ant-input-prefix),
  :deep(.ant-input-affix-wrapper-focused .ant-input-password-icon),
  :deep(.ant-input-affix-wrapper:hover .ant-input-password-icon) {
    color: #0a5aff;
  }

  :deep(.ant-input-clear-icon) {
    color: #a5b0c2;
    font-size: 13px;
    transition: color 0.18s ease;
  }

  :deep(.ant-input-clear-icon:hover) {
    color: #637089;
  }

  .login-code-row {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }

  .login-code-input {
    flex: 1;
    min-width: 0;
  }

  .login-code-btn {
    justify-content: center;
    width: 112px;
    color: #0a5aff;
    font-weight: 500;
    transition:
      border-color 0.18s ease,
      background-color 0.18s ease,
      color 0.18s ease,
      box-shadow 0.18s ease;
  }

  .login-code-btn:disabled {
    border-color: rgba(61, 91, 138, 0.14);
    background: rgba(243, 247, 252, 0.92);
    color: #8d9aad;
  }

  .login-options {
    justify-content: space-between;
    gap: 16px;
    margin: 2px 0 28px;
    color: #6d7590;
  }

  :deep(.ant-checkbox-wrapper) {
    color: #6d7590;
  }

  .login-options button {
    padding: 0;
    color: #0a5aff;
    font-weight: 500;
  }

  .login-submit {
    width: 100%;
    height: 52px;
    border: 1px solid transparent;
    border-radius: 16px;
    background: #1677ff;
    color: #fff;
    font-size: 16px;
    font-weight: 400;
    box-shadow: 0 18px 44px rgba(22, 119, 255, 0.26);
  }

  .login-submit:disabled,
  .login-submit.ant-btn-disabled,
  .login-submit[disabled] {
    border-color: transparent !important;
    background: #1677ff !important;
    color: #fff !important;
    box-shadow: 0 18px 44px rgba(22, 119, 255, 0.26) !important;
    opacity: 1 !important;
  }

  .login-card__footer {
    justify-content: center;
    gap: 8px;
    margin-top: 24px;
    color: #8b94aa;
    font-size: 12px;
    line-height: 1.6;
  }

  .login-card__legal {
    position: absolute;
    z-index: 1;
    display: flex;
    right: 28px;
    bottom: 22px;
    left: 28px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 0;
    color: rgba(139, 148, 170, 0.82);
    font-size: 12px;
    line-height: 1.6;
  }

  .login-card__legal i {
    color: rgba(139, 148, 170, 0.8);
    font-style: normal;
  }

  .login-welcome {
    position: fixed;
    inset: 0;
    z-index: 1200;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background:
      linear-gradient(180deg, rgba(244, 247, 249, 0.68) 0%, rgba(244, 247, 249, 0.5) 100%),
      rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(12px);
  }

  .login-welcome__surface {
    position: relative;
    display: flex;
    width: 100vw;
    min-height: 260px;
    align-items: center;
    justify-content: center;
    border-top: 1px solid rgba(10, 90, 255, 0.16);
    border-bottom: 1px solid rgba(10, 90, 255, 0.14);
    background:
      linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 22%, rgba(255, 255, 255, 0.92) 78%, rgba(255, 255, 255, 0) 100%),
      linear-gradient(180deg, rgba(238, 245, 255, 0.52) 0%, rgba(255, 255, 255, 0.3) 100%);
    box-shadow: 0 28px 90px rgba(32, 56, 85, 0.12);
  }

  .login-welcome__line {
    position: absolute;
    inset: 30px 12vw;
    border-top: 1px dashed rgba(216, 227, 242, 0.92);
    border-bottom: 1px dashed rgba(216, 227, 242, 0.92);
    pointer-events: none;
  }

  .login-welcome__inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 28px;
    padding: 38px 32px 44px;
    text-align: left;
  }

  .login-welcome__mark {
    display: flex;
    width: 86px;
    height: 86px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(10, 90, 255, 0.13);
    border-radius: 26px;
    background: rgba(255, 255, 255, 0.78);
    box-shadow: 0 16px 36px rgba(10, 90, 255, 0.12);
  }

  .login-welcome__mark img {
    width: 66px;
    height: 66px;
    object-fit: contain;
  }

  .login-welcome__copy span {
    display: block;
    color: #0a5aff;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0;
    line-height: 18px;
  }

  .login-welcome__copy h1 {
    margin: 8px 0 10px;
    color: #172033;
    font-size: 34px;
    font-weight: 500;
    line-height: 44px;
  }

  .login-welcome__copy p {
    margin: 0;
    color: #5f6a7a;
    font-size: 15px;
    line-height: 24px;
  }

  .login-welcome__progress {
    position: absolute;
    right: 28vw;
    bottom: 34px;
    left: 28vw;
    height: 3px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(225, 235, 255, 0.9);
  }

  .login-welcome__progress i {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #0a5aff, #72a4ff);
    transform-origin: left center;
    animation: login-welcome-progress 3s linear forwards;
  }

  .login-welcome-fade-enter-active {
    transition: opacity 0.32s ease;
  }

  .login-welcome-fade-leave-active {
    transition: opacity 0.42s ease;
  }

  .login-welcome-fade-enter-from,
  .login-welcome-fade-leave-to,
  .login-welcome--leaving {
    opacity: 0;
  }

  .login-welcome-fade-enter-active .login-welcome__surface {
    animation: login-welcome-rise 0.46s ease both;
  }

  @keyframes auroraDrift {
    from {
      transform: translate3d(0, 0, 0) scale(1);
    }
    to {
      transform: translate3d(42px, -24px, 0) scale(1.08);
    }
  }

  @keyframes livePulse {
    50% {
      box-shadow: 0 0 0 10px rgba(32, 199, 168, 0);
    }
  }

  @keyframes floatSoft {
    50% {
      transform: translateY(-8px);
    }
  }

  @keyframes shimmer {
    45%,
    100% {
      transform: translateX(120%);
    }
  }

  @keyframes login-welcome-rise {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes login-welcome-progress {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }

  @keyframes conceptFloat {
    50% {
      transform: translateY(-10px) rotate(-5deg) scale(1.02);
    }
  }

  @keyframes conceptFloatCommand {
    0%,
    100% {
      border-radius: 42% 58% 48% 52% / 58% 42% 54% 46%;
      transform: translateY(0) rotate(-8deg) scale(1);
    }
    50% {
      border-radius: 54% 46% 56% 44% / 44% 56% 42% 58%;
      transform: translateY(-10px) rotate(-4deg) scale(1.025);
    }
  }

  @keyframes conceptFloatHospital {
    0%,
    100% {
      border-radius: 58% 42% 62% 38% / 38% 54% 46% 62%;
      transform: translateY(0) rotate(7deg) scale(1);
    }
    50% {
      border-radius: 44% 56% 48% 52% / 62% 38% 58% 42%;
      transform: translateY(-14px) rotate(12deg) scale(1.018);
    }
  }

  @keyframes conceptFloatReview {
    0%,
    100% {
      border-radius: 64% 36% 44% 56% / 46% 64% 36% 54%;
      transform: translateY(0) rotate(-14deg) scale(1);
      filter: saturate(1);
    }
    50% {
      border-radius: 38% 62% 58% 42% / 58% 38% 62% 42%;
      transform: translateY(-8px) rotate(-20deg) scale(1.03);
      filter: saturate(1.12);
    }
  }

  @keyframes conceptFloatTrace {
    0%,
    100% {
      border-radius: 52% 48% 34% 66% / 48% 38% 62% 52%;
      transform: translateY(0) skewX(-3deg) rotate(4deg) scale(1);
      background-position: 0 0, center, center;
    }
    50% {
      border-radius: 36% 64% 48% 52% / 62% 44% 56% 38%;
      transform: translateY(-12px) skewX(4deg) rotate(9deg) scale(1.024);
      background-position: 42px 0, center, center;
    }
  }

  @keyframes traceScanner {
    0%,
    100% {
      transform: translateY(0);
      opacity: 0.3;
    }
    50% {
      transform: translateY(52px);
      opacity: 1;
    }
  }

  @keyframes traceSweep {
    45%,
    100% {
      transform: translateX(120%);
    }
  }

  @keyframes commandBoardBreath {
    0% {
      opacity: 0.76;
      transform: scale(0.992);
      box-shadow:
        0 24px 70px rgba(96, 111, 169, 0.16),
        0 0 0 var(--board-glow);
    }
    48% {
      opacity: 1;
      transform: scale(1.006);
      box-shadow:
        0 28px 78px rgba(96, 111, 169, 0.22),
        0 0 38px var(--board-glow);
    }
    100% {
      opacity: 1;
      transform: scale(1);
      box-shadow:
        0 24px 70px rgba(96, 111, 169, 0.18),
        0 0 0 var(--board-glow);
    }
  }

  @keyframes boardDataBreath {
    0% {
      opacity: 0.72;
      transform: translateY(8px) scale(0.992);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.84),
        0 0 0 var(--board-glow);
    }
    48% {
      opacity: 1;
      transform: translateY(0) scale(1.008);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.84),
        0 0 30px var(--board-glow);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.84),
        0 0 0 var(--board-glow);
    }
  }

  @media (max-width: 1180px) {
    .login-shell {
      align-items: flex-start;
      padding: 24px;
      overflow: auto;
    }

    .login-board {
      grid-template-columns: 1fr;
      height: auto;
      min-height: auto;
      padding: 16px;
    }

    .login-card {
      width: min(100%, 520px);
      margin: 0 auto;
      min-height: 620px;
    }

    .login-command {
      min-height: 640px;
    }

    .login-concept__visual {
      inset: 190px 30px 72px;
    }
  }

  @media (max-width: 760px) {
    .login-shell {
      padding: 12px;
    }

    .login-board {
      padding: 10px;
      border-radius: 24px;
    }

    .login-command {
      padding: 0;
      border-radius: 22px;
    }

    .login-concept {
      min-height: 560px;
      padding: 24px;
    }

    .login-health-mark {
      width: 70px;
      height: 70px;
      border-radius: 22px;
    }

    .login-health-mark__logo {
      width: 54px;
      height: 54px;
    }

    .login-concept__meta {
      top: 24px;
      right: 24px;
      width: 138px;
      min-height: 104px;
      padding: 12px;
      border-radius: 24px;
    }

    .login-concept__meta strong {
      font-size: 22px;
    }

    .login-concept__visual {
      inset: 190px 18px 62px;
    }

    .login-widget--chart,
    .login-widget--queue,
    .login-widget--review,
    .login-widget--trace {
      left: 8px;
      bottom: 22px;
      width: 72%;
      height: 200px;
    }

    .login-widget--metric {
      top: 22px;
      right: 8px;
      width: 150px;
      min-height: 108px;
      padding: 13px 14px;
    }

    .login-widget--metric strong {
      font-size: 25px;
    }

    .login-widget--flow {
      right: 20px;
      bottom: 0;
      width: 190px;
      min-height: 108px;
      padding: 13px 14px;
    }

    .login-command__top,
    .login-context-row {
      align-items: flex-start;
      flex-direction: column;
    }

    .login-meta-stack {
      align-items: flex-start;
    }

    .login-command h1 {
      font-size: 34px;
    }

    .login-metric,
    .login-context-card {
      width: 100%;
    }

    .login-card {
      min-height: auto;
      padding: 24px;
      border-radius: 22px;
    }
  }
</style>
