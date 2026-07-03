<template>
  <div>
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

    <a-card class="mt16px">
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
          <div class="flex align-center flex-wrap gap12px">
            <div class="flex justify-between align-center border border-rd-4px border-color-[#E9ECEF] py7px px12px mt12px" v-for="(p,i) in item.Materials" :key="i">
              <div>{{ p.Name }}</div>
              <a-divider type="vertical" />
              <div>{{ p.Weight }}</div>
              <div>{{ p.Unit }}</div>
            </div>
          </div>
          <div class="flex align-center gap12px mt12px whitespace-nowrap">
            <div class="border-rd-4px bg-[#F6F8FC] text-bold p8px">{{item.Detail.Count}}剂</div>
            <div class="border-rd-4px bg-[#F6F8FC] text-bold p8px">剂型：{{ item.Detail.Unit }}</div>
            <div class="border-rd-4px bg-[#F6F8FC] text-bold p8px">用法：{{ item.Detail.UseMethod }}</div>
            <div class="border-rd-4px bg-[#F6F8FC] text-bold p8px">每日次数：{{ item.Detail.DailyFrequency }}</div>
            <div class="border-rd-4px bg-[#F6F8FC] text-bold p8px">单次剂量：{{ item.Detail.PerDoseAmount }}</div>
            <div class="border-rd-4px bg-[#F6F8FC] text-bold p8px">剂量单位：{{ item.Detail.DoseUnit }}</div>
            <div class="border-rd-4px bg-[#F6F8FC] text-bold p8px">用药时间：{{ item.Detail.TakeTime }}</div>
            <div class="border-rd-4px bg-[#F6F8FC] text-bold p8px">用药天数：{{ item.Detail.TimeFrame }}</div>
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

</script>
<style lang="less" scoped>
</style>