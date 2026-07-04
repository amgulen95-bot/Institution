<template>
  <div class="MedicalPage">
    <div class="flex justify-between align-center pt16px pb8px pl16px pr16px">
      <div class="text-16px text-bold ">当前病历</div>
      <a-space :size="8">
        <a-button class="medical-system-radius-btn" @click="medicalVisible=true">常用模板</a-button>
        <a-tooltip @click="handleTemplate">
          <template #title>保存为模板</template>
          <img class="w32px h32px pointer" src="../../../assets/images/templateIcon.png" alt="">
        </a-tooltip>
      </a-space>
    </div>
    <a-form :model="visitForm" :rules="visitRules" ref="visitFormIns" class="bg-[#FFFDEC] medicalPanel" :validateTrigger="[]">
      <a-descriptions bordered :column="1" size="small" :labelStyle="{width:'100px',backgroundColor:'#FFFDEC',}" :contentStyle="{padding:'2px 12px'}">
        <a-descriptions-item label="主诉">
          <a-form-item name="ChiefComplaint">
            <a-popover placement="bottomLeft" v-model:open="quickPanel.ChiefComplaint.visible" trigger="click">
              <template #content>
                <div class="w900px" @mousedown.prevent @mouseleave="handleChiefComplaintMouseLeave">
                  <div v-for="(item,index) in quickPanel.ChiefComplaint.list" :key="index">
                    <div class="flex align-center flex-wrap gap12px">
                      <div class="pointerTag" v-for="(p,i) in item.list1" :key="i" @click="handleChiefComplaintListClick(p)">{{ p }}</div>
                    </div>
                    <div class="flex align-center flex-wrap gap12px mt8px">
                      <div class="pointerTag" v-for="(p,i) in item.list2" :key="i" @click="handleChiefComplaintListClick(p)">{{ p }}</div>
                    </div>
                    <a-divider class="my12px" dashed />
                  </div>
                  <div class="flex align-center flex-wrap gap12px">
                    <div class="pointerTag" v-for="(item,index) in quickPanel.ChiefComplaint.time" :key="index" @click="handleChiefComplaintTimeClick(item)">{{ item }}</div>
                  </div>
                  <div class="medical-quick-close bg-[#fafbfc] text-theme p8px text-center mt12px pointer" @click="quickPanel.ChiefComplaint.visible=false">
                    <CloseCircleOutlined />
                    <span class="ml4px">关闭</span>
                  </div>
                </div>
              </template>
              <a-textarea size="small" v-model:value="visitForm.ChiefComplaint" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" @focus="clearVisitFieldValidate('ChiefComplaint')" @click="clearVisitFieldValidate('ChiefComplaint')" />
            </a-popover>
          </a-form-item>
        </a-descriptions-item>
        <a-descriptions-item label="现病史">
          <a-form-item name="PresentIllness">
            <a-popover placement="bottomLeft" v-model:open="quickPanel.PresentIllness.visible" trigger="click">
              <template #content>
                <div class="w900px" @mousedown.prevent @mouseleave="quickPanel.PresentIllness.visible=false">
                  <div v-for="(item,index) in quickPanel.PresentIllness.list" :key="index">
                    <div class="flex align-center flex-wrap gap12px mb16px">
                      <div class="text-bold">{{ item.category }}</div>
                      <div class="pointerTag" v-for="(p,i) in item.list" :key="i" @click="handlePresentIllnessListClick(p)">{{ p }}</div>
                    </div>
                  </div>
                  <div class="medical-quick-close bg-[#fafbfc] text-theme p8px text-center mt12px pointer" @click="quickPanel.PresentIllness.visible=false">
                    <CloseCircleOutlined />
                    <span class="ml4px">关闭</span>
                  </div>
                </div>
              </template>
              <a-textarea size="small" v-model:value="visitForm.PresentIllness" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" @focus="clearVisitFieldValidate('PresentIllness')" @click="clearVisitFieldValidate('PresentIllness')" />
            </a-popover>
          </a-form-item>
        </a-descriptions-item>
        <a-descriptions-item label="既往史">
          <a-form-item name="PastHistory">
            <a-popover placement="bottomLeft" v-model:open="quickPanel.PastHistory.visible" trigger="click">
              <template #content>
                <div class="w900px" @mousedown.prevent @mouseleave="quickPanel.PastHistory.visible=false">
                  <div v-for="(item,index) in quickPanel.PastHistory.list" :key="index">
                    <div class="flex align-center flex-wrap gap12px">
                      <div class="pointerTag" v-for="(p,i) in item.list1" :key="i" @click="handlePastHistoryListClick(p)">{{ p }}</div>
                    </div>
                    <div class="flex align-center flex-wrap gap12px mt8px">
                      <div class="pointerTag" v-for="(p,i) in item.list2" :key="i" @click="handlePastHistoryListClick(p)">{{ p }}</div>
                    </div>
                    <a-divider class="my12px" dashed />
                  </div>
                  <div class="flex align-center flex-wrap gap12px">
                    <div class="text-bold">既往有</div>
                    <div class="pointerTag" v-for="(item,index) in quickPanel.PastHistory.past" :key="index" @click="handlePastHistoryPastClick(item)">{{ item }}</div>
                  </div>
                  <div class="medical-quick-close bg-[#fafbfc] text-theme p8px text-center mt12px pointer" @click="quickPanel.PastHistory.visible=false">
                    <CloseCircleOutlined />
                    <span class="ml4px">关闭</span>
                  </div>
                </div>
              </template>
              <a-textarea size="small" v-model:value="visitForm.PastHistory" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" />
            </a-popover>
          </a-form-item>
        </a-descriptions-item>
        <a-descriptions-item label="过敏史">
          <a-form-item name="AllergyHistory">
            <a-popover placement="bottomLeft" v-model:open="quickPanel.AllergyHistory.visible" trigger="click">
              <template #content>
                <div class="w900px" @mousedown.prevent @mouseleave="quickPanel.AllergyHistory.visible=false">
                  <div class="flex align-center flex-wrap gap12px">
                    <div class="pointerTag" v-for="(item,index) in quickPanel.AllergyHistory.deny" :key="index" @click="handleAllergyHistoryDenyClick(item)">{{ item }}</div>
                  </div>
                  <a-divider class="my12px" dashed />
                  <div class="text-bold mb12px">过敏史</div>
                  <div v-for="(item,index) in quickPanel.AllergyHistory.list" :key="index">
                    <div class="flex align-center flex-wrap gap12px">
                      <div class="pointerTag" v-for="(p,i) in item.list1" :key="i" @click="handleAllergyHistoryListClick(p)">{{ p }}</div>
                    </div>
                    <div class="flex align-center flex-wrap gap12px mt4px">
                      <div class="pointerTag" v-for="(p,i) in item.list2" :key="i" @click="handleAllergyHistoryListClick(p)">{{ p }}</div>
                    </div>
                    <div class="flex align-center flex-wrap gap12px mt4px">
                      <div class="pointerTag" v-for="(p,i) in item.list3" :key="i" @click="handleAllergyHistoryListClick(p)">{{ p }}</div>
                    </div>
                  </div>
                  <div class="medical-quick-close bg-[#fafbfc] text-theme p8px text-center mt12px pointer" @click="quickPanel.AllergyHistory.visible=false">
                    <CloseCircleOutlined />
                    <span class="ml4px">关闭</span>
                  </div>
                </div>
              </template>
              <a-textarea size="small" v-model:value="visitForm.AllergyHistory" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" />
            </a-popover>
          </a-form-item>
        </a-descriptions-item>
        <a-descriptions-item label="个人史">
          <a-form-item name="PersonalHistory">
            <a-popover placement="bottomLeft" v-model:open="quickPanel.PersonalHistory.visible" trigger="click">
              <template #content>
                <div class="w900px" @mousedown.prevent @mouseleave="quickPanel.PersonalHistory.visible=false">
                  <div v-for="(item,index) in quickPanel.PersonalHistory.list" :key="index">
                    <div class="flex align-center flex-wrap gap12px">
                      <div class="pointerTag" v-for="(p,i) in item.list1" :key="i" @click="handlePersonalHistoryListClick(p)">{{ p }}</div>
                    </div>
                    <div class="flex align-center flex-wrap gap12px mt4px">
                      <div class="pointerTag" v-for="(p,i) in item.list2" :key="i" @click="handlePersonalHistoryListClick(p)">{{ p }}</div>
                    </div>
                  </div>
                  <div class="medical-quick-close bg-[#fafbfc] text-theme p8px text-center mt12px pointer" @click="quickPanel.PersonalHistory.visible=false">
                    <CloseCircleOutlined />
                    <span class="ml4px">关闭</span>
                  </div>
                </div>
              </template>
              <a-textarea size="small" v-model:value="visitForm.PersonalHistory" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" />
            </a-popover>
          </a-form-item>
        </a-descriptions-item>
        <a-descriptions-item label="体格检查">
          <a-form-item name="PhysicalExam">
            <a-popover placement="bottomLeft" v-model:open="quickPanel.PhysicalExam.visible" trigger="click">
              <template #content>
                <div class="w900px" @mousedown.prevent @mouseleave="quickPanel.PhysicalExam.visible=false">
                  <a-tabs v-model:activeKey="activeKey" size="small">
                    <a-tab-pane :key="1" tab="体征">
                      <div class="flex align-center flex-wrap gap12px">
                        <div class="pointerTag" v-for="(item,index) in quickPanel.PhysicalExam.tizheng.list" :key="index" @click="handlePhysicalExamMultiClick(item)">{{ item }}</div>
                      </div>
                    </a-tab-pane>
                    <a-tab-pane :key="2" tab="体温">
                      <div class="flex align-center justify-between">
                        <div>
                          <div v-for="(item,index) in quickPanel.PhysicalExam.tiwen.list" :key="index">
                            <div class="flex align-center flex-wrap gap12px mt8px">
                              <div class="pointerTag" v-for="(p,i) in item" :key="i" @click="handlePhysicalExamSingleClick('体温', p, '℃')">{{ p }}</div>
                            </div>
                          </div>
                        </div>
                        <div class="text-24px pr24px">{{ quickPanel.PhysicalExam.tiwen.unit }}</div>
                      </div>
                    </a-tab-pane>
                    <a-tab-pane :key="3" tab="脉搏">
                      <div class="flex align-center justify-between">
                        <div>
                          <div v-for="(item,index) in quickPanel.PhysicalExam.maibo.list" :key="index">
                            <div class="flex align-center flex-wrap gap12px mt8px">
                              <div class="pointerTag" v-for="(p,i) in item" :key="i" @click="handlePhysicalExamSingleClick('脉搏', p, 'bpm')">{{ p }}</div>
                            </div>
                          </div>
                        </div>
                        <div class="text-24px pr24px">{{ quickPanel.PhysicalExam.maibo.unit }}</div>
                      </div>
                    </a-tab-pane>
                    <a-tab-pane :key="4" tab="呼吸">
                      <div class="flex align-center justify-between">
                        <div>
                          <div v-for="(item,index) in 3" :key="index">
                            <div class="flex align-center flex-wrap gap12px mt8px">
                              <div class="pointerTag" v-for="(p,i) in 10" :key="i" @click="handlePhysicalExamSingleClick('呼吸', (index+1)*10+i, '次/分')">{{(index+1)*10+i}}</div>
                            </div>
                          </div>
                        </div>
                        <div class="text-24px pr24px">{{ quickPanel.PhysicalExam.huxi.unit }}</div>
                      </div>
                    </a-tab-pane>
                    <a-tab-pane :key="5" tab="血压">
                      <div class="flex align-center justify-between">
                        <div>
                          <div class="flex" v-for="(item,index) in quickPanel.PhysicalExam.xueya.list" :key="index">
                            <div class="whitespace-nowrap text-bold mt2px">{{ item.name }}</div>
                            <div class="flex align-center flex-wrap gap12px mb8px ml12px">
                              <div class="pointerTag" v-for="(p,i) in item.list" :key="i" @click="handlePhysicalExamSingleClick(item.name, p, 'mmHg')">{{ p }}</div>
                            </div>
                          </div>
                        </div>
                        <div class="text-24px pr24px pl68px">{{ quickPanel.PhysicalExam.xueya.unit }}</div>
                      </div>
                    </a-tab-pane>
                    <a-tab-pane :key="6" tab="体重">
                      <div class="flex justify-between">
                        <div>
                          <div class="p8px border-rd-4px pointer text-bold" :class="quickPanel.PhysicalExam.tizhong.index==index?'bg-[#e1ebff]':''" v-for="(item,index) in quickPanel.PhysicalExam.tizhong.list" :key="index" @click="quickPanel.PhysicalExam.tizhong.index=index">{{ item.name }}</div>
                        </div>
                        <div class="flex-sub ml6px flex align-center flex-wrap gap12px mb8px">
                          <div class="pointerTag" v-for="(item,index) in quickPanel.PhysicalExam.tizhong.list[quickPanel.PhysicalExam.tizhong.index].list" :key="index" @click="handlePhysicalExamSingleClick('体重', item, 'kg')">{{ item }}</div>
                        </div>
                        <div class="text-24px px24px self-center">{{ quickPanel.PhysicalExam.tizhong.unit }}</div>
                      </div>
                    </a-tab-pane>
                    <a-tab-pane :key="7" tab="身高">
                      <div class="flex justify-between">
                        <div>
                          <div class="p8px border-rd-4px pointer text-bold" :class="quickPanel.PhysicalExam.shengao.index==index?'bg-[#e1ebff]':''" v-for="(item,index) in quickPanel.PhysicalExam.shengao.list" :key="index" @click="quickPanel.PhysicalExam.shengao.index=index">{{ item.name }}</div>
                        </div>
                        <div class="flex-sub ml6px flex align-center flex-wrap gap12px mb8px">
                          <div class="pointerTag" v-for="(item,index) in quickPanel.PhysicalExam.shengao.list[quickPanel.PhysicalExam.shengao.index].count" :key="index" @click="handlePhysicalExamSingleClick('身高', quickPanel.PhysicalExam.shengao.list[quickPanel.PhysicalExam.shengao.index].min+index, 'cm')">{{quickPanel.PhysicalExam.shengao.list[quickPanel.PhysicalExam.shengao.index].min+index}}</div>
                        </div>
                        <div class="text-24px px24px self-center">{{ quickPanel.PhysicalExam.shengao.unit }}</div>
                      </div>
                    </a-tab-pane>
                    <a-tab-pane :key="8" tab="血氧">
                      <div class="flex align-center justify-between">
                        <div class="ml6px flex align-center flex-wrap gap12px mb8px w350px">
                          <div class="pointerTag" v-for="(item,index) in 30" :key="index" @click="handlePhysicalExamSingleClick('血氧', 70+index, '%')">{{70+index}}</div>
                        </div>
                        <div class="text-24px px24px">{{ quickPanel.PhysicalExam.xueyang.unit }}</div>
                      </div>
                    </a-tab-pane>
                    <a-tab-pane :key="9" tab="血糖">
                      <div class="flex align-center justify-between">
                        <div class="ml6px flex align-center flex-wrap gap12px mb8px">
                          <div class="pointerTag" v-for="(item,index) in 80" :key="index" @click="handlePhysicalExamSingleClick('血糖', (4.0 + index * 0.1).toFixed(1), 'mmol/L')">{{ (4.0 + index * 0.1).toFixed(1) }}</div>
                        </div>
                        <div class="text-24px px24px">{{ quickPanel.PhysicalExam.xuetang.unit }}</div>
                      </div>
                    </a-tab-pane>
                  </a-tabs>
                  <div class="medical-quick-close bg-[#fafbfc] text-theme p8px text-center mt12px pointer" @click="quickPanel.PhysicalExam.visible=false">
                    <CloseCircleOutlined />
                    <span class="ml4px">关闭</span>
                  </div>
                </div>
              </template>
              <a-textarea size="small" v-model:value="visitForm.PhysicalExam" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" />
            </a-popover>
          </a-form-item>
        </a-descriptions-item>
        <a-descriptions-item label="望闻切诊">
          <a-form-item name="TCMDiagnosis">
            <a-textarea size="small" v-model:value="visitForm.TCMDiagnosis" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" />
          </a-form-item>
        </a-descriptions-item>
        <a-descriptions-item label="诊断">
          <a-form-item name="Diagnosis">
            <a-popover placement="bottomLeft" v-model:open="diagnosisPopover.visible" trigger="click">
              <template #content>
                <div class="w400px" @mousedown.prevent @mouseleave="diagnosisPopover.visible=false">
                  <div class="max-h300px overflow-y-auto" v-if="diagnosisPopover.list.length">
                    <div class="medical-option-item pointer p4px hover-bg-[#e1ebff]" v-for="(item,index) in diagnosisPopover.list" :key="index" @click="handleDiagnosisSelect(item)">{{ item }}</div>
                  </div>
                  <div v-else-if="diagnosisPopover.searchKey && !diagnosisPopover.loading" class="text-center text-gray">无匹配结果</div>
                  <div v-else-if="diagnosisPopover.loading" class="text-center text-gray">搜索中...</div>
                  <div v-else class="text-center text-gray">输入诊断名称搜索</div>
                </div>
              </template>
              <a-textarea size="small" v-model:value="visitForm.Diagnosis" :rows="1" :bordered="false" :auto-size="{ minRows: 1}" @input="handleDiagnosisInput" @focus="handleDiagnosisFocus" @click="clearVisitFieldValidate('Diagnosis')" />
            </a-popover>
          </a-form-item>
        </a-descriptions-item>
      </a-descriptions>
    </a-form>
    

    <a-modal v-model:open="templateModal.visible" title="保存为病历模板" centered width="600px" @ok="saveTemplate" :maskClosable="false" destroyOnClose>
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
          <a-form-item label="是否公共模板" name="IsPublic">
            <a-switch v-model:checked="templateModal.form.IsPublic" checked-children="是" un-checked-children="否" />
          </a-form-item>
        </a-form>
      </section>
    </a-modal>

    <a-modal v-model:open="callTemplateVisible" title="调用模板" centered width="500px" :maskClosable="false" destroyOnClose>
      <div class="text-center">
        <div class="text-18px text-bold">已填写“主诉”“现病史”</div>
        <div class="mt12px">插入到已填写内容中，还是覆盖已填写内容？</div>
      </div>
      <template #footer>
        <a-space>
          <a-button type="primary" @click="callTemplateSave(1)">插入</a-button>
          <a-button type="primary" @click="callTemplateSave(2)">覆盖</a-button>
          <a-button @click="callTemplateVisible=false">取消</a-button>
        </a-space>
			</template>
    </a-modal>

    <a-modal v-model:open="medicalVisible" centered width="1080px" :maskClosable="false" destroyOnClose :footer="null">
      <div style="height: calc(100vh - 200px);">
        <MedicalTemplate :isModal="true" @use-template="handleTemplateSelect"></MedicalTemplate>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted,ref,watch} from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { cloneDeep } from 'lodash-es';
  import {TemplateApiCtrl} from '/@/api/myy/template';
  import MedicalTemplate from '/@/components/MedicalTemplate.vue';
  import {CloseCircleOutlined} from '@ant-design/icons-vue';
  import {DiagnosisSearch} from '/@/api/platform/joinPay';
  
  const props = defineProps({
    visitForm: {
      type: Object,
      default: () => ({})
    }
  })
  const emit = defineEmits(['update:visitForm'])
  const { createMessage} = useMessage()
  const templateFormIns=ref()
  const visitFormIns=ref()
  const quickPanel=ref({
    ChiefComplaint:{
      visible:false,
      time:['偶尔','1天','2天','3天','4天','5天','1周','2周','3周','1个月','2个月','3个月','半年','1年'],
      list:[{list1:['咳嗽','干咳','咳痰','夜咳','咯血','咽干','咽痒','咽痛','声音嘶哑','咽部异物感','反复感冒'],list2:['发热','喷嚏','流涕','鼻塞','头痛','头晕','耳鸣','多汗','少汗','盗汗','自汗','肺结节']},
      {list1:['胃胀','胃痛','腹胀','腹痛','腹泻','恶心','呕吐','反酸','嗳气','烧心','食欲不振',],list2:['便秘','便溏','便血','黑便','水样便','里急后重','肝区痛','吞咽痛','右上腹痛','餐后饱胀']},
      {list1:['心悸','胸闷','胸痛','气短','喘息','气促','心绞痛','心动过速','呼吸困难','失眠','嗜睡','血压高'],list2:['尿频','尿急','尿痛','少尿','多尿','尿流细','排尿困难','眼睑水肿','下肢水肿','阳痿','早泄']},
      {list1:['肩痛','腰痛','颈椎痛','关节痛','关节僵硬','关节弹响','皮疹','水疱','皮肤瘙痒','皮肤红斑'],list2:['眼红','眼干','眼痛','眼异物感','视物模糊','口干','口苦','牙痛','牙龈出血','口腔溃疡']},
      {list1:['痛经','闭经','崩漏','月经量多','月经量少','月经量少','月经延后','经期错乱','带下异味','黄带'],list2:[]},]
    },
    PresentIllness:{
      visible:false,
      list:[{category:'精神',list:['精神可','精神萎靡','压力大','易怒','焦虑','抑郁']},
      {category:'饮食',list:['食欲正常','食欲不振','食欲亢进','易饥饿','厌油腻']},
      {category:'二便',list:['小便正常','尿痛','多尿','少尿','大便正常','大便干','大便稀']}]
    },
    PastHistory:{
      visible:false,
      list:[{list1:['既往体健','未见明显异常','无呛咳史'],list2:['否认药物过敏史','否认慢性疾病','否认传染病史','否认遗传病史','否认备孕','否认怀孕']}],
      past:['高血压','高血脂','心脏病','糖尿病','痛风','精神疾病','脑梗死','肝炎','胃炎','肺结核','哮喘','鼻炎','甲亢','血液病']
    },
    AllergyHistory:{
      visible:false,
      deny:['否认药物过敏史','否认食物过敏史'],
      list:[{list1:['青霉素','链霉素','卡那霉素','林可霉素','左氧氟沙星','溴芬酸钠','阿托品','头孢类','磺胺类','酒精','碘伏']},
      {list2:['去痛片','扑热息痛','安痛定','安定','鲁米那','阿司匹林','普鲁卡因']},
      {list3:['花粉','霉菌','尘螨','毛发皮屑','牛奶','鸡蛋','大豆','小麦','花生','鱼虾','坚果']}]
    },
    PersonalHistory:{
      visible:false,
      list:[{list1:['吸烟','偶尔吸烟','长期吸烟','不饮酒','偶尔饮酒','长期饮酒']},
      {list2:['未婚','已婚','未孕','备孕','怀孕','闭经','有早产史','有流产史','有痛经史']}]
    },
    PhysicalExam:{
      visible:false,
      tizheng:{name:'体征',type:1,list:['生命体征平稳','神志清楚','精神反应尚可','未见皮疹','浅表淋巴结未扪及肿大','双肺呼吸音清晰','双肺叩诊呈清音','未闻及异常呼吸音及干湿啰音','心前区无异常搏动','心音有力心律齐','各瓣膜区未闻及明显杂音','未闻及心包摩擦音','腹部柔软','无腹肌紧张','全腹部无压痛','肠鸣音活跃','双肾区无叩痛']},
      tiwen:{name:'体温',type:2,unit:'℃',list:[['36.0','36.5','37.0','37.3','37.4','37.5','37.6','37.7','37.8','37.9'],
        ['38.0','38.1','38.2','38.3','38.4','38.5','38.6','38.7','38.8','38.9'],
        ['39.0','39.1','39.2','39.3','39.4','39.5','39.6','39.7','39.8','39.9'],
        ['40.0','40.1','40.2','40.3','40.4','40.5','40.6','40.7','40.8','40.9'],
        ['41.0','41.1','41.2','41.3','41.4','41.5','41.6','41.7','41.8','41.9']]},
      maibo:{name:'脉搏',type:2,unit:'bpm',list:[['30','35','40','45','50','55','60','65','70','75','80'],
        ['85','90','95','100','105','110','115','120','125','130','135'],
        ['140','145','150','155','160','165','170','175','180',]]},
      huxi:{name:'呼吸',type:2,unit:'次/分'},
      xueya:{name:'血压',type:2,unit:'mmHg',list:[
        {name:'收缩压',list:['82','84','86','88','90','92','94','96','98','100','102','104','106','108','110','112','114','116','118','120','122','124','126','128','130','132','134','136','138','140','142','144','146','148','150','152','154','156','158','160','162','164','168','170','172','174','176','178','180']},
        {name:'舒张压',list:['52','54','56','58','60','62','64','66','68','70','72','74','76','78','80','82','84','86','88','90','92','94','96','98','100','102','104','106','108','110']}]},
      tizhong:{name:'体重',type:2,unit:'kg',index:0,list:[{name:'婴儿童(2~32)',list:['2.0','2.5','3.0','3.5','4.0','4.5','5.0','5.5','6.0','6.5','7.0','7.5','8.0','8.5','9.0','9.5',
        '10.0','10.5','11.0','11.5','12.0','12.5','13.0','13.5','14.0','14.5','15.0','15.5','16.0','16.5','17.0','17.5','18.0','18.5','19.0','19.5',
        '20.0','20.5','21.0','21.5','22.0','22.5','23.0','23.5','24.0','24.5','25.0','25.5','26.0','26.5','27.0','27.5','28.0','28.5','29.0','29.5','30.0','30.5','31.0','31.5','32.0']},
          {name:'青少年(30~60)',list:['30.0','30.5','31.0','31.5','32.0','32.5','33.0','33.5','34.0','34.5','35.0','35.5','36.0','36.5','37.0','37.5','38.0','38.5','39.0','39.5',
          '40.0','40.5','41.0','41.5','42.0','42.5','43.0','43.5','44.0','44.5','45.0','45.5','46.0','46.5','47.0','47.5','48.0','48.5','49.0','49.5',
          '50.0','50.5','51.0','51.5','52.0','52.5','53.0','53.5','54.0','54.5','55.0','55.5','56.0','56.5','57.0','57.5','58.0','58.5','59.0','59.5','60.0']},
          {name:'成年人(45~100)',list:['45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69',
          '70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99','100']}
        ]},
      shengao:{name:'身高',type:2,unit:'cm',index:0,list:[{name:'婴儿童(45~100)',min:45,max:100,count:56},{name:'青少年(100~150)',min:100,max:150,count:51},{name:'成年人(150~200)',min:150,max:200,count:51}]},
      xueyang:{name:'血氧',type:2,unit:'%'},
      xuetang:{name:'血糖',type:2,unit:'mmol/L'}
    },
  })
  let chiefComplaintOpenedAt = 0
  const templateInfo=ref({
    ChiefComplaint:'',
    PresentIllness:'',
    PastHistory:'',
    AllergyHistory:'',
    PersonalHistory:'',
    PhysicalExam:'',
    TCMDiagnosis:'',
    Diagnosis:'',
    DoctorRemark:'',
  })
  const visitRules=ref({
    ChiefComplaint: [{required: true,message: '该项必须填写',type:'string'}],
    PresentIllness: [{required: true,message: '该项必须填写',type:'string'}],
    Diagnosis: [{required: true,message: '该项必须填写',type:'string'}],
  })
  const callTemplateVisible=ref(false)
  const medicalVisible=ref(false)
  const categoryList=ref([])
  const activeKey=ref(1)
  const diagnosisPopover=ref({
    visible:false,
    searchKey:'',
    list:[] as string[],
    loading:false,
  })
  let diagnosisSearchTimer: any
  const visitForm = ref(cloneDeep(props.visitForm))
  watch(() => props.visitForm, (newVal) => {
    visitForm.value = cloneDeep(newVal)
  }, { deep: true })

  watch(() => diagnosisPopover.value.visible, (val) => {
    if (val && !diagnosisPopover.value.searchKey) {
      diagnosisPopover.value.loading = true
      DiagnosisSearch({}).then((data: any) => {
        diagnosisPopover.value.list = (data || []).map((item: any) => item.Name || item.name || item)
      }).finally(() => {
        diagnosisPopover.value.loading = false
      })
    }
  })
  watch(() => quickPanel.value.ChiefComplaint.visible, (val) => {
    if (val) {
      chiefComplaintOpenedAt = Date.now()
    }
  })

  watch(visitForm, (newVal) => {
    if (JSON.stringify(newVal) === JSON.stringify(props.visitForm)) {
      return;
    }
    emit('update:visitForm', cloneDeep(newVal));
  }, { deep: true })

  const templateForm={
    CategoryId:null,
    Name:'',
    IsPublic:false,
  }
  const templateModal=ref({
    visible:false,
    loading:false,
    form:cloneDeep(templateForm),
    rules: {
      Name: [{required: true,trigger: 'blur',message: '该项必须填写',type:'string'}],
      CategoryId: [{required: true,trigger: 'change',message: '该项必须选择',type:'string'}],
    }
  })

  onMounted(()=>{
    getCategoryList()
  })

  const getCategoryList=()=>{
    TemplateApiCtrl.CategoryList({type:2,limit:100}).then(data=>{
      categoryList.value=data.Rows
    })
  }

  const handleTemplate=()=>{
    const fields = ['ChiefComplaint','PresentIllness','PastHistory','AllergyHistory','PersonalHistory','PhysicalExam','TCMDiagnosis','Diagnosis','DoctorRemark']
    const hasValue = fields.some(key => visitForm.value[key])
    if(!hasValue){
      createMessage.warning('请先填写至少一项病历内容')
      return
    }
    templateModal.value.form=cloneDeep(templateForm)
    templateModal.value.visible=true
  }

  const saveTemplate=()=>{
    templateFormIns.value.validate().then(() => {
      const formData =cloneDeep(templateModal.value.form)
      templateModal.value.loading = true
      TemplateApiCtrl.SaveMedical({...visitForm.value,...formData}).then(data => {
        createMessage.success(`保存成功`);
        templateModal.value.visible=false
      }).catch(() => {}).finally(() => { templateModal.value.loading = false })
    })
  }

  const handleTemplateSelect = (templateDetail) => {
    if(templateDetail){
      templateInfo.value={
        ChiefComplaint:templateDetail.ChiefComplaint,
        PresentIllness:templateDetail.PresentIllness,
        PastHistory:templateDetail.PastHistory,
        AllergyHistory:templateDetail.AllergyHistory,
        PersonalHistory:templateDetail.PersonalHistory,
        PhysicalExam:templateDetail.PhysicalExam,
        TCMDiagnosis:templateDetail.TCMDiagnosis,
        Diagnosis:templateDetail.Diagnosis,
        DoctorRemark:templateDetail.DoctorRemark,
      }
      medicalVisible.value=false
      if(visitForm.value.ChiefComplaint){
        callTemplateVisible.value=true
      }else{
        callTemplateSave(2)
      }
    }
  }

  const callTemplateSave=(type)=>{
    if(type==1){  //插入
      visitForm.value={
        ChiefComplaint:visitForm.value.ChiefComplaint+templateInfo.value.ChiefComplaint,
        PresentIllness:visitForm.value.PresentIllness+templateInfo.value.PresentIllness,
        PastHistory:visitForm.value.PastHistory+templateInfo.value.PastHistory,
        AllergyHistory:visitForm.value.AllergyHistory+templateInfo.value.AllergyHistory,
        PersonalHistory:visitForm.value.PersonalHistory+templateInfo.value.PersonalHistory,
        PhysicalExam:visitForm.value.PhysicalExam+templateInfo.value.PhysicalExam,
        TCMDiagnosis:visitForm.value.TCMDiagnosis+templateInfo.value.TCMDiagnosis,
        Diagnosis:visitForm.value.Diagnosis+templateInfo.value.Diagnosis,
        DoctorRemark:visitForm.value.DoctorRemark+templateInfo.value.DoctorRemark,
      }
    }else{ //覆盖
      visitForm.value=cloneDeep(templateInfo.value)
    }
    callTemplateVisible.value=false
  }

  const handleChiefComplaintListClick = (value: string) => {
    const current = visitForm.value.ChiefComplaint || ''
    const items = current ? current.split(/[,，]\s*/).filter(s => s) : []
    if (items.includes(value)) {
      return
    }
    visitForm.value.ChiefComplaint = items.length > 0
      ? items.join('，') + '，' + value
      : value
  }

  const handleChiefComplaintMouseLeave = () => {
    if (Date.now() - chiefComplaintOpenedAt < 250) {
      return
    }
    quickPanel.value.ChiefComplaint.visible = false
  }

  const handlePresentIllnessListClick = (value: string) => {
    const current = visitForm.value.PresentIllness || ''
    const items = current ? current.split(/[,，]\s*/).filter(s => s) : []
    if (items.includes(value)) {
      return
    }
    visitForm.value.PresentIllness = items.length > 0
      ? items.join('，') + '，' + value
      : value
  }

  const handleChiefComplaintTimeClick = (value: string) => {
    const current = visitForm.value.ChiefComplaint || ''
    if (!current) return
    const parts = current.split(/[,，]\s*/)
    const lastPart = parts.pop() || ''
    parts.push(lastPart + value)
    visitForm.value.ChiefComplaint = parts.join('，')
  }

  const handlePastHistoryListClick = (value: string) => {
    const current = visitForm.value.PastHistory || ''
    const items = current ? current.split(/[,，]\s*/).filter(s => s) : []
    if (items.includes(value)) {
      return
    }
    visitForm.value.PastHistory = items.length > 0
      ? items.join('，') + '，' + value
      : value
  }

  const handlePastHistoryPastClick = (value: string) => {
    const text = '既往有' + value
    const current = visitForm.value.PastHistory || ''
    const items = current ? current.split(/[,，]\s*/).filter(s => s) : []
    if (items.includes(text)) {
      return
    }
    visitForm.value.PastHistory = items.length > 0
      ? items.join('，') + '，' + text
      : text
  }

  const handleAllergyHistoryListClick = (value: string) => {
    const current = visitForm.value.AllergyHistory || ''
    const items = current ? current.split(/[,，]\s*/).filter(s => s) : []
    if (items.includes(value)) {
      return
    }
    visitForm.value.AllergyHistory = items.length > 0
      ? items.join('，') + '，' + value
      : value
  }

  const handleAllergyHistoryDenyClick = (value: string) => {
    const current = visitForm.value.AllergyHistory || ''
    const items = current ? current.split(/[,，]\s*/).filter(s => s) : []
    if (items.includes(value)) {
      return
    }
    visitForm.value.AllergyHistory = items.length > 0
      ? items.join('，') + '，' + value
      : value
  }

  const handlePersonalHistoryListClick = (value: string) => {
    const current = visitForm.value.PersonalHistory || ''
    const items = current ? current.split(/[,，]\s*/).filter(s => s) : []
    if (items.includes(value)) {
      return
    }
    visitForm.value.PersonalHistory = items.length > 0
      ? items.join('，') + '，' + value
      : value
  }

  const handlePhysicalExamMultiClick = (value: string) => {
    const current = visitForm.value.PhysicalExam || ''
    const items = current ? current.split(/[,，]\s*/).filter(s => s) : []
    if (items.includes(value)) {
      return
    }
    visitForm.value.PhysicalExam = items.length > 0
      ? items.join('，') + '，' + value
      : value
  }

  const handlePhysicalExamSingleClick = (name: string, value: string | number, unit: string) => {
    const text = name + value + unit
    const current = visitForm.value.PhysicalExam || ''
    const items = current ? current.split(/[,，]\s*/).filter(s => s) : []
    const index = items.findIndex(item => item.startsWith(name))
    if (index !== -1) {
      items[index] = text
    } else {
      items.push(text)
    }
    visitForm.value.PhysicalExam = items.join('，')
  }

  const clearVisitFieldValidate = (field: string) => {
    visitFormIns.value?.clearValidate?.([field])
  }

  const handleDiagnosisFocus = () => {
    clearVisitFieldValidate('Diagnosis')
    const val = visitForm.value.Diagnosis || ''
    if (val && !/[，,]$/.test(val)) {
      visitForm.value.Diagnosis = val + '，'
    }
  }

  const handleDiagnosisInput = () => {
    const val = visitForm.value.Diagnosis || ''
    const parts = val.split(/[,，]/)
    const key = parts[parts.length - 1]?.trim() || ''
    diagnosisPopover.value.searchKey = key
    if (diagnosisSearchTimer) clearTimeout(diagnosisSearchTimer)
    if (!key) {
      diagnosisPopover.value.list = []
      return
    }
    diagnosisSearchTimer = setTimeout(() => {
      diagnosisPopover.value.loading = true
      DiagnosisSearch({ name: key }).then((data: any) => {
        diagnosisPopover.value.list = (data || []).map((item: any) => item.Name || item.name || item)
      }).finally(() => {
        diagnosisPopover.value.loading = false
      })
    }, 300)
  }

  const handleDiagnosisSelect = (value: string) => {
    const current = visitForm.value.Diagnosis || ''
    const parts = current.split(/[,，]/)
    parts[parts.length - 1] = value
    const items = parts.map(s => s.trim()).filter(s => s)
    if (new Set(items).size !== items.length) {
      return
    }
    visitForm.value.Diagnosis = items.join('，')
    diagnosisPopover.value.visible = false
    diagnosisPopover.value.list = []
  }

  async function handleSaveMedical(){
    try {
      await visitFormIns.value.validate();
      return true;
    } catch (error) {
      return false;
    }
  }

  defineExpose({
    handleSaveMedical
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
.MedicalPage .ant-form-item{
  margin-bottom: 0 !important;
}
.MedicalPage :deep(.ant-form-item){
  position: relative;
}
.MedicalPage :deep(.ant-form-item-with-help){
  margin-bottom: 0 !important;
}
.MedicalPage :deep(.ant-form-item-explain){
  position: absolute;
  left: auto;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 4;
  min-height: auto;
  line-height: 16px;
  font-size: 12px;
  pointer-events: none;
}
.MedicalPage :deep(.ant-form-item-explain-error){
  display: inline-block;
  padding: 1px 6px;
  background: #fff;
  border-radius: 4px;
  white-space: nowrap;
}
.pointerTag{
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
}
.pointerTag:hover{
  background-color: #e1ebff;
  color: #0A5AFF;
}
.MedicalPage :deep(.ant-descriptions-view){
  border: none !important;
}
.MedicalPage :deep(.ant-descriptions-item-label){
  border-inline-end:none !important;
  color: #5F6A7A !important;
  font-weight: 400;
}
.MedicalPage :deep(.ant-descriptions-item-content){
  border-inline-start:1px solid #f0f0f0;
  border: 1px solid #f0f0f0 !important;
  box-sizing: border-box;
  position: relative;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.MedicalPage :deep(.ant-descriptions-item-content::after){
  content: '';
  position: absolute;
  inset: -1px;
  z-index: 2;
  pointer-events: none;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.MedicalPage :deep(.ant-descriptions-item-content textarea.ant-input){
  min-height: 22px !important;
  line-height: 22px;
  overflow: hidden;
  resize: none;
}
.MedicalPage :deep(.ant-descriptions-item-content:hover),
.MedicalPage :deep(.ant-descriptions-item-content:focus-within){
  z-index: 3;
  border: 1px solid #0A5AFF !important;
}
.MedicalPage :deep(.ant-descriptions-item-content:hover::after),
.MedicalPage :deep(.ant-descriptions-item-content:focus-within::after){
  border-color: #0A5AFF;
  box-shadow: 0 0 0 2px fade(@primary-color, 16%), 0 4px 10px rgba(32, 48, 75, 0.06);
}
.medicalPanel :deep(.ant-input){
  font-weight: 400 !important;
  color: #000000 !important;
}
.medical-option-item {
  border-radius: 4px;
  padding: 7px 8px !important;
  color: #000000;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  border-bottom: 1px dashed #E8EEF7;
}
.medical-option-item:last-child {
  border-bottom: none;
}
.medical-quick-close {
  border-radius: 4px;
}
.medical-quick-close:hover {
  background-color: #EEF5FF !important;
}
.medical-system-radius-btn {
  border-radius: 8px !important;
}
</style>
