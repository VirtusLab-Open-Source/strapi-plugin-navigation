import { uuid, isUuid } from 'uuidv4';
import { get, find, first, orderBy, isObject, isString, isNumber, isArray, isNil, isEmpty, omit } from 'lodash';
import { navigationItemType } from './enums';

export const transformItemToRESTPayload = (
  item,
  parent = undefined,
  master = undefined,
  config = {},
) => {
  const {
    id,
    title,
    type = navigationItemType.INTERNAL,
    updated = false,
    removed = false,
    uiRouterKey,
    menuAttached,
    path,
    externalPath,
    related,
    relatedType,
    order,
    audience = [],
    items = [],
  } = item;
  const isExternal = type === navigationItemType.EXTERNAL;
  const { contentTypeItems = [], contentTypes = [] } = config;
  const parsedRelated = Number(related);
  const relatedId = isExternal || isNaN(parsedRelated) ? related : parsedRelated;
  const relatedContentTypeItem = isExternal ? undefined : find(contentTypeItems, cti => cti.id === relatedId);
  const relatedContentType = relatedContentTypeItem || relatedType ?
    find(contentTypes,
      ct => ct.collectionName === (relatedContentTypeItem ? relatedContentTypeItem.__collectionName : relatedType)) :
    undefined;

  return {
    id,
    parent,
    master,
    title,
    type,
    updated,
    removed,
    order,
    uiRouterKey,
    menuAttached,
    audience: audience.map((audienceItem) =>
      isObject(audienceItem) ? audienceItem.id : audienceItem,
    ),
    path: isExternal ? undefined : path,
    externalPath: isExternal ? externalPath : undefined,
    related: isExternal
      ? undefined
      : [
        {
          refId: relatedId,
          ref: relatedContentType ? relatedContentType.name : relatedType,
          field: relatedContentType ? relatedContentType.relatedField : 'navigation',
        },
      ],
    items: items.map((iItem) => transformItemToRESTPayload(iItem, id, master, config)),
  };
};

export const transformToRESTPayload = (payload, config = {}) => {
  const { id, name, visible, items } = payload;
  return {
    id,
    name,
    visible,
    items: items.map((item) => transformItemToRESTPayload(item, null, id, config)),
  };
};

const linkRelations = (item, config) => {
  const { contentTypeItems = [], contentTypes = [] } = config;
  const { type, related, relatedType, relatedRef, isSingle } = item;
  // console.log('linkRelations:item:', item);
  let relation = {
    related: undefined,
    relatedRef: undefined,
    relatedType: undefined,
  };

  if (isSingle && relatedType) {
    const relatedContentType = contentTypes.find(_ => relatedType === _.collectionName) || {};
    return {
      ...item,
      relatedType,
      relatedRef: {
        isSingle,
        __collectionName: relatedContentType.collectionName,
        ...omit(relatedContentType, 'collectionName'),
      },
    };
  }

  // we got empty array after remove object in relation
  // from API we got related as array but on edit it is primitive type
  if ((type !== navigationItemType.INTERNAL) || !related || (isObject(related) && isEmpty(related))) {
    return {
      ...item,
      ...relation,
    };
  }

  const relatedItem = isArray(related) ? first(related) : related;
  const parsedRelated = Number(related);
  const relatedId = isNaN(parsedRelated) ? related : parsedRelated;
  const relationNotChanged = relatedRef && relatedItem ? relatedRef.id === relatedItem : false;

  if (relationNotChanged) {
    return item;
  }

  const shouldFindRelated = (isNumber(related) || isUuid(related) || isString(related)) && !relatedRef;
  const shouldBuildRelated = !relatedRef || (relatedRef && (relatedRef.id !== relatedId));
  if (shouldBuildRelated && !shouldFindRelated) {
    const { __contentType } = relatedItem;
    const relatedContentType = find(contentTypes,
      ct => ct.contentTypeName.toLowerCase() === __contentType.toLowerCase(), {});
    const { collectionName, labelSingular, isSingle } = relatedContentType;
    relation = {
      related: relatedItem.id,
      relatedRef: {
        __collectionName: collectionName,
        isSingle,
        labelSingular,
        ...relatedItem,
      },
      relatedType: collectionName,
    };
  } else if (shouldFindRelated) {
    const relatedRef = find(contentTypeItems, cti => cti.id === relatedId);
    const relatedContentType = find(contentTypes, ct => ct.collectionName.toLowerCase() === relatedType.toLowerCase());
    const { contentTypeName, labelSingular, isSingle } = relatedContentType;
    relation = {
      relatedRef: {
        __collectionName: relatedType,
        __contentType: contentTypeName,
        isSingle,
        labelSingular,
        ...relatedRef,
      },
    };
  } else {
    return {
      ...item,
    };
  }

  return {
    ...item,
    ...relation,
  };
};

const reOrderItems = (items = []) =>
  orderBy(items, ['order'], ['asc'])
    .map((item, n) => {
      const order = n + 1;
      return {
        ...item,
        order,
        updated: item.updated || order !== item.order,
      };
    });

export const transformItemToViewPayload = (payload, items = [], config) => {
  if (!payload.viewParentId) {
    if (payload.viewId) {
      const updatedRootLevel = items
        .map((item) => {
          if (item.viewId === payload.viewId) {
            return linkRelations({
              ...payload,
            }, config);
          }
          return {
            ...item,
          };
        });
      return reOrderItems(updatedRootLevel);
    }
    return [
      ...reOrderItems(items),
      linkRelations({
        ...payload,
        order: items.length + 1,
        viewId: uuid(),
      }, config),
    ];
  }

  const updatedLevel = items
    .map((item) => {
      const branchItems = item.items || [];
      if (payload.viewParentId === item.viewId) {
        if (!payload.viewId) {
          return {
            ...item,
            items: [
              ...reOrderItems(branchItems),
              linkRelations({
                ...payload,
                order: branchItems.length + 1,
                viewId: uuid(),
              }, config),
            ],
          };
        }
        const updatedBranchItems = branchItems
          .map((iItem) => {
            if (iItem.viewId === payload.viewId) {
              return linkRelations(payload, config);
            }
            return {
              ...iItem,
            };
          });
        return {
          ...item,
          items: reOrderItems(updatedBranchItems),
        };
      }
      return {
        ...item,
        items: transformItemToViewPayload(payload, item.items, config),
      };
    });
  return reOrderItems(updatedLevel);
};

export const prepareItemToViewPayload = (items = [], viewParentId = null, config = {}) =>
  items.map((item, n) => {
    const viewId = uuid();
    return {
      ...linkRelations({
        viewId,
        viewParentId,
        ...item,
        order: item.order || (n + 1),
        updated: item.updated || isNil(item.order),
      }, config),
      items: prepareItemToViewPayload(item.items, viewId, config),
    };
  });

export const extractRelatedItemLabel = (item = {}, fields = {}) => {
  const { __collectionName } = item;
  const { default: defaultFields = [] } = fields;
  return get(fields, `${__collectionName}`, defaultFields).map((_) => item[_]).filter((_) => _)[0] || '';
};

export const usedContentTypes = (items) => items.flatMap(
  (item) => [item.relatedRef, ...(item.items ? usedContentTypes(item.items) : [])],
);
