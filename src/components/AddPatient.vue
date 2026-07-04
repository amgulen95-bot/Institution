<template>
  <div>
    <a-modal v-model:open="patientModal.visible"  centered width="700px" wrapClassName="patient-archive-modal" @ok="confirm" :maskClosable="false" destroyOnClose>
      <template #title>
        <a-space class="patient-modal-title" :size="12">
          <div>{{patientModal.form.Id==0?'新增患者信息':'编辑患者信息'}}</div>
          <a-button class="read-id-card-btn" type="primary">
            <img class="read-id-card-icon" src="../assets/images/idCard.png" alt="">
            <span>读取身份证</span>
          </a-button>
        </a-space>
      </template>
      <section class="patient-archive-body padding-lr32 formModal">
        <a-form layout="vertical" :model="patientModal.form" :rules="patientModal.rules" ref="formIns" :validateTrigger="[]">
          <div class="patient-form-section">
            <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="患者姓名" name="Name">
                <a-input v-model:value="patientModal.form.Name" placeholder="请填写"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="患者性别" name="Gender">
                <a-radio-group v-model:value="patientModal.form.Gender" :disabled="isIdCardInfoLocked">
                  <a-radio :value="1">男</a-radio>
                  <a-radio :value="2">女</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="手机号码" name="Phone">
                <a-input v-model:value="patientModal.form.Phone" placeholder="请填写"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="年龄" name="Age">
                <a-input-number id="inputNumber" v-model:value="patientModal.form.Age" placeholder="请填写" :min="0" :max="105" :disabled="isIdCardInfoLocked" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="身份证号" name="IDCard">
                <a-input v-model:value="patientModal.form.IDCard" placeholder="请填写" :maxlength="18" @input="handleIdCardInput"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="出生日期" name="BirthDate">
                <a-date-picker v-model:value="patientModal.form.BirthDate" style="width:100%" valueFormat="YYYY-MM-DD" placeholder="请选择" :disabled="isIdCardInfoLocked" :get-popup-container="(trigger) => trigger.parentElement" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="患者关系" name="RelationType">
                <a-radio-group v-model:value="patientModal.form.RelationType">
                  <a-radio :value="0">本人</a-radio>
                  <a-radio :value="1">家庭成员</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="婚姻状况" name="MaritalStatus">
                <a-radio-group v-model:value="patientModal.form.MaritalStatus">
                  <a-radio :value="0">已婚</a-radio>
                  <a-radio :value="1">未婚</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="民族" name="Nation">
                <a-select v-model:value="patientModal.form.Nation" placeholder="请选择" allowClear dropdownClassName="patient-nation-select-popup" :listHeight="220" :virtual="false">
                  <a-select-option :value="item.name" v-for="(item,index) in Nation" :key="index">{{item.name}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            </a-row>
          </div>
          <div class="patient-form-section patient-form-section-last">
            <a-form-item label="地址" name="Address">
              <a-input v-model:value="patientModal.form.Address" placeholder="请填写"></a-input>
            </a-form-item>
            <a-form-item label="备注" name="Remark">
              <a-textarea v-model:value="patientModal.form.Remark" placeholder="请简单说明一下" :rows="3" />
            </a-form-item>
          </div>
        </a-form>
      </section>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { nextTick, ref,onMounted,watch} from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {PatientApiCtrl} from '/@/api/myy/patient';
  import {basicEnum} from '/@/api/platform/common';

  const { createMessage } = useMessage()
  const props = defineProps({
    patientId:{ type: Number, default:0 },
    visible: { type: Boolean, default: false },
  });
  const emit = defineEmits(['update:visible', 'confirm'])
  const formIns=ref()
  const Nation=ref([])
  const isIdCardInfoLocked=ref(false)
  const patientModal=ref({
    loading:false,
    visible:false,
    form:{
      Id:0,
      Name:'',
      Phone:'',
      IDCard:'',
      Gender:1,
      Age:null,
      RelationType:0,
      BirthDate:'',
      Nation:'',
      MaritalStatus:1,
      Address:'',
      Remark:'',
      Attrs:[],
    },
    rules: {
      Name: [{required: true,message: '该项必须填写',type:'string'}],
      Gender: [{required: true,message: '该项必须填写',type:'number'}],
      Age: [{required: true,validator: validateAge}],
      Phone: [{required: true,message: '该项必须填写',type:'string'}],
      IDCard: [{validator: validateIdCard}],
    }
  })
  
  watch(() => props.visible, (newVal) => {
    if (newVal) {
      patientModal.value.visible = true
    }
  })
  watch(() => patientModal.value.visible, (newVal) => {
    if (!newVal) {
      emit('update:visible', false)
      isIdCardInfoLocked.value = false
      formIns.value?.resetFields()
    }
  })

  onMounted(()=>{
    getBasicEnum()
  })

  // 获取枚举
  const getBasicEnum=()=>{
    basicEnum({name:'Nation'}).then(data=>{
      Nation.value=data
    })
  }

  const getAgeFromBirthDate = (birthDate) => {
    const birth = new Date(birthDate)
    if (Number.isNaN(birth.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1
    }
    return age >= 0 ? age : null
  }

  function validateAge(_rule, value) {
    if (value === null || value === undefined || value === '') {
      return Promise.reject('该项必须填写')
    }
    const numberValue = Number(value)
    if (Number.isNaN(numberValue) || numberValue < 0 || numberValue > 105) {
      return Promise.reject('请填写0-105之间的年龄')
    }
    if (numberValue < 3 && !/^\d+(\.\d)?$/.test(String(value))) {
      return Promise.reject('3岁以下最多保留一位小数')
    }
    if (numberValue >= 3 && !Number.isInteger(numberValue)) {
      return Promise.reject('3岁及以上请填写整数')
    }
    return Promise.resolve()
  }

  const isValidIdCard = (idCard) => {
    const value = String(idCard || '').trim().toUpperCase()
    if (!/^\d{17}[\dX]$/.test(value)) return false
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const codes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
    const sum = weights.reduce((total, weight, index) => total + Number(value[index]) * weight, 0)
    return codes[sum % 11] === value[17]
  }

  function validateIdCard(_rule, value) {
    if (!value) return Promise.resolve()
    if (!isValidIdCard(value) || !parseIdCardInfo(value)) {
      return Promise.reject('请填写正确的18位身份证号')
    }
    return Promise.resolve()
  }

  const normalizeIdCard = (idCard) => {
    const value = String(idCard || '').toUpperCase().replace(/[^0-9X]/g, '').slice(0, 18)
    const firstSeventeen = value.slice(0, 17).replace(/\D/g, '')
    const last = value.length > 17 ? value.slice(17, 18).replace(/[^0-9X]/g, '') : ''
    return `${firstSeventeen}${last}`.slice(0, 18)
  }

  const parseIdCardInfo = (idCard) => {
    const value = String(idCard || '').trim()
    if (!isValidIdCard(value)) return null
    const match = value.match(/^\d{6}(\d{4})(\d{2})(\d{2})\d{3}[\dXx]$/)
    if (!match) return null
    const year = match[1]
    const month = match[2]
    const day = match[3]
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    if (date.getFullYear() !== Number(year) || date.getMonth() + 1 !== Number(month) || date.getDate() !== Number(day)) {
      return null
    }
    const birthDate = `${year}-${month}-${day}`
    const genderCode = value.slice(16, 17)
    return {
      birthDate,
      age: getAgeFromBirthDate(birthDate),
      gender: Number(genderCode) % 2 === 1 ? 1 : 2,
    }
  }

  const handleIdCardInput = () => {
    patientModal.value.form.IDCard = normalizeIdCard(patientModal.value.form.IDCard)
    if (patientModal.value.form.IDCard.length !== 18) {
      isIdCardInfoLocked.value = false
      patientModal.value.form.BirthDate = ''
      nextTick(() => {
        formIns.value?.clearValidate?.(['IDCard'])
      })
      return
    }
    syncBirthDateFromIdCard()
    nextTick(() => {
      formIns.value?.validateFields?.(['IDCard']).catch(() => {})
    })
  }

  const syncBirthDateFromIdCard = () => {
    if (!patientModal.value.form.IDCard) {
      isIdCardInfoLocked.value = false
      patientModal.value.form.BirthDate = ''
      return
    }
    const idCardInfo = parseIdCardInfo(patientModal.value.form.IDCard)
    if (idCardInfo) {
      isIdCardInfoLocked.value = true
      patientModal.value.form.BirthDate = idCardInfo.birthDate
      patientModal.value.form.Gender = idCardInfo.gender
      if (idCardInfo.age !== null) {
        patientModal.value.form.Age = idCardInfo.age
      }
    } else {
      isIdCardInfoLocked.value = false
    }
  }
  
  const confirm=()=>{
    syncBirthDateFromIdCard()
    formIns.value.validate().then(() => {
      patientModal.value.loading = true
      const formData = cloneDeep(patientModal.value.form)
      PatientApiCtrl.SavePatient(formData).then(data=>{
        createMessage.success('保存成功')
        patientModal.value.visible = false
        emit('update:visible',false);
        emit('confirm',data.Id)
      }).catch(() => {}).finally(() => { patientModal.value.loading = false })
    })
  }
</script>
<style lang="less" scoped>
:global(.patient-archive-modal .ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 14px 36px rgb(32 56 85 / 14%);
}

:global(.patient-archive-modal .ant-modal-header) {
  padding: 18px 24px 8px;
  border-bottom: 1px dashed #e6ecf3;
  background: #fff;
}

:global(.patient-archive-modal .ant-modal-title) {
  color: #263241;
  font-size: 16px;
  font-weight: 600;
}

:global(.patient-archive-modal .ant-modal-body) {
  padding: 16px 0 4px;
  background: #fff;
}

:global(.patient-archive-modal .ant-modal-close) {
  top: 8px !important;
  right: 8px !important;
  width: 36px !important;
  height: 36px !important;
  line-height: 36px !important;
}

:global(.patient-archive-modal .ant-modal-close .ant-modal-close-x),
:global(.patient-archive-modal .ant-modal-close-x) {
  width: 36px !important;
  height: 36px !important;
  line-height: 36px !important;
}

:global(.patient-archive-modal .ant-modal-footer) {
  padding: 14px 24px 18px;
  border-top: 1px dashed #e6ecf3;
  background: #fff;
}

:global(.patient-archive-modal .ant-modal-footer .ant-btn) {
  min-width: 84px;
  height: 34px;
  border-radius: 8px;
}

.patient-modal-title {
  width: 100%;
  align-items: center;
}

.read-id-card-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgb(10 90 255 / 14%);
}

.read-id-card-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
  object-fit: contain;
  vertical-align: middle;
}

