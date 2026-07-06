<template>
  <a-modal
    v-model:open="receiptModal.visible"
    title="请输入就诊人收货信息"
    centered
    width="820px"
    wrapClassName="receipt-info-modal"
    okText="确认提交"
    cancelText="取消"
    :confirmLoading="receiptModal.loading"
    :maskClosable="false"
    destroyOnClose
    @ok="confirm"
  >
    <div class="receipt-info-content">
      <section class="receipt-info-patient-card">
        <div class="receipt-info-patient-main">
          <img class="receipt-info-avatar" src="../../../assets//images/userAvatar1.png" alt="" />
          <div class="receipt-info-patient-text">
            <div class="receipt-info-patient-name-row">
              <span class="receipt-info-patient-name">{{ patient.Name || '就诊人' }}</span>
              <ManOutlined class="receipt-info-gender receipt-info-gender-man" v-if="patient.Gender == 1" />
              <WomanOutlined class="receipt-info-gender receipt-info-gender-woman" v-else />
              <span class="receipt-info-age">{{ patient.Age || '-' }} 岁</span>
            </div>
            <div class="receipt-info-meta-row">
              <span>病历编号：{{ visitId || '-' }}</span>
              <span>开方日期：{{ createDate }}</span>
            </div>
          </div>
        </div>
        <div class="receipt-info-total">
          <span>订单金额</span>
          <strong>￥{{ total }}</strong>
        </div>
      </section>

      <section class="receipt-info-recognize-card">
        <div class="receipt-info-section-head">
          <div class="receipt-info-section-title">
            <img class="receipt-info-recognize-icon" src="../../../assets//images/recognizeIcon.png" alt="" />
            <span>智能粘贴识别</span>
          </div>
          <a-space :size="8">
            <a-button size="small" @click="address = ''">清除</a-button>
            <a-button type="primary" ghost size="small" @click="handleIdentify">识别地址</a-button>
          </a-space>
        </div>
        <a-textarea
          v-model:value="address"
          class="receipt-info-paste-input"
          placeholder="粘贴就诊人姓名、手机号、省市区和详细地址，系统会自动识别填充"
          :bordered="false"
          :rows="2"
        />
      </section>

      <section class="receipt-info-form-card">
        <div class="receipt-info-form-head">
          <div>
            <div class="receipt-info-form-title">收货信息</div>
            <div class="receipt-info-form-subtitle">请核对就诊人收货地址，确认后将随订单提交</div>
          </div>
          <a-space :size="8">
            <a-button type="primary" ghost>微信扫码上传</a-button>
            <a-button type="primary" @click="handleInstitutionalAddress">默认机构地址</a-button>
          </a-space>
        </div>

        <a-form
          ref="formIns"
          class="receipt-info-form"
          layout="vertical"
          :model="receiptModal.form"
          :rules="receiptModal.rules"
        >
          <a-form-item label="收货人" name="ReceiverName">
            <a-input v-model:value="receiptModal.form.ReceiverName" placeholder="请输入收货人姓名" />
          </a-form-item>
          <a-form-item label="联系电话" name="ReceiverPhone">
            <a-input
              v-model:value="receiptModal.form.ReceiverPhone"
              placeholder="请输入11位手机号"
              :maxlength="11"
              @input="handleReceiverPhoneInput"
            />
          </a-form-item>
          <a-form-item label="省市区" name="RegionCode">
            <a-cascader
              v-model:value="receiptModal.form.RegionCode"
              :options="citiesList"
              :field-names="{ label: 'name', value: 'code', children: 'children' }"
              placeholder="请选择省市区"
              @change="changeRegionData"
            />
          </a-form-item>
          <a-form-item label="详细地址" name="ReceiverAddress">
            <a-input v-model:value="receiptModal.form.ReceiverAddress" placeholder="请输入具体街道、小区、楼牌号" />
          </a-form-item>
        </a-form>
      </section>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { Cities, AddressAnalysis } from '/@/api/platform/common';
  import { WomanOutlined, ManOutlined } from '@ant-design/icons-vue';
  import { useUserStore } from '@/store/modules/user';

  interface ReceiptForm {
    ReceiverName: string;
    ReceiverPhone: string;
    ReceiverAddress: string;
    RegionCode: any[];
    RegionData: any[];
  }

  const userStore = useUserStore();
  const { createMessage } = useMessage();
  const props = defineProps({
    patient: { type: Object, default: () => ({}) },
    total: { type: Number, default: 0 },
    visitId: { type: String, default: '' },
    visible: { type: Boolean, default: false },
  });
  const emit = defineEmits(['update:visible', 'confirm']);
  const formIns = ref();
  const address = ref('');
  const citiesList = ref<any[]>([]);
  const createDate = ref(formatToDateTime(new Date()));
  const receiptForm: ReceiptForm = {
    ReceiverName: '',
    ReceiverPhone: '',
    ReceiverAddress: '',
    RegionCode: [],
    RegionData: [],
  };
  const receiptModal = ref({
    loading: false,
    visible: false,
    form: cloneDeep(receiptForm),
    rules: {
      ReceiverName: [{ required: true, trigger: 'blur', message: '该项必须填写', type: 'string' }],
      ReceiverPhone: [{ required: true, trigger: 'blur', validator: validateReceiverPhone }],
      ReceiverAddress: [{ required: true, trigger: 'blur', message: '该项必须填写', type: 'string' }],
      RegionCode: [{ required: true, trigger: 'change', message: '该项必须选择', type: 'array' }],
    },
  });

  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        createDate.value = formatToDateTime(new Date());
        receiptModal.value.visible = true;
      }
    },
  );

  watch(
    () => receiptModal.value.visible,
    (newVal) => {
      if (!newVal) {
        emit('update:visible', false);
        formIns.value?.resetFields();
        address.value = '';
        receiptModal.value.loading = false;
      }
    },
  );

  onMounted(() => {
    getCities();
  });

  const getCities = () => {
    Cities().then((data) => {
      citiesList.value = data;
    });
  };

  const normalizeReceiverPhone = () => {
    receiptModal.value.form.ReceiverPhone = String(receiptModal.value.form.ReceiverPhone || '')
      .replace(/\D/g, '')
      .slice(0, 11);
  };

  function validateReceiverPhone(_rule: any, value: string) {
    const phone = String(value || '').trim();
    if (!phone) {
      return Promise.reject('该项必须填写');
    }
    if (!/^\d{11}$/.test(phone)) {
      return Promise.reject('请输入11位数字手机号');
    }
    return Promise.resolve();
  }

  const handleReceiverPhoneInput = () => {
    normalizeReceiverPhone();
  };

  const handleIdentify = async () => {
    if (address.value == '') {
      createMessage.warning('请输入需要识别的信息');
      return;
    }
    receiptModal.value.loading = true;

    try {
      const data = await AddressAnalysis({ address: address.value });
      const addressinfo = data;

      if (!addressinfo.ad_info.adcode) {
        createMessage.error('地址识别失败，请手动输入地址');
        return;
      }

      const addressArray = [
        {
          Code: addressinfo.ad_info.adcode,
          Name: addressinfo.address_components.province,
        },
        {
          Code: addressinfo.ad_info.adcode,
          Name: addressinfo.address_components.city,
        },
        {
          Code: addressinfo.ad_info.adcode,
          Name: addressinfo.address_components.district,
        },
      ];
      const uniqueCodes = [...new Set(addressArray.map((item) => item.Code))];
      receiptModal.value.form.RegionCode = [
        ...new Set(uniqueCodes.flatMap((code) => [code.substring(0, 2), code.substring(0, 4), code])),
      ];
      receiptModal.value.form.RegionData = addressArray.map((item, index) => {
        return {
          Code: receiptModal.value.form.RegionCode[index],
          Name: item.Name,
        };
      });

      const response = await fetch('https://uni.qishangke.com/address-master/query.php?address=' + address.value);
      if (!response.ok) {
        throw new Error(`请求失败，状态码: ${response.status}`);
      }
      const extraData = await response.json();
      receiptModal.value.form.ReceiverName = extraData.name;
      receiptModal.value.form.ReceiverPhone = extraData.mobile;
      normalizeReceiverPhone();
      receiptModal.value.form.ReceiverAddress = extraData.street;
    } catch (error) {
      createMessage.error('识别或请求异常，请稍后重试');
    } finally {
      receiptModal.value.loading = false;
    }
  };

  const changeRegionData = (_e: any, list: any[]) => {
    if (list.length) {
      receiptModal.value.form.RegionData = list.map((item) => {
        return {
          Code: item.code,
          Name: item.name,
        };
      });
    }
  };

  const handleInstitutionalAddress = () => {
    const userInfo = userStore.getUserInfo;
    receiptModal.value.form.ReceiverName = userInfo.Clinic.ContactName;
    receiptModal.value.form.ReceiverPhone = userInfo.Clinic.ContactPhone;
    normalizeReceiverPhone();
    receiptModal.value.form.ReceiverAddress = userInfo.Clinic.Address;

    receiptModal.value.form.RegionCode = [
      userInfo.Clinic.ProvinceCode,
      userInfo.Clinic.CityCode,
      userInfo.Clinic.DistrictCode,
    ];
    receiptModal.value.form.RegionData = [
      {
        Code: userInfo.Clinic.ProvinceCode,
        Name: userInfo.Clinic.Province,
      },
      {
        Code: userInfo.Clinic.CityCode,
        Name: userInfo.Clinic.City,
      },
      {
        Code: userInfo.Clinic.DistrictCode,
        Name: userInfo.Clinic.District,
      },
    ];
  };

  const confirm = () => {
    normalizeReceiverPhone();
    formIns.value.validate().then(() => {
      receiptModal.value.loading = true;
      const formData = cloneDeep(receiptModal.value.form);
      formData.RegionData = JSON.stringify(formData.RegionData);
      createMessage.success('保存成功');
      receiptModal.value.form = cloneDeep(receiptForm);
      receiptModal.value.visible = false;
      emit('update:visible', false);
      emit('confirm', formData);
    });
  };
