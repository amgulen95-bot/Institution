<template>
  <div>
    <div class="flex border-rd-8px overflow-hidden" v-loading="loading">
      <div class="w350px bg-[#F5F7FA]">
        <div class="pt24px pl16px pr16px">
          <a-input-search v-model:value="keyword" placeholder="搜索中药处方模板" @search="getPrescriptList" />
        </div>
        <a-tabs v-model:activeKey="activeKey" centered class="mt8px" @change="changeCategory">
          <a-tab-pane :key="1" tab="经典验方"></a-tab-pane>
          <a-tab-pane :key="2" tab="协定方"></a-tab-pane>
          <a-tab-pane :key="3" tab="常用方"></a-tab-pane>
        </a-tabs>

        

        <div class="flex overflow-hidden classifyList" style="height: calc(100vh - 380px);">
          <a-empty class="flex-sub mt48px" v-if="!categoryInfo.list.length" />
          <template v-else>
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
          </template>
        </div>

        <div class="flex align-center justify-center pt16px pb24px border-t border-color-[#e0e0e0]" v-if="activeKey==3">
          <a-button type="primary" ghost :icon="h(PlusOutlined)" @click="addCategory">创建分类</a-button>
          <a-button type="primary" :icon="h(PlusOutlined)" class="ml12px" @click="editTemplate('add')">新建模板</a-button>
        </div>
      </div>
      <div class="flex-sub p24px pt36px" v-if="activeKey==1||activeKey==2">
        <div class="text-18px text-bold">{{templateInfo.detail.ProName}}</div>
        <div class="overflow-y-scroll scrollbar-none mt16px" style="height: calc(100vh - 350px);">
          <a-descriptions bordered :column="1" :labelStyle="{ width: '140px' }">
            <a-descriptions-item label="分类">{{templateInfo.detail.RecipelName}}</a-descriptions-item>
            <a-descriptions-item :label="item.Name" v-for="(item,index) in templateInfo.detail.Attrs">{{item.Value}}</a-descriptions-item>
          </a-descriptions>
          <div class="border mt16px border-rd-8px overflow-hidden border-color-[#f0f0f0]">
            <div class="pt8px pb8px pl16px pr16px w100% bg-[#fafbfc]">
              <div class="flex justify-between align-center">
                <div class="text-bold">{{templateInfo.detail.RecipelName}}-{{ templateInfo.detail.MedicineTypeName }}</div>
                <div class="color-[#4E5766]">共{{templateInfo.materialsList.length}}味药</div>
              </div>
            </div>
            <a-descriptions bordered :column="3">
              <a-descriptions-item :label="item.MaterialName" v-for="(item,index) in templateInfo.materialsList" :key="index">{{item.Weight}}g</a-descriptions-item>
            </a-descriptions>
            <a-space class="pt8px pb8px pl16px pr16px w100% bg-[#fafbfc]">
              <div>{{templateInfo.detail.MedicineTypeName}}</div>
              <a-divider type="vertical" />
              <div>{{templateInfo.detail.UseMethodName}}</div>
              <a-divider type="vertical" />
              <div>{{templateInfo.detail.DailyFrequencyName}}</div>
              <a-divider type="vertical" />
              <div>单次剂量：{{templateInfo.detail.PerDoseAmount}}{{templateInfo.detail.DoseUnitName}}</div>
              <a-divider type="vertical" />
              <div>{{templateInfo.detail.TakeTimeName}}</div>
              <a-divider type="vertical" />
              <div>疗程：{{templateInfo.detail.CertNumber}}</div>
            </a-space>
          </div>
        </div>
        
        <div class="flex align-center mt16px justify-center">
          <a-button type="primary" v-if="isModal" @click="handleUseTemplate">使用此模板</a-button>
        </div>
      </div>

      <div class="flex-sub p24px pt36px" v-else>
        <div class="text-18px text-bold">{{templateInfo.detail.Name}}</div>

        <div class="overflow-y-scroll scrollbar-none mt16px" style="height: calc(100vh - 350px);">
          <a-descriptions bordered :column="2" :labelStyle="{ width: '80px' }">
            <a-descriptions-item label="分类">{{templateInfo.detail.CategoryName}}</a-descriptions-item>
            <a-descriptions-item label="来源">{{templateInfo.detail.Source}}</a-descriptions-item>
            <a-descriptions-item label="功用" :span="2">{{templateInfo.detail.Effect}}</a-descriptions-item>
            <a-descriptions-item label="主治" :span="2">{{templateInfo.detail.Indication}}</a-descriptions-item>
            <a-descriptions-item label="加减" :span="2">{{templateInfo.detail.Modification}}</a-descriptions-item>
          </a-descriptions>

          <div class="border mt16px border-rd-8px overflow-hidden border-color-[#f0f0f0]" v-if="templateInfo.materialsList.length">
            <div class="pt8px pb8px pl16px pr16px w100% bg-[#fafbfc]">
              <div class="flex justify-between align-center">
                <div class="text-bold">中药处方-饮片</div>
                <div class="color-[#4E5766]">共{{templateInfo.materialsList.length}}味药</div>
              </div>
            </div>
            <a-descriptions bordered :column="3">
              <a-descriptions-item :label="item.MaterialName" v-for="(item,index) in templateInfo.materialsList" :key="index">{{item.Weight}}g</a-descriptions-item>
            </a-descriptions>
            <a-space class="pt8px pb8px pl16px pr16px w100% bg-[#fafbfc]">
              <div>{{templateInfo.detail.DoseCount}}剂</div>
              <a-divider type="vertical" />
              <div>{{templateInfo.detail.DosageFormName}}</div>
              <a-divider type="vertical" />
              <div>{{templateInfo.detail.UseMethodName}}</div>
              <a-divider type="vertical" />
              <div>{{templateInfo.detail.FrequencyName}}</div>
              <a-divider type="vertical" />
              <div>{{templateInfo.detail.EachDose}}{{templateInfo.detail.DoseUnitName}}</div>
              <a-divider type="vertical" />
              <div>{{templateInfo.detail.TakeTimeName}}</div>
              <template v-if="templateInfo.detail.TakeDays">
                <a-divider type="vertical" />
                <div>{{templateInfo.detail.TakeDays}}天</div>
              </template>
            </a-space>
          </div>
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
  </div>
