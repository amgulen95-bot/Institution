<template>
  <div class="p-4 print-medical-page">
    <div class="print-medical-layout">
      <div class="flex-sub SmallCard pos-relative print-medical-config-card" v-loading="loading">
        <div class="print-medical-header">
          <div>
            <div class="print-medical-title">打印电子病历</div>
            <div class="print-medical-subtitle">配置电子病历打印字段，右侧实时同步文档预览</div>
          </div>
          <span class="print-medical-badge">实时预览</span>
        </div>
        <a-form :model="config" class="print-medical-form" :labelCol="{ style: 'width: 112px' }" :wrapperCol="{span:24}">
          <section class="print-medical-section">
            <div class="print-medical-section-header">
              <div>
                <div class="panel-title">病历前记</div>
                <div class="print-medical-section-desc">设置病历抬头、患者基础信息和日期展示方式。</div>
              </div>
            </div>
            <div class="print-medical-section-body">
          <a-form-item label="抬头名称" class="print-medical-form-item">
            <a-space class="print-medical-inline-control">
              <a-input v-model:value="config.headerName" placeholder="请输入抬头名称" allow-clear show-count :maxlength="12" />
              <a-button class="print-medical-link-button" type="link" size="small" @click="showSubtitle=true">加一行</a-button>
            </a-space>
            <div class="mt12px" v-if="showSubtitle||config.headerSubtitle">
              <a-space class="print-medical-inline-control">
                <a-input v-model:value="config.headerSubtitle" placeholder="请输入" allow-clear show-count :maxlength="12" />
                <a-button class="print-medical-link-button" type="link" danger size="small" @click="deleteSubtitle">删除</a-button>
              </a-space>
            </div>
          </a-form-item>
          <a-form-item label="抬头信息" class="print-medical-form-item">
            <a-checkbox-group class="print-medical-option-grid" v-model:value="config.headerInfo">
              <a-checkbox value="logo">Logo</a-checkbox>
              <a-checkbox value="barcode">就诊条码</a-checkbox>
              <a-checkbox value="docTitle">文书名称</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item label="患者信息" class="print-medical-form-item">
            <a-checkbox-group class="print-medical-option-grid is-wide" v-model:value="config.checkStates">
              <a-checkbox value="showVisitNo">初复诊</a-checkbox>
              <a-checkbox value="showIdCard">证件</a-checkbox>
              <a-checkbox value="showBirth">出生日期</a-checkbox>
              <a-checkbox value="showNation">民族</a-checkbox>
              <a-checkbox value="showAddress">住址</a-checkbox>
              <a-checkbox value="showMobile">手机号</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item label="就诊日期" class="print-medical-form-item">
            <a-radio-group class="print-medical-radio-grid" v-model:value="config.dateFormat">
              <a-radio value="date">仅展示年月日</a-radio>
              <a-radio value="datetime">展示年月日时分秒</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="信息脱敏" class="print-medical-form-item">
            <a-checkbox-group class="print-medical-option-grid" v-model:value="config.privacy">
              <a-checkbox value="hideMobile">手机号</a-checkbox>
              <a-checkbox value="hideIdCard">证件</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
            </div>
          </section>

          <section class="print-medical-section">
            <div class="print-medical-section-header">
              <div>
                <div class="panel-title">病历正文</div>
                <div class="print-medical-section-desc">控制治疗药品、药品列信息和药事医嘱的展示。</div>
              </div>
            </div>
            <div class="print-medical-section-body">
          <a-form-item label="收费项目" class="print-medical-form-item">
            <a-checkbox v-model:checked="config.bodyConfig.showChargeItems">治疗、药品等项目</a-checkbox>
          </a-form-item>
          <a-form-item label="中西成药" class="print-medical-form-item">
            <a-checkbox-group class="print-medical-option-grid" v-model:value="config.bodyConfig.drugColumns">
              <a-checkbox value="name">商品名</a-checkbox>
              <a-checkbox value="spec">规格</a-checkbox>
              <a-checkbox value="days">天数</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item label="药事医嘱" class="print-medical-form-item">
            <a-checkbox v-model:checked="config.bodyConfig.showAdvice">医嘱</a-checkbox>
          </a-form-item>
            </div>
          </section>

          <section class="print-medical-section">
            <div class="print-medical-section-header">
              <div>
                <div class="panel-title">病历后记</div>
                <div class="print-medical-section-desc">设置页尾签字行、金额、打印时间和备注说明。</div>
              </div>
            </div>
            <div class="print-medical-section-body">
          <a-form-item label="页尾签字行" class="print-medical-form-item">
            <a-checkbox-group class="print-medical-option-grid" v-model:value="config.footerInfo">
              <a-checkbox value="amount">金额</a-checkbox>
              <a-checkbox value="printTime">打印时间</a-checkbox>
              <a-checkbox value="phone">电话</a-checkbox>
              <a-checkbox value="address">地址</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item label="页尾备注" class="print-medical-form-item">
            <a-textarea class="print-medical-textarea" v-model:value="config.footerNote" :rows="3" show-count :maxlength="200" placeholder="请输入页尾备注信息..." />
          </a-form-item>
            </div>
          </section>
          <div class="h95px"></div>
        </a-form>
        <a-space class="formSubmit print-medical-submit">
          <a-button class="print-medical-action-button" type="primary" @click="handleSave">确定保存</a-button>
          <a-button class="print-medical-action-button" type="primary" ghost @click="handleReset">恢复默认</a-button>
        </a-space>
      </div>

      <!-- 右侧预览区域 -->
      <div class="preview-panel">
        <div class="preview-panel-header">
          <div>
            <div class="preview-panel-title">电子病历</div>
            <div class="preview-panel-subtitle">模拟实际病历打印文档效果</div>
          </div>
          <span class="tag-preview">预览</span>
        </div>
        <div class="medical-preview-stage">
          <MedicalPreview :config="config" :data="mockData" :staticBarcode="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import MedicalPreview from '/@/components/MedicalPreview.vue';
