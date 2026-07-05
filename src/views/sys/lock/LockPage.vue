<template>
  <div :class="prefixCls" class="fixed inset-0 h-screen w-screen">
    <div :class="`${prefixCls}__dashboard`">
      <div :class="`${prefixCls}__dashboard-head`">
        <span>蒙医云休息屏</span>
        <span>{{ userInfo.AccountName }}</span>
      </div>
      <div :class="`${prefixCls}__dashboard-grid`">
        <div
          v-for="item in dashboardCards"
          :key="item.label"
          :class="`${prefixCls}__metric-card`"
        >
          <div :class="`${prefixCls}__metric-label`">{{ item.label }}</div>
          <div :class="`${prefixCls}__metric-value`">{{ item.value }}</div>
          <div :class="`${prefixCls}__metric-line`">
            <span :style="{ width: item.rate + '%' }"></span>
          </div>
        </div>
      </div>
    </div>

    <div :class="`${prefixCls}__content`">
      <div :class="`${prefixCls}__time-panel`">
        <div :class="`${prefixCls}__time-main`">
          <span>{{ hour }}</span>
          <em>:</em>
          <span>{{ minute }}</span>
          <small>{{ secondText }}</small>
        </div>
        <div :class="`${prefixCls}__date`">
          {{ year }}/{{ month }}/{{ day }} {{ week }} {{ meridiem }}
        </div>
        <div :class="`${prefixCls}__status`">
          当前系统已进入安全休息状态，业务数据仍在安静守护中。
        </div>
        <button
          v-show="showDate"
          type="button"
          :class="`${prefixCls}__unlock`"
          @click="handleShowForm(false)"
        >
          <LockOutlined />
          <span>{{ t('sys.lock.unlock') }}</span>
        </button>
      </div>

      <div :class="`${prefixCls}__flow`">
        <div :class="`${prefixCls}__flow-title`">处方流转状态</div>
        <div :class="`${prefixCls}__flow-track`">
          <span>审方</span>
          <i></i>
          <span>调配</span>
          <i></i>
          <span>发药</span>
          <i></i>
          <span>完成</span>
        </div>
      </div>
    </div>

    <transition name="lock-card">
      <div :class="`${prefixCls}-entry`" v-show="!showDate">
        <div :class="`${prefixCls}-entry-content`">
          <div :class="`${prefixCls}-entry__header`">
            <img :src="userInfo.avatar" :class="`${prefixCls}-entry__header-img`" />
            <div :class="`${prefixCls}-entry__header-text`">
              <p :class="`${prefixCls}-entry__header-name`">{{ userInfo.AccountName }}</p>
              <span>请输入锁屏密码完成解锁</span>
            </div>
          </div>
          <div :class="`${prefixCls}-entry__divider`"></div>
          <InputPassword
            :placeholder="t('sys.lock.placeholder')"
            :class="`${prefixCls}-entry__input`"
            v-model:value="password"
            @pressEnter="unLock"
          />
          <div :class="`${prefixCls}-entry__err-msg`">
            <span v-if="errMsg">{{ t('sys.lock.alert') }}</span>
          </div>
          <div :class="`${prefixCls}-entry__footer`">
            <a-button
              :class="`${prefixCls}-entry__ghost`"
              :disabled="loading"
              @click="handleShowForm(true)"
            >
              {{ t('common.back') }}
            </a-button>
            <a-button
              :class="`${prefixCls}-entry__ghost`"
              :disabled="loading"
              @click="goLogin"
            >
              {{ t('sys.lock.backToLogin') }}
            </a-button>
            <a-button
              type="primary"
              :class="`${prefixCls}-entry__submit`"
              @click="unLock()"
              :loading="loading"
            >
              {{ t('sys.lock.entry') }}
            </a-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import { Input } from 'ant-design-vue';
  import { useUserStore } from '@/store/modules/user';
  import { useLockStore } from '@/store/modules/lock';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useNow } from './useNow';
  import { useDesign } from '@/hooks/web/useDesign';
  import { LockOutlined } from '@ant-design/icons-vue';
  import headerImg from '@/assets/images/header.jpg';
  import { PrescriptApiCtrl } from '/@/api/myy/prescript';
  import { ChargeApiCtrl } from '/@/api/myy/charge';
  import { OrderApiCtrl } from '/@/api/myy/order';

  const InputPassword = Input.Password;

  const password = ref('');
  const loading = ref(false);
  const errMsg = ref(false);
  const showDate = ref(true);
  const lockMetrics = ref({
    todayVisits: null as null | number,
    pendingCharges: null as null | number,
    pharmacyPreparing: null as null | number,
    prescriptionFlow: null as null | number,
    visitRate: 0,
    pendingRate: 0,
    pharmacyRate: 0,
    flowRate: 0,
  });

  const { prefixCls } = useDesign('lock-page');
  const lockStore = useLockStore();
  const userStore = useUserStore();

  const { hour, month, minute, second, meridiem, year, day, week } = useNow(true);

  const { t } = useI18n();

  const userInfo = computed(() => {
    const clinic = userStore.getUserInfo?.Clinic || {};
    const doctor = userStore.getUserInfo?.Doctor || {};
    return {
      AccountName: clinic.Name || '蒙医云诊室',
      ContactName: doctor.DoctorName || '',
      avatar: clinic.Logo || headerImg,
    };
  });

  const secondText = computed(() => String(second.value).padStart(2, '0'));
  const formatMetric = (value: null | number, unit: string) => {
    return value === null ? '--' : `${value} ${unit}`;
  };
  const clampRate = (value: number) => Math.min(96, Math.max(18, value));
  const dashboardCards = computed(() => [
    {
      label: '今日接诊',
      value: formatMetric(lockMetrics.value.todayVisits, '人'),
      rate: lockMetrics.value.todayVisits === null ? 28 : lockMetrics.value.visitRate,
    },
    {
      label: '云药房调配',
      value: formatMetric(lockMetrics.value.pharmacyPreparing, '单'),
      rate: lockMetrics.value.pharmacyPreparing === null ? 28 : lockMetrics.value.pharmacyRate,
    },
    {
      label: '处方流转',
      value: formatMetric(lockMetrics.value.prescriptionFlow, '单'),
      rate: lockMetrics.value.prescriptionFlow === null ? 28 : lockMetrics.value.flowRate,
    },
    {
      label: '待收款',
      value: formatMetric(lockMetrics.value.pendingCharges, '笔'),
      rate: lockMetrics.value.pendingCharges === null ? 28 : lockMetrics.value.pendingRate,
    },
  ]);

  onMounted(() => {
    loadLockMetrics();
  });

  async function loadLockMetrics() {
    await Promise.allSettled([
      loadTodayVisitMetric(),
      loadChargeMetric(),
      loadOrderFlowMetric(),
    ]);
  }

  async function loadTodayVisitMetric() {
    try {
      const data = await PrescriptApiCtrl.TodayVisitList({
        page: 1,
        limit: 1,
        keyword: '',
        status: null,
      }, 'none');
      const total = Number(data?.TotalItemCount ?? data?.Rows?.length ?? 0);
      lockMetrics.value.todayVisits = total;
      lockMetrics.value.visitRate = clampRate(total * 9);
    } catch (error) {
      lockMetrics.value.todayVisits = null;
    }
  }

  async function loadChargeMetric() {
    try {
      const data = await ChargeApiCtrl.ChargeList({
        page: 1,
        limit: 1,
        chargeStatus: 0,
      }, 'none');
      const total = Number(data?.TotalItemCount ?? data?.Rows?.length ?? 0);
      lockMetrics.value.pendingCharges = total;
      lockMetrics.value.pendingRate = clampRate(total * 14);
    } catch (error) {
      lockMetrics.value.pendingCharges = null;
    }
  }

  async function loadOrderFlowMetric() {
    try {
      const data = await OrderApiCtrl.OrderList({
        page: 1,
        limit: 30,
      }, 'none');
      const rows = Array.isArray(data?.Rows) ? data.Rows : [];
      const total = Number(data?.TotalItemCount ?? rows.length ?? 0);
      const preparing = rows.filter((item) => {
        return [0, 1, 2].includes(Number(item.PreparStatus));
      }).length;
      lockMetrics.value.prescriptionFlow = total;
      lockMetrics.value.pharmacyPreparing = preparing;
      lockMetrics.value.flowRate = clampRate(total * 6);
      lockMetrics.value.pharmacyRate = clampRate(preparing * 18);
    } catch (error) {
      lockMetrics.value.prescriptionFlow = null;
      lockMetrics.value.pharmacyPreparing = null;
    }
  }

  async function unLock() {
    if (!password.value) {
      return;
    }
    let pwd = password.value;
    try {
      loading.value = true;
      const res = await lockStore.unLock(pwd);
      errMsg.value = !res;
    } finally {
      loading.value = false;
    }
  }

  function goLogin() {
    userStore.logout(true);
    lockStore.resetLockInfo();
  }

  function handleShowForm(show = false) {
    if (show) {
      password.value = '';
      errMsg.value = false;
    }
    showDate.value = show;
  }
