<template>

  <a-card hoverable :bodyStyle="{padding:'0'}"
        :class="{'img-selected':mediaItem.selected,'bg-red error':mediaItem.status == -1}"
        @click="selectImage">
    <template #cover>
      <video v-if="isVideo(mediaItem.Url)" 
             height="160" 
             style="border-radius: 4px 4px 0 0; height: 160px; background-color: black" 
             controls
             :src="mediaItem.Url"></video>
      <a-image v-else class="img-item"
              placeholder
              height="160"
              style="border-radius: 4px 4px 0 0; max-height: 200px;"
              :preview="false"
              :src="mediaItem.Cover" :fallback="DEFAULTEMPTYIMAGEURL"></a-image>
    </template>
    
     <div class="img-info" :style="{padding:'8px',color: mediaItem.status == -1 ? '#e54d42' : 'inherit'}">
        <div class="text-left img-title text-bold">{{mediaItem.Name}}</div>
      </div>

    <!-- <a-card-meta :title="mediaItem.Name" :style="{padding:'8px',color: mediaItem.status == -1 ? '#e54d42' : 'inherit'}">
      <template #description>
        <span :class="mediaItem.status!=1 ? 'aj-margin-bottom-sm' : ''">{{mediaItem.CreateDate}}</span>
      </template>
    </a-card-meta> -->

    <div v-if="mediaItem.selected" class="select-flag" :class="mediaItem.status== -1 ? 'bg-red' : 'bg-green'">
      <Icon icon="ant-design:check-outlined"></Icon>
    </div>
    <div v-if="mediaItem.status == 0 || mediaItem.status == -1" class="upload-progress bg-gray aj-padding-lr-sm">
      <a-progress size="small"
                 :percent="mediaItem.uploadPercent"
                 :status="mediaItem.status == 0 ? 'active' : (mediaItem.status == 1 ? 'success' : 'exception')" />
    </div>
    <div v-if="mediaItem.status == 0 || mediaItem.status == 2" class="status-mask aj-flex aj-align-center aj-justify-center">
      <a-spin v-if="[0,2].includes( mediaItem.status )"
             :tip="mediaItem.status == 0 ? '上传中...' : '删除中...'" class="text-white" size="large">
        <template #indicator>
          <LoadingOutlined />
        </template>
      </a-spin>
    </div>
  </a-card>
</template>
<script lang="ts">
  import { computed, defineComponent, onMounted } from 'vue';

  import { LoadingOutlined } from '@ant-design/icons-vue';

  import utils, { commonRegex, DEFAULTEMPTYIMAGEURL } from '/@/utils/common'
  import { formatToDateTime } from '/@/utils/dateUtil'

  import { upload ,GetSTSToken } from '/@/api/platform/common'

  export default defineComponent({
    components: { LoadingOutlined },
    props: {
      mediaItem: {
        type: Object
      },
      disabled: {
        type: Boolean,
        default: false
      }
    },
    setup(props) {
      const GID = localStorage.getItem('GID') || ''
      const uniUpload = (file) => {
        return new Promise((resolve, reject) => {
          return reject(false)
          GetSTSToken().then(res => {
            let client = new OSS({
              // yourRegion填写Bucket所在地域。以华东1（杭州）为例，yourRegion填写为oss-cn-hangzhou。
              region: res.Endpoint ?  res.Endpoint.split('.')[0] : 'oss-cn-beijing',
              authorizationV4: true,
              // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
              accessKeyId: res.AccessKeyId,
              accessKeySecret: res.AccessKeySecret,
              // 从STS服务获取的安全令牌（SecurityToken）。
              stsToken: res.SecurityToken,
              // 填写Bucket名称。
              bucket: res.BucketName,
            });
            let namearr = file.name.split('.')
            let name = namearr[0] + GID + Math.floor((Math.random() * 100) + 1) + '.' + namearr[1]
            client.put(name, file).then((ress) => {
              resolve(ress)
            }).catch((err) => {
              reject(err)
            })
            
          }).catch((err) => {
            reject(err)
          })
        })
      }

      onMounted(() => {
        if (props.mediaItem.status == 0 && props.mediaItem.file) {
          uniUpload(props.mediaItem.file).then((res) => {
            upload({url:res.url,filetype: utils.computeFileExt(res.url),size: props.mediaItem.file.size}, (e) => {
              const val = (e.loaded / e.total).toFixed(2);
              let p = Number((Number(val) * 100).toFixed(0));
              props.mediaItem.uploadPercent = p
            },).then(data => {
              props.mediaItem.status = 1
              props.mediaItem.Name = data.name
              props.mediaItem.Id =  data.id || utils.buildShortUUID()
              props.mediaItem.Cover = utils.computeFileIcon({
                Url: data.url,
                Extension: utils.computeFileExt(data.url)
              })
              props.mediaItem.Url = data.url
              props.mediaItem.CreateDate = formatToDateTime(new Date())
            }).catch((err) => {
              props.mediaItem.Url = DEFAULTEMPTYIMAGEURL
              props.mediaItem.status = -1
            })

          }).catch((err) => {
            let formData = new FormData()
            formData.append('file',props.mediaItem.file)
            formData.append('category',props.mediaItem.category)
            formData.append('storeType',props.mediaItem.storeType)
            upload(formData, (e) => {
              const val = (e.loaded / e.total).toFixed(2);
              let p = Number((Number(val) * 100).toFixed(0));
              props.mediaItem.uploadPercent = p
            }, 'none').then(data => {
              if (data && data.length) {
                const img = data[0]
                props.mediaItem.Name = img.name
                props.mediaItem.Id = img.Id
                props.mediaItem.Cover = utils.computeFileIcon({
                  Url: img.url,
                  Extension: utils.computeFileExt(img.url)
                })
                props.mediaItem.Url = img.url
                props.mediaItem.CreateDate = formatToDateTime(new Date())
                props.mediaItem.status = 1
              } else {
                props.mediaItem.Url = DEFAULTEMPTYIMAGEURL
                props.mediaItem.status = -1
              }
            }).catch((err) => {
              props.mediaItem.Url = DEFAULTEMPTYIMAGEURL
              props.mediaItem.status = -1
            })
          })
        }
      })

      const isVideo = computed(() => {
        return (url) => {
          return commonRegex.video.test(utils.computeFileExt(url))
        }
      })

      const selectImage = () => {
        if (props.disabled || [0, 2].includes(props.mediaItem.status)) {
          return
        }
        props.mediaItem.selected = !props.mediaItem.selected
      }

      return {
        DEFAULTEMPTYIMAGEURL,
        selectImage,
        isVideo
      }
    },
  });
