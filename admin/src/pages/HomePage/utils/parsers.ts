import { capitalize, first, get, isEmpty, orderBy } from 'lodash';

import {
  ConfigFromServerSchema,
  NavigationItemSchema,
  NavigationItemTypeSchema,
  StrapiContentTypeItemSchema,
} from '../../../api/validators';
import { NavigationItemFormSchema } from '../components/NavigationItemForm';

const reOrderItems = (items: NavigationItemSchema[] = []) =>
  orderBy(items, ['order'], ['asc']).map((item, n) => {
    const order = n + 1;
    return {
      ...item,
      order,
      updated: item.updated || order !== item.order,
    };
  });

const toNavigationItem = (
  payload: NavigationItemFormSchema,
  config: ConfigFromServerSchema
): NavigationItemSchema => {
  return payload.type === 'INTERNAL'
    ? {
        type: 'INTERNAL',
        collapsed: !!payload.collapsed,
        id: payload.id!,
        documentId: payload.documentId!,
        menuAttached: !!payload.menuAttached,
        order: payload.order ?? 0,
        path: payload.path,
        title: payload.title,
        uiRouterKey: payload.uiRouterKey,
        additionalFields: payload.additionalFields,
        audience:
          payload.audience?.map(
            (documentId) =>
              config.availableAudience.find((audience) => audience.documentId === documentId)!
          ) ?? [],
        autoSync: payload.autoSync,
        items: payload.items?.length
          ? transformItemToViewPayload(payload, payload.items, config)
          : payload.items,
        related: {
          __type: payload.relatedType,
          documentId: payload.related,
        },
        viewId: payload.viewId,
        viewParentId: payload.viewParentId,
        structureId: payload.structureId,
        removed: payload.removed,
        updated: payload.updated,
      }
    : payload.type === 'EXTERNAL'
      ? {
          type: 'EXTERNAL',
          collapsed: !!payload.collapsed,
          id: payload.id!,
          documentId: payload.documentId!,
          menuAttached: !!payload.menuAttached,
          order: payload.order ?? 0,
          title: payload.title,
          uiRouterKey: payload.uiRouterKey,
          additionalFields: payload.additionalFields,
          autoSync: payload.autoSync,
          items: payload.items?.length
            ? transformItemToViewPayload(payload, payload.items, config)
            : payload.items,
          path: '',
          viewId: payload.viewId,
          structureId: payload.structureId,
          viewParentId: payload.viewParentId,
          removed: payload.removed,
          updated: payload.updated,
          externalPath: payload.externalPath ?? '',
          audience:
            payload.audience?.map(
              (documentId) =>
                config.availableAudience.find((audience) => audience.documentId === documentId)!
            ) ?? [],
        }
      : {
          type: 'WRAPPER',
          collapsed: !!payload.collapsed,
          id: payload.id!,
          documentId: payload.documentId!,
          menuAttached: !!payload.menuAttached,
          order: payload.order ?? 0,
          path: payload.path ?? '',
          title: payload.title,
          uiRouterKey: payload.uiRouterKey,
          additionalFields: payload.additionalFields,
          audience:
            payload.audience?.map(
              (documentId) =>
                config.availableAudience.find((audience) => audience.documentId === documentId)!
            ) ?? [],
          autoSync: payload.autoSync,
          items: payload.items?.length
            ? transformItemToViewPayload(payload, payload.items, config)
            : payload.items,
          viewId: payload.viewId,
          viewParentId: payload.viewParentId,
          structureId: payload.structureId,
          removed: payload.removed,
          updated: payload.updated,
        };
};

export const transformItemToViewPayload = (
  payload: NavigationItemFormSchema,
  items: (NavigationItemSchema & { viewId?: number })[] = [],
  config: ConfigFromServerSchema
): Array<NavigationItemSchema & { viewId?: number }> => {
  if (!payload.viewParentId) {
    if (payload.viewId) {
      const updatedRootLevel = items.map((item): NavigationItemSchema => {
        if (item.viewId === payload.viewId) {
          return toNavigationItem(payload, config);
        }

        return {
          ...item,
          items: item.items?.length
            ? transformItemToViewPayload(payload, item.items, config)
            : item.items,
        };
      });

      return reOrderItems(updatedRootLevel);
    }

    return [
      ...reOrderItems([...items, toNavigationItem({ ...payload, viewId: Date.now() }, config)]),
    ];
  }

  const updatedLevel = items.map((item) => {
    const branchItems = item.items || [];

    if (payload.viewParentId === item.viewId) {
      if (!payload.viewId) {
        return {
          ...item,
          items: [
            ...reOrderItems([
              ...branchItems,
              toNavigationItem({ ...payload, viewId: Date.now() }, config),
            ]),
          ],
        };
      }

      const updatedBranchItems = branchItems.map((item) => {
        if (item.viewId === payload.viewId) {
          return toNavigationItem(payload, config);
        }

        return item;
      });

      return {
        ...item,
        items: reOrderItems(updatedBranchItems),
      };
    }

    return {
      ...item,
      items: item.items?.length
        ? transformItemToViewPayload(payload, item.items, config)
        : item.items,
    };
  });

  return reOrderItems(updatedLevel);
};

