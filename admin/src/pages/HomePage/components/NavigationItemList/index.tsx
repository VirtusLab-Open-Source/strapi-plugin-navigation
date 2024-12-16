import { FC } from 'react';

import { NavigationItemSchema } from '../../../../api/validators';
import {
  Item,
  OnItemCollapseEffect,
  OnItemEditEffect,
  OnItemLevelAddEffect,
  OnItemRemoveEffect,
  OnItemReorderEffect,
  OnItemRestoreEffect,
} from '../NavigationItemListItem';
import Wrapper from './Wrapper';

interface Props {
  isParentAttachedToMenu?: boolean;
  items?: Array<NavigationItemSchema>;
  level?: number;
  levelPath?: string;
  onItemEdit: OnItemEditEffect;
  onItemLevelAdd: OnItemLevelAddEffect;
  onItemRemove: OnItemRemoveEffect;
  onItemRestore: OnItemRestoreEffect;
  onItemReOrder: OnItemReorderEffect;
  onItemToggleCollapse: OnItemCollapseEffect;
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
  onItemRemove,
  onItemRestore,
  onItemReOrder,
  onItemToggleCollapse,
  displayFlat,
  permissions,
  structurePrefix,
  viewParentId,
  locale,
}) => (
  <Wrapper data-level={level}>
    {items?.map((item, index) => {
      return (
        <Item
          key={`list-item-${item.viewId || index}`}
          item={item}
          isLast={index === items.length - 1}
          level={level}
          levelPath={levelPath}
          isParentAttachedToMenu={isParentAttachedToMenu}
          onItemRestore={onItemRestore}
          onItemLevelAdd={onItemLevelAdd}
          onItemRemove={onItemRemove}
          onItemEdit={onItemEdit}
          onItemReOrder={onItemReOrder}
          onItemToggleCollapse={onItemToggleCollapse}
          displayChildren={displayFlat}
          permissions={permissions}
          structureId={structurePrefix ? `${structurePrefix}.${index}` : index.toString()}
          viewParentId={viewParentId}
          locale={locale}
        />
      );
    })}
  </Wrapper>
);
