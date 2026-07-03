
<style>
  @keyframes retateRe {
      from {
          transform: rotate(0);
      }

      to {
          transform: rotate(360deg);
      }
  }

  .roteateLoading {
      transform-origin: center;
      animation: retateRe 2s infinite linear;
      width: 20px;
      height: 20px;
      margin-right: 6px;
  }
</style>
<!--组件声明-->
<template>
  <div style="display:flex;align-items:center;justify-content:center" @click="loadMore">
      <img v-if="status == 'loading'" class="roteateLoading" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAATZJREFUWEftltENwjAMRN1NYBPYBDaBSRgFRmET0KG4sqrEd01BVSX605/4/HJxHA+28jesnN+WAtzNbGdm+96NLAV4lcTdOt2BJfFPAWDtk1irAjS1MgcgDoBjAsIAkPhW6qSq0wLwwAOByACmGtVCzRyAgFd5y4m4u3haUnIEsCKcQqjXDeDuXhrDAAAZISDGChOJAYB1FFgBcAj8WXI/BuUGfdaqAL2Njsb9AaIDXrlT26RianhNNSMA7vSpIvQo3ZCeZ2UB1fzXwKYcQIdDPSjf1xuRV/PFzK6EILbi7CmXO2F8WM6CC8orOu6B1QBL3hpKZYgMwO8wGlFr52wgifPE7IHEgzPblZEMOvhmjWT+BLPnlwFQHVYD7MopAKnG5gFaQylzTr6GslDvwqVH0Jt3jHsDNFdPITkb8b4AAAAASUVORK5CYII=" />
      <span>{{showText}}</span>
  </div>
</template>

<script lang="ts">
  import * as Vue from 'vue';
  export default Vue.defineComponent({
      name: 'LoadmreComp',
      props: {
          bgColor: {
              type: String,
              default: 'transparent'
          },
          // 是否显示加载中的图标
          icon: {
              type: Boolean,
              default: true
          },
          iconColor: {
              type: String,
              default: '#606266'
          },
          // 字体大小
          fontSize: {
              type: String,
              default: '14'
          },
          // 字体颜色
          color: {
              type: String,
              default: '#606266'
          },
          // 组件状态，loadmore-加载前的状态，loading-加载中的状态，nomore-没有更多的状态
          status: {
              type: String,
              default: 'loadmore'
          },
          // 显示的文字
          loadText: {
              type: Object,
              default() {
                  return {
                      loadmore: '加载更多',
                      loading: '正在加载...',
                      nomore: '没有更多了'
                  }
              }
          },
      },
      emits: ['loadmore'],
      setup(props, ctx) {

          // 计算,监听
          const showText = Vue.computed(() => {
              let text = '';
              if (props.status == 'loadmore') text = props.loadText.loadmore;
              else if (props.status == 'loading') text = props.loadText.loading;
              else text = props.loadText.nomore;
              return text;
          })

          // methods
          const loadMore = () => {
              if (props.status == 'loadmore') ctx.emit('loadmore');
          }
          return {
              loadMore,
              showText,
          }
      }
  })
</script>
