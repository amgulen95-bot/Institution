<template>
  <div class="p-4 print-receipt-page">
    <div class="print-receipt-layout">
      <div class="flex-sub SmallCard pos-relative print-receipt-config-card" v-loading="loading">
        <div class="print-receipt-header">
          <div>
            <div class="print-receipt-title">打印收费小票</div>
            <div class="print-receipt-subtitle">配置收费小票展示字段，右侧实时同步打印预览</div>
          </div>
          <span class="print-receipt-badge">实时预览</span>
        </div>
        <a-form class="print-receipt-form" :model="config" :labelCol="{ style: 'width: 112px' }" :wrapperCol="{span:24}">
          <section class="print-receipt-section">
            <div class="print-receipt-section-header">
              <div>
                <div class="panel-title">小票抬头</div>
                <div class="print-receipt-section-desc">设置小票顶部名称、Logo、地址电话和就诊条码。</div>
              </div>
            </div>
            <div class="print-receipt-section-body">
          <!-- 抬头名称输入 -->
          <a-form-item label="抬头名称" class="print-receipt-form-item">
            <a-space class="print-receipt-inline-control">
              <a-input v-model:value="config.headerName" placeholder="请输入抬头名称" allow-clear show-count :maxlength="12" />
              <a-button class="print-receipt-link-button" type="link" size="small" @click="showSubtitle=true">加一行</a-button>
            </a-space>
            <div class="mt12px" v-if="showSubtitle||config.headerSubtitle">
              <a-space class="print-receipt-inline-control">
                <a-input v-model:value="config.headerSubtitle" placeholder="请输入" allow-clear show-count :maxlength="12" />
                <a-button class="print-receipt-link-button" type="link" danger size="small" @click="deleteSubtitle">删除</a-button>
              </a-space>
            </div>
          </a-form-item>

          <!-- 抬头信息勾选 -->
          <a-form-item label="抬头信息" class="print-receipt-form-item">
            <a-checkbox-group class="print-receipt-option-grid" v-model:value="config.headerInfo">
              <a-checkbox value="logo">Logo</a-checkbox>
              <a-checkbox value="address">地址</a-checkbox>
              <a-checkbox value="phone">电话</a-checkbox>
              <a-checkbox value="visitCode">就诊条码</a-checkbox>
            </a-checkbox-group>
          </a-form-item>

          <!-- 患者信息勾选 -->
          <a-form-item label="患者信息" class="print-receipt-form-item">
            <a-checkbox-group class="print-receipt-option-grid is-wide" v-model:value="config.patientInfo">
              <a-checkbox value="gender">性别</a-checkbox>
              <a-checkbox value="age">年龄</a-checkbox>
              <a-checkbox value="mobile">手机</a-checkbox>
              <a-checkbox value="diagnosisNo">诊号</a-checkbox>
              <a-checkbox value="doctor">医生</a-checkbox>
              <a-checkbox value="issuer">开单人</a-checkbox>
              <a-checkbox value="idCard">证件</a-checkbox>
            </a-checkbox-group>
          </a-form-item>

          <!-- 隐私保护 -->
          <a-form-item label="隐私保护" class="print-receipt-form-item">
            <a-checkbox-group class="print-receipt-option-grid" v-model:value="config.privacy">
              <a-checkbox value="hideName">姓名</a-checkbox>
              <a-checkbox value="hideMobile">手机</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
            </div>
          </section>

          <section class="print-receipt-section">
            <div class="print-receipt-section-header">
              <div>
                <div class="panel-title">小票正文</div>
                <div class="print-receipt-section-desc">控制收费项目与收银金额信息的打印显示。</div>
              </div>
            </div>
            <div class="print-receipt-section-body">

          <!-- 收费项目 -->
          <a-form-item label="收费项目" class="print-receipt-form-item">
            <a-checkbox v-model:checked="config.showChargeItems">打印收费项目信息</a-checkbox>
          </a-form-item>

          <!-- 收银信息 -->
          <a-form-item label="收银信息" class="print-receipt-form-item">
            <a-checkbox-group class="print-receipt-option-grid" v-model:value="config.cashierInfo">
              <a-checkbox value="total">合计</a-checkbox>
              <a-checkbox value="discount">优惠</a-checkbox>
              <a-checkbox value="payable">应付</a-checkbox>
              <a-checkbox value="paid">实付</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
            </div>
          </section>
          <div class="h95px"></div>
        </a-form>
        
        <a-space class="formSubmit print-receipt-submit">
          <a-button class="print-receipt-action-button" type="primary" @click="handleSave">确定保存</a-button>
          <a-button class="print-receipt-action-button" type="primary" ghost @click="handleReset">恢复默认</a-button>
        </a-space>
      </div>
      <!-- 右侧：预览区域 -->
      <div class="preview-panel">
        <div class="preview-panel-header">
          <div>
            <div class="preview-panel-title">收费小票</div>
            <div class="preview-panel-subtitle">模拟实际打印纸张效果</div>
          </div>
          <span class="tag-preview">预览</span>
        </div>
        <!-- 引入子组件进行渲染 -->
        <div class="receipt-preview-stage">
          <ReceiptPreview :config="config" :data="mockData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref,onMounted} from 'vue';
  import ReceiptPreview from '/@/components/ReceiptPreview.vue';
  import {PrintApiCtrl} from '/@/api/myy/print';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { cloneDeep } from 'lodash-es';

  const { createMessage} = useMessage()
  const defaultConfig = {
    headerName: '蒙医云蒙医医院',
    headerSubtitle:'',
    headerInfo: ['address', 'phone'], 
    patientInfo: ['gender', 'age', 'mobile', 'diagnosisNo', 'doctor', 'issuer'], 
    privacy: ['hideMobile'], 
    showChargeItems: false,
    cashierInfo: ['total', 'discount', 'payable', 'paid'],
  };
  const showSubtitle=ref(false)
  const loading=ref(false)
  const config =ref(cloneDeep(defaultConfig))
  const mockData = {
    address: '成都市一环路西二段199号',
    phone: '028-87732526',
    visitCode:'',
    patientName: '任盈盈',
    gender: '女',
    age:22,
    mobile: '13800138000',
    doctorName: '胡青牛',
    idCard: '51010019970101xxxx',
    deptName: '内科',
    sequenceNo: '便民上午+10号',
    visitDate: '2019-12-11周三 12:00',
    totalAmount: '100.00',
    discountAmount: '0.00',
    payableAmount: '100.00',
    paidAmount: '100.00',
    payMethod: 1,
    operator: '令狐冲',
  };

  onMounted(()=>{
    getPrintConfig()
  })

  const getPrintConfig=()=>{
    loading.value=true
    PrintApiCtrl.PrintConfig({}).then(data=>{
      config.value=cloneDeep(JSON.parse(data.ReceiptTemplate))
    }).catch(() => {}).finally(() => {loading.value=false })
  }

  const deleteSubtitle=()=>{
    showSubtitle.value=false
    config.value.headerSubtitle=''
  }

  // 方法
  const handleSave = () => {
    loading.value=true
    const formData=cloneDeep(config.value)
    PrintApiCtrl.SaveTemplate({
      TemplateType:'receipt',
      TemplateJson:JSON.stringify(formData)
    }).then(data=>{
      createMessage.success('保存成功')
      getPrintConfig()
    }).catch(() => {}).finally(() => {loading.value=false })
  };

  const handleReset = () => {
    showSubtitle.value=false
    const formData=cloneDeep(defaultConfig)
    loading.value=true
    PrintApiCtrl.SaveTemplate({
      TemplateType:'receipt',
      TemplateJson:JSON.stringify(formData)
    }).then(data=>{
      createMessage.success('保存成功')
      getPrintConfig()
    }).catch(() => {}).finally(() => {loading.value=false })
  };
