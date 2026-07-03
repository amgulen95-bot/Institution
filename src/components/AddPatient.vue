<template>
  <div>
    <a-modal v-model:open="patientModal.visible"  centered width="700px" @ok="confirm" :maskClosable="false" destroyOnClose>
      <template #title>
        <a-space :size="12">
          <div>{{patientModal.form.Id==0?'新增患者信息':'编辑患者信息'}}</div>
          <a-button type="primary">读取身份证</a-button>
        </a-space>
      </template>
      <section class="padding-lr32 formModal">
        <a-form layout="vertical" :model="patientModal.form" :rules="patientModal.rules" ref="formIns">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="患者姓名" name="Name">
                <a-input v-model:value="patientModal.form.Name" placeholder="请填写"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="患者性别" name="Gender">
                <a-radio-group v-model:value="patientModal.form.Gender">
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
                <a-input-number id="inputNumber" v-model:value="patientModal.form.Age" placeholder="请填写" :min="0" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="身份证号" name="IDCard">
                <a-input v-model:value="patientModal.form.IDCard" placeholder="请填写"></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="出生日期" name="BirthDate">
                <a-date-picker v-model:value="patientModal.form.BirthDate" style="width:100%" valueFormat="YYYY-MM-DD" placeholder="请选择" :get-popup-container="(trigger) => trigger.parentElement" />
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
                <a-select v-model:value="patientModal.form.Nation" placeholder="请选择" allowClear>
                  <a-select-option :value="item.name" v-for="(item,index) in Nation" :key="index">{{item.name}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="地址" name="Address">
            <a-input v-model:value="patientModal.form.Address" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item label="备注" name="Remark">
            <a-textarea v-model:value="patientModal.form.Remark" placeholder="请简单说明一下" :rows="3" />
          </a-form-item>
        </a-form>
      </section>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { ref,onMounted,watch} from 'vue';
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
      Nation:'汉族',
      MaritalStatus:1,
      Address:'',
      Remark:'',
      Attrs:[],
    },
    rules: {
      Name: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      Phone: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      IDCard: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      Age: [{required: true,trigger: 'blur',message: '该项必须填写',type:'number'}],
      BirthDate: [{required: true,trigger: 'change',message: '该项必须选择',type:'string'}],
      Nation: [{required: true,trigger: 'change',message: '该项必须选择',type:'string'}],
      Address: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
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
  
  const confirm=()=>{
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
</style>