import { PrintApiCtrl } from '/@/api/myy/print';
import { useMessage } from '/@/hooks/web/useMessage';
import { cloneDeep } from 'lodash-es';

const { createMessage } = useMessage()
const loading = ref(false);

const defaultConfig = {
  headerName: '蒙医云蒙医医院',
  headerSubtitle:'',
  headerInfo: ['logo', 'docTitle'],
  checkStates:['showMobile'],
  privacy: ['hideMobile'],
  dateFormat: 'date',
  footerInfo: ['amount', 'printTime'],
  footerNote: '除主诊医师特别注明外，处方仅当日有效。按卫生部规定，药房药品一经发出，不得退换。',
  bodyConfig: {
    showChargeItems: true,
    drugColumns: ['name', 'spec', 'days'],
    showAdvice: true,
  }
};

const config = ref(cloneDeep(defaultConfig));
const showSubtitle=ref(false)
const mockData = {
  patientName: '任盈盈',
  gender: '女',
  age: 22,
  sequenceNo:'1841841564864',
  deptName: '内科',
  doctorName: '胡青牛',
  birthDate:'1998-12-10',
  idCard:'500361199602102320',
  nation:'汉族',
  address:'重庆市南岸区南城大道128号',
  visitDate: '2026-06-10',
  mobile: '184****7385',
  diagnosis:'感冒',
  pastHistory:'无',
  presentIllness:'无',
  chiefComplaint:'咳嗽,发热,头痛',
  prescriptions: [
    {
      materials: [
        { name: '桔梗', weight: '6g' },
        { name: '黄芩', weight: '6g' },
        { name: '知母', weight: '6g' },
        { name: '赤芍', weight: '6g' },
        { name: '玄参', weight: '6g' },
        { name: '连翘', weight: '6g' },
      ],
      usage: '2剂；煎服；1日1剂日3次每次150ml，饭后1小时服用',
    },
  ],
  usage: '共2剂。煎服。1日1剂日3次每次150ml，饭后1小时服用',
  advice: '1.多喝水，保持身体充足水分\n2.饮食规律宜清淡，忌烟酒，忌辛辣寒凉',
  totalAmount: 285.09,
  doctorPhone:'13888883007',
  doctorAddress:'重庆市大渡口区南城大道128号测试诊所'
};

onMounted(() => {
  getPrintConfig()
})

const getPrintConfig = () => {
  loading.value = true
  PrintApiCtrl.PrintConfig({}).then(data => {
    config.value = cloneDeep(JSON.parse(data.MedicalRecordTemplate))
  }).catch(() => {}).finally(() => { loading.value = false })
}

const handleSave = () => {
  loading.value = true
  const formData = cloneDeep(config.value)
  PrintApiCtrl.SaveTemplate({
    TemplateType: 'medicalRecord',
    TemplateJson: JSON.stringify(formData)
  }).then(data => {
    createMessage.success('保存成功')
    getPrintConfig()
  }).catch(() => {}).finally(() => { loading.value = false })
};

const deleteSubtitle=()=>{
  showSubtitle.value=false
  config.value.headerSubtitle=''
}

const handleReset = () => {
  showSubtitle.value=false
  loading.value = true
  const formData = cloneDeep(defaultConfig)
  PrintApiCtrl.SaveTemplate({
    TemplateType: 'medicalRecord',
    TemplateJson: JSON.stringify(formData)
  }).then(data => {
    createMessage.success('保存成功')
    getPrintConfig()
  }).catch(() => {}).finally(() => { loading.value = false })
};
</script>

<style scoped>
.print-medical-page {
  min-height: calc(100vh - 104px);
  background: #f4f7f9;
}

.print-medical-layout {
  display: flex;
  gap: 16px;
  min-height: calc(100vh - 120px);
}

.print-medical-config-card {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  overflow: hidden;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(62, 88, 120, 0.06);
}

.print-medical-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 16px;
  border-bottom: 1px dashed #dce6f5;
}

.print-medical-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1d2533;
  font-size: 18px;
  font-weight: 500;
  line-height: 26px;
}