</script>

<style scoped>
.print-receipt-page {
  min-height: calc(100vh - 104px);
  background: #f4f7f9;
}

.print-receipt-layout {
  display: flex;
  gap: 16px;
  min-height: calc(100vh - 120px);
}

.print-receipt-config-card {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  overflow: hidden;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(62, 88, 120, 0.06);
}

.print-receipt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 16px;
  border-bottom: 1px dashed #dce6f5;
}

.print-receipt-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1d2533;
  font-size: 18px;
  font-weight: 500;
  line-height: 26px;
}

.print-receipt-title::before {
  display: inline-block;
  width: 5px;
  height: 18px;
  border-radius: 999px;
  background: #0a5aff;
  content: '';
}

.print-receipt-subtitle {
  margin-top: 6px;
  color: #858d98;
  font-size: 13px;
  line-height: 20px;
}

.print-receipt-badge,
.tag-preview {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border: 1px solid #dce6f5;
  border-radius: 999px;
  background: #f9fbfd;
  color: #07c160;
  font-size: 13px;
  font-weight: 400;
}

.print-receipt-form {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 0;
  scrollbar-gutter: stable;
}

.print-receipt-form::-webkit-scrollbar,
.preview-panel::-webkit-scrollbar {
  width: 8px;
}

.print-receipt-form::-webkit-scrollbar-thumb,
.preview-panel::-webkit-scrollbar-thumb {
  border: 2px solid #fff;
  border-radius: 999px;
  background: #d8e2f2;
}

.print-receipt-form::-webkit-scrollbar-track,
.preview-panel::-webkit-scrollbar-track {
  background: transparent;
}

.print-receipt-section {
  margin-bottom: 14px;
  overflow: hidden;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #fff;
}

