import { Card, CardBody, Divider, Flex, Link, TextButton, Typography } from '@strapi/design-system';
import { ArrowRight, Cog, Earth, Link as LinkIcon, Plus } from '@strapi/icons';
import { isEmpty, isNumber } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
import { DropTargetMonitor, useDrag, useDrop } from 'react-dnd';
import { useIntl } from 'react-intl';
import { useTheme } from 'styled-components';

import { NavigationItemSchema, StrapiContentTypeItemSchema } from '../../../../api/validators';
import { getTrad } from '../../../../translations';
import { Effect } from '../../../../types';
import {
  useConfig,
  useContentTypeItems,
  useContentTypes,
  useInvalidateContentTypeItems,
} from '../../hooks';
import { extractRelatedItemLabel, mapServerNavigationItem } from '../../utils';
import { CollapseButton } from '../CollapseButton';
import { type NavigationItemFormSchema } from '../NavigationItemForm';
import { List } from '../NavigationItemList';
import { ItemCardBadge } from './ItemCardBadge';
import { ItemCardHeader } from './ItemCardHeader';
import { ItemCardRemovedOverlay } from './ItemCardRemovedOverlay';
import Wrapper from './Wrapper';
import { useIsDesktop, useIsMobile, useIsTablet, useMediaQuery } from '@strapi/strapi/admin';

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

