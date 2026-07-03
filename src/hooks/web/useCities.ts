import { ref } from 'vue';
import {Cities} from '/@/api/platform/common';

interface IDistrict {
  name: string;
  code: string | number;
  ParentName: string;
  ParentCode: string;
  children?: [] | null;
}
interface ICity {
  name: string;
  code: string | number;
  ParentName?: string;
  ParentCode?: string;
  children: IDistrict[];
}
interface IProvince {
  name: string;
  code: string | number;
  ParentName?: string;
  ParentCode?: string;
  children: ICity[];
}

const allCities = ref<IProvince[]>([]);
let loading = false;
const getCity = () => {
  loading = true;
  Cities().then((res) => {
    allCities.value = res;
  })
  .finally(() => {
    loading = false;
  });
};
getCity();

function useCities(refresh = false) {
  if (allCities.value.length < 1 || refresh) {
    !loading && getCity();
  }
  return allCities;
}
type GetRegionDataForNameFn = (province: string, city: string, district: string) => { Code: string | number; Name: string }[];
export const getRegionDataForName: GetRegionDataForNameFn = function (province: string, city: string, district: string) {
  let RegionData: { Code: string | number; Name: string }[] = [];
  let provinceData: IProvince | undefined = allCities.value.find((a) => a.name == province);
  if (provinceData && provinceData.children) {
    let cityData: ICity | undefined = provinceData.children.find((a) => a.name == city);
    let districtData: IDistrict[] = [];
    if (cityData) {
      districtData = cityData.children;
    } else {
      provinceData.children.forEach((a) => {
        districtData.push(...a.children);
      });
    }

    let rightDistrict = districtData.find((a) => a.name == district);
    if (rightDistrict) {
      RegionData = [
        {
          Name: provinceData.name,
          Code: provinceData.code,
        },
        {
          Name: rightDistrict.ParentName,
          Code: rightDistrict.ParentCode,
        },
        {
          Name: rightDistrict.name,
          Code: rightDistrict.code,
        },
      ];
    }
  }
  return RegionData;
};

export default useCities;
