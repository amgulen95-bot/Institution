<template>
  <div class="prescription-template-root">
    <div class="prescription-template-panel flex border-rd-8px overflow-hidden" v-loading="loading">
      <div class="prescription-template-sidebar w350px bg-[#F5F7FA]">
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
            <div class="prescription-template-category-list overflow-y-scroll pl16px pt16px border-r border-color-[#e0e0e0] scrollbar-none">
              <div class="prescription-template-category-item mb20px pt12px pb12px pl12px pr12px max-w-116px flex align-center pointer" :class="categoryInfo.id==item.Id?'text-theme text-bold activeClassify':''" v-for="(item,index) in categoryInfo.list" :key="index" @click="changeClassify(item)">
                <img v-if="categoryInfo.id!=item.Id" class="w16px h16px" src="../assets/images/prescriptionIcon.png" alt="">
                <img v-else class="w16px h16px" src="../assets/images/prescriptionActiveIcon.png" alt="">
                <span class="ml4px ellipsis1">{{item.Name}}</span>
              </div>
            </div>
            <div class="prescription-template-list overflow-y-scroll p16px scrollbar-none flex-sub">
              <div class="prescription-template-list-item p12px border-rd-8px pointer" :class="templateInfo.id==item.Id?'text-theme text-bold bg-[#e1ebff]':''" v-for="(item,index) in templateInfo.list" :key="index" @click="changeTemplate(item)">{{item.Name}}</div>
            </div>
          </template>
        </div>

        <div class="prescription-template-sidebar-actions flex align-center justify-center pt16px pb24px border-t border-color-[#e0e0e0]" v-if="activeKey==3">
          <a-button class="prescription-template-action-btn" type="primary" ghost :icon="h(PlusOutlined)" @click="addCategory">创建分类</a-button>
          <a-button class="prescription-template-action-btn ml12px" type="primary" :icon="h(PlusOutlined)" @click="editTemplate('add')">新建模板</a-button>
        </div>
      </div>
      <div class="prescription-template-detail flex-sub" v-if="activeKey==1||activeKey==2">
        <div class="prescription-template-detail-scroll overflow-y-scroll scrollbar-none">
          <section class="prescription-template-hero">
            <div class="prescription-template-hero-main">
              <div class="prescription-template-kicker">{{activeKey==1?'经典验方':'协定方'}}</div>
              <div class="prescription-template-title">{{templateInfo.detail.ProName || '--'}}</div>
            </div>
          </section>

          <section class="prescription-template-section">
            <div class="prescription-template-section-title">模板信息</div>
            <a-descriptions class="prescription-template-descriptions" bordered :column="1" :labelStyle="{ width: '140px' }">
              <a-descriptions-item label="分类">{{templateInfo.detail.RecipelName || '--'}}</a-descriptions-item>
              <a-descriptions-item :label="item.Name" v-for="(item,index) in templateInfo.detail.Attrs" :key="index">{{item.Value || '--'}}</a-descriptions-item>
            </a-descriptions>
          </section>

          <section class="prescription-template-section">
            <div class="prescription-template-section-title">
              <span>{{templateInfo.detail.RecipelName || '处方'}}-{{ templateInfo.detail.MedicineTypeName || '饮片' }}</span>
              <span>共{{templateInfo.materialsList.length}}味药</span>
            </div>
            <div class="prescription-template-material-grid">
              <div class="prescription-template-material-card" v-for="(item,index) in templateInfo.materialsList" :key="index">
                <span>{{item.MaterialName || '--'}}</span>
                <strong>{{item.Weight || '--'}}g</strong>
              </div>
            </div>
            <div class="prescription-template-usage">
              <span>{{templateInfo.detail.MedicineTypeName || '--'}}</span>
              <span>{{templateInfo.detail.UseMethodName || '--'}}</span>
              <span>{{templateInfo.detail.DailyFrequencyName || '--'}}</span>
              <span>单次剂量：{{templateInfo.detail.PerDoseAmount || '--'}}{{templateInfo.detail.DoseUnitName || ''}}</span>
              <span>{{templateInfo.detail.TakeTimeName || '--'}}</span>
              <span>疗程：{{templateInfo.detail.CertNumber || '--'}}</span>
            </div>
          </section>
        </div>
        
        <div class="prescription-template-footer justify-end">
          <a-button class="prescription-template-primary-btn" type="primary" v-if="isModal" @click="handleUseTemplate">使用此模板</a-button>
        </div>
      </div>

      <div class="prescription-template-detail flex-sub" v-else>
        <div class="prescription-template-detail-scroll overflow-y-scroll scrollbar-none">
          <section class="prescription-template-hero">
            <div class="prescription-template-hero-main">
              <div class="prescription-template-kicker">常用方</div>
              <div class="prescription-template-title">{{templateInfo.detail.Name || '--'}}</div>
            </div>
          </section>

          <section class="prescription-template-section">
            <div class="prescription-template-section-title">模板信息</div>
            <a-descriptions class="prescription-template-descriptions" bordered :column="2" :labelStyle="{ width: '80px' }">
              <a-descriptions-item label="分类">{{templateInfo.detail.CategoryName || '--'}}</a-descriptions-item>
              <a-descriptions-item label="来源">{{templateInfo.detail.Source || '--'}}</a-descriptions-item>
              <a-descriptions-item label="功用" :span="2">{{templateInfo.detail.Effect || '--'}}</a-descriptions-item>
              <a-descriptions-item label="主治" :span="2">{{templateInfo.detail.Indication || '--'}}</a-descriptions-item>
              <a-descriptions-item label="加减" :span="2">{{templateInfo.detail.Modification || '--'}}</a-descriptions-item>
            </a-descriptions>
          </section>

          <section class="prescription-template-section" v-if="templateInfo.materialsList.length">
            <div class="prescription-template-section-title">
              <span>中药处方-饮片</span>
              <span>共{{templateInfo.materialsList.length}}味药</span>
            </div>
            <div class="prescription-template-material-grid">
              <div class="prescription-template-material-card" v-for="(item,index) in templateInfo.materialsList" :key="index">
                <span>{{item.MaterialName || '--'}}</span>
                <strong>{{item.Weight || '--'}}g</strong>
              </div>
            </div>
            <div class="prescription-template-usage">
              <span>{{templateInfo.detail.DoseCount || 1}}剂</span>
              <span>{{templateInfo.detail.DosageFormName || '--'}}</span>
              <span>{{templateInfo.detail.UseMethodName || '--'}}</span>
              <span>{{templateInfo.detail.FrequencyName || '--'}}</span>
              <span>单次剂量：{{templateInfo.detail.EachDose || '--'}}{{templateInfo.detail.DoseUnitName || ''}}</span>
              <span>{{templateInfo.detail.TakeTimeName || '--'}}</span>
              <span v-if="templateInfo.detail.TakeDays">{{templateInfo.detail.TakeDays}}天</span>
            </div>
          </section>
        </div>
        
        <div class="prescription-template-footer justify-between">
          <a-space>
            <a-button class="prescription-template-action-btn" type="primary" ghost @click="editTemplate('edit')">编辑</a-button>
            <a-button class="prescription-template-action-btn" type="primary" danger ghost @click="handleDeletePrescription">删除</a-button>
          </a-space>
          <a-button class="prescription-template-primary-btn" type="primary" v-if="isModal" @click="handleUseTemplate">使用此模板</a-button>
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
  import { ref,computed,h,onMounted,createVNode,watch,nextTick} from 'vue';
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

  const emit = defineEmits(['use-template','ready'])
  const { createMessage} = useMessage()
  const go = useGo();
  const loading = ref(false);
  const activeKey = ref(props.activeKey)
  const initialReady = ref(false)
  const templateCache = ref({})
  const templateCategoryCache = ref({})
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
    getCategoryList(true)
  })

  const waitStableFrame = async () => {
    await nextTick()
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  }

  const markInitialReady = async () => {
    if(initialReady.value){
      return
    }
    await waitStableFrame()
    initialReady.value = true
    emit('ready')
  }

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

  const getCategoryRequest = (key = activeKey.value) => {
    if(key==1||key==2){
      return {
        api: TemplateApiCtrl.SystemPrescriptCategoryList,
        query: {recipel:key==1?4:3},
      }
    }
    return {
      api: TemplateApiCtrl.CategoryList,
      query: {type:1,limit:100},
    }
  }

  const getListRequest = (key, categoryId, searchKeyword = keyword.value) => {
    if(key==1||key==2){
      return {
        api: TemplateApiCtrl.SystemPrescriptList,
        query: { recipel: key == 1 ? 4 : 3, categoryId, limit:100, keyword:searchKeyword},
      }
    }
    return {
      api: TemplateApiCtrl.PrescriptList,
      query: { categoryId, keyword:searchKeyword, auditStatus:1},
    }
  }

  const getDetailRequest = (key, id) => {
    return {
      api: key==1||key==2 ? TemplateApiCtrl.SystemPrescriptDetail : TemplateApiCtrl.PrescriptDetail,
      query: { id },
    }
  }

  const normalizeDetailData = (key, data) => {
    if(key==1||key==2){
      const detail = cloneDeep(data.Details?.[0] || {})
      detail.CertNumber=data.CertNumber
      return {
        detail,
        materialsList: data.Details?.[0]?.Materials || [],
      }
    }
    return {
      detail: data.Template || {},
      materialsList: data.Details || [],
    }
  }

  const applyTemplateCache = (key, categoryId) => {
    const cached = templateCache.value[key]?.[categoryId]
    if(!cached){
      return false
    }
    templateInfo.value.list = cloneDeep(cached.list)
    templateInfo.value.id = cached.id
    templateInfo.value.materialsList = cloneDeep(cached.materialsList)
    templateInfo.value.detail = cloneDeep(cached.detail)
    return true
  }

  const preloadTemplateCache = async () => {
    const keys = [1,2,3]
    await Promise.all(keys.map(async (key) => {
      const categoryRequest = getCategoryRequest(key)
      const categoryData = await categoryRequest.api(categoryRequest.query).catch(() => ({ Rows: [] }))
      const categories = categoryData.Rows || categoryData || []
      templateCategoryCache.value[key] = categories
      templateCache.value[key] = templateCache.value[key] || {}
      await Promise.all(categories.map(async (category) => {
        const listRequest = getListRequest(key, category.Id, '')
        const listData = await listRequest.api(listRequest.query).catch(() => ({ Rows: [] }))
        const list = listData.Rows || listData || []
        const selectedId = list.length ? list[0].Id : null
        let detail = {}
        let materialsList:any[] = []
        if(selectedId){
          const detailRequest = getDetailRequest(key, selectedId)
          const detailData = await detailRequest.api(detailRequest.query).catch(() => null)
          if(detailData){
            const normalized = normalizeDetailData(key, detailData)
            detail = normalized.detail
            materialsList = normalized.materialsList
          }
        }
        templateCache.value[key][category.Id] = {
          list,
          id: selectedId,
          detail,
          materialsList,
        }
      }))
    }))
  }

  // 获取模板分类
  const getCategoryList=(isInitial = false)=>{
    if(!isInitial && !keyword.value && templateCategoryCache.value[activeKey.value]){
      categoryInfo.value.list=cloneDeep(templateCategoryCache.value[activeKey.value])
      if(categoryInfo.value.list.length){
        categoryInfo.value.id=categoryInfo.value.list[0].Id
        applyTemplateCache(activeKey.value, categoryInfo.value.id)
      }else{
        categoryInfo.value.id=null
        templateInfo.value.id=null
        templateInfo.value.list=[]
        templateInfo.value.materialsList=[]
        templateInfo.value.detail={}
      }
      return Promise.resolve()
    }
    loading.value=true
    const request = getCategoryRequest()
    return request.api(request.query).then(data=>{
      categoryInfo.value.list=data.Rows||data
      if(categoryInfo.value.list.length){
        categoryInfo.value.id=categoryInfo.value.list[0].Id
        if(isInitial){
          return preloadTemplateCache().then(() => {
            applyTemplateCache(activeKey.value, categoryInfo.value.id)
            return markInitialReady()
          })
        }
        return getPrescriptList(false)
      }else{
        categoryInfo.value.id=null
        categoryInfo.value.list=[]
        templateInfo.value.id=null
        templateInfo.value.list=[]
        templateInfo.value.materialsList=[]
        templateInfo.value.detail={}
        if(isInitial){
          return markInitialReady()
        }
      }
    }).catch(() => {
      if(isInitial){
        return markInitialReady()
      }
    }).finally(() => {loading.value=false })
  }

  // 获取模板列表
  const getPrescriptList = (manageLoading = true) => {
    if(manageLoading){
      loading.value = true
    }
    const request = getListRequest(activeKey.value, categoryInfo.value.id)
    return request.api(request.query).then(data => {
      templateInfo.value.list = data.Rows || data
      if (templateInfo.value.list.length) {
        templateInfo.value.id = templateInfo.value.list[0].Id
        return getPrescriptDetail(false)
      }
      templateInfo.value.id=null
      templateInfo.value.materialsList=[]
      templateInfo.value.detail={}
    }).catch(() => {}).finally(() => {
      if(manageLoading){
        loading.value = false
      }
    })
  }

  // 获取模板详情
  const getPrescriptDetail = (manageLoading = true) => {
    if(manageLoading){
      loading.value = true
    }
    const request = getDetailRequest(activeKey.value, templateInfo.value.id)
    return request.api(request.query).then(data => {
      const normalized = normalizeDetailData(activeKey.value, data)
      templateInfo.value.detail=normalized.detail
      templateInfo.value.materialsList=normalized.materialsList
    }).catch(() => {}).finally(() => {
      if(manageLoading){
        loading.value = false
      }
    })
  }

  // 切换分类
  const changeClassify = (item) => {
    categoryInfo.value.id = item.Id
    if(keyword.value || !applyTemplateCache(activeKey.value, item.Id)){
      getPrescriptList()
    }
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
    const detail = templateInfo.value.detail?.Template || templateInfo.value.detail || {}
    Modal.confirm({
      title: '删除提示',
      centered:true,
      content:`您确定要删除处方模板：${detail.Name || '当前模板'}？`,
      icon: createVNode(ExclamationCircleOutlined),
      onOk() {
        loading.value=true
        TemplateApiCtrl.DeletePrescript({id: detail.Id || templateInfo.value.id}).then(data => {
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
.prescription-template-root {
  height: 100%;
  min-height: 100%;
}

.prescription-template-panel {
  height: 100%;
  min-height: 100%;
  background: #FFFFFF;
}

.prescription-template-sidebar {
  display: flex;
  flex-direction: column;
  align-self: stretch;
  min-height: 100%;
  background: #F5F7FA;
  border-right: 1px solid #E7EEF8;
}

.prescription-template-category-list {
  min-height: 0;
  width: 132px;
}

.prescription-template-list {
  min-height: 0;
}

.prescription-template-category-item,
.prescription-template-list-item {
  transition: background-color .18s ease, color .18s ease, box-shadow .18s ease;
}

.prescription-template-category-item:hover,
.prescription-template-list-item:hover {
  background: #EEF5FF;
}

.prescription-template-list-item + .prescription-template-list-item {
  margin-top: 4px;
}

.prescription-template-sidebar-actions {
  margin-top: auto;
  background: transparent;
}

.prescription-template-detail {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  background: #FFFFFF;
}

.prescription-template-detail-scroll {
  flex: 1;
  min-height: 0;
  padding: 24px 24px 8px;
}

.prescription-template-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 92px;
  padding: 20px 24px 20px 26px;
  border: 1px solid #DCE6F3;
  border-radius: 16px;
  background: #FFFFFF;
  box-shadow: inset 0 0 0 1px rgba(238, 245, 255, .72);
}

.prescription-template-hero::before {
  position: absolute;
  top: 20px;
  bottom: 20px;
  left: 0;
  width: 4px;
  border-radius: 0 6px 6px 0;
  background: #0A5AFF;
  content: '';
}

.prescription-template-hero-main {
  min-width: 0;
}

.prescription-template-kicker {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border: 1px solid #DCE6F3;
  border-radius: 8px;
  background: #EEF5FF;
  color: #0A5AFF;
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
}

.prescription-template-title {
  margin-top: 10px;
  color: #1F2B3D;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  word-break: break-word;
}

.prescription-template-section {
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid #E7EEF8;
  border-radius: 12px;
  background: #FFFFFF;
}

.prescription-template-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px dashed #CFE0F8;
  background: #EEF5FF;
  color: #1F2B3D;
  font-size: 15px;
  font-weight: 500;

  span:last-child {
    color: #4E70A8;
    font-size: 13px;
    font-weight: 400;
  }
}

.prescription-template-descriptions {
  :deep(.ant-descriptions-view) {
    border: 0;
  }

  :deep(.ant-descriptions-item-label) {
    color: #5F6A7A;
    font-weight: 400;
    background: #FAFAFA;
  }

  :deep(.ant-descriptions-item-content) {
    color: #000000;
    font-weight: 400;
    line-height: 22px;
    white-space: pre-wrap;
    background: #FFFFFF;
  }

  :deep(.ant-descriptions-bordered .ant-descriptions-item-label),
  :deep(.ant-descriptions-bordered .ant-descriptions-item-content) {
    border-color: #F0F0F0;
  }
}

.prescription-template-material-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 12px;
  padding: 14px 16px;
}

.prescription-template-material-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 38px;
  padding: 8px 12px;
  border: 1px solid #E7EEF8;
  border-radius: 8px;
  background: #FFFFFF;

  span {
    min-width: 0;
    overflow: hidden;
    color: #1F2B3D;
    font-size: 14px;
    font-weight: 400;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    flex: none;
    color: #0A5AFF;
    font-size: 14px;
    font-weight: 500;
  }
}

.prescription-template-usage {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  padding: 12px 16px;
  border-top: 1px dashed #DCE6F3;
  background: #F9FBFD;

  span {
    padding: 4px 10px;
    border: 1px solid #DCE6F3;
    border-radius: 8px;
    background: #FFFFFF;
    color: #4E5766;
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }
}

.prescription-template-footer {
  display: flex;
  align-items: center;
  flex: none;
  min-height: auto;
  padding: 8px 24px 20px;
  background: transparent;
}

.prescription-template-primary-btn {
  min-width: 128px;
}

.prescription-template-action-btn {
  border-radius: 8px;
}

.activeClassify{
  border-radius: 8px 0 0 8px;
  border-left: 3px solid #D8E4FB;
  background: #FFF;
}
.classifyList{
  flex: 1;
  min-height: 0;
  height: auto !important;
  margin-top: -16px;
}
</style>
