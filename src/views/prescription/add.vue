<template>
  <div class="p-4 page-height addTemplate">
    <a-card class="h100%" :title="templateId?'编辑处方模板':'新建处方模板'" v-loading="templateModal.loading">
      <template #extra>
        <a-space>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="saveTemplate">保存模板</a-button>
        </a-space>
      </template>
      <a-form :model="templateModal.form" :labelCol="{ style: 'width: 140px' }" :wrapperCol="{span:16}" :rules="templateModal.rules" ref="formIns">
        <a-form-item label="模板分类" name="CategoryId">
          <a-select v-model:value="templateModal.form.CategoryId" placeholder="请选择" allowClear showSearch optionFilterProp="title">
            <a-select-option :value="item.Id" v-for="(item,index) in categoryList" :key="index" :title="item.Name">{{item.Name}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="模板名称" name="Name">
          <a-input v-model:value="templateModal.form.Name" placeholder="请填写"></a-input>
        </a-form-item>
        <a-form-item label="来源" name="Source">
          <a-input v-model:value="templateModal.form.Source" placeholder="请填写"></a-input>
        </a-form-item>
        <a-form-item label="功用" name="Effect">
          <a-textarea v-model:value="templateModal.form.Effect" placeholder="请简单描述" :rows="3" />
        </a-form-item>
        <a-form-item label="主治" name="Indication">
          <a-textarea v-model:value="templateModal.form.Indication" placeholder="请简单描述" :rows="3" />
        </a-form-item>
        <a-form-item label="加减" name="Modification">
          <a-textarea v-model:value="templateModal.form.Modification" placeholder="请简单描述" :rows="3" />
        </a-form-item>
        <a-form-item label="是否公共模板" name="IsPublic">
          <a-switch v-model:checked="templateModal.form.IsPublic" checked-children="是" un-checked-children="否" />
        </a-form-item>
        <div class="pl24px">
          <div class="border-rd-12px border border-color-[#e1ebff] overflow-hidden">
            <div class="pt12px pb12px pl16px pr16px bg-[#F9FBFD] flex justify-between align-center">
              <div class="flex align-center">
                <div class="w14px h14px border-rd-50% border border-color-[#0A5AFF] border-width-2px"></div>
                <div class="color-[#4E5766] ml4px">中药处方：</div>
                <div class="text-bold">药材管理</div>
              </div>
              <a-space :size="4">
                <div class="color-[#565E74]">共{{templateModal.form.Details.length}}味药</div>
                <a-divider type="vertical" />
                <a-button type="link" danger size="small" @click="handleClearMaterial">清空药材</a-button>
              </a-space>
            </div>

            <div class="pt24px pb24px pl16px pr16px materialBlock">
              <a-space :size="[24, 12]" wrap>
                <MaterialInput
                  v-for="(item, index) in templateModal.form.Details" 
                  :key="index"
                  v-model:material-id="item.MaterialId"
                  v-model:material-name="item.MaterialName"
                  v-model:weight="item.Weight"
                  :group-materials="templateModal.form.Details" 
                  :self-index="index"
                  :show-delete="index!==0&&item.MaterialId!=null"
                  @delete="templateModal.form.Details.splice(index, 1)"
                  @add-new="templateModal.form.Details.push({ Sort: 1, MaterialId: null, MaterialName: '', Weight: null })"
                />
              </a-space>
            </div>
          </div>

          <a-space class="mt12px whitespace-nowrap medicinePlan" :size="12" wrap>
            <a-form-item name="DoseCount" :wrapperCol="{span:24}">
              <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pr8px">
                <a-input-number style="width:80px !important;" id="inputNumber" size="small" :controls="false" v-model:value="templateModal.form.DoseCount" :bordered="false" :min="0" placeholder="默认数量1" />
                <div>剂</div>
              </div>
            </a-form-item>
            <a-form-item name="DosageForm" :wrapperCol="{span:24}" class="w200px">
              <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px">
                <div class="whitespace-nowrap">剂型：</div>
                <a-select class="border-rd-4px bg-[#F6F8FC]" v-model:value="templateModal.form.DosageForm" placeholder="请选择" :bordered="false" allowClear>
                  <a-select-option :value="String(item.id)" v-for="(item,index) in MedicineType" :key="index">{{item.name}}</a-select-option>
                </a-select>
              </div>
            </a-form-item>
            <a-form-item name="UseMethod" :wrapperCol="{span:24}" class="w200px">
              <a-select class="border-rd-4px bg-[#F6F8FC]" v-model:value="templateModal.form.UseMethod" placeholder="用法" :bordered="false" allowClear>
                <a-select-option :value="item.id" v-for="(item,index) in ChineseMedicineUseMethod" :key="index">{{item.name}}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item name="Frequency" :wrapperCol="{span:24}" class="w200px">
              <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px">
                <div class="whitespace-nowrap">每日次数：</div>
                <a-select class="border-rd-4px bg-[#F6F8FC]" v-model:value="templateModal.form.Frequency" placeholder="请选择" :bordered="false" allowClear>
                  <a-select-option :value="String(item.id)" v-for="(item,index) in ChineseMedicineDailyFrequency" :key="index">{{item.name}}</a-select-option>
                </a-select>
              </div>
            </a-form-item>
            <a-form-item name="EachDose" :wrapperCol="{span:24}">
              <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pl8px">
                <div>单次剂量：</div>
                <a-input-number style="width:80px !important;" id="inputNumber" size="small" :controls="false" v-model:value="templateModal.form.EachDose" :bordered="false" :min="0" placeholder="" />
              </div>
            </a-form-item>
            <a-form-item name="DoseUnit" :wrapperCol="{span:24}" class="w200px">
              <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px">
                <div class="whitespace-nowrap">剂量单位：</div>
                <a-select class="border-rd-4px bg-[#F6F8FC]" v-model:value="templateModal.form.DoseUnit" placeholder="请选择" :bordered="false" allowClear>
                  <a-select-option :value="item.id" v-for="(item,index) in ChineseMedicineDoseUnit" :key="index">{{item.name}}</a-select-option>
                </a-select>
              </div>
            </a-form-item>
            <a-form-item name="TakeTime" :wrapperCol="{span:24}" class="w200px">
              <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px">
                <div>用药时间：</div>
                <a-select class="border-rd-4px bg-[#F6F8FC]" v-model:value="templateModal.form.TakeTime" placeholder="请选择" :bordered="false" allowClear>
                  <a-select-option :value="String(item.id)" v-for="(item,index) in ChineseMedicineMedicationTime" :key="index">{{item.name}}</a-select-option>
                </a-select>
              </div>
            </a-form-item>
            <a-form-item name="TakeDays" :wrapperCol="{span:24}">
              <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pr8px">
                <a-input-number id="inputNumber" class="w140px" :controls="false" size="small" v-model:value="templateModal.form.TakeDays" :bordered="false" placeholder="服药天数(选填)" :min="0" />
                <div>天</div>
              </div>
            </a-form-item>
          </a-space>

          <div class="flex justify-between align-center mt24px">
            <div class="flex-sub border-rd-8px border border-color-[#F3F4F7] flex p16px ">
              <div class="text-bold whitespace-nowrap line-height-22px">服药建议</div>
              <a-textarea size="small" v-model:value="templateModal.form.Advice" :rows="1" :bordered="false" :auto-size="{ minRows: 3}" placeholder="请输入服药建议" />
            </div>
            <div class="flex-sub border-rd-8px border border-color-[#F3F4F7] flex p16px ml12px">
              <div class="text-bold whitespace-nowrap line-height-22px">其他备注</div>
              <a-textarea size="small" v-model:value="templateModal.form.Remark" :rows="1" :bordered="false" :auto-size="{ minRows: 3}" placeholder="请输入服药建议" />
            </div>
          </div>
        </div>
      </a-form>
    </a-card>
  </div>
</template>
<script lang="ts" setup>
  import { ref,onMounted} from 'vue';
  import {TemplateApiCtrl} from '/@/api/myy/template';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { cloneDeep } from 'lodash-es';
  import {basicEnum} from '/@/api/platform/common';
  import { useRoute, useRouter } from 'vue-router';
  import MaterialInput from '/@/components/MaterialInput.vue';

  let route = useRoute();
  let router = useRouter();
  let templateId = route.query.id;
  const { createMessage} = useMessage()
  const formIns=ref()
  const categoryList=ref([])
  const ChineseMedicineUseMethod=ref([])
  const ChineseMedicineDailyFrequency=ref([])
  const MedicineType=ref([])
  const ChineseMedicineDoseUnit=ref([])
  const ChineseMedicineMedicationTime=ref([])
  const templateForm={
    Id:0,
    CategoryId:null,
    Name:'',
    Source:'',
    Effect:'',
    Indication:'',
    Modification:'',
    DoseCount:null,
    DosageForm:null,
    UseMethod:null,
    Frequency:null,
    EachDose:null,
    TakeTime:null,
    TakeDays:null,
    Advice:'',
    OtherRemark:'',
    Remark:'',
    IsPublic:false,
    Details:[{Sort:1,MaterialId:null,MaterialName:'',Weight:null}],
  }
  const templateModal=ref({
    loading:false,
    form:cloneDeep(templateForm),
    rules: {
      CategoryId: [{required: true,trigger: 'change',message: '该项必须选择',type:'string'}],
      Name: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      Source: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      Effect: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      Indication: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      Modification: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      DosageForm: [{required: true,trigger: 'change',message: '该项必须选择',type:'string'}],
      DoseCount: [{required: true,trigger: 'blur',message: '该项必须填写',type:'number'}],
      UseMethod: [{required: true,trigger: 'change',message: '该项必须选择',type:'number'}],
      Frequency: [{required: true,trigger: 'change',message: '该项必须选择',type:'string'}],
      EachDose: [{required: true,trigger: 'blur',message: '该项必须填写',type:'number'}],
      TakeTime: [{required: true,trigger: 'change',message: '该项必须选择',type:'string'}],
    }
  })

  onMounted(() => {
    getBasicEnum()
    getCategoryList()
    if(templateId){
      getTemplateDetail()
    }
  })
  
  // 获取枚举
  const getBasicEnum=()=>{
    basicEnum({name:'ChineseMedicineUseMethod'}).then(data=>{
      ChineseMedicineUseMethod.value=data
    })
    basicEnum({name:'ChineseMedicineDailyFrequency'}).then(data=>{
      ChineseMedicineDailyFrequency.value=data
    })
    basicEnum({name:'MedicineType'}).then(data=>{
      MedicineType.value=data
    })
    basicEnum({name:'ChineseMedicineDoseUnit'}).then(data=>{
      ChineseMedicineDoseUnit.value=data
    })
    basicEnum({name:'ChineseMedicineMedicationTime'}).then(data=>{
      ChineseMedicineMedicationTime.value=data
    })
  }

  const getCategoryList=()=>{
    TemplateApiCtrl.CategoryList({type:1,limit:100}).then(data=>{
      categoryList.value=data.Rows
    })
  }

  const getTemplateDetail=()=>{
    templateModal.value.loading=true
    TemplateApiCtrl.PrescriptDetail({id:templateId}).then(data=>{
      templateModal.value.form=cloneDeep(data.Template)
      templateModal.value.form.EachDose=Number(templateModal.value.form.EachDose)
      templateModal.value.form.Details=cloneDeep(data.Details)
      templateModal.value.form.Details.push({Sort:1,MaterialId:null,MaterialName:'',Weight:null})
    }).catch(() => {}).finally(() => {templateModal.value.loading= false })
  }

  const handleClearMaterial=()=>{
    templateModal.value.form.Details=[{Sort:1,MaterialId:null,MaterialName:'',Weight:null}]
  }

  const saveTemplate=() => {
    formIns.value.validate().then(() => {
      
      const formData =cloneDeep(templateModal.value.form)
      let isComplete=true
      let materialLists=formData.Details.filter(item=>item.MaterialId)
      if(materialLists.length){
        isComplete=!materialLists.some(item =>item.Weight==null||item.Weight==0);
      }else{
        isComplete=false
      }
      if(!isComplete){
        createMessage.error(`请完善药材管理`);
        return
      }
      formData.Details=materialLists
      templateModal.value.loading = true
      TemplateApiCtrl.SavePrescript(formData).then(data => {
        createMessage.success(`保存成功`);
        handleCancel()
      }).catch(() => {}).finally(() => { templateModal.value.loading = false })
    }).catch(() => { })
  }

  const handleCancel=()=>{
    templateModal.value.form=cloneDeep(templateForm)
    router.back()
  }

</script>
<style lang="less" scoped>
.page-height{
  height: calc(100vh - 100px);
}
.addTemplate ::v-deep(.ant-card-body){
  height: calc(100% - 68px);
  overflow-y: scroll;
}
.medicinePlan .ant-form-item{
  margin-bottom: 0 !important;
}
</style>