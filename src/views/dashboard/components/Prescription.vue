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
        <a-button class="prescription-system-radius-btn" type="primary" @click="addPrescription">
          <template #icon><PlusOutlined /></template>
          添加新处方
        </a-button>
      </div>
    </div>

    <div class="flex justify-between align-center">
      <div class="prescription-system-radius-btn bg-[#e1ebff] text-theme border-rd-4px px12px py7px text-bold pointer" @click="openPrescriptionTemplate">处方模板</div>
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
              <div class="color-[#565E74]" v-else>经典验方/协定方（药材不可调整）</div>
              <a-divider type="vertical" v-if="!item.ProId" />
              <a-button type="link" danger size="small" @click="clearMaterials(index)" v-if="!item.ProId">清空药材</a-button>
              <a-divider type="vertical" v-if="!item.ProId" />
              <DeleteTwoTone two-tone-color="#e02424" @click="deletePrescription(index)" />
              <a-divider type="vertical" v-if="!item.ProId" />
              <a-button type="link" size="small" @click="handleSave(index)" v-if="!item.ProId">保存为常用方</a-button>
            </a-space>
          </div>

          <div class="pt24px pb0px pl16px pr16px" v-if="!item.ProId">
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
                @add-new="item.Materials.push({ Sort: 1, MaterialId: null, MaterialName: '', Weight: null })"
                @update:weight="$emit('doseChange')"
              />
            </a-space>
          </div>
          <div class="pt24px pb0px pl16px pr16px" v-else>
            <a-space :size="[24, 12]" wrap>
              <template v-for="(p, i) in readonlyMaterials(item)" :key="i">
                <div class="template-material-readonly flex justify-between align-center border border-rd-4px border-color-[#E9ECEF] pt7px pb7px pr12px pl5px position-relative">
                  <a-input class="w180px template-material-name" size="small" :value="p.MaterialName" :bordered="false" readonly />
                  <a-divider type="vertical" />
                  <a-input-number class="template-material-weight" size="small" :controls="false" :value="p.Weight" :bordered="false" :min="0" readonly />
                  <span>g</span>
                </div>
              </template>
            </a-space>
          </div>

          <div class="pl16px pr8px pb8px">
            <div class="flex medicinePlan">
              <div class="medicine-plan-bar">
              <a-form-item class="medicine-plan-item medicine-plan-item-count medicine-plan-item-editable" :name="['list', index, 'DoseCount']" :rules="{validator: validateDoseCount, trigger: 'blur'}">
                <div class="medicine-plan-field medicine-plan-field-count medicine-plan-field-filled border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pr8px">
                  <a-input-number :ref="(el) => setMedicinePlanRef(el, index, 'DoseCount')" class="DoseCount" style="width:32px !important;" id="inputNumber" size="small" :controls="false" v-model:value="item.DoseCount" :bordered="false" :min="1" :precision="0" placeholder="1" @focus="selectMedicinePlanNumber" @blur="normalizeMedicinePlanNumber(index, 'DoseCount', { integer: true, required: true, min: 1 })" @change="(val) => { normalizeMedicinePlanNumber(index, 'DoseCount', { integer: true, required: true, min: 1 }); val && $emit('doseChange') }" />
                  <div>剂</div>
                </div>
              </a-form-item>
              <template v-if="!item.ProId">
                <a-form-item class="medicine-plan-item medicine-plan-item-dosage medicine-plan-item-editable" :name="['list', index, 'DosageForm']" :rules="{required: true,message: '该项必须选择',trigger: 'change'}">
                  <div class="medicine-plan-field medicine-plan-field-dosage border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px whitespace-nowrap" :class="{'medicine-plan-field-filled': item.DosageForm}">
                    <a-select :ref="(el) => setMedicinePlanRef(el, index, 'DosageForm')" class="border-rd-4px bg-[#F6F8FC]" v-model:value="item.DosageForm" placeholder="剂型" :bordered="false" allowClear dropdownClassName="medicine-plan-select-popup" :listHeight="220" :virtual="false" @change="focusMedicinePlanField(index, 'UseMethod')">
                      <a-select-option :value="String(item.id)" v-for="(item,index) in MedicineType" :key="index">{{item.name}}</a-select-option>
                    </a-select>
                  </div>
                </a-form-item>
                <a-form-item class="medicine-plan-item medicine-plan-item-method medicine-plan-item-editable" :name="['list', index, 'UseMethod']" :rules="{required: true,message: '该项必须选择',trigger: 'change'}">
                  <div class="medicine-plan-field medicine-plan-field-method border-rd-4px bg-[#F6F8FC] flex align-center text-bold whitespace-nowrap" :class="{'medicine-plan-field-filled': item.UseMethod}">
                    <a-select :ref="(el) => setMedicinePlanRef(el, index, 'UseMethod')" class="border-rd-4px bg-[#F6F8FC]" v-model:value="item.UseMethod" placeholder="用法" :bordered="false" allowClear dropdownClassName="medicine-plan-select-popup" :listHeight="220" :virtual="false" @change="focusMedicinePlanField(index, 'Frequency')">
                      <a-select-option :value="item.id" v-for="(item,index) in ChineseMedicineUseMethod" :key="index">{{ item.name }}</a-select-option>
                    </a-select>
                  </div>
                </a-form-item>
                <a-form-item class="medicine-plan-item medicine-plan-item-frequency medicine-plan-item-editable" :name="['list', index, 'Frequency']" :rules="{required: true,message: '该项必须选择',trigger: 'change'}">
                  <div class="medicine-plan-field medicine-plan-field-frequency border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px whitespace-nowrap" :class="{'medicine-plan-field-filled': item.Frequency}">
                    <a-select :ref="(el) => setMedicinePlanRef(el, index, 'Frequency')" class="border-rd-4px bg-[#F6F8FC]" v-model:value="item.Frequency" placeholder="每日次数" :bordered="false" allowClear dropdownClassName="medicine-plan-select-popup" :listHeight="220" :virtual="false" @change="focusMedicinePlanField(index, 'EachDose')">
                      <a-select-option :value="String(item.id)" v-for="(item,index) in ChineseMedicineDailyFrequency" :key="index">{{item.name}}</a-select-option>
                    </a-select>
                  </div>
                </a-form-item>
                <a-form-item class="medicine-plan-item medicine-plan-item-each-dose medicine-plan-item-editable" :name="['list', index, 'EachDose']" :rules="{validator: validateEachDose, trigger: 'blur'}">
                  <div class="medicine-plan-field medicine-plan-field-each-dose border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pl8px" :class="{'medicine-plan-field-filled': item.EachDose}">
                    <a-input-number :ref="(el) => setMedicinePlanRef(el, index, 'EachDose')" style="width:56px !important;" id="inputNumber" size="small" :controls="false" v-model:value="item.EachDose" :bordered="false" :min="0.01" placeholder="单次剂量" @focus="selectMedicinePlanNumber" @blur="normalizeMedicinePlanNumber(index, 'EachDose', { required: true, min: 0.01 })" @pressEnter="focusMedicinePlanField(index, 'DoseUnit')" />
                  </div>
                </a-form-item>
                <a-form-item class="medicine-plan-item medicine-plan-item-unit medicine-plan-item-editable" :name="['list', index, 'DoseUnit']" :rules="{required: true,message: '该项必须选择',trigger: 'change'}">
                  <div class="medicine-plan-field medicine-plan-field-unit border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px whitespace-nowrap" :class="{'medicine-plan-field-filled': item.DoseUnit}">
                    <a-select :ref="(el) => setMedicinePlanRef(el, index, 'DoseUnit')" class="border-rd-4px bg-[#F6F8FC]" v-model:value="item.DoseUnit" placeholder="剂量单位" :bordered="false" allowClear dropdownClassName="medicine-plan-select-popup" :listHeight="220" :virtual="false" @change="focusMedicinePlanField(index, 'TakeTime')">
                      <a-select-option :value="item.id" v-for="(item,index) in ChineseMedicineDoseUnit" :key="index">{{item.name}}</a-select-option>
                    </a-select>
                  </div>
                </a-form-item>
                <a-form-item class="medicine-plan-item medicine-plan-item-time medicine-plan-item-editable" :name="['list', index, 'TakeTime']" :rules="{required: true,message: '该项必须选择',trigger: 'change'}">
                  <div class="medicine-plan-field medicine-plan-field-time border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px whitespace-nowrap" :class="{'medicine-plan-field-filled': item.TakeTime}">
                    <a-select :ref="(el) => setMedicinePlanRef(el, index, 'TakeTime')" class="border-rd-4px bg-[#F6F8FC]" v-model:value="item.TakeTime" placeholder="服用时间" :bordered="false" allowClear dropdownClassName="medicine-plan-select-popup" :listHeight="220" :virtual="false" @change="focusMedicinePlanField(index, 'TakeDays')">
                      <a-select-option :value="String(item.id)" v-for="(item,index) in ChineseMedicineMedicationTime" :key="index">{{item.name}}</a-select-option>
                    </a-select>
                  </div>
                </a-form-item>
                <a-form-item class="medicine-plan-item medicine-plan-item-days medicine-plan-item-editable">
                  <div class="medicine-plan-field medicine-plan-field-days border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pr8px" :class="{'medicine-plan-field-filled': item.TakeDays}">
                    <a-input-number :ref="(el) => setMedicinePlanRef(el, index, 'TakeDays')" id="inputNumber" style="width:42px !important;" :controls="false" size="small" v-model:value="item.TakeDays" :bordered="false" placeholder="选填" :min="1" :precision="0" @focus="selectMedicinePlanNumber" @blur="normalizeMedicinePlanNumber(index, 'TakeDays', { integer: true, min: 1 })" />
                    <div>天</div>
                  </div>
                </a-form-item>
              </template>
              <template v-else>
                <a-form-item class="medicine-plan-item medicine-plan-item-dosage">
                  <div class="medicine-plan-field medicine-plan-field-readonly medicine-plan-field-dosage medicine-plan-field-filled border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px whitespace-nowrap">
                    <span>{{ medicineTypeText(item) }}</span>
                  </div>
                </a-form-item>
                <a-form-item class="medicine-plan-item medicine-plan-item-method">
                  <div class="medicine-plan-field medicine-plan-field-readonly medicine-plan-field-method medicine-plan-field-filled border-rd-4px bg-[#F6F8FC] flex align-center text-bold whitespace-nowrap">
                    <span>{{ useMethodText(item) }}</span>
                  </div>
                </a-form-item>
                <a-form-item class="medicine-plan-item medicine-plan-item-frequency medicine-plan-item-editable" :name="['list', index, 'Frequency']" :rules="{required: true,message: '该项必须选择',trigger: 'change'}">
                  <div class="medicine-plan-field medicine-plan-field-frequency border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px whitespace-nowrap" :class="{'medicine-plan-field-filled': item.Frequency}">
                    <a-select :ref="(el) => setMedicinePlanRef(el, index, 'Frequency')" class="border-rd-4px bg-[#F6F8FC]" v-model:value="item.Frequency" placeholder="每日次数" :bordered="false" allowClear dropdownClassName="medicine-plan-select-popup" :listHeight="220" :virtual="false" @change="focusMedicinePlanField(index, 'EachDose')">
                      <a-select-option :value="String(item.id)" v-for="(item,index) in ChineseMedicineDailyFrequency" :key="index">{{item.name}}</a-select-option>
                    </a-select>
                  </div>
                </a-form-item>
                <a-form-item class="medicine-plan-item medicine-plan-item-each-dose medicine-plan-item-editable" :name="['list', index, 'EachDose']" :rules="{validator: validateEachDose, trigger: 'blur'}">
                  <div class="medicine-plan-field medicine-plan-field-each-dose border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pl8px" :class="{'medicine-plan-field-filled': item.EachDose}">
                    <a-input-number :ref="(el) => setMedicinePlanRef(el, index, 'EachDose')" style="width:56px !important;" id="inputNumber" size="small" :controls="false" v-model:value="item.EachDose" :bordered="false" :min="0.01" placeholder="单次剂量" @focus="selectMedicinePlanNumber" @blur="normalizeMedicinePlanNumber(index, 'EachDose', { required: true, min: 0.01 })" @pressEnter="focusMedicinePlanField(index, 'TakeTime')" />
                  </div>
                </a-form-item>
                <a-form-item class="medicine-plan-item medicine-plan-item-unit">
                  <div class="medicine-plan-field medicine-plan-field-readonly medicine-plan-field-unit medicine-plan-field-filled border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px whitespace-nowrap">
                    <span>{{ doseUnitText(item) }}</span>
                  </div>
                </a-form-item>
                <a-form-item class="medicine-plan-item medicine-plan-item-time medicine-plan-item-editable" :name="['list', index, 'TakeTime']" :rules="{required: true,message: '该项必须选择',trigger: 'change'}">
                  <div class="medicine-plan-field medicine-plan-field-time border-rd-4px bg-[#F6F8FC] flex align-center text-bold pl8px whitespace-nowrap" :class="{'medicine-plan-field-filled': item.TakeTime}">
                    <a-select :ref="(el) => setMedicinePlanRef(el, index, 'TakeTime')" class="border-rd-4px bg-[#F6F8FC]" v-model:value="item.TakeTime" placeholder="服用时间" :bordered="false" allowClear dropdownClassName="medicine-plan-select-popup" :listHeight="220" :virtual="false" @change="focusMedicinePlanField(index, 'TakeDays')">
                      <a-select-option :value="String(item.id)" v-for="(item,index) in ChineseMedicineMedicationTime" :key="index">{{item.name}}</a-select-option>
                    </a-select>
                  </div>
                </a-form-item>
                <a-form-item class="medicine-plan-item medicine-plan-item-days medicine-plan-item-editable">
                  <div class="medicine-plan-field medicine-plan-field-days border-rd-4px bg-[#F6F8FC] flex align-center text-bold pt5px pb5px pr8px" :class="{'medicine-plan-field-filled': item.TakeDays}">
                    <a-input-number :ref="(el) => setMedicinePlanRef(el, index, 'TakeDays')" id="inputNumber" style="width:42px !important;" :controls="false" size="small" v-model:value="item.TakeDays" :bordered="false" placeholder="选填" :min="1" :precision="0" @focus="selectMedicinePlanNumber" @blur="normalizeMedicinePlanNumber(index, 'TakeDays', { integer: true, min: 1 })" />
                    <div>天</div>
                  </div>
                </a-form-item>
              </template>
              </div>
            </div>
            <div class="prescription-note-row flex justify-between align-center mt12px" v-if="!item.ProId">
              <div class="prescription-note-field flex-sub border-rd-8px border border-color-[#F3F4F7] flex align-center px12px py7px">
                <div class="prescription-note-label whitespace-nowrap line-height-22px">服药建议</div>
                <a-textarea size="small" v-model:value="item.Advice" :rows="1" :bordered="false" :auto-size="{ minRows: 1, maxRows: 1}" placeholder="请输入服药建议" />
              </div>
              <div class="prescription-note-field flex-sub border-rd-8px border border-color-[#F3F4F7] flex align-center px12px py7px ml12px">
                <div class="prescription-note-label whitespace-nowrap line-height-22px">其他备注</div>
                <a-textarea size="small" v-model:value="item.Remark" :rows="1" :bordered="false" :auto-size="{ minRows: 1, maxRows: 1}" placeholder="请输入服药建议" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-form>


    <a-modal v-model:open="templateModal.visible" title="保存为常用方模板" centered width="600px" wrapClassName="dashboard-prescription-modal" @ok="saveTemplate" :maskClosable="false" destroyOnClose>
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

    <a-modal v-model:open="prescriptionVisible" centered width="1080px" wrapClassName="dashboard-prescription-modal" :maskClosable="false" :destroyOnClose="false" :forceRender="true" :footer="null">
      <div class="prescription-template-modal-body" :class="{ 'is-ready': prescriptionTemplateReady }" style="height: calc(100vh - 200px);">
        <PrescriptionTemplate :isModal="true" @use-template="handleTemplateSelect" @ready="handlePrescriptionTemplateReady"></PrescriptionTemplate>
      </div>
    </a-modal>


    <a-modal v-model:open="callTemplateVisible" title="调用模板" centered width="500px" wrapClassName="dashboard-prescription-modal" :maskClosable="false" destroyOnClose>
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
  import { computed, nextTick, onMounted,ref,watch} from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {PlusOutlined,DeleteTwoTone} from '@ant-design/icons-vue';
  import {basicEnum} from '/@/api/platform/common';
  import { cloneDeep } from 'lodash-es';
  import {TemplateApiCtrl} from '/@/api/myy/template';
  import MaterialInput from '/@/components/MaterialInput.vue';
  import PrescriptionTemplate from '/@/components/PrescriptionTemplate.vue';
  const prescriptionVisible=ref(false)
  const prescriptionTemplateReady=ref(false)
  const prescriptionTemplatePendingVisible=ref(false)
  
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
  const medicinePlanRefs = ref<Map<string, any>>(new Map())
  const prescriptionForm={
    Name:'',
    Advice:'',
    Remark:'',
    DoseCount:1,
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

  const openPrescriptionTemplate=()=>{
    if(prescriptionTemplateReady.value){
      prescriptionVisible.value=true
      return
    }
    prescriptionTemplatePendingVisible.value=true
  }

  const handlePrescriptionTemplateReady=()=>{
    prescriptionTemplateReady.value=true
    if(prescriptionTemplatePendingVisible.value){
      prescriptionTemplatePendingVisible.value=false
      nextTick(() => {
        prescriptionVisible.value=true
      })
    }
  }

  const addPrescription=()=>{
    prescription.value.list.push(cloneDeep(prescriptionForm))
  }

  const getMedicinePlanRefKey = (index: number, field: string) => `${index}-${field}`

  const setMedicinePlanRef = (el: any, index: number, field: string) => {
    const key = getMedicinePlanRefKey(index, field)
    if (el) {
      medicinePlanRefs.value.set(key, el)
    } else {
      medicinePlanRefs.value.delete(key)
    }
  }

  const focusMedicinePlanField = async (index: number, field: string) => {
    await nextTick()
    const control = medicinePlanRefs.value.get(getMedicinePlanRefKey(index, field))
    control?.focus?.()
    const input = control?.$el?.querySelector?.('input')
    input?.focus?.()
    if (field === 'EachDose' || field === 'TakeDays') {
      input?.select?.()
    }
  }

  const selectMedicinePlanNumber = (event: FocusEvent) => {
    const input = event.target as HTMLInputElement
    input?.select?.()
  }

  const parseMedicinePlanNumber = (value) => {
    if (value === undefined || value === null || value === '') return null
    const matched = String(value).match(/\d+(\.\d+)?/)
    if (!matched) return null
    const parsed = Number(matched[0])
    return Number.isFinite(parsed) ? parsed : null
  }

  const normalizeMedicinePlanValue = (value, options: { integer?: boolean; required?: boolean; min?: number } = {}) => {
    const parsed = parseMedicinePlanNumber(value)
    if (parsed === null) return options.required ? null : null
    const normalized = options.integer ? Math.round(parsed) : parsed
    const min = options.min ?? 0
    if (normalized < min) return options.required ? null : null
    return normalized
  }

  const normalizeMedicinePlanNumber = (index: number, field: string, options: { integer?: boolean; required?: boolean; min?: number } = {}) => {
    const item = prescription.value.list[index]
    if (!item) return
    item[field] = normalizeMedicinePlanValue(item[field], options)
  }

  const normalizePrescriptionPlan = (index: number) => {
    normalizeMedicinePlanNumber(index, 'DoseCount', { integer: true, required: true, min: 1 })
    normalizeMedicinePlanNumber(index, 'EachDose', { required: true, min: 0.01 })
    normalizeMedicinePlanNumber(index, 'TakeDays', { integer: true, min: 1 })
  }

  const validateDoseCount = async (_rule, value) => {
    if (value === undefined || value === null || value === '') return Promise.reject('该项必须填写')
    const normalized = normalizeMedicinePlanValue(value, { integer: true, required: true, min: 1 })
    if (!normalized || normalized < 1) return Promise.reject('该项必须填写正整数')
    return Promise.resolve()
  }

  const validateEachDose = async (_rule, value) => {
    if (value === undefined || value === null || value === '') return Promise.reject('该项必须填写')
    const normalized = normalizeMedicinePlanValue(value, { required: true, min: 0.01 })
    if (!normalized || normalized <= 0) return Promise.reject('该项必须填写正数')
    return Promise.resolve()
  }

  const normalizeTakeDays = (value) => normalizeMedicinePlanValue(value, { integer: true, min: 1 })

  const readonlyMaterials = (item) => {
    return (item.Materials || []).filter(p => p.MaterialId)
  }

  const normalizeSelectValue = (value) => {
    if (value === undefined || value === null || value === '') return null
    return String(value)
  }

  const findEnumIdByName = (list, name) => {
    if (!name) return null
    const target = list.value.find(item => item.name === name)
    return target ? String(target.id) : null
  }

  const findEnumNameById = (list, value) => {
    const normalized = normalizeSelectValue(value)
    if (!normalized) return ''
    const target = list.value.find(item => String(item.id) === normalized)
    return target?.name || ''
  }

  const medicineTypeText = (item) => {
    return item.MedicineTypeName || item.DosageFormName || findEnumNameById(MedicineType, item.DosageForm)
  }

  const useMethodText = (item) => {
    return item.UseMethodName || findEnumNameById(ChineseMedicineUseMethod, item.UseMethod)
  }

  const doseUnitText = (item) => {
    return item.DoseUnitName || findEnumNameById(ChineseMedicineDoseUnit, item.DoseUnit)
  }

  const normalizeSystemTemplate = (source) => {
    return {
      DoseCount: 1,
      Frequency: normalizeSelectValue(source.Frequency ?? source.DailyFrequency ?? source.DailyFrequencyId) || findEnumIdByName(ChineseMedicineDailyFrequency, source.DailyFrequencyName),
      EachDose: normalizeMedicinePlanValue(source.EachDose ?? source.PerDoseAmount, { required: false, min: 0.01 }),
      TakeTime: normalizeSelectValue(source.TakeTime ?? source.TakeTimeId) || findEnumIdByName(ChineseMedicineMedicationTime, source.TakeTimeName),
      TakeDays: normalizeTakeDays(source.TakeDays ?? source.CertNumber ?? source.TimeFrame),
    }
  }

  const handleSave = async (index: number) => {
    try {
      normalizePrescriptionPlan(index)
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
      if (isSystem) {
        prescription.value.list[0].ProId = templateInfo.value.ProId
        ;(templateInfo.value.Materials || templateInfo.value.Details || []).forEach(item => {
          materialMap.set(item.MaterialId, item);
        });
        Object.assign(prescription.value.list[0], normalizeSystemTemplate(templateInfo.value))
      }else{
        ;(templateInfo.value.Details || []).forEach(item => {
          materialMap.set(item.MaterialId, item);
        });
      }
      prescription.value.list[0].Materials = [
        ...Array.from(materialMap.values()),
        ...(isSystem ? [] : [{ Sort: 1, MaterialId: null, MaterialName: '', Weight: null }])
      ];
    }else{
      const sourceMaterials = cloneDeep(templateInfo.value.Details || templateInfo.value.Materials || [])
      const newItem = {
        ...cloneDeep(templateInfo.value),
        Materials: isSystem ? sourceMaterials : [...sourceMaterials, {Sort:1,MaterialId:null,MaterialName:'',Weight:null}]
      }
      if (isSystem) {
        newItem.ProId = templateInfo.value.ProId
        Object.assign(newItem, normalizeSystemTemplate(templateInfo.value))
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
    
    for (const item of validPrescriptions) {
      const realIndex = prescription.value.list.indexOf(item);
      if (realIndex === -1) { continue; }
      normalizePrescriptionPlan(realIndex)
      const fieldNames = item.ProId
        ? [
          ['list', realIndex, 'DoseCount'],
          ['list', realIndex, 'Frequency'],
          ['list', realIndex, 'EachDose'],
          ['list', realIndex, 'TakeTime']
        ]
        : [
          ['list', realIndex, 'DoseCount'],
          ['list', realIndex, 'DosageForm'],
          ['list', realIndex, 'DoseUnit'],
          ['list', realIndex, 'UseMethod'],
          ['list', realIndex, 'Frequency'],
          ['list', realIndex, 'EachDose'],
          ['list', realIndex, 'TakeTime']
        ]
      
      try {
        await prescriptionFormIns.value.validateFields(fieldNames);
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
        if (p.MaterialId && p.Weight && item.DoseCount) {
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
  font-size: 14px !important;
  font-weight: 500 !important;
  line-height: 22px !important;
  color: red !important;
}
.medicinePlan .ant-form-item{
  margin-bottom: 0 !important;
}
.medicinePlan :deep(.ant-form-item-has-error) {
  z-index: 8;

  &.medicine-plan-item,
  .medicine-plan-field {
    border-color: #F3A7A7;
    box-shadow: 0 0 0 2px rgba(224, 36, 36, 0.08), 0 1px 2px rgba(32, 48, 75, 0.04);

    &:focus-within {
      border-color: @primary-color;
      box-shadow: 0 0 0 2px fade(@primary-color, 16%), 0 4px 10px rgba(32, 48, 75, 0.06);
    }
  }
}
.medicinePlan {
  align-items: center;
  max-width: 100%;
  overflow-x: visible;
  overflow-y: visible;
  padding: 0 4px 0 0;

  :deep(.ant-input-number-input) {
    text-align: right;
  }

  .medicine-plan-bar {
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: stretch;
    width: fit-content;
    max-width: 100%;
    min-width: 0;
    margin-top: 20px;
    overflow: visible;
    border: 1px solid #E8EEF7;
    border-radius: 8px;
    background: linear-gradient(180deg, #FDFEFF 0%, #F8FAFD 100%);
    box-shadow: 0 1px 2px rgba(32, 48, 75, 0.04);
  }

  .medicine-plan-item {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    min-height: 36px;
    margin-bottom: 0 !important;
    border: 1px solid transparent;
    border-left: 1px dashed #AFC2E8;
    border-radius: 0;
    background: rgba(253, 254, 255, 0.76);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;

    &:first-child {
      border-left-color: transparent;
      border-radius: 8px 0 0 8px;
    }

    &:last-child {
      border-radius: 0 8px 8px 0;
    }

    &.medicine-plan-item-editable {
      background: #E1EBFF;
    }

    &:hover,
    &:focus-within {
      z-index: 6;
      border-color: @primary-color !important;
      background: #FFFFFF;
      box-shadow: 0 0 0 2px fade(@primary-color, 16%), 0 4px 10px rgba(32, 48, 75, 0.06);
    }

    &:not(:first-child):hover,
    &:not(:first-child):focus-within {
      border-radius: 0;
    }

    &:last-child:hover,
    &:last-child:focus-within {
      border-radius: 0 8px 8px 0;
    }
  }

  .medicine-plan-field {
    width: 100%;
    min-height: 34px;
    padding: 5px 8px !important;
    background: transparent !important;
    border-radius: 0;
    color: #313947;
    font-size: 14px;
    font-weight: 500 !important;
    line-height: 22px;
    border: 0;
    box-shadow: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;

    &:hover,
    &:focus-within {
      background: transparent !important;
      box-shadow: none;
    }

    > div {
      font-size: 14px;
      font-weight: 500 !important;
      line-height: 22px;
      white-space: nowrap;
      flex: 0 0 auto;
    }

    :deep(.ant-select) {
      flex: 1;
      min-width: 72px;
    }

    :deep(.ant-select-selector),
    :deep(.ant-input-number),
    :deep(.ant-input-number-input) {
      height: 24px !important;
      font-size: 14px;
      font-weight: 500 !important;
      line-height: 24px !important;
      background: transparent !important;
      color: #313947;
    }

    :deep(.ant-select-selection-item),
    :deep(.ant-select-selection-placeholder) {
      font-size: 14px;
      font-weight: 500 !important;
      line-height: 24px !important;
      padding-right: 18px;
    }

    :deep(.ant-select-arrow),
    :deep(.ant-select-clear) {
      right: 6px;
    }
  }

  .medicine-plan-field-filled {
    border-color: #DDE7F4;
    color: #1F2B3D;
  }

  .medicine-plan-field-readonly {
    cursor: default;

    &:hover,
    &:focus-within {
      background: transparent !important;
      box-shadow: none;
    }

    span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .medicine-plan-item-count {
    width: 74px;
  }

  .medicine-plan-item-dosage {
    width: 116px;
  }

  .medicine-plan-item-method {
    width: 146px;
  }

  .medicine-plan-item-frequency {
    width: 116px;
  }

  .medicine-plan-item-each-dose {
    width: 80px;
  }

  .medicine-plan-item-unit {
    width: 102px;
  }

  .medicine-plan-item-time {
    width: 176px;
  }

  .medicine-plan-item-days {
    width: 80px;
  }

  .medicine-plan-field-count {
    min-width: 0;
    padding: 5px 22px 5px 0 !important;

    :deep(.ant-input-number) {
      width: 28px !important;
      flex: 0 0 28px;
    }
  }

  .medicine-plan-field-dosage {
    min-width: 0;
  }

  .medicine-plan-field-method {
    min-width: 0;
  }

  .medicine-plan-field-frequency {
    min-width: 0;
  }

  .medicine-plan-field-each-dose {
    min-width: 0;
  }

  .medicine-plan-field-unit {
    min-width: 0;

    :deep(.ant-select) {
      min-width: 70px;
    }
  }

  :deep(.ant-form-item-explain) {
    position: absolute;
    top: -20px;
    right: auto;
    left: 8px;
    z-index: 20;
    min-height: 0;
    margin: 0;
    padding: 0;
    white-space: nowrap;
    pointer-events: none;
  }

  :deep(.ant-form-item-explain-error) {
    max-width: 112px;
    padding: 0 5px;
    overflow: hidden;
    border: 1px solid rgba(243, 167, 167, 0.58);
    border-radius: 4px;
    background: rgba(255, 247, 247, 0.96);
    color: #D14343;
    font-size: 11px;
    font-weight: 500;
    line-height: 16px;
    text-overflow: ellipsis;
    box-shadow: 0 2px 6px rgba(209, 67, 67, 0.08);
  }

  .medicine-plan-item-count :deep(.ant-form-item-explain-error),
  .medicine-plan-item-each-dose :deep(.ant-form-item-explain-error) {
    max-width: 88px;
  }

  .medicine-plan-field-time {
    min-width: 0;
  }

  .medicine-plan-field-days {
    min-width: 0;
  }
}

.prescription-note-row {
  width: 890px;
  max-width: 890px;
}

.prescription-note-field {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover,
  &:focus-within {
    border-color: @primary-color !important;
    box-shadow: 0 0 0 2px fade(@primary-color, 16%), 0 4px 10px rgba(32, 48, 75, 0.06);
  }

  :deep(.ant-input) {
    line-height: 22px;
    resize: none;
  }
}

.prescription-note-label {
  font-weight: 400;
}

.template-material-readonly {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover,
  &:focus-within {
    border-color: @primary-color !important;
    box-shadow: 0 0 0 2px fade(@primary-color, 20%);
  }

  :deep(.ant-input),
  :deep(.ant-input-number-input) {
    cursor: default;
  }

  :deep(.ant-input-number-input) {
    text-align: right;
  }
}

:global(.medicine-plan-select-popup) {
  width: max-content !important;
  min-width: 240px !important;
  max-width: none !important;
  padding: 5px;
  border: 1px solid #E8EEF7;
  border-radius: 8px;
  box-shadow: 0 8px 18px rgba(32, 48, 75, 0.1);
  animation-duration: 0.1s;
  overflow: hidden;
}

:global(.medicine-plan-select-popup .ant-select-item-option-content) {
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
}

:global(.medicine-plan-select-popup .rc-virtual-list-holder),
:global(.medicine-plan-select-popup .ant-select-dropdown-content) {
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

:global(.medicine-plan-select-popup .rc-virtual-list-holder::-webkit-scrollbar),
:global(.medicine-plan-select-popup .ant-select-dropdown-content::-webkit-scrollbar) {
  width: 6px;
}

:global(.medicine-plan-select-popup .rc-virtual-list-holder::-webkit-scrollbar-thumb),
:global(.medicine-plan-select-popup .ant-select-dropdown-content::-webkit-scrollbar-thumb) {
  background: rgba(78, 87, 102, 0.22);
  border-radius: 6px;
}

:global(.medicine-plan-select-popup .ant-select-item) {
  min-height: 32px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: none;
}

:global(.medicine-plan-select-popup .ant-select-item-option-active:not(.ant-select-item-option-disabled)) {
  background: #EEF5FF;
}
.prescription-system-radius-btn {
  border-radius: 8px !important;
}
.prescription-template-modal-body {
  opacity: 0;
  transition: opacity 160ms ease-out;
}
.prescription-template-modal-body.is-ready {
  opacity: 1;
}
:global(.dashboard-prescription-modal .ant-modal-content) {
  border-radius: 28px;
  overflow: hidden;
}
</style>
