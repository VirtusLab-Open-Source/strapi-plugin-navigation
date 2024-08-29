import { UseQueryResult } from '@tanstack/react-query';

import { NavigationItemSchema } from '../../../api/validators';

export * from './parsers';

export const getPendingAction = (actions: Array<Pick<UseQueryResult, 'isPending'>>) =>
  actions.find(({ isPending }) => isPending);

export const changeCollapseItemDeep = (
  item: NavigationItemSchema,
  isCollapsed: boolean
): NavigationItemSchema => {
  if (item.collapsed !== isCollapsed) {
    return {
      ...item,
      collapsed: isCollapsed,
      updated: true,
      items: item.items?.map((el) => changeCollapseItemDeep(el, isCollapsed)),
    };
  }

  return {
    ...item,
    items: item.items?.map((el) => changeCollapseItemDeep(el, isCollapsed)),
  };
};