</template>
<script lang="ts" setup>
  import { ref,computed,h,onMounted,createVNode,watch} from 'vue';
  import {TemplateApiCtrl} from '/@/api/myy/template';
  import {PlusOutlined,ExclamationCircleOutlined} from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { cloneDeep } from 'lodash-es';
  import { useGo } from '/@/hooks/web/usePage';
  import {basicEnum} from '/@/api/platform/common';
  import { Modal } from 'ant-design-vue';

  const props = defineProps({
    activeKey:{ type: Number, default: 1 },
    isModal:{ type: Boolean, default: false},
  });

  const emit = defineEmits(['use-template'])
  const { createMessage} = useMessage()
  const go = useGo();
  const loading = ref(false);
  const activeKey = ref(props.activeKey)
  watch(() => props.activeKey, (newVal) => {
    activeKey.value = newVal;
  });
  const ChineseMedicineUseMethod=ref([])
  const keyword=ref('')
  const categoryInfo=ref({
    list:[],
    id:null,
  })
  const templateInfo=ref({
    list:[],
    id:null,
    materialsList:[],
    detail:{},
  })
  const categoryFormIns=ref()
  const categoryForm={
    Id:0,
    Type:1,
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

  onMounted(()=>{
    getBasicEnum()
    getCategoryList()
  })

  const computeIndication=computed(()=>{
    return (val)=>{
      try {
        const arr = JSON.parse(val);
        if (Array.isArray(arr)) {
          return arr.join('，');
        }
        return '';
      } catch (e) {
        return '';
      }
    }
  })

  // 获取枚举
  const getBasicEnum=()=>{
    basicEnum({name:'ChineseMedicineUseMethod'}).then(data=>{
      ChineseMedicineUseMethod.value=data
    })
  }

  // 获取模板分类
  const getCategoryList=()=>{
    loading.value=true
    let api=TemplateApiCtrl.SystemPrescriptCategoryList
    let query={}
    if(activeKey.value==1||activeKey.value==2){
      api=TemplateApiCtrl.SystemPrescriptCategoryList
      query={recipel:activeKey.value==1?4:3}
    }else{
      api=TemplateApiCtrl.CategoryList
      query={type:1,limit:100}
    }
    api(query).then(data=>{
      categoryInfo.value.list=data.Rows||data
      if(categoryInfo.value.list.length){
        categoryInfo.value.id=categoryInfo.value.list[0].Id
        getPrescriptList()
      }else{
        categoryInfo.value.id=null
        categoryInfo.value.list=[]
        templateInfo.value.id=null
        templateInfo.value.list=[]
        templateInfo.value.materialsList=[]
        templateInfo.value.detail={}
      }
    }).catch(() => {}).finally(() => {loading.value=false })
  }

  // 获取模板列表
  const getPrescriptList = () => {
    loading.value = true
    let api = TemplateApiCtrl.SystemPrescriptList
    let query = {}
    if (activeKey.value == 1 || activeKey.value == 2) {
      api = TemplateApiCtrl.SystemPrescriptList
      query = { recipel: activeKey.value == 1 ? 4 : 3, categoryId: categoryInfo.value.id,limit:100,keyword:keyword.value}
    } else {
      api = TemplateApiCtrl.PrescriptList
      query = { categoryId: categoryInfo.value.id,keyword:keyword.value,auditStatus:1}
    }
    api(query).then(data => {
      templateInfo.value.list = data.Rows || data
      if (templateInfo.value.list.length) {
        templateInfo.value.id = templateInfo.value.list[0].Id
        getPrescriptDetail()
      }
    }).catch(() => {}).finally(() => { loading.value = false })
  }

  // 获取模板详情
  const getPrescriptDetail = () => {
    loading.value = true
    let api = TemplateApiCtrl.SystemPrescriptDetail
    let query = { id: templateInfo.value.id }

    if (activeKey.value == 1 || activeKey.value == 2) {
      api = TemplateApiCtrl.SystemPrescriptDetail
      query = { id: templateInfo.value.id }
    } else {
      api = TemplateApiCtrl.PrescriptDetail
      query = { id: templateInfo.value.id }
    }

    api(query).then(data => {
      if(activeKey.value==1||activeKey.value==2){
        templateInfo.value.materialsList=data.Details[0].Materials
        templateInfo.value.detail=data.Details[0]
        templateInfo.value.detail.CertNumber=data.CertNumber
      }else{
        templateInfo.value.detail=data.Template
        templateInfo.value.materialsList=data.Details
      }
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

  // 切换 Tab
  const changeCategory = () => {
    getCategoryList()
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
      content:`您确定要删除处方模板：${templateInfo.value.detail.Template.Name}？`,
      icon: createVNode(ExclamationCircleOutlined),
      onOk() {
        loading.value=true
        TemplateApiCtrl.DeletePrescript({id:templateInfo.value.detail.Template.Id}).then(data => {
          createMessage.success(`删除成功`);
          getPrescriptList()
        }).catch(() => {}).finally(() => {loading.value=false})
      },
    });
  }

  const editTemplate=(type)=>{
    if(type=='add'){
      go('/prescription/add')
    }else{
      go('/prescription/add?id='+templateInfo.value.id)
    }
  }

  const handleUseTemplate = () => {
    const templateData = cloneDeep(templateInfo.value.detail)
    if(activeKey.value==3){
      templateData.Details=templateInfo.value.materialsList
    }
    emit('use-template', templateData, activeKey.value)
  };
</script>
<style lang="less" scoped>
.activeClassify{
  border-radius: 8px 0 0 8px;
  border-left: 3px solid #D8E4FB;
  background: #FFF;
}
.classifyList{
  margin-top: -16px;
}
</style>