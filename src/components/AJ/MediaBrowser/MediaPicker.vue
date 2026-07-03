<template>
  <section>
    <a-button type="default" v-if="type == 'button'" :disabled="displayOnly" @click="showMediaBs">
      <small>{{ text }} <small v-if="max > 1 && max < 99">{{ files.length }}/{{ max }}</small></small>
    </a-button>
    <section class="media-items aj-media-button aj-flex aj-align-center aj-justify-start aj-margin-lr-sm" ref="mediaItemsRef" style="flex-wrap: wrap;" v-else>
      <div class="media-item" v-for="(item, index) in files" :key="index"
        :style="{ height: size.height + 'px', width: size.width + 'px' }" >
        <video v-if="isVideo(item.Url)" 
             style="border-radius: 4px 4px 0 0; height: 160px; background-color: black;width: 100%;height: 100%;" 
             :controls="false"
             :src="parseUrl(item.Url)"></video>
        <a-image v-else class="img-item" placeholder :src="parseUrl(item.Url)" :height="size.height" :fallback="DEFAULTEMPTYIMAGEURL" ></a-image>
        <a :class="smallDelBtn ? 'del-btn1 bg-red' : 'del-btn bg-red'" @click.stop="removeImg(index)" v-if="!displayOnly" >
          <Icon icon="ant-design:close-outlined" />
        </a>
        <a :class="smallDelBtn ? 'del-btn2 bg-blue' : 'del-btn3 bg-blue'" @click.stop="e => showMediaBs(e,item)" v-if="!displayOnly" >
          <Icon icon="ant-design:retweet-outlined" />
        </a>
      </div>
      <div v-if="displayOnly && files.length == 0">
        <AEmpty :description="emptyText" />
      </div>
      <a class="media-item media-picker text-center aj-flex aj-align-center aj-justify-center text-gray"
        :style="{ height: size.height + 'px', width: size.width + 'px' }" v-if="files.length < max && !displayOnly"
        @click="showMediaBs">
        <div>
          <Icon icon="ant-design:plus-circle-outlined" size="24" color="#0A5AFF"></Icon>
          <div>
            <small>{{ text }} <small v-if="max > 1 && max < 99">{{ files.length }}/{{ max }}</small></small>
          </div>
        </div>
      </a>
    </section>
    <teleport to="body">
      <MediaBrowser ref="MediaBrowserRef" @register="bsRegister" @ajselected="mediaSelected" :selectFileType="selectFileType" />
    </teleport>
  </section>
</template>
<script lang="ts">
import { defineComponent, computed, ref, toRaw, unref, watch,onMounted } from 'vue';

import utils, { DEFAULTEMPTYIMAGEURL ,parseUrl} from '/@/utils/common'

import MediaBrowser from '/@/components/AJ/MediaBrowser/BrowserModal.vue'

import { useModal } from '/@/components/Modal'

import { useMessage } from '/@/hooks/web/useMessage'

import { useSortable } from '/@/hooks/web/useSortable';