</script>

<style lang="less" scoped>
:global(.receipt-info-modal .ant-modal-content) {
  overflow: hidden;
  border-radius: 28px;
  box-shadow: 0 18px 46px rgb(32 56 85 / 16%);
}

:global(.receipt-info-modal .ant-modal-header) {
  padding: 22px 28px 12px;
  border-bottom: 0;
  background: #ffffff;
}

:global(.receipt-info-modal .ant-modal-title) {
  color: #1d2533;
  font-size: 18px;
  font-weight: 400;
}

:global(.receipt-info-modal .ant-modal-close) {
  top: 16px;
  right: 18px;
}

:global(.receipt-info-modal .ant-modal-body) {
  padding: 0 28px 8px;
}

:global(.receipt-info-modal .ant-modal-footer) {
  padding: 14px 28px 24px;
  border-top: 0;
}

:global(.receipt-info-modal .ant-modal-footer .ant-btn),
:global(.receipt-info-modal .ant-btn) {
  min-width: 86px;
  border-radius: 8px;
}

.receipt-info-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.receipt-info-patient-card,
.receipt-info-recognize-card,
.receipt-info-form-card {
  border: 1px solid #e8eef7;
  border-radius: 16px;
  background: #ffffff;
}

.receipt-info-patient-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f9fbfd;
}