.print-medical-title::before {
  display: inline-block;
  width: 5px;
  height: 18px;
  border-radius: 999px;
  background: #0a5aff;
  content: '';
}

.print-medical-subtitle {
  margin-top: 6px;
  color: #858d98;
  font-size: 13px;
  line-height: 20px;
}

.print-medical-badge,
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

.print-medical-form {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 0;
  scrollbar-gutter: stable;
}

.print-medical-form::-webkit-scrollbar,
.preview-panel::-webkit-scrollbar {
  width: 8px;
}

.print-medical-form::-webkit-scrollbar-thumb,
.preview-panel::-webkit-scrollbar-thumb {
  border: 2px solid #fff;
  border-radius: 999px;
  background: #d8e2f2;
}

.print-medical-form::-webkit-scrollbar-track,
.preview-panel::-webkit-scrollbar-track {
  background: transparent;
}

.print-medical-section {
  margin-bottom: 14px;
  overflow: hidden;
  border: 1px solid #e8eef7;
  border-radius: 12px;
  background: #fff;
}

.print-medical-section-header {
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

.print-medical-section-desc {
  margin-top: 4px;
  color: #858d98;
  font-size: 13px;
  line-height: 20px;
}

.print-medical-section-body {
  padding: 16px 18px 4px;
}

.print-medical-form-item {
  margin-bottom: 16px;
}

.print-medical-inline-control {
  display: flex;
  width: 100%;
}

.print-medical-inline-control :deep(.ant-space-item:first-child) {
  flex: 1;
  min-width: 0;
}

.print-medical-link-button {
  height: 34px;
  border-radius: 8px;
  font-weight: 400;
}

.print-medical-option-grid,
.print-medical-radio-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(88px, 1fr));
  gap: 8px;
  width: 100%;
}

.print-medical-option-grid.is-wide {
  grid-template-columns: repeat(3, minmax(96px, 1fr));
}

.print-medical-option-grid :deep(.ant-checkbox-wrapper),
.print-medical-radio-grid :deep(.ant-radio-wrapper) {
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

.print-medical-option-grid :deep(.ant-checkbox-wrapper:hover),
.print-medical-radio-grid :deep(.ant-radio-wrapper:hover) {
  border-color: #0a5aff;
  background: #eef5ff;
  box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08);
}

.print-medical-form :deep(.ant-form-item-label > label) {
  color: #5f6a7a;
  font-size: 14px;
  font-weight: 400;
}

.print-medical-form :deep(.ant-input),
.print-medical-form :deep(.ant-input-affix-wrapper),
.print-medical-form :deep(textarea.ant-input) {
  min-height: 36px;
  border-color: #dce6f5;
  border-radius: 8px;
  color: #1d2533;
  font-size: 14px;
  font-weight: 400;
  box-shadow: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.print-medical-form :deep(.ant-input:hover),
.print-medical-form :deep(.ant-input:focus),
.print-medical-form :deep(.ant-input-affix-wrapper:hover),
.print-medical-form :deep(.ant-input-affix-wrapper-focused),
.print-medical-form :deep(textarea.ant-input:hover),
.print-medical-form :deep(textarea.ant-input:focus) {
  border-color: #0a5aff !important;
  box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08) !important;
}

.print-medical-form :deep(.ant-input-affix-wrapper .ant-input),
.print-medical-form :deep(.ant-input-affix-wrapper .ant-input:hover),
.print-medical-form :deep(.ant-input-affix-wrapper .ant-input:focus) {
  min-height: auto;
  border: 0 !important;
  box-shadow: none !important;
}

.print-medical-textarea {
  resize: vertical;
}

.print-medical-submit {
  justify-content: flex-end;
  height: 72px;
  padding: 0 20px;
  border-top: 1px dashed #dce6f5;
  border-radius: 0 0 12px 12px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
}

.print-medical-action-button {
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
  width: 840px;
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

.medical-preview-stage {
  display: flex;
  justify-content: center;
  min-height: 100%;
  padding: 28px 24px 42px;
}

.medical-preview-stage :deep(.medical-paper) {
  position: relative;
  overflow: hidden;
  border: 1px solid #edf1f7;
  border-radius: 6px;
  box-shadow: 0 16px 38px rgba(62, 88, 120, 0.14);
}

.medical-preview-stage :deep(.medical-paper)::before {
  content: "预览";
  position: absolute;
  top: 18px;
  right: -38px;
  z-index: 4;
  width: 124px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #07c160;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
  background: linear-gradient(90deg, #f0fff7 0%, #dcf8e8 100%);
  border-top: 1px solid rgba(7, 193, 96, 0.16);
  border-bottom: 1px solid rgba(7, 193, 96, 0.16);
  box-shadow: 0 8px 20px rgba(7, 193, 96, 0.14);
  transform: rotate(45deg);
  pointer-events: none;
}

@media (max-width: 1440px) {
  .preview-panel {
    width: 720px;
  }

  .print-medical-option-grid,
  .print-medical-option-grid.is-wide,
  .print-medical-radio-grid {
    grid-template-columns: repeat(2, minmax(96px, 1fr));
  }
}
</style>