export default defineComponent({
  components: { MediaBrowser },
  emits: ['update:images', 'selected','change'],
  props: {
    fileFilter: {
      type: String,
      default: ''
    },
    emptyText: {
      type: String,
      default: '暂无文件'
    },
    formType: {
      type: String,
      default: 'array', // 表单绑定值类型 array 或 string
    },
    displayOnly: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: '上传图片'
    },
    size: {
      type: Object,
      default: () => {
        return {
          height: 120,
          width: 120
        }
      }
    },
    max: {
      type: Number,
      default: 6
    },
    type: {
      type: String,
      default: 'picture' // picture 图片视频模式 , button 简单按钮形式
    },
    images: {
      type: [Array, String],
      default: () => {
        return []
      }
    },
    selectFileType:{
      type: String,
      default: 'all' 
    },
    //隐藏右上角删除
    smallDelBtn:{
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const mediaItemsRef = ref()
    onMounted(() => {
      if (mediaItemsRef.value) {
        const { initSortable } = useSortable(mediaItemsRef, {
          onEnd: (evt) => {
            const { oldIndex, newIndex } = evt;
            if (typeof newIndex == 'number') {
              const source = files.value[oldIndex as number]
              files.value.splice(oldIndex as number,1)
              files.value.splice(newIndex, 0 , source )
              emit(props.type == 'button' ? 'selected' : 'update:images', props.formType == 'array' ? files.value : files.value[0].Url)
              emit('change',files.value)
            }
          },
        });
        initSortable();
      }
    })
    const [bsRegister, { openModal }] = useModal()

    const { createConfirm, createMessage } = useMessage()

    const MediaBrowserRef = ref()

    const files = ref([])

    watch(() => props.images, () => {
      initFiles()
    })
    const initFiles = () => {
      if (typeof (props.images) == 'object') {
        files.value = [...toRaw(unref(props.images))]
      }

      if (typeof (props.images) == 'string' && props.images) {
        files.value = [{
          Id: new Date().getTime().toString(),
          Url: props.images
        }]
        
      }
    }

    //initFiles()

    onMounted(() => {
      initFiles()
    })

    // 生命周期

    const computedCover = computed(() => {
      return (url) => {
        return utils.computeFileIcon({
          Url: url,
          Extension: utils.computeFileExt(url)
        })
      }
    })
    const editObj = ref({
      ID: null,
      Url: null
    })
    // methods
    const showMediaBs = (e,edit:any = false) => {
      if (edit) {
        editObj.value = {
          ID: edit.ID || edit.Id,
          Url: edit.Url
        }
      } else {
        editObj.value = {
          ID: null,
          Url: null
        }
      }
      openModal(true)
    }

    const removeImg = (index) => {
      createConfirm({
        title: '删除提示',
        content: '确定移除该项吗?',
        iconType: 'warning',
        onOk: () => {
          files.value.splice(index, 1)
          if (props.formType == 'array') {
            emit('update:images', [...toRaw(unref(files.value))])
            emit('change')
          } else {
            emit('update:images', files.value[0] ? files.value[0].Url : '')
            emit('change')
          }

        }
      })
    }

    const mediaSelected = (list) => {
      if (editObj.value.ID || editObj.value.Url) {
        //修改
        const imgs = JSON.parse(JSON.stringify(files.value))
        let index = imgs.findIndex(p => ((p.Id || p.ID) == editObj.value.ID) || (p.Url == editObj.value.Url))
        imgs.splice(index, 1, list[0])
        emit(props.type == 'button' ? 'selected' : 'update:images', props.formType == 'array' ? imgs : imgs[0].Url)
        emit('change',imgs)
        MediaBrowserRef.value?.closeModal()
        return 
      }
      
      let array = []
      list.forEach(i => {
        const index = files.value.findIndex(p => (p.Id || p.ID) == (i.Id || i.ID))
        if (index == -1) {
          array.push(i)
        }
      })
      if ((props.max > 0 && props.max < 99) && (array.length + files.value.length) > props.max) {
        createMessage.warn(`已超过最大上传限制:${props.max}`)
        return
      }
      if (array.length > 0) {
        const imgs = [...files.value, ...array]
        files.value = imgs
        emit(props.type == 'button' ? 'selected' : 'update:images', props.formType == 'array' ? imgs : imgs[0].Url)
        emit('change',imgs)

      }
      MediaBrowserRef.value?.closeModal()
    }

    return {
      MediaBrowserRef,
      computedCover,
      removeImg,
      DEFAULTEMPTYIMAGEURL,
      showMediaBs,
      bsRegister,
      mediaSelected,
      files,
      mediaItemsRef,
      isVideo: utils.isVideoURL,
      parseUrl
    }
  },
});
</script>
<style scoped>
.media-item {
  background-color: #F7F9FC;
  border-radius: 4px;
  border: 1px dashed #0A5AFF;
  margin: 8px;
  position: relative;
  overflow: hidden;
}

.ant-image {
  text-align: center;
}

.media-item .del-btn {
  display: inline-flex;
  padding: 2px 4px;
  position: absolute;
  top: 0;
  right: 0;
  height: 24px;
  width: 24px;
  border-top-right-radius: 4px;
}
.media-item .del-btn1 {
  display: inline-flex;
  position: absolute;
  top: 0;
  right: 0;
  border-top-right-radius: 4px;
}

.media-item .del-btn2 {
  display: inline-flex;
  position: absolute;
  top: 0;
  left: 0;
  border-top-right-radius: 4px;
}
.media-item .del-btn3 {
  display: inline-flex;
  padding: 2px 4px;
  position: absolute;
  top: 0;
  left: 0;
  height: 24px;
  width: 24px;
  border-top-right-radius: 4px;
}

</style>
