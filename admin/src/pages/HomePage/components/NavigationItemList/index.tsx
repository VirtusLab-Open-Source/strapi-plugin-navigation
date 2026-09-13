import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FC, useMemo } from 'react';

import { NavigationItemSchema } from '../../../../api/validators';
import {
  Item,
  OnItemEditEffect,
  OnItemLevelAddEffect,
  OnItemSubmitEffect,
  getNavigationItemSortableId,
} from '../NavigationItemListItem';
import Wrapper from './Wrapper';
import { type NavigationItemFormSchema } from '../NavigationItemForm';
import { mapServerNavigationItem } from '../../utils';

interface Props {
  isParentAttachedToMenu?: boolean;
  items?: Array<NavigationItemSchema>;
  level?: number;
  levelPath?: string;
  onItemEdit: OnItemEditEffect;
  onItemLevelAdd: OnItemLevelAddEffect;
  onItemSubmit: OnItemSubmitEffect;
  displayFlat?: boolean;
  permissions: { canUpdate: boolean; canAccess: boolean };
  structurePrefix: string;
  viewParentId?: number;
  locale: string;
}

export const List: FC<Props> = ({
  isParentAttachedToMenu = false,
  items,
  level = 0,
  levelPath = '',
  onItemEdit,
  onItemLevelAdd,
  onItemSubmit,
  displayFlat,
  permissions,
  structurePrefix,
  viewParentId,
  locale,
}) => {
  const handleItemReOrder = ({
    item,
    newOrder,
  }: {
    item: NavigationItemFormSchema;
    newOrder: number;
  }) => {
    onItemSubmit({
      ...item,
      order: newOrder,
    });
  };

  const handleItemRemove = (item: NavigationItemSchema) => {
    onItemSubmit(
      mapServerNavigationItem(
        {
          ...item,
          removed: true,
        },
        true
      )
    );
  };

  const handleItemRestore = (item: NavigationItemSchema) => {
    onItemSubmit(
      mapServerNavigationItem(
        {
          ...item,
          removed: false,
        },
        true
      )
    );
  };

  const handleItemToggleCollapse = (item: NavigationItemSchema) => {
    onItemSubmit(
      mapServerNavigationItem(
        {
          ...item,
          collapsed: !item.collapsed,
          updated: true,
          isSearchActive: false,
        },
        true
      )
    );
  };

  const sortableIds = useMemo(
    () =>
      (items ?? []).map((item, index) => {
        const structureId = structurePrefix ? `${structurePrefix}.${index}` : index.toString();
        return getNavigationItemSortableId(item, structureId);
      }),
    [items, structurePrefix]
  );

  return (
    <Wrapper data-level={level}>
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        {items?.map((item, index) => {
          const structureId = structurePrefix ? `${structurePrefix}.${index}` : index.toString();

          return (
            <Item
              key={`list-item-${getNavigationItemSortableId(item, structureId)}`}
              item={item}
              isLast={index === items.length - 1}
              level={level}
              levelPath={levelPath}
              isParentAttachedToMenu={isParentAttachedToMenu}
              onItemLevelAdd={onItemLevelAdd}
              onItemEdit={onItemEdit}
              onItemSubmit={onItemSubmit}
              onItemRestore={handleItemRestore}
              onItemRemove={handleItemRemove}
              onItemReOrder={handleItemReOrder}
              onItemToggleCollapse={handleItemToggleCollapse}
              displayChildren={displayFlat}
              permissions={permissions}
              structureId={structureId}
              viewParentId={viewParentId}
              locale={locale}
            />
          );
        })}
      </SortableContext>
    </Wrapper>
  );
};
