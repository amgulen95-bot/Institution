import type { Menu as MenuType } from '@/router/types';
import type { MenuState } from './types';
import { computed, Ref, toRaw, unref } from 'vue';
import { uniq } from 'lodash-es';
import { getAllParentPath } from '@/router/helper/menuHelper';
import { useTimeoutFn } from '@vben/hooks';
import { useDebounceFn } from '@vueuse/core';

export function useOpenKeys(
  menuState: MenuState,
  menus: Ref<MenuType[]>,
  accordion: Ref<boolean>,
  mixSider: Ref<boolean>,
  collapse: Ref<boolean>,
) {
  const debounceSetOpenKeys = useDebounceFn(setOpenKeys, 50);
  async function setOpenKeys(path: string) {
    const native = !mixSider.value;
    const menuList = toRaw(menus.value);

    const handle = () => {
      if (menuList?.length === 0) {
        menuState.activeSubMenuNames = [];
        menuState.openNames = [];
        return;
      }
      // --- 修改开始 ---
       const defaultOpenKeys = ['/order', '/store'];

      // 2. 判断：如果是初始化状态（openNames 为空），则强制使用默认值
      // 注意：这里不再判断 !path，因为初始化时 path 通常是存在的
      if (menuState.openNames.length === 0) {
         if (!unref(accordion)) {
            // 非手风琴模式：直接赋值默认数组
            menuState.openNames = [...defaultOpenKeys];
         } else {
            // 手风琴模式：通常只展开一个，取第一个
            menuState.openNames = [defaultOpenKeys[0]];
         }
         menuState.activeSubMenuNames = menuState.openNames;
         // 注意：这里不要 return，让代码继续往下走，处理当前点击的 path
      }

      // 3. 原有逻辑：处理当前点击的菜单（这会基于上面的默认值继续追加）
      const keys = getAllParentPath(menuList, path);

      if (!unref(accordion)) {
        // 如果是非手风琴，保留默认值 + 新点击的
        menuState.openNames = uniq([...menuState.openNames, ...keys]);
      } else {
        // 如果是手风琴，点击新的会覆盖旧的
        menuState.openNames = keys;
      }
      menuState.activeSubMenuNames = menuState.openNames;
      // --- 修改结束 ---
    };
    if (native) {
      handle();
    } else {
      useTimeoutFn(handle, 30);
    }
  }

  const getOpenKeys = computed(() => {
    return unref(collapse) ? [] : menuState.openNames;
  });

  return { setOpenKeys: debounceSetOpenKeys, getOpenKeys };
}
