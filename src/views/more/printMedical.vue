<template>
  <div class="p-4">
    <div class="flex">
      <div class="flex-sub SmallCard pos-relative" style="height: calc(100vh - 120px);" v-loading="loading">
        <a-form :model="config" class="h100% overflow-y-scroll">
          <h2 class="panel-title">病历前记</h2>
          <a-form-item label="抬头名称">
            <a-space>
              <a-input v-model:value="config.headerName" placeholder="请输入抬头名称" allow-clear show-count :maxlength="12" />
              <a-button type="link" size="small" @click="showSubtitle=true">加一行</a-button>
            </a-space>
            <div class="mt12px" v-if="showSubtitle||config.headerSubtitle">
              <a-space>
                <a-input v-model:value="config.headerSubtitle" placeholder="请输入" allow-clear show-count :maxlength="12" />
                <a-button type="link" danger size="small" @click="deleteSubtitle">删除</a-button>
              </a-space>
            </div>
          </a-form-item>
          <a-form-item label="抬头信息">
            <a-checkbox-group v-model:value="config.headerInfo">
              <a-checkbox value="logo">Logo</a-checkbox>
              <a-checkbox value="barcode">就诊条码</a-checkbox>
              <a-checkbox value="docTitle">文书名称</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item label="患者信息">
            <a-checkbox-group v-model:value="config.checkStates">
              <a-checkbox value="showVisitNo">初复诊</a-checkbox>
              <a-checkbox value="showIdCard">证件</a-checkbox>
              <a-checkbox value="showBirth">出生日期</a-checkbox>
              <a-checkbox value="showNation">民族</a-checkbox>
              <a-checkbox value="showAddress">住址</a-checkbox>
              <a-checkbox value="showMobile">手机号</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item label="就诊日期">
            <a-radio-group v-model:value="config.dateFormat">
              <a-radio value="date">仅展示年月日</a-radio>
              <a-radio value="datetime">展示年月日时分秒</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="信息脱敏">
            <a-checkbox-group v-model:value="config.privacy">
              <a-checkbox value="hideMobile">手机号</a-checkbox>
              <a-checkbox value="hideIdCard">证件</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-divider />
          <h2 class="panel-title">病历正文</h2>
          <a-form-item label="收费项目">
            <a-checkbox v-model:checked="config.bodyConfig.showChargeItems">治疗、药品等项目</a-checkbox>
          </a-form-item>
          <a-form-item label="中西成药">
            <a-checkbox-group v-model:value="config.bodyConfig.drugColumns">
              <a-checkbox value="name">商品名</a-checkbox>
              <a-checkbox value="spec">规格</a-checkbox>
              <a-checkbox value="days">天数</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item label="药事医嘱">
            <a-checkbox v-model:checked="config.bodyConfig.showAdvice">医嘱</a-checkbox>
          </a-form-item>
          <a-divider />
          <h2 class="panel-title">病历后记</h2>
          <a-form-item label="页尾签字行">
            <a-checkbox-group v-model:value="config.footerInfo">
              <a-checkbox value="amount">金额</a-checkbox>
              <a-checkbox value="printTime">打印时间</a-checkbox>
              <a-checkbox value="phone">电话</a-checkbox>
              <a-checkbox value="address">地址</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
          <a-form-item label="页尾备注">
            <a-textarea v-model:value="config.footerNote" :rows="3" show-count :maxlength="200" placeholder="请输入页尾备注信息..." />
          </a-form-item>
          <div class="h95px"></div>
        </a-form>
        <a-space class="formSubmit">
          <a-button type="primary" @click="handleSave">确定保存</a-button>
          <a-button type="primary" ghost @click="handleReset">恢复默认</a-button>
        </a-space>
      </div>

      <!-- 右侧预览区域 -->
      <div class="preview-panel">
        <span class="tag-preview">预览</span>
        <span class="text-16px mb24px">电子病历</span>
        <MedicalPreview :config="config" :data="mockData" :staticBarcode="true" />
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
.panel-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
}
.preview-panel {
  width: 840px;
  background: #FAFBFD;
  padding-top: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}
.tag-preview {
  position: absolute;
  left: -8px;
  top: 20px;
  background: #47C87A;
  color: #fff;
  padding: 2px 8px;
  font-size: 12px;
  transform: rotate(-45deg);
  transform-origin: 0 0;
}
</style>
