<template>
  <BasicModal
    v-bind="$attrs"
    :destroyOnClose="true"
    @register="bsMregister"
    :defaultFullscreen="false"
    :canFullscreen="false"
    @open-change="handleVisibleChange"
    wrapClassName="aj-media-browser2"
    width="900px"
    :maskClosable="false"
    centered
  >
    <template #tool>
      <div class="aj-flex aj-align-center aj-justify-between toolBox" style="margin-top: -32px">
        <div>
          <a-form-item-rest>
            <a-input-search
              v-model:value="searchForm.search"
              allowClear
              placeholder="搜索文件名、扩展名"
              @search="getList(true)"
              style="width: 250px"
            />
          </a-form-item-rest>
        </div>
        <a-space align="center" class="tool-header-right">
          <a-popconfirm placement="bottom" :open="categoryCfg.visible" @cancel="categoryCfg.cancel" @confirm="categoryCfg.confirm">
            <template #icon>
              <span></span>
            </template>
            <template #title>
              <a-form-item-rest><a-input v-model:value="categoryCfg.name" placeholder="分类名称,10字以内" :maxlength="10" /></a-form-item-rest>
            </template>
            <span>&nbsp;</span>
          </a-popconfirm>
          <a-dropdown :disabled="loading">
            <template #overlay>
              <a-menu @click="categoryOpeartion">
                <a-menu-item key="add"> <Icon icon="ant-design:plus-outlined"></Icon> 添加分类 </a-menu-item>
                <a-menu-item key="rename"> <Icon icon="ant-design:edit-outlined"></Icon> 重命名 </a-menu-item>
                <a-menu-item key="delete"> <Icon color="#ed6f6f" icon="ant-design:delete-outlined"></Icon> 删除分类 </a-menu-item>
              </a-menu>
            </template>
            <a-button type="primary" post-icon="ant-design:down-outlined"> 分类操作 </a-button>
          </a-dropdown>
          <a-form-item-rest>
            <a-upload :before-upload="beforeUpload" multiple :showUploadList="false" withCredentials>
              <a-button type="primary" pre-icon="ant-design:upload-outlined" :disabled="loading"> 上传资源 </a-button>
            </a-upload>
          </a-form-item-rest>

          <a-divider type="vertical"></a-divider>
          <div> <small>已选择</small> {{ selectedSuccessCount }} <small>个</small> </div>
          <a-button color="success" @click="confirmSelect" :disabled="loading || selectedSuccessCount == 0" pre-icon="ant-design:check-outlined">
            确定选择
          </a-button>
          <a-button color="error" @click="deleteSelected" :disabled="loading || selectedCount == 0" pre-icon="ant-design:delete-outlined">
            删除所选
          </a-button>
        </a-space>
      </div>
    </template>
    <div
      class="ymd-tab-box"
      style="position: absolute; z-index: 999; height: 500px; width: 12%; flex-direction: column; overflow-y: auto; border-bottom: 0"
    >
      <div
        v-for="tab in tabs"
        :key="tab.value"
        :class="tab.value == currentTab ? 'tabAc' : ''"
        @click="currentTab = tab.value"
        style="text-align: center; margin-right: 0; border-radius: 0"
        >{{ tab.name || '默认分类' }}</div
      >
    </div>
    <div style="overflow: hidden; position: relative; width: 100%; display: flex; height: calc(75vh - 180px)">
      <div style="width: 12%"></div>
      <div style="width: 88%; height: 100%; overflow: hidden; padding: 0px 0 12px 20px; box-sizing: border-box" v-loading="isShow">
        <div v-if="images.length < 1 && !loading" style="display: flex; justify-content: center; width: 100%; padding-top: 100px">
          <a-empty />
        </div>
        <section
          class="aj-imgbs-images"
          style="height: 100%; overflow-y: scroll; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; grid-row-gap: 20px; grid-column-gap: 1px"
        >
          <div v-for="item in images" :key="item.Id">
            <MediaItem :mediaItem="item" @remove="removeImage" @refresh="getList(true)" />
          </div>
        </section>
      </div>
    </div>
    <template #footer>
      <div class="aj-flex aj-align-center aj-justify-center aj-padding-sm footer-pagination" style="overflow: hidden; background-color: #fff">
        <a-pagination
          v-model:current="pageConfig.current"
          v-model:pageSize="pageConfig.pageSize"
          :showTotal="pageConfig.showTotal"
          :total="pageConfig.total"
          :showSizeChanger="false"
          @change="getList"
        ></a-pagination>
        <a-dropdown>
          <a
            class="ant-dropdown-link"
            @click.prevent
            style="padding: 1.5px 8px; border: 1px solid #d9d9d9; border-radius: 4px; color: rgb(31, 34, 41)"
          >
            {{ pageConfig.pageSize }}条/页
            <DownOutlined :style="{ fontSize: '13px' }" />
          </a>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="pageConfig.pageSize = 10">
                <a href="javascript:;">10条/页</a>
              </a-menu-item>
              <a-menu-item @click="pageConfig.pageSize = 20">
                <a href="javascript:;">20条/页</a>
              </a-menu-item>
              <a-menu-item @click="pageConfig.pageSize = 30">
                <a href="javascript:;">30条/页</a>
              </a-menu-item>
              <a-menu-item @click="pageConfig.pageSize = 40">
                <a href="javascript:;">40条/页</a>
              </a-menu-item>
              <a-menu-item @click="pageConfig.pageSize = 50">
                <a href="javascript:;">50条/页</a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </template>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, computed ,watch ,nextTick} from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { DownOutlined } from '@ant-design/icons-vue';
  import MediaItem from './MediaItem.vue'
  import utils , { parseUrl} from '/@/utils/common'

  import { useMessage } from '/@/hooks/web/useMessage'
  import { formatToDateTime } from '/@/utils/dateUtil'
  import { buildUUID } from '/@/utils/uuid'
  import { updateCategory,removeCategory,addCategory,remove,mediaList,getMediaGroups} from '/@/api/platform/common'
  import { useAppStore } from '/@/store/modules/app'
  import heic2any from 'heic2any';

  export default defineComponent({
    components: { MediaItem, BasicModal , DownOutlined },
    emits: ['register', 'ajselected'],
    props: {
      selectFileType:{
        type: String,
        default: 'all' 
      }
    },
    setup(props, { emit }) {
      // data
      const currentTab = ref<string | number>('-1')
      const tabs = ref([])
      const isShow=ref(false)
      const pageConfig = ref({
        current: 1,
        pageSize: 24,
        total: 0,
        size: 'small',
        showTotal: (total) => {
          return `共 ${total} 条`;
        },
      })
      const images = ref([])
      const loading = ref(false)
      const searchForm = ref({
        search: ''
      })
      watch(() => pageConfig.value.pageSize,() => {
          pageConfig.value.current = 1;
          getList();
        },
      );
      watch(
        () => currentTab.value,
        () => {
          getList(true);
        },
      );
      const categoryCfg = ref({
        visible: false,
        cancel: () => {
          categoryCfg.value.visible = false
          categoryCfg.value.name = ''
        },
        confirm: () => {
          if (!categoryCfg.value.name) {
            createMessage.warn({
              content: '请输入分类名称',
            })
            return
          }
          categoryCfg.value.saving = true
          if (categoryCfg.value.editMode) {
            updateCategory({
              id: currentTab.value,
              name: categoryCfg.value.name
            }).then(() => {
              notification.success({
                message: '提示',
                description: `${categoryCfg.value.name} 已更新成功`,
                duration: 2,
              })
              getCategories()
            }).catch(() => {})
            .finally(() => { categoryCfg.value.saving = false })
          } else {
            addCategory({
              name: categoryCfg.value.name
            }).then(() => {
              notification.success({
                message: '提示',
                description: `${categoryCfg.value.name} 已添加成功`,
                duration: 2,
              })
              getCategories()
            }).catch(() => {
            }).finally(() => { categoryCfg.value.saving = false })
          }
          categoryCfg.value.visible = false
          categoryCfg.value.name = ''
        },
        name: '',
        saving: false,
        editMode: false,
      })

      // others
      const appStore = useAppStore()
      const { createMessage, notification, createConfirm } = useMessage()

      const [bsMregister, { closeModal }] = useModalInner((data) => {});

      // 生命周期
      const availableHeight = computed(() => {
        return appStore.getWindowAvailableHeight - 200
      })
      const selectedCount = computed(() => {
        return images.value.filter(p => p.selected).length
      })
      const selectedSuccessCount = computed(() => {
        return images.value.filter(p => p.selected && p.status == 1).length
      })

      const beforeUpload = async (file, list) => {
        if (list.length > 9) {
          createMessage.warn({ content: '最多支持同时上传 9 个文件' });
          return false;
        }
        // 检查文件大小 超过 100M 提示
        const sizeOfM = Number((file.size / 1024 / 1024).toFixed(2));
        if (sizeOfM > 100) {
          createMessage.warn({ content: `最大支持上传 100M 文件,当前:${sizeOfM}M ` });
          return false;
        }
        const isHeic = file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic');
        let finalFile = file; // 最终要上传的文件
        if (isHeic) {
          isShow.value=true
          try {
            const convertedBlob = await heic2any({
              blob: file,
              toType: 'image/jpeg', // 转换为目标格式
              quality: 0.8, // 质量
            });
            const newFileName = file.name.replace(/\.heic$/i, '.jpg');
            finalFile = new File([convertedBlob], newFileName, { type: 'image/jpeg' });
            isShow.value=false
          } catch (error) {
            createMessage.error('图片格式转换失败，请重试');
            isShow.value=false
            return false; // 转换失败则中断上传
          }
        }
        const newImg = {
          Id: buildUUID(),
          Name: finalFile.name,
          Cover: URL.createObjectURL(finalFile),
          Url: URL.createObjectURL(finalFile),
          CreateDate: formatToDateTime(new Date()),
          selected: false,
          file: finalFile, // 注意这里存入的是 finalFile
          uploadPercent: 0,
          category: currentTab.value,
          storeType: 0,
          status: 0
        };
        images.value.unshift(newImg);
        return false; // 阻止自动上传，因为我们已经在本地预览了
      };

      const confirmSelect = () => {
        const imageList = images.value.filter(p => p.selected).map(p => {
          return {
            Id: p.Id,
            Url: p.Url,
          }
        })
        
        if (props.selectFileType == 'image') {
          if (imageList.some(a => !utils.isImageURL(a.Url))) {
            createMessage.warn(`只能选择图片类型`)
            return
          }
        }
        if (props.selectFileType == 'video') {
          if (imageList.some(a => !utils.isVideoURL(a.Url))) {
            createMessage.warn(`只能选择视频类型`)
            return
          }
        }
        if (props.selectFileType == 'audio') {
          if (imageList.some(a => !utils.isAudioURL(a.Url))) {
            createMessage.warn(`只能选择音频类型`)
            return
          }
        }

        emit('ajselected', imageList)
      }
      const removeImage = (item) => {
        let index = images.value.findIndex(p => p.Id == item.Id)
        if (index == -1) {
          return
        }
        images.value.splice(index, 1)
      }
      const deleteSelected = () => {
        const array = images.value.filter(p => p.selected)

        createConfirm({
          title: '删除提示',
          content: `确定删除所选 ${array.length} 个文件?`,
          iconType: 'info',
          onOk: () => {

            const serverDels = array.filter(p => p.status == 1).map(p => {
              return {
                Id: p.Id,
                Name: p.Name,
                Url: p.Url
              }
            })
            array.forEach(i => {
              if (i.status == 1) {
                i.status = 2

              } else {
                const idx = images.value.findIndex(k => k.Id == i.Id)
                images.value.splice(idx, 1)
              }
            })

            if (serverDels.length) {
              remove({ ids: serverDels.map(p => p.Id) }).then(() => {}).catch(err => {
                serverDels.forEach(it => {
                  notification.error({
                    message: `删除失败`,
                    description: `${it.Name}:${err}`,
                    duration: 3,
                  })
                })

              }).finally(() => { getList() })
            }
          }
        })
      }

      const checkCategoryCanOperate = () => {
        if (categoryCfg.value.name == '默认图片') {
          createMessage.warn({
            content: '默认图片不支持该操作',
          })
          return false
        }
        return true
      }

      const categoryOpeartion = (item) => {        
        categoryCfg.value.editMode = item.key == 'rename'
        categoryCfg.value.name = item.key != 'add' ? tabs.value.find(p => p.value == currentTab.value)?.name : ''
        if (item.key != 'add') {
          if (!checkCategoryCanOperate()) {
            return
          }
        }
        if (item.key == 'delete') {
          createConfirm({
            title: '删除确认',
            content: `即将删除 ${categoryCfg.value.name} ,其下所有资源文件也会一并删除,是否确认?`,
            iconType: 'warning',
            keyboard: false,
            onOk: () => {
              return new Promise((ok, err) => {
                removeCategory({
                  id: currentTab.value
                }).then(() => {
                  getCategories()
                  ok(true)
                }).catch(() => {
                  err()
                })
              })
            }
          })
        }
        
        categoryCfg.value.visible = item.key != 'delete'
      }

      const getList = (isSearch = false) => {
        if (typeof isSearch != 'number') {
          isSearch && (pageConfig.value.current = 1);
        }
        loading.value = true;
        images.value = [];
        mediaList({
          category: currentTab.value,
          page: pageConfig.value.current || 1,
          limit: pageConfig.value.pageSize,
          search: searchForm.value.search
        }).then(data => {
          pageConfig.value.total = data.Total

          images.value = data.Rows.map(p => {
            return {
              Id: p.id,
              Name: p.name,
              Cover: utils.computeFileIcon({ Extension: utils.computeFileExt(p.url), Url: p.url }),
              Url: parseUrl(p.url),
              CreateDate: formatToDateTime(new Date()),
              selected: false,
              file: null,
              uploadPercent: 0,
              category: currentTab.value,
              storeType: p.fileType,
              status: 1 // 0 上传中 1 已上传 , -1 上传失败, 2 删除中
            }
          })
          nextTick(() => {
            document.querySelector(`.aj-imgbs-images`)?.scrollTo(0,0);
          })
        }).catch((err) => { }).finally(() => { loading.value = false })
      }

      const getCategories = () => {        
        getMediaGroups().then(data => {
          if (data.length > 0) {
            currentTab.value = data[0].value
            tabs.value = data
          }
        }).catch(() => { })
      }

      function handleVisibleChange(v) {
        getCategories()
        getList()
      }

      return {
        bsMregister,
        loading,
        availableHeight,
        pageConfig,
        tabs,
        currentTab,
        images,
        searchForm,
        categoryCfg,
        handleVisibleChange,
        categoryOpeartion,
        getList,
        selectedSuccessCount,
        selectedCount,
        confirmSelect,
        deleteSelected,
        beforeUpload,
        closeModal,
        removeImage,
        isShow
      }
    },
  });
