<template>
  <div>
    <div class="flex border-rd-8px overflow-hidden" v-loading="loading">
      <div class="w350px bg-[#F5F7FA]">
        <div class="pt24px pl16px pr16px">
          <a-input-search v-model:value="keyword" placeholder="搜索病历模板" @search="getPrescriptList" />
        </div>

        <div class="flex overflow-hidden mt16px border-t border-color-[#e0e0e0]" style="height: calc(100vh - 380px);">
          <div class="overflow-y-scroll pl16px pt16px  border-r border-color-[#e0e0e0] scrollbar-none">
            <div class="mb20px pt12px pb12px pl12px pr12px max-w-116px flex align-center pointer" :class="categoryInfo.id==item.Id?'text-theme text-bold activeClassify':''" v-for="(item,index) in categoryInfo.list" :key="index" @click="changeClassify(item)">
              <img v-if="categoryInfo.id!=item.Id" class="w16px h16px" src="../assets/images/prescriptionIcon.png" alt="">
              <img v-else class="w16px h16px" src="../assets/images/prescriptionActiveIcon.png" alt="">
              <span class="ml4px ellipsis1">{{item.Name}}</span>
            </div>
          </div>
          <div class="overflow-y-scroll p16px scrollbar-none flex-sub">
            <div class="p12px border-rd-8px pointer" :class="templateInfo.id==item.Id?'text-theme text-bold bg-[#e1ebff]':''" v-for="(item,index) in templateInfo.list" :key="index" @click="changeTemplate(item)">{{item.Name}}</div>
          </div>
        </div>

        <div class="flex align-center justify-center pt16px pb24px border-t border-color-[#e0e0e0]">
          <a-button type="primary" ghost :icon="h(PlusOutlined)" @click="addCategory">创建分类</a-button>
          <a-button type="primary" :icon="h(PlusOutlined)" class="ml12px" @click="editTemplate('add')">新建模板</a-button>
        </div>
      </div>
      <div class="flex-sub p24px pt36px">
        <div class="text-18px text-bold">{{templateInfo.detail.Name}}</div>

        <div class="overflow-y-scroll scrollbar-none mt16px" style="height: calc(100vh - 350px);">
          <a-descriptions bordered :column="1" :labelStyle="{ width: '100px' }">
            <a-descriptions-item label="主诉">{{templateInfo.detail.ChiefComplaint}}</a-descriptions-item>
            <a-descriptions-item label="现病史">{{templateInfo.detail.PresentIllness}}</a-descriptions-item>
            <a-descriptions-item label="既往史" :span="2">{{templateInfo.detail.PastHistory}}</a-descriptions-item>
            <a-descriptions-item label="过敏史" :span="2">{{templateInfo.detail.AllergyHistory}}</a-descriptions-item>
            <a-descriptions-item label="个人史" :span="2">{{templateInfo.detail.PersonalHistory}}</a-descriptions-item>
            <a-descriptions-item label="体格检查" :span="2">{{templateInfo.detail.PhysicalExam}}</a-descriptions-item>
            <a-descriptions-item label="望闻切诊" :span="2">{{templateInfo.detail.TCMDiagnosis}}</a-descriptions-item>
            <a-descriptions-item label="诊断" :span="2">{{templateInfo.detail.Diagnosis}}</a-descriptions-item>
          </a-descriptions>
        </div>
        <div class="flex align-center mt16px justify-between">
          <a-space>
            <a-button type="primary" ghost @click="editTemplate('edit')">编辑</a-button>
            <a-button type="primary" danger ghost @click="handleDeletePrescription">删除</a-button>
          </a-space>
          <a-button type="primary" v-if="isModal" @click="handleUseTemplate">使用此模板</a-button>
        </div>
      </div>
    </div>

    <!-- 新增/编辑 -->
    <a-modal v-model:open="categoryModal.visible" :title="categoryModal.form.Id==0?'新增分类':'编辑分类'" centered width="600px" @ok="saveCategory" :maskClosable="false" destroyOnClose>
      <section class="padding-lr32 formModal">
        <a-form :model="categoryModal.form" :labelCol="{ style: 'width: 100px' }" :wrapperCol="{span:16}" :rules="categoryModal.rules" ref="categoryFormIns">
          <a-form-item label="排序" name="Sort">
            <a-input-number id="inputNumber" v-model:value="categoryModal.form.Sort" />
          </a-form-item>
          <a-form-item label="分类名称" name="Name">
            <a-input v-model:value="categoryModal.form.Name" placeholder="请填写"></a-input>
          </a-form-item>
        </a-form>
      </section>
    </a-modal>


    <a-modal v-model:open="templateModal.visible" :title="templateModal.form.Id==0?'新增模板':'编辑模板'" centered width="800px" @ok="saveTemplate" :maskClosable="false" destroyOnClose>
      <section class="padding-lr32 formModal">
        <a-form :model="templateModal.form" :labelCol="{ style: 'width: 100px' }" :wrapperCol="{span:16}" :rules="templateModal.rules" ref="templateFormIns">
          <a-form-item label="模板名称" name="Name">
            <a-input v-model:value="templateModal.form.Name" placeholder="请填写"></a-input>
          </a-form-item>
          <a-form-item label="是否公共模板" name="IsPublic">
            <a-switch v-model:checked="templateModal.form.IsPublic" checked-children="是" un-checked-children="否" />
          </a-form-item>
          <a-descriptions bordered :column="1" :labelStyle="{ width: '100px' }">
            <a-descriptions-item label="主诉">
              <a-textarea size="small" v-model:value="templateModal.form.ChiefComplaint" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" />
            </a-descriptions-item>
            <a-descriptions-item label="现病史">
              <a-textarea size="small" v-model:value="templateModal.form.PresentIllness" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" />
            </a-descriptions-item>
            <a-descriptions-item label="既往史">
              <a-textarea size="small" v-model:value="templateModal.form.PastHistory" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" />
            </a-descriptions-item>
            <a-descriptions-item label="过敏史">
              <a-textarea size="small" v-model:value="templateModal.form.AllergyHistory" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" />
            </a-descriptions-item>
            <a-descriptions-item label="个人史">
              <a-textarea size="small" v-model:value="templateModal.form.PersonalHistory" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" />
            </a-descriptions-item>
            <a-descriptions-item label="体格检查">
              <a-textarea size="small" v-model:value="templateModal.form.PhysicalExam" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" />
            </a-descriptions-item>
            <a-descriptions-item label="望闻切诊">
              <a-textarea size="small" v-model:value="templateModal.form.TCMDiagnosis" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" />
            </a-descriptions-item>
            <a-descriptions-item label="诊断">
              <a-textarea size="small" v-model:value="templateModal.form.Diagnosis" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" />
            </a-descriptions-item>
          </a-descriptions>
        </a-form>
      </section>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { ref,h,onMounted,createVNode,watch} from 'vue';
  import {TemplateApiCtrl} from '/@/api/myy/template';
  import {PlusOutlined,ExclamationCircleOutlined} from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { cloneDeep } from 'lodash-es';
  import { useGo } from '/@/hooks/web/usePage';
  import { Modal } from 'ant-design-vue';

  const props = defineProps({
    isModal:{ type: Boolean, default: false},
  });

  const emit = defineEmits(['use-template'])
  const { createMessage} = useMessage()
  const go = useGo();
  const loading = ref(false);
  const keyword=ref('')
  const templateFormIns=ref()
  const categoryInfo=ref({
    list:[],
    id:null,
  })
  const templateInfo=ref({
    list:[],
    id:null,
    detail:{},
  })
  const categoryFormIns=ref()
  const categoryForm={
    Id:0,
    Type:2,
    Name:'',
    Sort:1,
  }
  const categoryModal=ref({
    visible:false,
    loading:false,
    form:cloneDeep(categoryForm),
    rules: {
      Name: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      Sort: [{required: true,trigger: 'blur',message: '该项必须填写',type:'number'}],
    }
  })
  const templateForm={
    Id:0,
    CategoryId:null,
    Name:'',
    Disease:'',
    IsPublic:false,
    ChiefComplaint:'',
    PresentIllness:'',
    PastHistory:'',
    AllergyHistory:'',
    PersonalHistory:'',
    PhysicalExam:'',
    TCMDiagnosis:'',
    Diagnosis:'',
    Remark:'',
  }
  const templateModal=ref({
    visible:false,
    loading:false,
    form:cloneDeep(templateForm),
    rules: {
      Name: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
    }
  })

  onMounted(()=>{
    getCategoryList()
  })

  // 获取模板分类
  const getCategoryList=()=>{
    loading.value=true
    TemplateApiCtrl.CategoryList({type:2,limit:100}).then(data=>{
      categoryInfo.value.list=data.Rows
      if(categoryInfo.value.list.length){
        categoryInfo.value.id=categoryInfo.value.list[0].Id
        getPrescriptList()
      }
    }).catch(() => {}).finally(() => {loading.value=false })
  }

  // 获取模板列表
  const getPrescriptList = () => {
    loading.value = true
    TemplateApiCtrl.MedicalList({
      categoryId: categoryInfo.value.id,
      keyword:keyword.value,
      page:1,
      limit:100
    }).then(data => {
      templateInfo.value.list = data.Rows
      if (templateInfo.value.list.length) {
        templateInfo.value.id = templateInfo.value.list[0].Id
        getPrescriptDetail()
      }
    }).catch(() => {}).finally(() => { loading.value = false })
  }

  // 获取模板详情
  const getPrescriptDetail = () => {
    loading.value = true
    TemplateApiCtrl.MedicalDetail({ id: templateInfo.value.id }).then(data => {
      templateInfo.value.detail = data
    }).catch(() => {}).finally(() => { loading.value = false })
  }

  // 切换分类
  const changeClassify = (item) => {
    categoryInfo.value.id = item.Id
    getPrescriptList()
  }

  // 切换模板
  const changeTemplate = (item) => {
    templateInfo.value.id = item.Id
    getPrescriptDetail()
  }

  // 分类弹框
  const addCategory=()=>{
    categoryModal.value.form=cloneDeep(categoryForm)
    categoryModal.value.visible=true
  }

  //保存分类
  const saveCategory=()=>{
    categoryFormIns.value.validate().then(() => {
      categoryModal.value.loading = true
      const  formData=cloneDeep(categoryModal.value.form)
      TemplateApiCtrl.SaveCategory(formData).then(data => {
        createMessage.success(`保存成功`);
        categoryModal.value.visible=false
        getCategoryList()
      }).catch(() => {
      }).finally(() => {categoryModal.value.loading= false })
    }).catch(() => { })
  };

  const handleDeletePrescription=()=>{
    Modal.confirm({
      title: '删除提示',
      centered:true,
      content:`您确定要删除病历模板：${templateInfo.value.detail.Name}？`,
      icon: createVNode(ExclamationCircleOutlined),
      onOk() {
        loading.value=true
        TemplateApiCtrl.DeleteMedical({id:templateInfo.value.detail.Id}).then(data => {
          createMessage.success(`删除成功`);
          templateInfo.value.detail={}
          getPrescriptList()
        }).catch(() => {}).finally(() => {loading.value=false})
      },
    });
  }

  const editTemplate=(type)=>{
    if(type=='add'){
      templateModal.value.form=cloneDeep(templateForm)
      templateModal.value.form.CategoryId=categoryInfo.value.id
    }else{
      templateModal.value.form=cloneDeep(templateInfo.value.detail)
    }
    templateModal.value.visible=true
  }

  const saveTemplate=()=>{
    templateFormIns.value.validate().then(() => {
      templateModal.value.loading = true
      const formData=cloneDeep(templateModal.value.form)
      TemplateApiCtrl.SaveMedical(formData).then(data => {
        createMessage.success(`保存成功`);
        templateModal.value.visible=false
        getPrescriptList()
      }).catch(() => {
      }).finally(() => {templateModal.value.loading= false })
    }).catch(() => { })
  }

  const handleUseTemplate = () => {
    const templateData = cloneDeep(templateInfo.value.detail)
    emit('use-template', templateData)
  };
</script>
<style lang="less" scoped>
.activeClassify{
  border-radius: 8px 0 0 8px;
  border-left: 3px solid #D8E4FB;
  background: #FFF;
}
</style>