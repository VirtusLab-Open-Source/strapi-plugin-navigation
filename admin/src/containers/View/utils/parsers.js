import { isUuid, uuid } from 'uuidv4';
import { find, get, isArray, isEmpty, isNil, isNumber, isObject, isString, last, omit, orderBy } from 'lodash';
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
  const { contentTypes = [] } = config;

  const parsedRelated = Number(related);
  const relatedId = isExternal || isNaN(parsedRelated) ? related : parsedRelated;

  const relatedContentType = relatedType ?
    find(contentTypes,
      ct => ct.uid === relatedType) :
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
      isObject(audienceItem) ? audienceItem.value : audienceItem,
    ),
    path: isExternal ? undefined : path,
    externalPath: isExternal ? externalPath : undefined,
    related: isExternal
      ? undefined
      : [
        {
          refId: relatedId,
          ref: relatedContentType ? relatedContentType.uid : relatedType,
          field: relatedContentType && relatedContentType.relatedField ? relatedContentType.relatedField : 'navigation',
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
  let relation = {
    related: undefined,
    relatedRef: undefined,
    relatedType: undefined,
  };

  if (isSingle && relatedType) {
    const relatedContentType = contentTypes.find(_ => relatedType === _.uid) || {};
    return {
      ...item,
      relatedType,
      relatedRef: {
        ...omit(relatedContentType, 'collectionName'),
        isSingle,
        __collectionName: relatedContentType.uid,
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

  const relatedItem = isArray(related) ? last(related) : related;

  const parsedRelated = Number(related);
  const relatedId = isNaN(parsedRelated) ? related : parsedRelated;

  const relationNotChanged = relatedRef && relatedItem ? relatedRef.id === relatedItem : false;

  if (relationNotChanged) {
    return item;
  }

  const shouldFindRelated = (isNumber(related) || isUuid(related) || isString(related)) && !relatedRef;
  const shouldBuildRelated = !relatedRef || (relatedRef && (relatedRef.id !== relatedId));
  if (shouldBuildRelated && !shouldFindRelated) {
    const relatedContentType = find(contentTypes,
      ct => ct.uid === relatedItem.__contentType, {});
    const { uid, labelSingular, isSingle } = relatedContentType;
    relation = {
      related: relatedItem.id,
      relatedRef: {
        ...relatedItem,
        __collectionName: uid,
        isSingle,
        labelSingular,
      },
      relatedType: uid,
    };
  } else if (shouldFindRelated) {
    const relatedRef = find(contentTypeItems, cti => cti.id === relatedId);
    const relatedContentType = find(contentTypes, ct => ct.uid === relatedType);
    const { uid, contentTypeName, labelSingular, isSingle } = relatedContentType;
    relation = {
      relatedRef: {
        ...relatedRef,
        __collectionName: uid,
        __contentType: contentTypeName,
        isSingle,
        labelSingular,
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

export const extractRelatedItemLabel = (item = {}, fields = {}, config = {}) => {
  const { contentTypes = [] } = config;
  const { __collectionName } = item;
  const contentType = contentTypes.find(_ => _.uid === __collectionName)
  const { default: defaultFields = [] } = fields;
  return get(fields, `${contentType ? contentType.collectionName : ''}`, defaultFields).map((_) => item[_]).filter((_) => _)[0] || '';
};

export const usedContentTypes = (items = []) => items.flatMap(
  (item) => {
    const used = (item.items ? usedContentTypes(item.items) : []);
    if (item.relatedRef) {
      return [item.relatedRef, ...used];
    }
    return used;
  },
);

export const isRelationCorrect = ({ related, type }) => {
  const isRelationDefined = !isNil(related);
  return type === navigationItemType.EXTERNAL || (type === navigationItemType.INTERNAL && isRelationDefined);
};

export const isRelationPublished = ({ relatedRef, relatedType = {}, type, isCollection }) => {
  if (isCollection) {
    return relatedType.available || relatedRef.available;
  }
  if ((type === navigationItemType.INTERNAL)) {
    const isHandledByPublshFlow =  relatedRef ? 'published_at' in relatedRef : false;
    if (isHandledByPublshFlow) {
      return get(relatedRef, 'published_at', true);
    }
  }
  return true;
};

export const validateNavigationStructure = (items = []) =>
  items.map(item =>
    (item.removed || isRelationCorrect({
      related: item.related,
      type: item.type,
    })) &&
    validateNavigationStructure(item.items)
  ).filter(item => !item).length === 0;