.patient-archive-body {
  padding-top: 0;
  padding-bottom: 4px;
}

.patient-form-section {
  padding: 12px 0 6px;
  border-bottom: 1px dashed #e6ecf3;
}

.patient-form-section-last {
  padding-top: 10px;
  border-bottom: 0;
}

.patient-archive-body :deep(.ant-form-item) {
  margin-bottom: 8px;
}

.patient-archive-body :deep(.ant-form-item-control) {
  position: relative;
  padding-bottom: 14px;
}

.patient-archive-body :deep(.ant-form-item-explain) {
  position: absolute;
  bottom: 2px;
  left: 0;
  min-height: 14px;
  font-size: 12px;
  line-height: 14px;
}

.patient-archive-body :deep(.ant-form-item-with-help) {
  margin-bottom: 8px;
}

.patient-archive-body :deep(.ant-form-item-label > label) {
  color: #5f6a7a;
  font-weight: 400;
}

.patient-archive-body :deep(.ant-input),
.patient-archive-body :deep(.ant-input-number),
.patient-archive-body :deep(.ant-picker),
.patient-archive-body :deep(.ant-select-selector),
.patient-archive-body :deep(.ant-input-affix-wrapper) {
  border-radius: 8px !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.patient-archive-body :deep(.ant-input:hover),
.patient-archive-body :deep(.ant-input:focus),
.patient-archive-body :deep(.ant-input-number:hover),
.patient-archive-body :deep(.ant-input-number-focused),
.patient-archive-body :deep(.ant-picker:hover),
.patient-archive-body :deep(.ant-picker-focused),
.patient-archive-body :deep(.ant-select:hover .ant-select-selector),
.patient-archive-body :deep(.ant-select-focused .ant-select-selector) {
  border-color: @primary-color !important;
  box-shadow: 0 0 0 2px fade(@primary-color, 20%) !important;
}

.patient-archive-body :deep(.ant-input-number) {
  width: 100%;
}

.patient-archive-body :deep(.ant-radio-wrapper) {
  color: #263241;
}

:global(.patient-nation-select-popup) {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 28px rgb(32 56 85 / 14%);
}

:global(.patient-nation-select-popup .rc-virtual-list-holder) {
  overflow-y: auto !important;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #cbd6e2 transparent;
}

:global(.patient-nation-select-popup .rc-virtual-list-holder::-webkit-scrollbar) {
  width: 6px;
}

:global(.patient-nation-select-popup .rc-virtual-list-holder::-webkit-scrollbar-thumb) {
  border-radius: 999px;
  background: #cbd6e2;
}

:global(.patient-nation-select-popup .ant-select-item) {
  min-height: 34px;
  padding: 7px 12px;
  color: #263241;
  transition: background-color 0.14s ease;
}

:global(.patient-nation-select-popup .ant-select-item-option-active:not(.ant-select-item-option-disabled)) {
  background-color: #eef5ff;
}

:global(.patient-nation-select-popup .ant-select-item-option-selected:not(.ant-select-item-option-disabled)) {
  background-color: #f9fbfd;
  color: @primary-color;
  font-weight: 500;
}
</style>
