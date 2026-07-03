<template>
  <div v-if="false">
    <div style="height:32px;" v-if="isShow"></div>
    <div :class="[prefixCls, `${prefixCls}--${theme}`]" class="HyBreadcrumb" :style="{top:getShowTabs?'94px':'64px'}">
      <a-breadcrumb :routes="routes">
        <template #itemRender="{ route, routes: routesMatched, paths }">
          <span v-if="!hasRedirect(routesMatched, route)">
            {{ t(route.name || route.meta.title) }}
          </span>
          <router-link v-else to="" @click="handleClick(route, paths, $event as Event)">
            {{ t(route.name || route.meta.title) }}
          </router-link>
        </template>
        <template #separator>
          <DoubleRightOutlined />
        </template>
      </a-breadcrumb>
    </div>
  </div>
</template>
<script lang="ts">
  import type { RouteLocationMatched } from 'vue-router';
  import { useRouter } from 'vue-router';
  import type { Menu } from '@/router/types';

  import { defineComponent, ref, watchEffect,computed,unref } from 'vue';

  import { Breadcrumb } from 'ant-design-vue';
  import Icon from '@/components/Icon/Icon.vue';

  import { useDesign } from '@/hooks/web/useDesign';
  import { useRootSetting } from '@/hooks/setting/useRootSetting';
  import { useGo } from '@/hooks/web/usePage';
  import { useI18n } from '@/hooks/web/useI18n';

  import { propTypes } from '@/utils/propTypes';
  import { isString } from '@/utils/is';
  import { filter } from '@/utils/helper/treeHelper';
  import { getMenus } from '@/router/menus';
  import { DoubleRightOutlined } from '@ant-design/icons-vue';

  import { REDIRECT_NAME } from '@/router/constant';
  import { getAllParentPath } from '@/router/helper/menuHelper';
  import { useMultipleTabSetting } from '@/hooks/setting/useMultipleTabSetting';
  import { useFullContent } from '@/hooks/web/useFullContent';
  import { useHeaderSetting } from '@/hooks/setting/useHeaderSetting';

  export default defineComponent({
    components: { Icon, [Breadcrumb.name]: Breadcrumb,DoubleRightOutlined },
    props: {
      theme: propTypes.oneOf(['dark', 'light']),
    },
    setup() {
      const routes = ref<RouteLocationMatched[]>([]);
      const { currentRoute } = useRouter();
      const { prefixCls } = useDesign('layout-breadcrumb');
      const { getShowBreadCrumbIcon } = useRootSetting();
      const go = useGo();
      const isShow=ref<boolean>(false);
  
      const { getShowMultipleTab} = useMultipleTabSetting();
      const { getFullContent } = useFullContent();
      const { getFixed, getShowFullHeaderRef,} =useHeaderSetting();

      const getShowTabs = computed(() => {
        return unref(getShowMultipleTab) && !unref(getFullContent);
      });
      const getIsShowPlaceholderDom = computed(() => {
        return unref(getFixed) || unref(getShowFullHeaderRef);
      });

      const { t } = useI18n();
      watchEffect(async () => {
        if (currentRoute.value.name === REDIRECT_NAME) return;
        const menus = await getMenus();

        const routeMatched = currentRoute.value.matched;
        const cur = routeMatched?.[routeMatched.length - 1];
        let path = currentRoute.value.path;

        if (cur && cur?.meta?.currentActiveMenu) {
          path = cur.meta.currentActiveMenu as string;
        }

        const parent = getAllParentPath(menus, path);
        const filterMenus = menus.filter((item) => item.path === parent[0]);
        const matched = getMatched(filterMenus, parent) as any;

        if (!matched || matched.length === 0) return;

        const breadcrumbList = filterItem(matched);

        if (currentRoute.value.meta?.currentActiveMenu) {
          breadcrumbList.push({
            ...currentRoute.value,
            name: currentRoute.value.meta?.title || currentRoute.value.name,
          } as unknown as RouteLocationMatched);
        }
        // routes.value = breadcrumbList;
        routes.value=breadcrumbList.map(item=>{
          item.children=[]
          return item
        })
        isShow.value=routes.value[routes.value.length-1].meta.hideMenu
      });

      function getMatched(menus: Menu[], parent: string[]) {
        const metched: Menu[] = [];
        menus.forEach((item) => {
          if (parent.includes(item.path)) {
            metched.push({
              ...item,
              name: item.meta?.title || item.name,
            });
          }
          if (item.children?.length) {
            metched.push(...getMatched(item.children, parent));
          }
        });
        return metched;
      }

      function filterItem(list: RouteLocationMatched[]) {
        return filter(list, (item) => {
          const { meta, name } = item;
          if (!meta) {
            return !!name;
          }
          const { title, hideBreadcrumb, hideMenu } = meta;
          if (!title || hideBreadcrumb || hideMenu) {
            return false;
          }
          return true;
        }).filter((item) => !item.meta?.hideBreadcrumb);
      }

      function handleClick(route: RouteLocationMatched, paths: string[], e: Event) {
        e?.preventDefault();
        const { children, redirect, meta } = route;

        if (children?.length && !redirect) {
          e?.stopPropagation();
          return;
        }
        if (meta?.carryParam) {
          return;
        }

        if (redirect && isString(redirect)) {
          go(redirect);
        } else {
          let goPath = '';
          if (paths.length === 1) {
            goPath = paths[0];
          } else {
            const ps = paths.slice(1);
            const lastPath = ps.pop() || '';
            goPath = `${lastPath}`;
          }
          goPath = /^\//.test(goPath) ? goPath : `/${goPath}`;
          go(goPath);
        }
      }

      function hasRedirect(routes: RouteLocationMatched[], route: RouteLocationMatched) {
        return routes.indexOf(route) !== routes.length - 1;
      }

      function getIcon(route) {
        return route.icon || route.meta?.icon;
      }

      return { routes, t, prefixCls, getIcon, getShowBreadCrumbIcon, handleClick, hasRedirect,getShowTabs,getIsShowPlaceholderDom,isShow};
    },
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-layout-breadcrumb';

  .@{prefix-cls} {
    display: flex;
    align-items: center;
    padding: 0 8px;

    .ant-breadcrumb-link {
      .anticon {
        margin-right: 4px;
        margin-bottom: 2px;
      }
    }

    &--light {
      .ant-breadcrumb-link {
        color: @breadcrumb-item-normal-color;

        a {
          color: rgb(0 0 0 / 65%);

          &:hover {
            color: @primary-color;
            background-color:#f2f5f7;
          }
        }
      }

      .ant-breadcrumb-separator {
        color: @breadcrumb-item-normal-color;
      }
    }

    &--dark {
      .ant-breadcrumb-link {
        color:#1F2229;
        a {
          color: #858D98;

          &:hover {
            // color: @white;
            background-color:#f2f5f7;
          }
        }
      }

      .ant-breadcrumb-separator,
      .anticon {
        color: #858D98;
      }
    }
  }
  .HyBreadcrumb{
    width: calc(100% - 200px);
    position: fixed;
    z-index: 505;
    top: 64px;
    box-sizing: border-box;
    padding: 12px 16px 0px 16px !important;
    background-color: #f2f5f7;
    color: #1F2229 !important;
  }
</style>