export const extractRelatedItemLabel = (
  item: StrapiContentTypeItemSchema,
  config?: ConfigFromServerSchema
) => {
  const contentTypes = config?.contentTypes ?? [];
  const fields = config?.contentTypesNameFields ?? {};
  const defaultFields = fields.default ?? [];

  const { __collectionUid } = item;

  const contentType = contentTypes.find(({ uid }) => uid === __collectionUid);

  if (contentType?.isSingle) {
    return contentType.label;
  }

  const defaultFieldsWithCapitalizedOptions = [
    ...defaultFields,
    ...defaultFields.map((_) => capitalize(_)),
  ];
  const labelFields = get(
    fields,
    `${contentType ? contentType.uid : __collectionUid}`,
    defaultFieldsWithCapitalizedOptions
  );
  const itemLabels = (isEmpty(labelFields) ? defaultFieldsWithCapitalizedOptions : labelFields)
    .map((_) => item[_])
    .filter((_) => _);

  return first(itemLabels) || '';
};

export const isRelationCorrect = (item: Partial<NavigationItemFormSchema>) => {
  switch (item.type) {
    case 'EXTERNAL':
    case 'WRAPPER':
      return true;
    case 'INTERNAL':
      return !!item.related;
  }
};

export const isRelationPublished = ({
  relatedRef,
  relatedType = {},
  type,
  isCollection,
}: {
  relatedRef: StrapiContentTypeItemSchema;
  relatedType?: { available?: boolean };
  type: NavigationItemTypeSchema;
  isCollection: boolean;
}) => {
  if (isCollection) {
    return relatedType.available || relatedRef.available;
  }
  if (type === 'INTERNAL') {
    const isHandledByPublishFlow = relatedRef ? 'publishedAt' in relatedRef : false;

    if (isHandledByPublishFlow) {
      return get(relatedRef, 'publishedAt', true);
    }
  }
  return true;
};

export const mapServerNavigationItem = (
  item: NavigationItemSchema,
  stopAtFirstLevel = false
): NavigationItemFormSchema => {
  const { __type: relatedType, documentId: related } =
    item.type === 'INTERNAL' && item.related
      ? item.related
      : {
          __type: "",
          documentId: "",
        };

  return item.type === 'INTERNAL'
    ? {
        type: 'INTERNAL',
        id: item.id,
        documentId: item.documentId,
        additionalFields: item.additionalFields ?? {},
        path: item.path ?? '',
        relatedType,
        related,
        title: item.title,
        uiRouterKey: item.uiRouterKey,
        autoSync: item.autoSync ?? undefined,
        collapsed: item.collapsed,
        externalPath: undefined,
        order: item.order ?? 0,
        menuAttached: item.menuAttached,
        viewId: item.viewId,
        viewParentId: item.viewParentId,
        items: stopAtFirstLevel
          ? (item.items as unknown as NavigationItemFormSchema[])
          : (item.items?.map((_) => mapServerNavigationItem(_)) ?? undefined),
        removed: item.removed,
        updated: item.updated,
        isSearchActive: item.isSearchActive,
      }
    : item.type === 'EXTERNAL'
      ? {
          type: 'EXTERNAL',
          id: item.id,
          documentId: item.documentId,
          additionalFields: item.additionalFields ?? {},
          title: item.title,
          uiRouterKey: item.uiRouterKey,
          autoSync: item.autoSync ?? undefined,
          collapsed: item.collapsed,
          externalPath: item.externalPath!,
          order: item.order ?? 0,
          menuAttached: item.menuAttached,
          viewId: item.viewId,
          viewParentId: item.viewParentId,
          items: stopAtFirstLevel
            ? (item.items as unknown as NavigationItemFormSchema[])
            : (item.items?.map((_) => mapServerNavigationItem(_)) ?? undefined),
          removed: item.removed,
          updated: item.updated,
          isSearchActive: item.isSearchActive,
        }
      : {
          type: 'WRAPPER',
          id: item.id,
          documentId: item.documentId,
          additionalFields: item.additionalFields ?? {},
          title: item.title,
          uiRouterKey: item.uiRouterKey,
          autoSync: item.autoSync ?? undefined,
          collapsed: item.collapsed,
          order: item.order ?? 0,
          menuAttached: item.menuAttached,
          viewId: item.viewId,
          viewParentId: item.viewParentId,
          items: stopAtFirstLevel
            ? (item.items as unknown as NavigationItemFormSchema[])
            : (item.items?.map((_) => mapServerNavigationItem(_)) ?? undefined),
          removed: item.removed,
          updated: item.updated,
          isSearchActive: item.isSearchActive,
          path: item.path ?? '',
        };
};