.receipt-info-patient-main {
  display: flex;
  align-items: center;
  min-width: 0;
}

.receipt-info-avatar {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 50%;
  box-shadow: 0 6px 16px rgb(32 56 85 / 8%);
}

.receipt-info-patient-text {
  min-width: 0;
  margin-left: 12px;
}

.receipt-info-patient-name-row {
  display: flex;
  align-items: center;
  min-width: 0;
}

.receipt-info-patient-name {
  max-width: 180px;
  overflow: hidden;
  color: #1d2533;
  font-size: 16px;
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.receipt-info-gender {
  margin-left: 6px;
}

.receipt-info-gender-man {
  color: #0a5aff;
}

.receipt-info-gender-woman {
  color: #f52468;
}

.receipt-info-age {
  margin-left: 8px;
  color: #5f6a7a;
  font-size: 13px;
}

.receipt-info-meta-row {
  display: flex;
  gap: 28px;
  margin-top: 12px;
  color: #5f6a7a;
  font-size: 13px;
}

.receipt-info-total {
  min-width: 128px;
  padding: 10px 14px;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #ffffff;
  text-align: right;
}

.receipt-info-total span {
  display: block;
  color: #5f6a7a;
  font-size: 12px;
}

.receipt-info-total strong {
  display: block;
  margin-top: 3px;
  color: #f74344;
  font-size: 20px;
  font-weight: 500;
  line-height: 26px;
}

.receipt-info-recognize-card {
  padding: 14px 16px 16px;
  border-color: #d8e6ff;
  background: #f9fbfd;
}

.receipt-info-section-head,
.receipt-info-form-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.receipt-info-section-title {
  display: flex;
  align-items: center;
  color: #0a5aff;
  font-weight: 400;
}

.receipt-info-recognize-icon {
  width: 18px;
  height: 18px;
  margin-right: 6px;
}

.receipt-info-paste-input {
  margin-top: 12px;
  height: 66px !important;
  min-height: 66px !important;
  padding: 10px 12px !important;
  border: 1px dashed #d6e4fb;
  border-radius: 12px;
  background: #ffffff;
  color: #1d2533;
  font-size: 14px;
  resize: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.receipt-info-paste-input:hover,
.receipt-info-paste-input:focus {
  border-color: #0a5aff;
  background: #ffffff;
  box-shadow: 0 0 0 2px rgb(10 90 255 / 8%);
}

.receipt-info-form-card {
  padding: 16px 18px 4px;
  background: #fdfefe;
}

.receipt-info-form-title {
  color: #1d2533;
  font-size: 15px;
  font-weight: 400;
}

.receipt-info-form-subtitle {
  margin-top: 4px;
  color: #5f6a7a;
  font-size: 12px;
}

.receipt-info-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
  row-gap: 0;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #dce6f5;
}

:global(.receipt-info-modal .receipt-info-form .ant-form-item:nth-child(3)),
:global(.receipt-info-modal .receipt-info-form .ant-form-item:nth-child(4)) {
  grid-column: 1 / -1;
}

:global(.receipt-info-modal .ant-form-item) {
  margin-bottom: 12px;
}

:global(.receipt-info-modal .ant-form-item-label > label) {
  color: #5f6a7a;
  font-weight: 400;
}

:global(.receipt-info-modal .receipt-info-form .ant-input),
:global(.receipt-info-modal .ant-select-selector),
:global(.receipt-info-modal .ant-cascader .ant-select-selector) {
  height: 36px !important;
  border-color: #dce6f5 !important;
  border-radius: 8px !important;
  background: #ffffff !important;
  box-shadow: none !important;
  color: #1d2533;
  font-size: 14px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

:global(.receipt-info-modal .receipt-info-form .ant-input:hover),
:global(.receipt-info-modal .receipt-info-form .ant-input:focus),
:global(.receipt-info-modal .ant-select:hover .ant-select-selector),
:global(.receipt-info-modal .ant-select-focused .ant-select-selector) {
  border-color: #0a5aff !important;
  box-shadow: 0 0 0 2px rgb(10 90 255 / 8%) !important;
}
</style>