export type OnItemSubmitEffect = Effect<NavigationItemFormSchema>;

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
  onItemSubmit: OnItemSubmitEffect;
  displayFlat?: boolean;
  permissions: { canUpdate: boolean; canAccess: boolean };
  isLast?: boolean;
  displayChildren?: boolean;
  structureId: string;
  viewParentId?: number;
  locale: string;
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
  onItemSubmit,
  displayChildren,
  permissions,
  structureId,
  viewParentId,
  locale,
}) => {
  const mappedItem = mapServerNavigationItem(item, true);

  const { formatMessage } = useIntl();

  const configQuery = useConfig();
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  console.log("mobile", isMobile, "tablet", isTablet, "desktop", isDesktop)

  const isExternal = mappedItem.type === 'EXTERNAL';
  const isWrapper = mappedItem.type === 'WRAPPER';
  // TODO: is handled by publish flow
  const isHandledByPublishFlow = true;

  const isNextMenuAllowedLevel = isNumber(configQuery.data?.allowedLevels)
    ? level < configQuery.data.allowedLevels - 1
    : true;
  const isMenuAllowedLevel = isNumber(configQuery.data?.allowedLevels)
    ? level < configQuery.data.allowedLevels
    : true;

  const hasChildren = !isEmpty(item.items) && !displayChildren;
  const absolutePath = isExternal
    ? undefined
    : `${levelPath === '/' ? '' : levelPath}/${mappedItem.path === '/' ? '' : mappedItem.path}`.replace(
        '//',
        '/'
      );

  const contentTypeItemsQuery = useContentTypeItems({
    uid: mappedItem.type === 'INTERNAL' ? (mappedItem.relatedType ?? '') : '',
    locale,
  });

  const contentTypesQuery = useContentTypes();

  const contentType = contentTypesQuery.data?.find((_) =>
    mappedItem.type === 'INTERNAL' ? _.uid === mappedItem.relatedType : false
  );

  const isContentManagerType = contentType?.uid.includes('api::');

  const relatedItem = contentTypeItemsQuery.data?.find((contentTypeItem) =>
    mappedItem.type === 'INTERNAL' ? contentTypeItem.documentId === mappedItem.related : false
  ) ?? { documentId: '', id: 0 };

  const isPublished = !!relatedItem?.publishedAt;

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

    return `/admin/content-manager/${isSingle ? 'single-types' : 'collection-types'}/${contentType?.uid}${!isSingle ? '/' + entity?.documentId : ''}${entityLocale}`;
  };

  const onNewItemClick = useCallback(
    (event: MouseEvent) => {
      if (!canUpdate) {
        return;
      }

      const maxOrder = (mappedItem.items ?? []).reduce((acc, { order }) => {
        return acc < order ? order : acc;
      }, 0);

      return onItemLevelAdd(
        event,
        mappedItem.viewId,
        isNextMenuAllowedLevel,
        absolutePath,
        mappedItem.menuAttached,
        `${structureId}.${mappedItem.items?.length ?? 0}`,
        maxOrder
      );
    },
    [
      mappedItem.viewId,
      isNextMenuAllowedLevel,
      absolutePath,
      mappedItem.menuAttached,
      structureId,
      mappedItem.items,
      canUpdate,
    ]
  );

  useEffect(() => {
    if (mappedItem.isSearchActive) {
      refs.dropRef?.current?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [mappedItem.isSearchActive, refs.dropRef.current]);

  const invalidatContentTypeItems = useInvalidateContentTypeItems({
    uid: mappedItem.type === 'INTERNAL' ? (mappedItem.relatedType ?? '') : '',
    locale,
  });

  useEffect(() => {
    invalidatContentTypeItems();
  }, []);

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
          width: isMobile ? '100%' : '728px',
          zIndex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: mappedItem.isSearchActive ? theme.colors.secondary100 : undefined,
          borderColor: mappedItem.isSearchActive ? theme.colors.secondary200 : undefined,
          transition: 'background-color 0.3s ease-in',
        }}
      >
        {mappedItem.removed && <ItemCardRemovedOverlay />}
        <div ref={refs.previewRef}>
          <CardBody>
            <ItemCardHeader
              title={item.title ?? ''}
              path={isExternal ? mappedItem.externalPath : absolutePath}
              icon={isExternal ? <Earth /> : isWrapper ? <Cog /> : <LinkIcon />}
              onItemRemove={() => onItemRemove({ ...item, viewParentId })}
              onItemEdit={() => {
                const { __type: relatedType, documentId: related } = item.related ?? {};

                if (
                  item.type !== 'EXTERNAL' &&
                  item.type !== 'INTERNAL' &&
                  item.type !== 'WRAPPER'
                ) {
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
                          relatedType: relatedType ?? '',
                          related: related ?? '',
                          additionalFields: item.additionalFields ?? {},
                          items: item.items ?? [],
                          autoSync: item.autoSync ?? true,
                          externalPath: undefined,
                          viewParentId,
                          audience: item.audience?.map(({ documentId }) => documentId) ?? [],
                        }
                      : item.type === 'EXTERNAL'
                        ? {
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
                            audience: item.audience?.map(({ documentId }) => documentId) ?? [],
                          }
                        : {
                            ...item,
                            type: 'WRAPPER',
                            isMenuAllowedLevel,
                            isParentAttachedToMenu,
                            isSearchActive: false,
                            additionalFields: item.additionalFields ?? {},
                            items: item.items ?? [],
                            autoSync: item.autoSync ?? true,
                            viewParentId,
                            audience: item.audience?.map(({ documentId }) => documentId) ?? [],
                          },
                  levelPath,
                  isParentAttachedToMenu,
                });
              }}
              onItemRestore={() => onItemRestore({ ...item, viewParentId })}
              dragRef={refs.dragRef}
              removed={mappedItem.removed}
              canUpdate={canUpdate}
              isSearchActive={mappedItem.isSearchActive}
            />
          </CardBody>

          <Divider />

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
                    collapsed={mappedItem.collapsed}
                    itemsCount={item.items?.length ?? 0}
                  />
                )}
                {canUpdate && isNextMenuAllowedLevel && (
                  <TextButton
                    disabled={mappedItem.removed}
                    startIcon={<Plus />}
                    onClick={onNewItemClick}
                  >
                    <Typography
                      variant="pi"
                      fontWeight="bold"
                      textColor={mappedItem.removed ? 'neutral600' : 'primary600'}
                    >
                      {formatMessage(getTrad('components.navigationItem.action.newItem'))}
                    </Typography>
                  </TextButton>
                )}
              </Flex>
              {mappedItem.type === 'INTERNAL' && mappedItem.related && !relatedItem.id ? (
                <Flex justifyContent="center" alignItems="center">
                  <Typography variant="omega" textColor="neutral600">
                    {relatedTypeLabel}&nbsp;/&nbsp;
                  </Typography>
                  <Typography variant="omega" textColor="neutral800">
                    {formatMessage(getTrad('components.navigationItem.related.localeMissing'))}
                  </Typography>
                </Flex>
              ) : null}
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
                  {isContentManagerType && (
                    <Link
                      href={generatePreviewUrl(relatedItem ?? undefined)}
                      endIcon={<ArrowRight />}
                    >
                      &nbsp;
                    </Link>
                  )}
                </Flex>
              )}
            </Flex>
          </CardBody>
        </div>
      </Card>
      {hasChildren && !mappedItem.removed && !mappedItem.collapsed && (
        <List
          onItemLevelAdd={onItemLevelAdd}
          onItemEdit={onItemEdit}
          onItemSubmit={onItemSubmit}
          isParentAttachedToMenu={mappedItem.menuAttached}
          items={item.items ?? []}
          level={level + 1}
          levelPath={absolutePath}
          permissions={permissions}
          structurePrefix={structureId}
          viewParentId={mappedItem.viewId}
          locale={locale}
        />
      )}
    </Wrapper>
  );
};
