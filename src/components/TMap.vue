<template>
  <div>
    <a-modal title="地图选点" v-model:open="MapModal.visible" width="1000px" :zIndex="1001">
      <div style="min-width: 900px; padding: 16px; max-height: calc(100vh - 240px); overflow-y: auto" v-if="MapModal.visible" v-loading="loading">
        <div class="form-group" id="r-result">
          <div class="input-group" style="display: flex">
            <a-input v-model:value="MapModal.cityName" id="cityName" style="width: 250px" placeholder="请输入地址来直接查找相关位置" />
            <div class="input-group-btn">
              <a-button @click="theLocation" style="margin-left: 10px">搜索</a-button>
            </div>
          </div>
        </div>
        <div id="container" style="height: 450px; margin-top: 12px; width: 900px"></div>
      </div>
      <template #footer>
        <a-space>
          <a-button type="primary" @click="MapModal.confirm" :loading="loading"> 确定 </a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>
<script>
  import { defineComponent, nextTick, reactive, ref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { jsonp } from '/@/utils/jsonp.js';

  export default defineComponent({
    name: 'TMap',
    components: {},
    props: {
      Latitude: {
        type: [String, Number],
        default: 39.916527,
      },
      Longitude: {
        type: [String, Number],
        default: 116.397128,
      },
      Address: {
        type: String,
        default: '',
      },
      FullAddress: {
        type: String,
        default: '',
      },
      OnlyLatlong: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:Latitude', 'update:Longitude', 'update:FullAddress', 'update:Address', 'addressData', 'regionCodeData'],
    setup(props, { emit }) {
      const { createMessage } = useMessage();
      const TmapKey = '2TVBZ-EEGCU-H7MVA-4KFNS-VYVIV-Z3FW2';
      function loadScript() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://map.qq.com/api/gljs?v=1.exp&libraries=service&key=${TmapKey}`;
        document.body.appendChild(script);
      }
      if (!window.TMap) {
        loadScript();
      }
      const loading = ref(false);
      const getAddrForJwd = (location) => {
        return new Promise((resolve, reject) => {
          let params = {
            key: TmapKey,
            location: `${location.lat},${location.lng}`,
          };
          loading.value = true;
          jsonp('https://apis.map.qq.com/ws/geocoder/v1/?', {
            output: 'jsonp',
            ...params,
          })
            .then((res) => {
              loading.value = false;
              if (res.status === 0) {
                resolve(res.result);
              } else {
                createMessage.error('地址解析失败');
                reject(res);
              }
            })
            .catch(() => {
              loading.value = false;
            });
        });
      };
      var geocoder,
        map,
        marker = null,
        mapdetail = {},
        poi = {},
        city,
        markers;
      const MapModal = reactive({
        visible: false,
        cityName: '',
        confirm() {
          if (mapdetail && mapdetail.lat) {
            if (props.OnlyLatlong) {
              emit('update:Latitude', mapdetail.lat.toString().slice(0, 8));
              emit('update:Longitude', mapdetail.lng.toString().slice(0, 8));
              MapModal.visible = false;
            } else {
              getAddrForJwd(mapdetail)
                .then((result) => {
                  emit('update:Address', result.formatted_addresses?.recommend || result.address_component?.street || result.address);
                  emit('update:FullAddress', result.address);
                  emit('addressData', result.address_component);
                  emit('regionCodeData', result.ad_info);
                  emit('update:Latitude', mapdetail.lat.toString().slice(0, 8));
                  emit('update:Longitude', mapdetail.lng.toString().slice(0, 8));
                  MapModal.visible = false;
                })
                .catch(() => {});
            }
          } else {
            createMessage.error('没有选择地址');
          }
        },
        show() {
          MapModal.visible = true;
          mapdetail.lat = props.Latitude || 0;
          mapdetail.lng = props.Longitude || 0;
          nextTick(() => {
            map = new TMap.Map('container', {
              zoom: 15,
              center: props.Latitude && props.Longitude ? new TMap.LatLng(props.Latitude, props.Longitude) : new TMap.LatLng(39.916527, 116.397128),
            });
            geocoder = new TMap.service.Geocoder(); // 新建一个正逆地址解析类
            markers = new TMap.MultiMarker({
              map: map,
              geometries: props.Latitude && props.Longitude ? [{ id: 'main', position: new TMap.LatLng(props.Latitude, props.Longitude) }] : [],
            });
            map.on('click', (evt) => {
              poi = evt.poi;
              let latLng = evt.latLng;
              if (poi) {
                markers.updateGeometries([
                  {
                    id: 'main',
                    position: poi.latLng,
                  },
                ]);
                map.setCenter(poi.latLng);
                mapdetail = poi.latLng;
              } else if (latLng) {
                markers.updateGeometries([
                  {
                    id: 'main',
                    position: latLng,
                  },
                ]);
                map.setCenter(latLng);
                mapdetail = latLng;
              }
            });
            if (props.FullAddress) {
              theLocation(true, props.FullAddress);
            }
          });
        },
      });
      function theLocation(markshow = true, cityname = '') {
        markers.setGeometries([]);
        // 将给定的地址转换为坐标位置
        let address = cityname || MapModal.cityName;
        if (!address) return;
        geocoder.getLocation({ address: address }).then((result) => {
          if (markshow) {
            markers.updateGeometries([
              {
                id: 'main',
                position: result.result.location, // 将得到的坐标位置用点标记标注在地图上
              },
            ]);
          }
          map.setCenter(result.result.location);
          mapdetail = result.result.location;
          // 显示坐标数值
        });
      }

      return {
        geocoder,
        map,
        marker,
        mapdetail,
        city,
        markers,
        MapModal,
        theLocation,
        loading,
      };
    },
  });
</script>

<style lang="less" scoped>
  .uploading {
    cursor: pointer;
    background: #f7f9fc;
    color: #8d9199;
    overflow: hidden;
  }
</style>
