<template>
  <div>
    <div class="flex justify-between align-center flex-wrap">
      <div class="text-18px text-bold mb12px">
        <img class="w28px h28px" src="../../../assets/images/yaofang.png" alt="">
        <span class="ml4px">云药房处方</span>
      </div>
      <div class="flex align-center flex-wrap gap12px mb12px">
        <div class="pt2px pb2px pr2px bg-[#f6f8fc] border-rd-4px flex align-center">
          <div class="pl8px pr8px">合作医院</div>
          <a-select class="w180px" v-model:value="defaultValue" placeholder="合作医院" allowClear>
            <a-select-option :value="1">蒙医云医院</a-select-option>
          </a-select>
        </div>
        <div class="pt2px pb2px pr2px bg-[#f6f8fc] border-rd-4px flex align-center">
          <div class="pl8px pr8px">调配中心</div>
          <a-select class="w180px" v-model:value="defaultValue" placeholder="调配中心" allowClear>
            <a-select-option :value="1">蒙医云中央智慧蒙药房</a-select-option>
          </a-select>
        </div>
        <a-button type="primary" @click="addPrescription">
          <template #icon><PlusOutlined /></template>
          添加新处方
        </a-button>
      </div>
    </div>

    <div class="flex justify-between align-center">
      <div class="bg-[#e1ebff] text-theme border-rd-4px px12px py7px text-bold pointer" @click="prescriptionVisible=true">处方模板</div>
      <div class="color-[#4E5766]">共计{{prescription.list.length}}个处方</div>
    </div>
    <a-form :model="prescription" ref="prescriptionFormIns">
      <div class="mt12px" v-for="(item,index) in prescription.list" :key="index">
        <div class="border-rd-12px border border-color-[#e1ebff] overflow-hidden">
          <div class="pt12px pb12px pl16px pr16px bg-[#F9FBFD] flex justify-between align-center">
            <div class="flex align-center">
              <div class="w14px h14px border-rd-50% border border-color-[#0A5AFF] border-width-2px"></div>
              <div class="color-[#4E5766] ml4px whitespace-nowrap">处方{{index+1}}：</div>
              <a-input class="w300px" size="small" v-model:value="item.Name" :bordered="false" :placeholder="`处方模板名称 (不填写默认名：处方${index+1})`" />
            </div>
            <a-space :size="4">
              <div class="color-[#565E74]" v-if="!item.ProId">共{{item.Materials.length}}味药</div>
              <div class="color-[#565E74]" v-else>经典验方/协定方（仅可调整剂数）</div>
              <a-divider type="vertical" v-if="!item.ProId" />
              <a-button type="link" danger size="small" @click="clearMaterials(index)" v-if="!item.ProId">清空药材</a-button>
              <a-divider type="vertical" v-if="!item.ProId" />
              <DeleteTwoTone two-tone-color="#e02424" @click="deletePrescription(index)" />
              <a-divider type="vertical" v-if="!item.ProId" />
              <a-button type="link" size="small" @click="handleSave(index)" v-if="!item.ProId">保存为常用方</a-button>
            </a-space>
          </div>

          <div class="pt24px pb24px pl16px pr16px" v-if="!item.ProId">
            <a-space :size="[24, 12]" wrap>
              <MaterialInput
                v-for="(p, i) in item.Materials" 
                :key="i"
                v-model:material-id="p.MaterialId"
                v-model:material-name="p.MaterialName"
                v-model:weight="p.Weight"
                :group-materials="item.Materials" 
                :self-index="i"
                :show-delete="i !== 0&&p.MaterialId!=null"
                @delete="item.Materials.splice(i, 1); $emit('doseChange')"
                @add-new="item.Materials.push({ Sort: 1, MaterialId: null, MaterialName: '', Weight: null }); $emit('doseChange')"
                @update:weight="$emit('doseChange')"
              />
            </a-space>
          </div>
          <div class="pt16px pb16px pl16px pr16px" v-else>
            <a-space :size="[12, 8]" wrap>
              <template v-for="(p, i) in item.Materials" :key="i">
                <div class="border border-rd-4px border-color-[#E9ECEF] pt7px pb7px pl12px pr12px flex align-center" v-if="p.MaterialId">
                  <span class="color-[#333] text-bold">{{p.MaterialName}}</span>
                  <a-divider type="vertical" />
                  <span class="color-[#666]">{{p.Weight}}g</span>
                </div>
              </template>
            </a-space>
          </div>

          <div class="px8px pb8px">
            <div class="flex mt12px flex-wrap gap12px medicinePlan">
              <a-form-item :name="['list', index, 'DoseCount']" :rules="{required: true,message: '该项必须填写',trigger: 'blur'}">
                <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pr8px">
                  <a-input-number class="DoseCount" style="width:78px !important;" id="inputNumber" size="small" :controls="false" v-model:value="item.DoseCount" :bordered="false" :min="0" placeholder="默认数量1" @change="(val) => val && $emit('doseChange')" />
                  <div>剂</div>
                </div>
              </a-form-item>
              <template v-if="!item.ProId">
                <a-form-item class="w150px" :name="['list', index, 'DosageForm']" :rules="{required: true,message: '该项必须选择',trigger: 'change'}">
                  <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px whitespace-nowrap">
                    <div>剂型：</div>
                    <a-select class="border-rd-4px bg-[#F6F8FC]" v-model:value="item.DosageForm" placeholder="请选择" :bordered="false" allowClear>
                      <a-select-option :value="String(item.id)" v-for="(item,index) in MedicineType" :key="index">{{item.name}}</a-select-option>
                    </a-select>
                  </div>
                </a-form-item>
                <a-form-item class="w120px" :name="['list', index, 'UseMethod']" :rules="{required: true,message: '该项必须选择',trigger: 'change'}">
                  <a-select class="border-rd-4px bg-[#F6F8FC]" v-model:value="item.UseMethod" placeholder="用法" :bordered="false" allowClear>
                    <a-select-option :value="item.id" v-for="(item,index) in ChineseMedicineUseMethod" :key="index">{{ item.name }}</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item class="w180px" :name="['list', index, 'Frequency']" :rules="{required: true,message: '该项必须选择',trigger: 'change'}">
                  <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px whitespace-nowrap">
                    <div>每日次数：</div>
                    <a-select class="border-rd-4px bg-[#F6F8FC]" v-model:value="item.Frequency" placeholder="请选择" :bordered="false" allowClear>
                      <a-select-option :value="String(item.id)" v-for="(item,index) in ChineseMedicineDailyFrequency" :key="index">{{item.name}}</a-select-option>
                    </a-select>
                  </div>
                </a-form-item>
                <a-form-item :name="['list', index, 'EachDose']" :rules="{required: true,message: '该项必须填写',trigger: 'blur'}">
                  <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pl8px">
                    <div>单次剂量：</div>
                    <a-input-number style="width:78px !important;" id="inputNumber" size="small" :controls="false" v-model:value="item.EachDose" :bordered="false" :min="0" placeholder="请输入" />
                  </div>
                </a-form-item>
                <a-form-item class="w140px" :name="['list', index, 'DoseUnit']" :rules="{required: true,message: '该项必须选择',trigger: 'change'}">
                  <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px whitespace-nowrap">
                    <div>剂量单位：</div>
                    <a-select class="border-rd-4px bg-[#F6F8FC]" v-model:value="item.DoseUnit" placeholder="请选择" :bordered="false" allowClear>
                      <a-select-option :value="item.id" v-for="(item,index) in ChineseMedicineDoseUnit" :key="index">{{item.name}}</a-select-option>
                    </a-select>
                  </div>
                </a-form-item>
                <a-form-item class="w200px" :name="['list', index, 'TakeTime']" :rules="{required: true,message: '该项必须选择',trigger: 'change'}">
                  <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px whitespace-nowrap">
                    <div>服用时间：</div>
                    <a-select class="border-rd-4px bg-[#F6F8FC]" v-model:value="item.TakeTime" placeholder="请选择" :bordered="false" allowClear>
                      <a-select-option :value="String(item.id)" v-for="(item,index) in ChineseMedicineMedicationTime" :key="index">{{item.name}}</a-select-option>
                    </a-select>
                  </div>
                </a-form-item>
                <a-form-item>
                  <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pr8px">
                    <a-input-number id="inputNumber" style="width:78px !important;" :controls="false" size="small" v-model:value="item.TakeDays" :bordered="false" placeholder="服药天数(选填)" :min="0" />
                    <div>天</div>
                  </div>
                </a-form-item>
              </template>
              <template v-else>
                <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold px8px py7px whitespace-nowrap">剂型：{{ item.MedicineTypeName }}</div>
                <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold px8px py7px whitespace-nowrap">{{ item.UseMethodName }}</div>
                <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold px8px py7px whitespace-nowrap">每日次数：{{ item.DailyFrequencyName }}</div>
                <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold px8px py7px whitespace-nowrap">单次剂量：{{ item.PerDoseAmount }}{{ item.DoseUnitName }}</div>
                <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold px8px py7px whitespace-nowrap">服用时间：{{ item.TakeTimeName }}</div>
                <div class="border-rd-4px bg-[#F6F8FC] flex align-center text-bold px8px py7px whitespace-nowrap">疗程：{{ item.CertNumber }}</div>
              </template>
            </div>
            <div class="flex justify-between align-center mt12px" v-if="!item.ProId">
              <div class="flex-sub border-rd-8px border border-color-[#F3F4F7] flex p16px ">
                <div class="text-bold whitespace-nowrap line-height-22px">服药建议</div>
                <a-textarea size="small" v-model:value="item.Advice" :rows="1" :bordered="false" :auto-size="{ minRows: 2}" placeholder="请输入服药建议" />
              </div>
              <div class="flex-sub border-rd-8px border border-color-[#F3F4F7] flex p16px ml12px">
                <div class="text-bold whitespace-nowrap line-height-22px">其他备注</div>
                <a-textarea size="small" v-model:value="item.Remark" :rows="1" :bordered="false" :auto-size="{ minRows: 2}" placeholder="请输入服药建议" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-form>


    <a-modal v-model:open="templateModal.visible" title="保存为常用方模板" centered width="600px" @ok="saveTemplate" :maskClosable="false" destroyOnClose>
      <section class="padding-lr32">
        <a-form :model="templateModal.form" :labelCol="{ style: 'width: 100px' }" :wrapperCol="{span:16}" :rules="templateModal.rules" ref="templateFormIns">
          <a-form-item label="模板分类" name="CategoryId">
            <a-select v-model:value="templateModal.form.CategoryId" placeholder="请选择" allowClear showSearch optionFilterProp="title">
              <a-select-option :value="item.Id" v-for="(item,index) in categoryList" :key="index" :title="item.Name">{{item.Name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="模板名称" name="Name">
            <a-input v-model:value="templateModal.form.Name" placeholder="请填写"></a-input>
          </a-form-item>
        </a-form>
      </section>
    </a-modal>

    <a-modal v-model:open="prescriptionVisible" centered width="1080px" :maskClosable="false" destroyOnClose :footer="null">
      <div style="height: calc(100vh - 200px);">
        <PrescriptionTemplate :isModal="true" @use-template="handleTemplateSelect"></PrescriptionTemplate>
      </div>
    </a-modal>


    <a-modal v-model:open="callTemplateVisible" title="调用模板" centered width="500px" :maskClosable="false" destroyOnClose>
      <div class="text-center">
        <div class="text-18px text-bold">"{{templateInfo.ProName||templateInfo.Name}}"</div>
        <div class="mt12px">作为汤头添加到当前处方，还是新起一个处方？</div>
      </div>
      <template #footer>
        <a-space>
          <a-button type="primary" @click="callTemplateSave(1)">添加</a-button>
          <a-button type="primary" @click="callTemplateSave(2)">新起</a-button>
          <a-button @click="callTemplateVisible=false">取消</a-button>
        </a-space>
			</template>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { computed, onMounted,ref,watch} from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {PlusOutlined,DeleteTwoTone} from '@ant-design/icons-vue';
  import {basicEnum} from '/@/api/platform/common';
  import { cloneDeep } from 'lodash-es';
  import {TemplateApiCtrl} from '/@/api/myy/template';
  import MaterialInput from '/@/components/MaterialInput.vue';
  import PrescriptionTemplate from '/@/components/PrescriptionTemplate.vue';
  const prescriptionVisible=ref(false)
  
  const props = defineProps({
    prescriptionList: Array<any>,
  });
  const emit = defineEmits(['update:prescription-list','add'])
  const { createMessage} = useMessage()
  const defaultValue=ref(1)
  const prescriptionFormIns=ref()
  const templateFormIns=ref()
  const templateInfo=ref({})
  const callTemplateVisible=ref(false)
  const ChineseMedicineUseMethod=ref([])
  const ChineseMedicineDailyFrequency=ref([])
  const MedicineType=ref([])
  const ChineseMedicineDoseUnit=ref([])
  const ChineseMedicineMedicationTime=ref([])
  const categoryList=ref([])
  const complete=ref(false)
  const prescriptionForm={
    Name:'',
    Advice:'',
    Remark:'',
    DoseCount:null,
    DosageForm:null,
    UseMethod:null,
    DoseUnit:null,
    Frequency:null,
    EachDose:null,
    TakeTime:null,
    TakeDays:null,
    ProId: null,
    Materials:[{Sort:1,MaterialId:null,MaterialName:'',Weight:null}]
  }
  const prescription = ref({
    list: cloneDeep(props.prescriptionList || [])
  })
  watch(() => prescription.value.list, (newList) => {
    emit('update:prescription-list', cloneDeep(newList));
  }, { deep: true })

  watch(() => props.prescriptionList, (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(prescription.value.list)) {
      prescription.value.list = cloneDeep(newVal);
    }
  }, { deep: true })

  const templateModal=ref({
    visible:false,
    loading:false,
    form:{
      CategoryId:null,
      Name:'',
    },
    rules: {
      Name: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      CategoryId: [{required: true,trigger: 'change',message: '该项必须选择',type:'string'}],
    }
  })

  onMounted(()=>{
    getBasicEnum()
    getCategoryList()
  })

  const getBasicEnum=()=>{
    basicEnum({name:'ChineseMedicineUseMethod'}).then(data=>{
      ChineseMedicineUseMethod.value=data
    })
    basicEnum({name:'MedicineType'}).then(data=>{
      MedicineType.value=data
    })
    basicEnum({name:'ChineseMedicineDailyFrequency'}).then(data=>{
      ChineseMedicineDailyFrequency.value=data
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

  const addPrescription=()=>{
    prescription.value.list.push(cloneDeep(prescriptionForm))
  }

  const handleSave = async (index: number) => {
    try {
      await prescriptionFormIns.value.validateFields([
        ['list', index, 'DoseCount'],
        ['list', index, 'DosageForm'],
        ['list', index, 'DoseUnit'],
        ['list', index, 'UseMethod'],
        ['list', index, 'Frequency'],
        ['list', index, 'EachDose'],
        ['list', index, 'TakeTime']
      ])
      const formData =cloneDeep(prescription.value.list[index])
      let isComplete=true
      let materialLists=formData.Materials.filter(item=>item.MaterialId)
      if(materialLists.length){
        isComplete=!materialLists.some(item =>item.Weight==null||item.Weight==0);
      }else{
        isComplete=false
      }
      if(!isComplete){
        createMessage.error(`请完善处方药材用量`);
        return
      }
      delete formData.Materials
      templateModal.value.form={
        CategoryId:null,
        Name:formData.Name,
        Details:materialLists,
        ...formData,
      }
      templateModal.value.visible=true
    } catch (error) {}
  }

  const saveTemplate=()=>{
    templateFormIns.value.validate().then(() => {
      const formData =cloneDeep(templateModal.value.form)
      templateModal.value.loading = true
      TemplateApiCtrl.SavePrescript(formData).then(data => {
        createMessage.success(`保存成功`);
        templateModal.value.visible=false
      }).catch(() => {}).finally(() => { templateModal.value.loading = false })
    })
  }

  const clearMaterials=(index)=>{
    if (prescription.value.list[index].ProId) return
    prescription.value.list[index].Materials=[{Sort:1,MaterialId:null,MaterialName:'',Weight:null}]
    emit('doseChange')
  }
  
  const deletePrescription=(index)=>{
    prescription.value.list.splice(index,1)
    emit('doseChange')
  }

  const computeMedicineCost=computed(()=>{
    return (val)=>{
      let materialLists=val.filter(item=>item.MaterialId)
      if(materialLists){
        let total=0
        materialLists.forEach(element => {
          total+=Number(element.Price)*Number(element.Weight)
        })
        return total
      }else{
        return 0
      }
    }
  })

  const handleTemplateSelect = (templateDetail, activeKey) => {
    if(templateDetail){
      templateInfo.value=templateDetail
      templateInfo.value._activeKey=activeKey
      prescriptionVisible.value=false
      const cleanedList = prescription.value.list.filter(item => {
        return item.Materials.some(material => material.MaterialId!=null)
      })
      prescription.value.list = cleanedList;
      if(activeKey==3){
        // if(cleanedList.length){
        //   callTemplateVisible.value=true
        // }else{
        //   callTemplateSave(2)
        // }
        callTemplateSave(2)
      }else{
        templateInfo.value.DoseCount=1
        callTemplateSave(2)
      }
    }
  }

  const callTemplateSave=(type)=>{
    const isSystem = Number(templateInfo.value._activeKey) === 1 || Number(templateInfo.value._activeKey) === 2
    if(type==1){
      let materialLists=prescription.value.list[0].Materials.filter(item=>item.MaterialId)
      const materialMap = new Map();
      materialLists.forEach(item => {
        materialMap.set(item.MaterialId, item)
      })
      prescription.value.list[0].Materials = [
        ...Array.from(materialMap.values()),
        { Sort: 1, MaterialId: null, MaterialName: '', Weight: null }
      ];
      if (isSystem) {
        prescription.value.list[0].ProId = templateInfo.value.ProId
        templateInfo.value.Materials.forEach(item => {
          materialMap.set(item.MaterialId, item);
        });
      }else{
        templateInfo.value.Details.forEach(item => {
          materialMap.set(item.MaterialId, item);
        });
      }
    }else{
      const newItem = {...templateInfo.value,Materials:[...templateInfo.value.Details||templateInfo.value.Materials,{Sort:1,MaterialId:null,MaterialName:'',Weight:null}]}
      if (isSystem) {
        newItem.ProId = templateInfo.value.ProId
      }
      prescription.value.list.push(newItem)
    }
    emit('add')
    callTemplateVisible.value=false
  }

  async function savePrescript() {
    complete.value = false;
    
    const validPrescriptions = prescription.value.list.filter(item => 
      item.Materials.some(p => p.MaterialId != null)
    );
    
    // 必须有一项处方
    if (validPrescriptions.length === 0) {
      createMessage.error('请至少添加一项有效处方')
      complete.value = false;
      return false;
    }
    
    const nonTemplateItems = validPrescriptions.filter(item => !item.ProId)
    const hasInvalidWeight = nonTemplateItems.some(item => 
      item.Materials.some(p => p.MaterialId && (p.Weight == null || p.Weight == 0))
    );
    
    if (hasInvalidWeight) {
      createMessage.error(`请完善处方药材用量`);
      complete.value = false;
      return false;
    }
    
    for (const item of nonTemplateItems) {
      const realIndex = prescription.value.list.indexOf(item);
      if (realIndex === -1) { continue; }
      
      try {
        await prescriptionFormIns.value.validateFields([
          ['list', realIndex, 'DoseCount'],
          ['list', realIndex, 'DosageForm'],
          ['list', realIndex, 'DoseUnit'],
          ['list', realIndex, 'UseMethod'],
          ['list', realIndex, 'Frequency'],
          ['list', realIndex, 'EachDose'],
          ['list', realIndex, 'TakeTime']
        ]);
      } catch (error) {
        complete.value = false;
        createMessage.error('请完善处方信息（请查看页面上的红色提示）');
        return false; 
      }
    }
    complete.value = true;
    return true;
  }

  function getMaterialList() {
    const materials=[]
    prescription.value.list.forEach(item => {
      item.Materials.forEach(p => {
        if (p.MaterialId && p.Weight) {
          materials.push({ ...p, Count: p.Weight * item.DoseCount })
        }
      })
    })
    return materials
  }

  defineExpose({
    savePrescript,
    getMaterialList
  })
</script>
<style lang="less" scoped>
.ant-input {
  &-number,
  &-number-group-wrapper {
    width:50px !important;
    min-width: 50px;
    max-width: 100%;
  }
}
.DoseCount ::v-deep(.ant-input-number-input){
  color: red !important;
}
.medicinePlan .ant-form-item{
  margin-bottom: 0 !important;
}
</style>