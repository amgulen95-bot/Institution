<template>
  <div class="completed-detail-view">
    <div class="flex align-center justify-between flex-wrap">
      <div class="flex align-center py8px px16px bg-[#fff] border-rd-8px mb8px gap24px whitespace-nowrap">
        <div class="flex align-center">
          <img class="w20px h20px" src="../../../assets/images/userImg.png" alt="">
          <div class="w56px ml4px">{{data.Visit?.PatientName}}</div>
        </div>
        <div>{{data.Visit?.PatientGender==1?'男':'女'}}</div>
        <div>{{data.Visit?.PatientAge}}岁</div>
        <div class="flex align-center">
          <img class="w20px h20px" src="../../../assets/images/phone.png" alt="">
          <div>{{data.Visit?.PatientPhone}}</div>
        </div>
      </div>
      <div class="flex align-center py10px px16px bg-[#fff] border-rd-8px mb8px gap16px whitespace-nowrap">
        <div>{{data.Visit?.VisitType==0?'初诊':'复诊'}}</div>
        <a-divider type="vertical" />
        <div class="flex align-center">
          <span>挂号费：</span>
          <span class="text-bold text-theme">￥{{ data.Visit?.RegistrationFee }}</span>
        </div>
      </div>
    </div>
    <div class="border-rd-12px border border-color-[#e8cf9e] bg-[#fff] overflow-hidden">
      <div class="text-16px text-bold pt16px pb8px pl16px">病历</div>
      <a-descriptions bordered :column="1" :labelStyle="{ width: '100px' }">
        <a-descriptions-item label="主诉">{{data.Visit?.ChiefComplaint}}</a-descriptions-item>
        <a-descriptions-item label="现病史">{{data.Visit?.PresentIllness}}</a-descriptions-item>
        <a-descriptions-item label="既往史" :span="2">{{data.Visit?.PastHistory}}</a-descriptions-item>
        <a-descriptions-item label="过敏史" :span="2">{{data.Visit?.AllergyHistory}}</a-descriptions-item>
        <a-descriptions-item label="个人史" :span="2">{{data.Visit?.PersonalHistory}}</a-descriptions-item>
        <a-descriptions-item label="体格检查" :span="2">{{data.Visit?.PhysicalExam}}</a-descriptions-item>
        <a-descriptions-item label="望闻切诊" :span="2">{{data.Visit?.TCMDiagnosis}}</a-descriptions-item>
        <a-descriptions-item label="诊断" :span="2">{{data.Visit?.Diagnosis}}</a-descriptions-item>
      </a-descriptions>
    </div>

    <a-card class="mt16px completed-prescription-card dashboard-card-radius">
      <div class="flex justify-between align-center flex-wrap">
        <div class="text-18px text-bold">
          <img class="w28px h28px" src="../../../assets/images/yaofang.png" alt="">
          <span class="ml4px">云药房处方</span>
        </div>
        <div class="flex align-center flex-wrap gap12px">
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
        </div>
      </div>
      <div v-if="data.Details?.length">
        <div class="mt12px" v-for="(item,index) in data.Details" :key="index">
          <div class="border-rd-12px border border-color-[#e1ebff] overflow-hidden">
            <div class="pt12px pb12px pl16px pr16px bg-[#F9FBFD] flex justify-between align-center">
              <div class="flex align-center">
                <div class="w14px h14px border-rd-50% border border-color-[#0A5AFF] border-width-2px"></div>
                <div class="color-[#4E5766] ml4px">处方{{index+1}}：{{item.Detail.ProName}}</div>
              </div>
              <div class="color-[#565E74]">共{{item.Materials.length}}味药</div>
            </div>
          </div>
          <div class="pt24px pb12px">
            <a-space :size="[24, 12]" wrap>
              <div class="readonly-material-card flex justify-between align-center border border-rd-4px border-color-[#E9ECEF] pt7px pb7px pr12px pl5px position-relative" v-for="(p,i) in item.Materials" :key="i">
              <div class="readonly-material-name">{{ materialName(p) }}</div>
              <a-divider type="vertical" />
              <div class="readonly-material-weight">{{ materialWeight(p) }}</div>
              <span>g</span>
              </div>
            </a-space>
          </div>
          <div class="prescription-detail-plan">
            <div class="medicine-plan-bar">
              <div class="medicine-plan-item medicine-plan-item-count">
                <div class="medicine-plan-field medicine-plan-field-count medicine-plan-field-filled flex align-center text-bold">
                  <span class="medicine-plan-number">{{ doseCountText(item.Detail) }}</span>
                  <span>剂</span>
                </div>
              </div>
              <div class="medicine-plan-item medicine-plan-item-dosage">
                <div class="medicine-plan-field medicine-plan-field-dosage medicine-plan-field-filled flex align-center text-bold">
                  <span>剂型：</span>
                  <span>{{ dosageFormText(item.Detail) }}</span>
                </div>
              </div>
              <div class="medicine-plan-item medicine-plan-item-method">
                <div class="medicine-plan-field medicine-plan-field-method medicine-plan-field-filled flex align-center text-bold">
                  <span>{{ useMethodText(item.Detail) }}</span>
                </div>
              </div>
              <div class="medicine-plan-item medicine-plan-item-frequency">
                <div class="medicine-plan-field medicine-plan-field-frequency medicine-plan-field-filled flex align-center text-bold">
                  <span>每日次数：</span>
                  <span>{{ frequencyText(item.Detail) }}</span>
                </div>
              </div>
              <div class="medicine-plan-item medicine-plan-item-each-dose">
                <div class="medicine-plan-field medicine-plan-field-each-dose medicine-plan-field-filled flex align-center text-bold">
                  <span>单次剂量：</span>
                  <span>{{ eachDoseText(item.Detail) }}</span>
                </div>
              </div>
              <div class="medicine-plan-item medicine-plan-item-unit">
                <div class="medicine-plan-field medicine-plan-field-unit medicine-plan-field-filled flex align-center text-bold">
                  <span>剂量单位：</span>
                  <span>{{ doseUnitText(item.Detail) }}</span>
                </div>
              </div>
              <div class="medicine-plan-item medicine-plan-item-time">
                <div class="medicine-plan-field medicine-plan-field-time medicine-plan-field-filled flex align-center text-bold">
                  <span>用药时间：</span>
                  <span>{{ takeTimeText(item.Detail) }}</span>
                </div>
              </div>
              <div class="medicine-plan-item medicine-plan-item-days">
                <div class="medicine-plan-field medicine-plan-field-days medicine-plan-field-filled flex align-center text-bold">
                  <span>用药天数：</span>
                  <span>{{ takeDaysText(item.Detail) }}</span>
                  <span v-if="takeDaysText(item.Detail)">天</span>
                </div>
              </div>
            </div>
          </div>
          <div class="border-rd-8px border border-color-[#F3F4F7] flex p16px mt12px">
            <div class="text-bold whitespace-nowrap line-height-22px">服药建议/备注</div>
            <div class="ml12px mt2px">{{ item.Detail.Remark }}</div>
          </div>
        </div>
      </div>
    </a-card>
    
  </div>
