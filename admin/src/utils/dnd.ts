import { type NavigationItemSchema } from '../api/validators';
import { type NavigationItemFormSchema } from '../pages/HomePage/components/NavigationItemForm';

export type NavigationItemReorderPayload = {
  item: NavigationItemFormSchema;
  newOrder: number;
};

export type NavigationSortableData = {
  levelPath: string;
  item: NavigationItemSchema;
  viewParentId?: number;
  onItemReOrder: (payload: NavigationItemReorderPayload) => void;
};

export const getNavigationItemSortableId = (
  item: NavigationItemSchema,
  structureId: string
): string => {
  return item.viewId != null ? String(item.viewId) : structureId;
};