</script>
<style lang="less">
  .aj-imgbs-images {
    overflow: hidden;
    overflow-y: auto;
  }

 
  .aj-media-browser .scrollbar__bar {
    width: 0;
    display: none;
  }
  .aj-media-browser2 .ant-modal {
      .scrollbar {
        padding: 0;
        .scrollbar__wrap {
          margin-bottom: 0 !important;
        }
      }

  }
    .aj-media-browser .ant-modal-content {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;

    }

    .aj-media-browser .ant-modal-body {
        flex: 1;
        height: 510px;
        overflow: hidden;
    }

    .aj-media-browser .aj-imgbs-images {
        overflow: hidden;
        overflow-y: auto;
    }

    .aj-media-browser .ant-modal-header {
        padding: 3px;
        border-bottom: 1px solid #fff;
    }

    .toolBox {
      padding: 0 12px;
      box-sizing: border-box;
      margin-bottom: 10px;
      .tool-header-right {
        flex: 1;
        padding-left: 10px;
        
      }
    }

    .footer-pagination {
      position: relative;
      z-index: 9999;
    }
    .ymd-tab-box {
      border-bottom: 0.5px solid #F2F5F7;
      background: #FFF;
      display: flex;
      div {
        color: #858D98;
        padding: 9px 16px;
        margin-right: 24px;
        cursor: pointer;
        &:hover {
          color: @primary-color;
        }
        &.tabAc {
          border-radius: 4px 4px 0px 0px;
          background: rgba(10, 90, 255, 0.08);
          color: @primary-color;
          font-weight: 600;
        }
      }
    }
</style>
