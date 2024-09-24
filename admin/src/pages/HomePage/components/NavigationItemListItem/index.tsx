import { Card, CardBody, Divider, Flex, Link, TextButton, Typography } from '@strapi/design-system';
import { ArrowRight, Earth, Link as LinkIcon, Plus } from '@strapi/icons';
import { isEmpty, isNumber } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
import { DropTargetMonitor, useDrag, useDrop } from 'react-dnd';
import { useIntl } from 'react-intl';
import { useTheme } from 'styled-components';

import { NavigationItemSchema, StrapiContentTypeItemSchema } from '../../../../api/validators';
import { getTrad } from '../../../../translations';
import { Effect } from '../../../../types';
import { RELATED_ITEM_SEPARATOR } from '../../../../utils/constants';
import { useConfig, useContentTypeItems, useContentTypes } from '../../hooks';
import { extractRelatedItemLabel, mapServerNavigationItem } from '../../utils';
import { CollapseButton } from '../CollapseButton';
import { NavigationItemFormSchema } from '../NavigationItemForm';
import { List } from '../NavigationItemList';
import { ItemCardBadge } from './ItemCardBadge';
import { ItemCardHeader } from './ItemCardHeader';
import { ItemCardRemovedOverlay } from './ItemCardRemovedOverlay';
import Wrapper from './Wrapper';

export type OnItemReorderEffect = Effect<{
  item: NavigationItemFormSchema;
  newOrder: number;
}>;

export type OnItemLevelAddEffect = (
  event: MouseEvent,
  viewParentId?: number,
  isMenuAllowedLevel?: boolean,
  levelPath?: string,
  parentAttachedToMenu?: boolean,
  structureId?: string,
  maxOrder?: number
) => void;

export type OnItemEditEffect = Effect<{
  item: NavigationItemFormSchema & {
    isMenuAllowedLevel?: boolean;
    isParentAttachedToMenu?: boolean;
  };
  levelPath: string;
  isParentAttachedToMenu?: boolean;
}>;

export type OnItemRemoveEffect = Effect<NavigationItemSchema>;

export type OnItemRestoreEffect = Effect<NavigationItemSchema>;

export type OnItemCollapseEffect = Effect<NavigationItemSchema>;

interface Props {
  isParentAttachedToMenu?: boolean;
  item: NavigationItemSchema;
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
  isLast?: boolean;
  displayChildren?: boolean;
  structureId: string;
  viewParentId?: number;
}

