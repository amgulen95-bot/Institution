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
                <div class="flex justify-between align-center border border-rd-4px border-color-[#E9ECEF] pt7px pb7px pr12px pl5px position-relative" v-for="(item,index) in templateModal.form.Details" :key="index">
                  <a-popover v-model:open="materialModal.visible[index]" placement="bottomLeft" trigger="focus" :destroyTooltipOnHide="false" @openChange="(visible) => handlePopoverChange(visible, index)">
                    <template #content>
                      <div class="w650px">
                        <MaterialList :list-data="materialModal.list" :loading="materialModal.loading" :total="materialModal.total" @row-click="handleSelectMaterial" @page-change="handlePageChange"></MaterialList>
                      </div>
                    </template>
                    <a-input class="w180px" 
                      size="small" 
                      v-model:value="item.MaterialName"
                      @blur="handleInputBlur(index)"
                      @focus="handleInputFocus(index)"
                      @input="handleInputChange(index)"
                      :bordered="false"
                      placeholder="药材名称" />
                  </a-popover>
                  
                  <a-divider type="vertical" />
                  <a-input-number id="inputNumber" size="small" :controls="false" v-model:value="item.Weight" :bordered="false" :min="0" placeholder="用量" />
                  <span>g</span>

                  <CloseCircleOutlined class="position-absolute top--7px right--7px color-[#c8cdd4]" v-if="index!=0&&item.MaterialId" @click="handleDeleteMaterial(index)" />
                </div>
              </a-space>
            </div>
          </div>

          <a-space class="mt12px" :size="12" wrap>
            <a-form-item name="DoseCount" :wrapperCol="{span:24}">
              <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pr8px">
                <a-input-number style="width:80px !important;" id="inputNumber" size="small" :controls="false" v-model:value="templateModal.form.DoseCount" :bordered="false" :min="0" placeholder="默认数量1" />
                <div>剂</div>
              </div>
            </a-form-item>
            <a-form-item name="DosageForm" :wrapperCol="{span:24}">
              <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pl8px">
                <div class="whitespace-nowrap">剂型：</div>
                <a-input  size="small" v-model:value="templateModal.form.DosageForm" :bordered="false" placeholder="请输入" />
              </div>
            </a-form-item>
            <a-form-item name="UseMethod" :wrapperCol="{span:24}" class="w200px">
              <a-select class="border-rd-4px bg-[#F6F8FC]" v-model:value="templateModal.form.UseMethod" placeholder="用法" :bordered="false" allowClear>
                <a-select-option :value="item.id" v-for="(item,index) in ChineseMedicineUseMethod" :key="index">{{item.name}}</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item name="Frequency" :wrapperCol="{span:24}">
              <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pl8px">
                <div>用药频率：</div>
                <a-input class="w140px" size="small" v-model:value="templateModal.form.Frequency" :bordered="false" placeholder="请输入" />
              </div>
            </a-form-item>
            <a-form-item name="EachDose" :wrapperCol="{span:24}">
              <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pl8px">
                <div>每次用量：</div>
                <a-input class="w140px" size="small" v-model:value="templateModal.form.EachDose" :bordered="false" placeholder="请输入" />
              </div>
            </a-form-item>
            <a-form-item name="TakeTime" :wrapperCol="{span:24}">
              <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pl8px">
                <div>服用时间：</div>
                <a-input class="w140px" size="small" v-model:value="templateModal.form.TakeTime" :bordered="false" placeholder="请输入" />
              </div>
            </a-form-item>
            <a-form-item name="TakeDays" :wrapperCol="{span:24}">
              <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pr8px">
                <a-input-number id="inputNumber" class="w140px" :controls="false" size="small" v-model:value="templateModal.form.TakeDays" :bordered="false" placeholder="服药天数(选填)" :min="0" />
                <div>天</div>
              </div>
            </a-form-item>
          </a-space>

          <div class="flex justify-between align-center mt12px">
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
  import {PrescriptApiCtrl} from '/@/api/myy/prescript';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { cloneDeep } from 'lodash-es';
  import {basicEnum} from '/@/api/platform/common';
  import { useRoute, useRouter } from 'vue-router';
  import {CloseCircleOutlined} from '@ant-design/icons-vue';
  import MaterialList from '/@/components/MaterialList.vue';

  let route = useRoute();
  let router = useRouter();
  let templateId = route.query.id;
  const { createMessage,createConfirm} = useMessage()
  const formIns=ref()
  const categoryList=ref([])
  const ChineseMedicineUseMethod=ref([])
  const materialModal=ref({
    loading:false,
    visible: [] as boolean[],
    index:0,
    total:0,
    list:[],
    originalValue:'',
    isConfirmed: false,
  })
  const templateForm={
    Id:0,
    CategoryId:null,
    Name:'',
    Source:'',
    Effect:'',
    Indication:'',
    Modification:'',
    DoseCount:null,
    DosageForm:'',
    UseMethod:null,
    Frequency:'',
    EachDose:'',
    TakeTime:'',
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
      DosageForm: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      DoseCount: [{required: true,trigger: 'blur',message: '该项必须填写',type:'number'}],
      UseMethod: [{required: true,trigger: 'change',message: '该项必须选择',type:'number'}],
      Frequency: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      EachDose: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      TakeTime: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
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
      templateModal.value.form.Details=cloneDeep(data.Details)
      templateModal.value.form.Details.push({Sort:1,MaterialId:null,MaterialName:'',Weight:null})
    }).catch(() => {}).finally(() => {templateModal.value.loading= false })
  }

  const handleInputFocus = async (index: number) => {
    materialModal.value.index = index
    materialModal.value.isConfirmed = false
    materialModal.value.originalValue = templateModal.value.form.Details[index].MaterialName||''
    await fetchMaterialList(1, 10, '')
  }

  let timer: any = null;
  const handleInputChange = (index: number) => {
    clearTimeout(timer);
    materialModal.value.index = index;
    const keyword = templateModal.value.form.Details[index].MaterialName?.trim() || '';
    timer = setTimeout(() => {
      fetchMaterialList(1, 10, keyword);
    }, 300);
  }

  const fetchMaterialList = async (page: number, pageSize: number, keyword: string) => {
    materialModal.value.loading = true;
    try {
      const data = await PrescriptApiCtrl.MaterialList({
        page: page,
        limit: pageSize,
        name: keyword
      });
      materialModal.value.list = data.Rows || [];
      materialModal.value.total = data.TotalItemCount || 0;
      
      const currentIndex = materialModal.value.index;
      materialModal.value.visible[currentIndex] = materialModal.value.list.length > 0;
    } catch (error) {
      materialModal.value.visible[materialModal.value.index] = false;
    } finally {
      materialModal.value.loading = false;
    }
  };

  const handlePageChange = (page: number, pageSize: number) => {
    const index = materialModal.value.index
    const keyword = templateModal.value.form.Details[index]?.MaterialName?.trim() || ''
    fetchMaterialList(page, pageSize, keyword)
  }

  const handleSelectMaterial = (record: any) => {
    const currentIndex = materialModal.value.index;
    const isExist = templateModal.value.form.Details.some(
      (item, index) => item.MaterialName === record.Name && index !== currentIndex
    );
    if (isExist) {
      createMessage.warning(`处方中已添加【${record.Name}】`);
      materialModal.value.visible[currentIndex] = false;
      materialModal.value.list = [];
      materialModal.value.total = 0;
      return;
    }
    templateModal.value.form.Details[currentIndex].MaterialId = record.Id;
    templateModal.value.form.Details[currentIndex].MaterialName = record.Name;
    materialModal.value.visible[currentIndex] = false;
    materialModal.value.list = [];
    materialModal.value.total = 0;
    materialModal.value.originalValue = record.Name;
    materialModal.value.isConfirmed = true
    templateModal.value.form.Details.push({ Sort: 1, MaterialId: null, MaterialName: '', Weight: null });
  }

  const handleInputBlur = (index: number) => {
    const currentItem = templateModal.value.form.Details[index];
    if (!materialModal.value.isConfirmed && currentItem.MaterialName !== materialModal.value.originalValue) {
      currentItem.MaterialName = materialModal.value.originalValue;
    }
  };

  const handlePopoverChange = (visible: boolean, index: number) => {
    if (!visible) {
      materialModal.value.list = [];
      materialModal.value.total = 0;
    }
  };

  const handleDeleteMaterial=(index)=>{
    templateModal.value.form.Details.splice(index,1)
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
.materialBlock .ant-input {
  &-number,
  &-number-group-wrapper {
    width:50px !important;
    min-width: 50px;
    max-width: 100%;
  }
}
</style>