<template>
  <div class="p-4">
    <div class="flex">
      <div class="flex-sub SmallCard pos-relative" style="height: calc(100vh - 120px);" v-loading="loading">
        <a-form class="h100% overflow-y-scroll" :model="config" :labelCol="{ style: 'width: 140px' }" :wrapperCol="{span:16}">
          <h2 class="panel-title">小票抬头</h2>
          <!-- 抬头名称输入 -->
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

          <!-- 抬头信息勾选 -->
          <a-form-item label="抬头信息">
            <a-checkbox-group v-model:value="config.headerInfo">
              <a-checkbox value="logo">Logo</a-checkbox>
              <a-checkbox value="address">地址</a-checkbox>
              <a-checkbox value="phone">电话</a-checkbox>
              <a-checkbox value="visitCode">就诊条码</a-checkbox>
            </a-checkbox-group>
          </a-form-item>

          <!-- 患者信息勾选 -->
          <a-form-item label="患者信息" >
            <a-checkbox-group v-model:value="config.patientInfo">
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
          <a-form-item label="隐私保护">
            <a-checkbox-group v-model:value="config.privacy">
              <a-checkbox value="hideName">姓名</a-checkbox>
              <a-checkbox value="hideMobile">手机</a-checkbox>
            </a-checkbox-group>
          </a-form-item>

          <a-divider />

          <h2 class="panel-title">小票正文</h2>

          <!-- 收费项目 -->
          <a-form-item label="收费项目">
            <a-checkbox v-model:checked="config.showChargeItems">打印收费项目信息</a-checkbox>
          </a-form-item>

          <a-divider />

          <!-- 收银信息 -->
          <a-form-item label="收银信息">
            <a-checkbox-group v-model:value="config.cashierInfo">
              <a-checkbox value="total">合计</a-checkbox>
              <a-checkbox value="discount">优惠</a-checkbox>
              <a-checkbox value="payable">应付</a-checkbox>
              <a-checkbox value="paid">实付</a-checkbox>
            </a-checkbox-group>
          </a-form-item>
        </a-form>
        
        <a-space class="formSubmit">
          <a-button type="primary" @click="handleSave">确定保存</a-button>
          <a-button type="primary" ghost @click="handleReset">恢复默认</a-button>
        </a-space>
      </div>
      <!-- 右侧：预览区域 -->
      <div class="preview-panel">
        <span class="tag-preview">预览</span>
        <span class="text-16px mb24px">收费小票</span>
        <!-- 引入子组件进行渲染 -->
        <ReceiptPreview :config="config" :data="mockData" />
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
.panel-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
}

.preview-panel {
  width: 560px;
  background: #FAFBFD;
  padding-top: 48px;
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