export const Item: React.FC<Props> = ({
  item,
  isLast = false,
  level = 0,
  levelPath = '',
  isParentAttachedToMenu,
  onItemLevelAdd,
  onItemRemove,
  onItemRestore,
  onItemEdit,
  onItemReOrder,
  onItemToggleCollapse,
  displayChildren,
  permissions,
  structureId,
  viewParentId,
}) => {
  const {
    viewId,
    type,
    path,
    removed,
    externalPath,
    menuAttached,
    collapsed,
    items = [],
    isSearchActive,
    related,
    relatedType,
  } = mapServerNavigationItem(item, true);

  const { formatMessage } = useIntl();

  const configQuery = useConfig();

  const isExternal = type === 'EXTERNAL';
  // TODO: is handled by publish flow
  const isHandledByPublishFlow = true;

  const isNextMenuAllowedLevel = isNumber(configQuery.data?.allowedLevels)
    ? level < configQuery.data.allowedLevels - 1
    : true;
  const isMenuAllowedLevel = isNumber(configQuery.data?.allowedLevels)
    ? level < configQuery.data.allowedLevels
    : true;

  const hasChildren = !isEmpty(item.items) && !isExternal && !displayChildren;
  const absolutePath = isExternal
    ? undefined
    : `${levelPath === '/' ? '' : levelPath}/${path === '/' ? '' : path}`;

  const contentTypeItemsQuery = useContentTypeItems({
    uid: relatedType ?? '',
  });

  const contentTypesQuery = useContentTypes();

  const contentType = contentTypesQuery.data?.find((_) => _.uid === relatedType);

  const relatedItem = contentTypeItemsQuery.data?.find(
    (contentTypeItem) => contentTypeItem.id === related
  ) ?? { id: -1 };

  const isPublished = !!relatedItem.publishedAt;

  const relatedItemLabel = !isExternal
    ? extractRelatedItemLabel(relatedItem, configQuery.data)
    : '';

  const relatedTypeLabel = contentType?.info.displayName ?? '';

  const relatedBadgeColor = isPublished ? 'success' : 'secondary';

  const canUpdate = permissions.canUpdate;

  const dragRef = useRef(null);
  const dropRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef(null);

  const [, drop] = useDrop({
    accept: `navigation-item_${levelPath}`,
    hover(
      hoveringItem: NavigationItemSchema,
      monitor: DropTargetMonitor<NavigationItemSchema, unknown>
    ) {
      const dragIndex = hoveringItem.order ?? 0;
      const dropIndex = item.order ?? 0;

      // Don't replace items with themselves
      if (dragIndex === dropIndex) {
        return;
      }

      const hoverBoundingRect = dropRef.current!.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) {
        return;
      }

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Place the hovering item before or after the drop target
      const isAfter = hoverClientY > hoverMiddleY;
      const newOrder = isAfter ? (item.order ?? 0) + 0.5 : (item.order ?? 0) - 0.5;

      if (dragIndex < dropIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > dropIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onItemReOrder({
        item: mapServerNavigationItem(hoveringItem, true),
        newOrder,
      });
    },
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: `navigation-item_${levelPath}`,
    item: () => item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const refs = {
    dragRef: drag(dragRef) as any,
    dropRef: drop(dropRef) as any,
    previewRef: dragPreview(previewRef) as any,
  };

  const generatePreviewUrl = (entity?: StrapiContentTypeItemSchema) => {
    const isSingle = contentType?.kind === 'singleType';
    const entityLocale = entity?.locale ? `?plugins[i18n][locale]=${entity?.locale}` : '';

    return `/content-manager/${isSingle ? 'single-types' : 'collection-types'}/${contentType?.uid}${!isSingle ? '/' + entity?.id : ''}${entityLocale}`;
  };

  const onNewItemClick = useCallback(
    (event: MouseEvent) =>
      canUpdate &&
      onItemLevelAdd(
        event,
        viewId,
        isNextMenuAllowedLevel,
        absolutePath,
        menuAttached,
        `${structureId}.${items.length}`,
        Math.max(...items.map(({ order }) => order))
      ),
    [viewId, isNextMenuAllowedLevel, absolutePath, menuAttached, structureId, items, canUpdate]
  );

  useEffect(() => {
    if (isSearchActive) {
      refs.dropRef?.current?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [isSearchActive, refs.dropRef.current]);

  const theme = useTheme();

  return (
    <Wrapper
      level={level}
      isLast={isLast}
      style={{ opacity: isDragging ? 0.2 : 1 }}
      ref={refs ? refs.dropRef : undefined}
    >
      <Card
        style={{
          width: '728px',
          zIndex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: isSearchActive ? theme.colors.neutral150 : undefined,
          borderColor: isSearchActive ? theme.colors.neutral300 : undefined,
          transition: 'background-color 0.3s ease-in',
        }}
      >
        {removed && <ItemCardRemovedOverlay />}
        <div ref={refs.previewRef}>
          <CardBody>
            <ItemCardHeader
              title={item.title ?? ''}
              path={isExternal ? externalPath : absolutePath}
              icon={isExternal ? <Earth /> : <LinkIcon />}
              onItemRemove={() => onItemRemove({ ...item, viewParentId })}
              onItemEdit={() => {
                const [relatedType, related] = item.related?.split(RELATED_ITEM_SEPARATOR) ?? [];

                if (item.type !== 'EXTERNAL' && item.type !== 'INTERNAL') {
                  return;
                }

                onItemEdit({
                  item:
                    item.type === 'INTERNAL'
                      ? {
                          ...item,
                          type: 'INTERNAL',
                          isMenuAllowedLevel,
                          isParentAttachedToMenu,
                          isSearchActive: false,
                          relatedType,
                          related: related ? parseInt(related, 10) : undefined,
                          additionalFields: item.additionalFields ?? {},
                          items: item.items ?? [],
                          autoSync: item.autoSync ?? true,
                          externalPath: undefined,
                          viewParentId,
                          audience: item.audience?.map(({ id }) => id) ?? [],
                        }
                      : {
                          ...item,
                          type: 'EXTERNAL',
                          isMenuAllowedLevel,
                          isParentAttachedToMenu,
                          isSearchActive: false,
                          relatedType: undefined,
                          related: undefined,
                          additionalFields: item.additionalFields ?? {},
                          items: item.items ?? [],
                          autoSync: item.autoSync ?? true,
                          externalPath: item.externalPath ?? '',
                          viewParentId,
                          audience: item.audience?.map(({ id }) => id) ?? [],
                        },
                  levelPath,
                  isParentAttachedToMenu,
                });
              }}
              onItemRestore={() => onItemRestore({ ...item, viewParentId })}
              dragRef={refs.dragRef}
              removed={removed}
              canUpdate={canUpdate}
              isSearchActive={isSearchActive}
            />
          </CardBody>
          <Divider />
          {!isExternal && (
            <CardBody style={{ padding: '8px' }}>
              <Flex
                style={{ width: '100%' }}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Flex>
                  {!isEmpty(item.items) && (
                    <CollapseButton
                      toggle={() => onItemToggleCollapse({ ...item, viewParentId })}
                      collapsed={collapsed}
                      itemsCount={item.items?.length ?? 0}
                    />
                  )}
                  {canUpdate && isNextMenuAllowedLevel && (
                    <TextButton disabled={removed} startIcon={<Plus />} onClick={onNewItemClick}>
                      <Typography
                        variant="pi"
                        fontWeight="bold"
                        textColor={removed ? 'neutral600' : 'primary600'}
                      >
                        {formatMessage(getTrad('components.navigationItem.action.newItem'))}
                      </Typography>
                    </TextButton>
                  )}
                </Flex>
                {relatedItemLabel && (
                  <Flex justifyContent="center" alignItems="center">
                    {isHandledByPublishFlow && (
                      <ItemCardBadge
                        borderColor={`${relatedBadgeColor}200`}
                        backgroundColor={`${relatedBadgeColor}100`}
                        textColor={`${relatedBadgeColor}600`}
                        className="action"
                        small
                      >
                        {formatMessage(
                          getTrad(
                            `components.navigationItem.badge.${isPublished ? 'published' : 'draft'}`
                          )
                        )}
                      </ItemCardBadge>
                    )}
                    <Typography variant="omega" textColor="neutral600">
                      {relatedTypeLabel}&nbsp;/&nbsp;
                    </Typography>
                    <Typography variant="omega" textColor="neutral800">
                      {relatedItemLabel}
                    </Typography>
                    <Link
                      to={generatePreviewUrl(relatedItem ?? undefined)}
                      endIcon={<ArrowRight />}
                    >
                      &nbsp;
                    </Link>
                  </Flex>
                )}
              </Flex>
            </CardBody>
          )}
        </div>
      </Card>
      {hasChildren && !removed && !collapsed && (
        <List
          onItemLevelAdd={onItemLevelAdd}
          onItemRemove={onItemRemove}
          onItemEdit={onItemEdit}
          onItemRestore={onItemRestore}
          onItemReOrder={onItemReOrder}
          onItemToggleCollapse={onItemToggleCollapse}
          isParentAttachedToMenu={menuAttached}
          items={item.items ?? []}
          level={level + 1}
          levelPath={absolutePath}
          permissions={permissions}
          structurePrefix={structureId}
          viewParentId={viewId}
        />
      )}
    </Wrapper>
  );
};