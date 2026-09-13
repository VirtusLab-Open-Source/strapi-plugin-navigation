import { Card, CardBody, Divider, Flex, Link, TextButton, Typography } from '@strapi/design-system';
import { ArrowRight, Cog, Earth, Link as LinkIcon, Plus } from '@strapi/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { isEmpty, isNumber } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useTheme } from 'styled-components';
import { useIsMobile } from '@strapi/strapi/admin';

import { NavigationItemSchema, StrapiContentTypeItemSchema } from '../../../../api/validators';
import { getTrad } from '../../../../translations';
import { Effect } from '../../../../types';
import { getNavigationItemSortableId } from '../../../../utils/dnd';
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

export { getNavigationItemSortableId } from '../../../../utils/dnd';

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
  const isMobile = useIsMobile();

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
  const isManualPath = item.isManualPath;
  const absolutePath = isExternal
    ? undefined
    : isManualPath
      ? (mappedItem.path ?? '')
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
  const dropRef = useRef<HTMLDivElement | null>(null);
  const sortableId = getNavigationItemSortableId(item, structureId);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
    disabled: !canUpdate,
    data: {
      levelPath,
      item,
      viewParentId,
      onItemReOrder,
    },
  });

  const setDroppableRef = useCallback(
    (node: HTMLDivElement | null) => {
      dropRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );

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
      onItemLevelAdd,
    ]
  );

  useEffect(() => {
    if (mappedItem.isSearchActive) {
      dropRef.current?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [mappedItem.isSearchActive]);

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
      style={{
        opacity: isDragging ? 0.2 : 1,
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      ref={setDroppableRef}
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
        <div>
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
              dragHandleProps={{
                ref: setActivatorNodeRef,
                ...attributes,
                ...listeners,
              }}
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
                    size="S"
                  >
                    <Typography
                      variant="pi"
                      fontWeight="bold"
                      textColor={mappedItem.removed ? 'neutral600' : 'primary600'}
                      fontSize={{ initial: '1.1rem', small: '1.2rem' }}
                    >
                      {formatMessage(getTrad('components.navigationItem.action.newItem'))}
                    </Typography>
                  </TextButton>
                )}
              </Flex>
              {mappedItem.type === 'INTERNAL' && mappedItem.related && !relatedItem.id ? (
                <Flex justifyContent="center" alignItems="center">
                  <Typography
                    variant="omega"
                    textColor="neutral600"
                    fontSize={{ initial: '1.2rem', small: '1.4rem' }}
                  >
                    {relatedTypeLabel}&nbsp;/&nbsp;
                  </Typography>
                  <Typography
                    variant="omega"
                    textColor="neutral800"
                    fontSize={{ initial: '1.2rem', small: '1.4rem' }}
                  >
                    {formatMessage(getTrad('components.navigationItem.related.localeMissing'))}
                  </Typography>
                </Flex>
              ) : null}
              {relatedItemLabel && (
                <Flex justifyContent="center" alignItems="center">
                  {isHandledByPublishFlow && !isMobile && (
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
                  <Typography
                    variant="omega"
                    textColor="neutral600"
                    fontSize={{ initial: '1.2rem', small: '1.4rem' }}
                  >
                    {relatedTypeLabel}&nbsp;/&nbsp;
                  </Typography>
                  <Typography
                    variant="omega"
                    textColor="neutral800"
                    fontSize={{ initial: '1.2rem', small: '1.4rem' }}
                  >
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
