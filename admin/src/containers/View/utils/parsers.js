import { v4, validate as validateUUID } from "uuid";
import { get, find, first, upperFirst, isObject, isString, isNumber, isArray } from "lodash";
import { navigationItemType } from "./enums";

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
    audience = [],
    items = [],
  } = item;
  const isExternal = type === navigationItemType.EXTERNAL;
  const { contentTypeItems = [], contentTypes = [] } = config;
  const relatedId = isExternal || (isString(related) && validateUUID(related)) ? related : parseInt(related, 10);
  const relatedContentTypeItem = isExternal ? undefined : find(contentTypeItems, cti => cti.id === relatedId);
  const relatedContentType = relatedContentTypeItem ? find(contentTypes, ct => ct.collectionName === (relatedContentTypeItem.__collectionName || relatedType)) : undefined;
  
  return {
    id,
    parent,
    master,
    title,
    type,
    updated,
    removed,
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
            field: "navigation",
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
  const { type, related, relatedType, relatedRef } = item;
  let relation = {
    related: undefined,
    relatedRef: undefined,
    relatedType: undefined
  }
  
  if ((type !== navigationItemType.INTERNAL) || !related) {
    return {
      ...item,
      ...relation,
    };
  }

  const relatedItem = isArray(related) ? first(related) : related;
  const relatedId = isString(related) && !validateUUID(related) ? parseInt(related, 10) : related; 
  const shouldFindRelated = (isNumber(related) || validateUUID(related) || isString(related)) && !relatedRef;
  const shouldBuildRelated = !relatedRef || (relatedRef && (relatedRef.id !== relatedId));
  if (shouldBuildRelated && !shouldFindRelated) {
    const { __contentType } = relatedItem;
    const __collectionName = get(find(contentTypes, ct => ct.name.toLowerCase() === __contentType.toLowerCase()), 'collectionName');
    relation = {
      related: relatedItem.id,
      relatedRef: { 
        __collectionName,
        ...relatedItem
      },
      relatedType: __collectionName
    };
  } else if (shouldFindRelated) {
    const relatedRef = find(contentTypeItems, cti => cti.id === relatedId);
    const relatedContentType = find(contentTypes, ct => ct.collectionName.toLowerCase() === relatedType.toLowerCase());
    relation = {
      relatedRef: {
        __collectionName: relatedType,
        __contentType: upperFirst(get(relatedContentType, 'name')),
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

export const transformItemToViewPayload = (payload, items = [], config) => {
  if (!payload.viewParentId) {
    if (payload.viewId) {
      return items.map((item) => {
        if (item.viewId === payload.viewId) {
          return linkRelations(payload, config);
        }
        return { ...item };
      });
    }
    return [
      ...items,
      linkRelations({
        ...payload,
        viewId: v4(),
      }, config),
    ];
  }

  return items.map((item) => {
    if (payload.viewParentId === item.viewId) {
      if (!payload.viewId) {
        return {
          ...item,
          items: [
            ...(item.items || []),
            linkRelations({
              ...payload,
              viewId: v4(),
            }, config),
          ],
        };
      }
      return {
        ...item,
        items: (item.items || []).map((iItem) => {
          if (iItem.viewId === payload.viewId) {
            return linkRelations(payload, config);
          }
          return { ...iItem };
        }),
      };
    }
    return {
      ...item,
      items: transformItemToViewPayload(payload, item.items, config),
    };
  });
};

export const prepareItemToViewPayload = (items = [], viewParentId = null, config = {}) => 
  items.map(item => {
    const viewId = v4();
    return {
      ...linkRelations({
        viewId,
        viewParentId,
        ...item,
      }, config),
      items: prepareItemToViewPayload(item.items, viewId, config),
    };
  });

  export const extractRelatedItemLabel = (item = {}) => item.name || item.title || item.label || item.id;