.print-receipt-section-header {
  padding: 14px 18px;
  border-bottom: 1px dashed #dce6f5;
  background: #f9fbfd;
}

.panel-title {
  margin: 0;
  color: #1d2533;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
}

.print-receipt-section-desc {
  margin-top: 4px;
  color: #858d98;
  font-size: 13px;
  line-height: 20px;
}

.print-receipt-section-body {
  padding: 16px 18px 4px;
}

.print-receipt-form-item {
  margin-bottom: 16px;
}

.print-receipt-inline-control {
  display: flex;
  width: 100%;
}

.print-receipt-inline-control :deep(.ant-space-item:first-child) {
  flex: 1;
  min-width: 0;
}

.print-receipt-link-button {
  height: 34px;
  border-radius: 8px;
  font-weight: 400;
}

.print-receipt-option-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(76px, 1fr));
  gap: 8px;
  width: 100%;
}

.print-receipt-option-grid.is-wide {
  grid-template-columns: repeat(4, minmax(82px, 1fr));
}

.print-receipt-option-grid :deep(.ant-checkbox-wrapper) {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  margin-inline-start: 0;
  padding: 0 10px;
  border: 1px solid #e8eef7;
  border-radius: 8px;
  background: #fff;
  color: #1d2533;
  font-size: 14px;
  font-weight: 400;
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.print-receipt-option-grid :deep(.ant-checkbox-wrapper:hover) {
  border-color: #0a5aff;
  background: #eef5ff;
  box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08);
}

.print-receipt-form :deep(.ant-form-item-label > label) {
  color: #5f6a7a;
  font-size: 14px;
  font-weight: 400;
}

.print-receipt-form :deep(.ant-input),
.print-receipt-form :deep(.ant-input-affix-wrapper) {
  min-height: 36px;
  border-color: #dce6f5;
  border-radius: 8px;
  color: #1d2533;
  font-size: 14px;
  font-weight: 400;
  box-shadow: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.print-receipt-form :deep(.ant-input:hover),
.print-receipt-form :deep(.ant-input:focus),
.print-receipt-form :deep(.ant-input-affix-wrapper:hover),
.print-receipt-form :deep(.ant-input-affix-wrapper-focused) {
  border-color: #0a5aff !important;
  box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
}

.print-receipt-form :deep(.ant-input-affix-wrapper .ant-input),
.print-receipt-form :deep(.ant-input-affix-wrapper .ant-input:hover),
.print-receipt-form :deep(.ant-input-affix-wrapper .ant-input:focus) {
  min-height: auto;
  border: 0 !important;
  box-shadow: none !important;
}

.print-receipt-submit {
  justify-content: flex-end;
  height: 72px;
  padding: 0 20px;
  border-top: 1px dashed #dce6f5;
  border-radius: 0 0 12px 12px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
}

.print-receipt-action-button {
  min-width: 104px;
  height: 36px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
}

.preview-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 560px;
  height: calc(100vh - 120px);
  overflow-y: auto;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #f9fbfd;
  box-shadow: 0 10px 28px rgba(62, 88, 120, 0.06);
}

.preview-panel-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 16px;
  border-bottom: 1px dashed #dce6f5;
  background: rgba(249, 251, 253, 0.96);
  backdrop-filter: blur(8px);
}

.preview-panel-title {
  color: #1d2533;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
}

.preview-panel-subtitle {
  margin-top: 4px;
  color: #858d98;
  font-size: 13px;
  line-height: 20px;
}

.receipt-preview-stage {
  display: flex;
  justify-content: center;
  min-height: 100%;
  padding: 28px 24px 42px;
}

.receipt-preview-stage :deep(.receipt-paper) {
  position: relative;
  overflow: hidden;
  border: 1px solid #edf1f7;
  border-radius: 6px;
  box-shadow: 0 16px 38px rgba(62, 88, 120, 0.14);
}

.receipt-preview-stage :deep(.receipt-paper)::before {
  content: "预览";
  position: absolute;
  top: 12px;
  right: -34px;
  z-index: 4;
  width: 108px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #07c160;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  background: linear-gradient(90deg, #f0fff7 0%, #dcf8e8 100%);
  border-top: 1px solid rgba(7, 193, 96, 0.16);
  border-bottom: 1px solid rgba(7, 193, 96, 0.16);
  box-shadow: 0 6px 16px rgba(7, 193, 96, 0.14);
  transform: rotate(45deg);
  pointer-events: none;
}

@media (max-width: 1280px) {
  .print-receipt-layout {
    gap: 12px;
  }

  .preview-panel {
    width: 460px;
  }

  .print-receipt-option-grid,
  .print-receipt-option-grid.is-wide {
    grid-template-columns: repeat(3, minmax(76px, 1fr));
  }
}
</style>
