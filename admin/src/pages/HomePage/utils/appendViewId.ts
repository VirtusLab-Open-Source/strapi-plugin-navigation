import { NavigationItemSchema } from '../../../api/validators';

export const appendViewId = (item: NavigationItemSchema): NavigationItemSchema => {
  return {
    ...item,
    viewId: Math.floor(Math.random() * 1520000),
    items: item.items?.map(appendViewId),
  };
};