</template>
<script lang="ts" setup>
  import { ref} from 'vue';

  const props = defineProps({
    data: { type: Object, default:{
      Details:[],
      Visit:{}
    }}
  })
  const defaultValue=ref(1)

  const normalizeNumberText = (value) => {
    if (value === null || value === undefined || value === '') return ''
    const matched = String(value).match(/\d+(\.\d+)?/)
    return matched ? matched[0] : String(value)
  }

  const firstText = (...values) => {
    const value = values.find(item => item !== null && item !== undefined && item !== '')
    return value === undefined ? '' : String(value)
  }

  const materialName = (item) => firstText(item.MaterialName, item.Name)
  const materialWeight = (item) => normalizeNumberText(firstText(item.Weight, item.Count, item.Quantity))
  const doseCountText = (detail) => normalizeNumberText(firstText(detail.Count, detail.DoseCount)) || '1'
  const dosageFormText = (detail) => firstText(detail.MedicineTypeName, detail.Unit, detail.DosageFormName)
  const useMethodText = (detail) => firstText(detail.UseMethodName, detail.UseMethod)
  const frequencyText = (detail) => firstText(detail.DailyFrequencyName, detail.FrequencyName, detail.DailyFrequency, detail.Frequency, detail.Dosage)
  const eachDoseText = (detail) => normalizeNumberText(firstText(detail.PerDoseAmount, detail.EachDose))
  const doseUnitText = (detail) => firstText(detail.DoseUnitName, detail.DoseUnit)
  const takeTimeText = (detail) => firstText(detail.TakeTimeName, detail.TakeTime)
  const takeDaysText = (detail) => normalizeNumberText(firstText(detail.CertNumber, detail.TimeFrame, detail.TakeDays))

</script>
<style lang="less" scoped>
.dashboard-card-radius {
  overflow: hidden;
  border-radius: 12px;
}

.completed-detail-view {
  width: var(--dashboard-center-card-width, 960px);
  margin-right: auto;
  margin-left: auto;
}

.completed-prescription-card {
  :deep(.ant-select) {
    pointer-events: none;
  }
}

.readonly-material-card {
  width: 286px;
  min-height: 40px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover,
  &:focus-within {
    border-color: @primary-color;
    box-shadow: 0 0 0 2px rgba(10, 90, 255, 0.08);
  }
}

.readonly-material-name {
  width: 180px;
  padding: 0 7px;
  overflow: hidden;
  color: #313947;
  font-size: 14px;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.readonly-material-weight {
  width: 50px;
  min-width: 50px;
  padding: 0 7px;
  color: #313947;
  font-size: 14px;
  line-height: 24px;
  text-align: right;
}

.prescription-detail-plan {
  overflow-x: visible;
  overflow-y: visible;
  margin-top: 12px;
  padding: 0;

  .medicine-plan-bar {
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: stretch;
    width: fit-content;
    max-width: 100%;
    min-width: 0;
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
    background: #E1EBFF;

    &:first-child {
      border-left-color: transparent;
      border-radius: 8px 0 0 8px;
    }

    &:last-child {
      border-radius: 0 8px 8px 0;
    }
  }

  .medicine-plan-field {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 34px;
    padding: 5px 8px !important;
    overflow: hidden;
    color: #313947;
    font-size: 14px;
    font-weight: 500 !important;
    line-height: 22px;
    background: transparent !important;
    border: 0;
    border-radius: 0 !important;
    box-shadow: none;
    cursor: default;

    > span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .medicine-plan-field-filled {
    color: #1F2B3D;
  }

  .medicine-plan-number {
    display: inline-block;
    width: 28px;
    text-align: right;
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
  }

  .medicine-plan-field-dosage > span:first-child,
  .medicine-plan-field-frequency > span:first-child,
  .medicine-plan-field-each-dose > span:first-child,
  .medicine-plan-field-unit > span:first-child,
  .medicine-plan-field-time > span:first-child,
  .medicine-plan-field-days > span:first-child {
    display: none;
  }
}
</style>