</script>
<style lang="less" scoped>
  /* stylelint-disable media-query-no-invalid */
  @prefix-cls: ~'@{namespace}-lock-page';

  .@{prefix-cls} {
    z-index: @lock-page-z-index;
    overflow: hidden;
    background:
      linear-gradient(180deg, rgba(244, 247, 249, 0.96) 0%, rgba(244, 247, 249, 0.82) 100%),
      radial-gradient(circle at 78% 18%, rgba(225, 235, 255, 0.82) 0, rgba(225, 235, 255, 0) 28%),
      radial-gradient(circle at 16% 78%, rgba(238, 245, 255, 0.9) 0, rgba(238, 245, 255, 0) 32%);
    color: #263447;

    &__dashboard {
      position: absolute;
      inset: 36px 46px auto;
      opacity: 0.78;
      animation: lock-dashboard-breathe 8s ease-in-out infinite;
    }

    &__dashboard-head {
      display: flex;
      justify-content: space-between;
      color: #5f6a7a;
      font-size: 13px;
      line-height: 20px;
    }

    &__dashboard-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(140px, 1fr));
      gap: 14px;
      margin-top: 12px;
    }

    &__metric-card {
      position: relative;
      padding: 14px 16px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(216, 226, 240, 0.84);
      border-radius: 12px;
      box-shadow: 0 14px 38px rgba(38, 52, 78, 0.07);
      backdrop-filter: blur(10px);

      &::after {
        position: absolute;
        right: 12px;
        bottom: 10px;
        width: 54px;
        height: 54px;
        background: linear-gradient(135deg, rgba(47, 111, 237, 0.12), rgba(255, 255, 255, 0));
        border-radius: 50%;
        content: '';
      }
    }

    &__metric-label {
      color: #5f6a7a;
      font-size: 12px;
      line-height: 18px;
    }

    &__metric-value {
      margin-top: 8px;
      color: #1f2937;
      font-size: 22px;
      font-weight: 500;
      line-height: 30px;
    }

    &__metric-line {
      height: 4px;
      margin-top: 12px;
      overflow: hidden;
      background: #eef5ff;
      border-radius: 99px;

      span {
        display: block;
        height: 100%;
        background: #2f6fed;
        border-radius: inherit;
        transition: width 0.8s ease;
      }
    }

    &__content {
      display: grid;
      position: relative;
      z-index: 1;
      grid-template-columns: minmax(460px, 0.9fr) minmax(320px, 0.45fr);
      align-items: center;
      gap: 54px;
      width: min(1180px, calc(100vw - 72px));
      height: 100%;
      margin: 0 auto;
      padding-top: 86px;
    }

    &__time-panel {
      padding: 34px 0;
    }

    &__time-main {
      display: flex;
      align-items: center;
      color: #1f2937;
      font-size: clamp(92px, 12vw, 168px);
      font-weight: 500;
      line-height: 0.95;
      letter-spacing: 0;

      em {
        margin: 0 18px;
        color: #2f6fed;
        font-style: normal;
        animation: lock-colon-soft 2s ease-in-out infinite;
      }

      small {
        align-self: flex-end;
        min-width: 54px;
        margin-bottom: 10px;
        margin-left: 18px;
        color: #2f6fed;
        font-size: clamp(28px, 3.4vw, 44px);
        font-weight: 500;
        line-height: 1;
        text-align: right;
        opacity: 0.72;
      }
    }

    &__date {
      margin-top: 20px;
      color: #5f6a7a;
      font-size: 22px;
      line-height: 32px;
    }

    &__status {
      width: min(520px, 100%);
      margin-top: 16px;
      padding-top: 16px;
      color: #5f6a7a;
      font-size: 14px;
      line-height: 22px;
      background-image: linear-gradient(to right, #d8e2f0 50%, transparent 50%);
      background-repeat: repeat-x;
      background-size: 8px 1px;
    }

    &__unlock {
      display: inline-flex;
      align-items: center;
      height: 44px;
      margin-top: 32px;
      padding: 0 22px;
      color: #2f6fed;
      font-size: 15px;
      line-height: 22px;
      background: #fff;
      border: 1px solid #d7e4ff;
      border-radius: 8px;
      box-shadow: 0 12px 28px rgba(47, 111, 237, 0.12);
      cursor: pointer;
      transition: background-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;

      span {
        margin-left: 8px;
      }

      &:hover {
        background: #eef5ff;
        box-shadow: 0 16px 34px rgba(47, 111, 237, 0.16);
        transform: translateY(-1px);
      }
    }

    &__flow {
      padding: 22px;
      background: rgba(255, 255, 255, 0.68);
      border: 1px solid rgba(216, 226, 240, 0.9);
      border-radius: 18px;
      box-shadow: 0 18px 44px rgba(38, 52, 78, 0.08);
      backdrop-filter: blur(12px);
    }

    &__flow-title {
      color: #1f2937;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
    }

    &__flow-track {
      display: grid;
      grid-template-columns: auto 1fr auto 1fr auto 1fr auto;
      align-items: center;
      gap: 10px;
      margin-top: 20px;

      span {
        color: #5f6a7a;
        font-size: 13px;
        line-height: 20px;
        white-space: nowrap;
      }

      i {
        display: block;
        height: 1px;
        background-image: linear-gradient(to right, #b9c8dd 50%, transparent 50%);
        background-size: 8px 1px;
      }
    }

    &-entry {
      display: flex;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 3;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: rgba(244, 247, 249, 0.46);
      backdrop-filter: blur(10px);
      pointer-events: auto;

      &-content {
        position: relative;
        z-index: 1;
        width: 430px;
        padding: 30px;
        background: #fff;
        border: 1px solid #e8eef7;
        border-radius: 28px;
        box-shadow: 0 28px 70px rgba(38, 52, 78, 0.18);
      }

      &__header {
        display: flex;
        align-items: center;

        &-img {
          width: 58px;
          height: 58px;
          margin-right: 14px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 0 0 1px #e1ebff;
        }

        &-text {
          min-width: 0;
        }

        &-name {
          margin: 0;
          overflow: hidden;
          color: #1f2937;
          font-size: 17px;
          font-weight: 500;
          line-height: 24px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        span {
          display: block;
          margin-top: 4px;
          color: #5f6a7a;
          font-size: 13px;
          line-height: 20px;
        }
      }

      &__divider {
        height: 1px;
        margin: 20px 0;
        background-image: linear-gradient(to right, #d8e2f0 50%, transparent 50%);
        background-size: 8px 1px;
      }

      &__input {
        height: 44px;
        border-radius: 10px;
      }

      :deep(.ant-input-affix-wrapper) {
        height: 44px;
        border-color: #e1e8f2;
        border-radius: 10px;
        transition: border-color 0.18s ease, box-shadow 0.18s ease;

        &:hover,
        &-focused {
          border-color: rgba(47, 111, 237, 0.44);
          box-shadow: 0 0 0 3px rgba(47, 111, 237, 0.1);
        }
      }

      &__err-msg {
        height: 24px;
        padding-top: 6px;
        color: @error-color;
        font-size: 13px;
        line-height: 18px;
      }

      &__footer {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 10px;
      }

      &__ghost,
      &__submit {
        height: 40px;
        border-radius: 8px;
        font-weight: 400;
      }

      &__ghost {
        color: #5f6a7a;
        background: #f9fbfd;
        border-color: #e1e8f2;

        &:hover {
          color: #2f6fed;
          background: #eef5ff;
          border-color: #cfe0ff;
        }
      }

      &__submit {
        grid-column: 1 / 3;
      }
    }

    @media screen and (max-width: @screen-lg) {
      &__dashboard-grid {
        grid-template-columns: repeat(2, minmax(140px, 1fr));
      }

      &__content {
        grid-template-columns: 1fr;
        gap: 24px;
        padding-top: 160px;
      }

      &__flow {
        display: none;
      }
    }

    @media screen and (max-width: @screen-sm) {
      &__dashboard {
        display: none;
      }

      &__content {
        width: calc(100vw - 36px);
        padding-top: 0;
      }

      &-entry-content {
        width: calc(100vw - 36px);
      }
    }
  }

  .lock-card-enter-active,
  .lock-card-leave-active {
    transition: opacity 0.2s ease;
  }

  .lock-card-enter-from,
  .lock-card-leave-to {
    opacity: 0;
  }

  @keyframes lock-colon-soft {
    0%,
    100% {
      opacity: 0.9;
    }

    50% {
      opacity: 0.42;
    }
  }

  @keyframes lock-dashboard-breathe {
    0%,
    100% {
      opacity: 0.74;
      transform: translateY(0);
    }

    50% {
      opacity: 0.9;
      transform: translateY(4px);
    }
  }
</style>