</script>

<style lang="less" scoped>
  .ant-card {
    border-radius: 4px;
  }

    .ant-card.img-selected {
      border: 1px dashed #39b54a;
    }

      .ant-card.img-selected.error {
        border: 1px dashed #e54d42;
      }



    .ant-card .select-flag {
      position: absolute;
      right: 0;
      top: 0;
      padding: 4px;
      width: 40px;
      border-top-right-radius: 4px;
      text-align: center;
    }

    .ant-card .status-mask {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-color: rgba(0,0,0,.5);
      border-radius: 4px;
      z-index: 10;
    }

    .ant-card .upload-progress {
      position: absolute;
      bottom: 0;
      width: 100%;
      left: 0;
      right: 0;
    }

    .ant-card .ant-card-cover {
      border-radius: 4px;
      text-align: center;
    }

  .ant-image {
    text-align: center;
  }

  .ant-spin {
    color: white
  }
</style>

<style scoped>
.ant-card {
  border-radius: 4px;
  height: 160px;
  width: 160px;
  overflow: hidden;
}

.ant-card .ant-card-cover {
  height: 160px;
  width: 160px;
}

      .ant-card .img-info {
        position: absolute;
        bottom: -2px;
        width: 160px;
        background-color: rgba(0,0,0,.3);
        display: none;
    }
.ant-card:hover .img-info {
        display: block;
        color: #fff;
    }

    .ant-card .img-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 90%;
        color: #fff;
    }

    .ant-card.img-selected .status-mask {
            border: 1px dashed #39b54a;
        }


      .ant-card.img-selected.error .ant-image, .aj-media-item .ant-card.img-selected.error video {
            border: 1px dashed #e54d42;
        }

  .ant-card .select-flag {
        position: absolute;
        right: -2px;
        top: 0;
        padding: 4px;
        width: 35px;
        border-bottom-left-radius: 50px;
        text-align: center;
        z-index: 12;
        overflow: hidden;
    }

  .ant-card .status-mask {
        position: absolute;
        top: 0;
        left: 0;
        height: 158px;
        width: 158px;
        background-color: rgba(0,0,0,.2);
        border-radius: 4px;
        z-index: 10;
    }
.ant-card .upload-progress {
        position: absolute;
        bottom: 0;
        width: 100%;
        left: 0;
        right: 0;
    }

  .ant-card .ant-card-cover {
        border-radius: 4px;
        text-align: center;
    }

.ant-image {
    text-align: center;
}

.ant-image img {
        object-fit: contain;
    }

.ant-spin {
    color: white;
}

.select-index {
color: white;
font-size: 20px;
display: inline-block;
height: 32px;
width: 32px;
border-radius: 50%;
border: 1px solid white;
text-align: center;
line-height: 30px;
}
 

 @media screen and (max-width: 900px) {
    .ant-card {
          height: 120px;
          width: 120px;
      }

          .ant-card .ant-card-cover {
              height: 120px;
              width: 120px;
          }

          .ant-card .img-info {
              width: 120px;
          }

        .ant-card .status-mask {
              height: 118px;
              width: 118px;
          }
    }
</style>
