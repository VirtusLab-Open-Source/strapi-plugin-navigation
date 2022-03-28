import {
  last,
  isObject,
  isEmpty,
  flatten,
  find,
  isString,
  get,
  isNil,
  isArray,
  first,
} from 'lodash';
import { Id, IStrapi, StrapiContentType, StrapiPlugin } from "strapi-typed";

import { AuditLogContext, AuditLogParams, ContentTypeEntity, NavigationActions, NavigationItem, NavigationItemRelated, NavigationItemType, NavigationService, NestedPath, PluginConfigNameFields, ToBeFixed } from "../../types";
import { NavigationError } from '../../utils/NavigationError';
import { TEMPLATE_DEFAULT, ALLOWED_CONTENT_TYPES, RESTRICTED_CONTENT_TYPES} from './constant';
declare var strapi: IStrapi;

export const getPluginService = <T>(name: string): T =>
  strapi.plugin("navigation").service(name);

export const errorHandler = (ctx: ToBeFixed) => (error: NavigationError | string) => {
  if (error instanceof NavigationError) {
    return ctx.badRequest(error.message, error.additionalInfo);
  }
  throw error;
};

export const parseParams = (params: ToBeFixed): any =>
  Object.keys(params).reduce((prev, curr) => {
    const value = params[curr];
    const parsedValue = isNaN(Number(value)) ? value : parseInt(value, 10);
    return {
      ...prev,
      [curr]: parsedValue,
    };
  }, {});



export const templateNameFactory = async (
  items: Array<NavigationItem> = [],
  strapi: IStrapi,
  contentTypes: Array<StrapiContentType<any>> = [],
) => {
  const flatRelated = flatten(items.map(i => i.related)).filter(_ => !!_);
  const relatedMap = (flatRelated as NavigationItemRelated[]).reduce((acc: { [key: string]: Array<Id> }, curr) => {
    const index = curr.__contentType as string;
    if (!acc[index]) {
      acc[index] = [];
    }
    acc[index].push(curr.id);
    return acc;
  }, {});
  const responses = await Promise.all(
    Object.entries(relatedMap)
      .map(
        ([contentType, ids]) => {
          const contentTypeUid = get(find(contentTypes, cnt => cnt.uid === contentType), 'uid');
          return strapi.query<ContentTypeEntity>(contentTypeUid)
            .findMany({
              where: { id: { $in: ids } },
              limit: -1
            })
            .then(res => ({ [contentType]: res }))
        }),
  );
  const relatedResponseMap = responses.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  const singleTypes = new Map(
    contentTypes
      .filter(x => x.isSingle)
      .map(({ contentTypeName, templateName }) => [contentTypeName, templateName || contentTypeName])
  );

  return (contentType: string, id: Id) => {
    const template: Array<ToBeFixed> = get(relatedResponseMap[contentType].find(data => data.id === id), 'template');

    if (template) {
      const templateComponent = getTemplateComponentFromTemplate(strapi, template);
      return get(templateComponent, 'options.templateName', TEMPLATE_DEFAULT);
    }

    if (singleTypes.get(contentType)) {
      return singleTypes.get(contentType);
    }

    return TEMPLATE_DEFAULT;
  };
};

export const getTemplateComponentFromTemplate = (
  strapi: IStrapi,
  template: Array<ToBeFixed> = [],
) => {
  const componentName: string = get(first(template), '__component');
  return !!componentName ? strapi.components[componentName] : null;
};

export const prepareAuditLog = (
  actions: Array<NavigationActions>
): string => {
  return [
    ...new Set(
      actions
        .filter((_: ToBeFixed) => !!_)
        .flatMap(({ remove, create, update }) => {
          return [create ? 'CREATE' : '', update ? 'UPDATE' : '', remove ? 'REMOVE' : '']
            .filter(_ => !!_);
        }),
    ),
  ].join('_');
};

export const sendAuditLog = (
  auditLogInstance: AuditLogContext,
  event: string,
  data: AuditLogParams,
): void => {
  if (auditLogInstance && auditLogInstance.emit) {
    auditLogInstance.emit(event, data);
  }
};

export const composeItemTitle = (
  item: NavigationItem,
  fields: PluginConfigNameFields = {},
  contentTypes: Array<StrapiContentType<any>> = []
): string | undefined => {
  const { title, related } = item;
  if (title) {
    return isString(title) && !isEmpty(title) ? title : undefined;
  } else if (related) {
    const relationTitle = extractItemRelationTitle((isArray(related) ? last(related) : related) as NavigationItemRelated, fields, contentTypes);
    return isString(relationTitle) && !isEmpty(relationTitle) ? relationTitle : undefined;
  }
  return undefined;
};

export const extractItemRelationTitle = (
  relatedItem: ContentTypeEntity,
  fields: PluginConfigNameFields = {},
  contentTypes: Array<StrapiContentType<any>> = []
) => {
  const { __contentType } = relatedItem;
  const contentType = find(contentTypes, _ => _.contentTypeName === __contentType);
  const { default: defaultFields = [] } = fields;
  return get(fields, `${contentType ? contentType.collectionName : ''}`, defaultFields).map((_) => relatedItem[_]).filter((_) => _)[0] || '';
};

export const filterOutUnpublished = (
  item: NavigationItem
) => {
  const relatedItem = item.related && last(item.related as NavigationItemRelated[]);
  const isHandledByPublishFlow = relatedItem ? 'published_at' in relatedItem : false;

  if (isHandledByPublishFlow) {
    const isRelatedDefinedAndPublished = relatedItem ?
      isHandledByPublishFlow && get(relatedItem, 'published_at') :
      false;
    return item.type === NavigationItemType.INTERNAL ? isRelatedDefinedAndPublished : true;
  }
  return (item.type !== NavigationItemType.INTERNAL) || relatedItem;
};

export const checkDuplicatePath = (
  parentItem: ToBeFixed | null,
  checkData: Array<NavigationItem>,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (parentItem && parentItem.items) {
      for (let item of checkData) {
        for (let _ of parentItem.items as NavigationItem[]) {
          if (_.path === item.path && (_.id !== item.id) && (item.type === NavigationItemType.INTERNAL)) {
            return reject(
              new NavigationError(
                `Duplicate path:${item.path} in parent: ${parentItem.title || 'root'} for ${item.title} and ${_.title} items`,
                {
                  parentTitle: parentItem.title,
                  parentId: parentItem.id,
                  path: item.path,
                  errorTitles: [item.title, _.title],
                },
              ),
            );
          }
        }
      }
    }
    return resolve();
  });
};

export const singularize = (
  value: string = '',
) => {
  return last(value) === 's' ? value.substr(0, value.length - 1) : value;
};

export const extractMeta = (
  plugins: { [uid: string]: StrapiPlugin }
) => {
  const { navigation: plugin } = plugins;
  return {
    masterModel: plugin.contentType('navigation'),
    itemModel: plugin.contentType('navigation-item'),
    relatedModel: plugin.contentType('navigations-items-related'),
    audienceModel: plugin.contentType('audience'),
    service: plugin.service('navigation') as NavigationService,
    plugin,
    pluginName: 'navigation',
  };
};

export const buildNestedStructure = (
  entities: Array<NavigationItem>,
  id: Id | null = null,
  field: keyof NavigationItem = 'parent',
): Array<NavigationItem> => {
  return entities
    .filter(entity => {
      let data = entity[field];
      if (data == null && id === null) {
        return true;
      }
      if (data && typeof id === 'string') {
        data = data.toString();
      }
      return (data && data === id) || (isObject(entity[field]) && ((entity[field] as NavigationItem).id === id));
    })
    .map(entity => {
      return ({
        ...entity,
        related: !isEmpty(entity.related) ? last(entity.related as ArrayLike<any>) : entity.related,
        items: buildNestedStructure(entities, entity.id, field),
      });
    });
};

export const buildNestedPaths = (
  items: Array<NavigationItem>,
  id: Id | null = null,
  field: keyof NavigationItem = 'parent',
  parentPath: string | null = null
): Array<NestedPath> => {
  return items
    .filter(entity => {
      let data = entity[field];
      if (data == null && id === null) {
        return true;
      }
      if (data && typeof id === 'string') {
        data = data.toString();
      }
      return (data && data === id) || (isObject(entity[field]) && ((entity[field] as NavigationItem).id === id));
    })
    .reduce((acc: Array<NestedPath>, entity) => {
      const path = `${parentPath || ''}/${entity.path}`
      return [
        {
          id: entity.id,
          parent: parentPath ? {
            id: get(entity, 'parent.id'),
            path: parentPath as string,
          } : undefined,
          path,
        },
        ...buildNestedPaths(items, entity.id, field, path),
        ...acc,
      ];
    }, []);
};

export const filterByPath = (
  items: Array<NavigationItem>,
  path: string | null,
): { root?: NestedPath, items: Array<NavigationItem> } => {
  const itemsWithPaths = path ? buildNestedPaths(items).filter(({ path: itemPath }) => itemPath.includes(path)) : [];
  const root = itemsWithPaths.find(({ path: itemPath }) => itemPath === path);

  return {
    root,
    items: isNil(root) ? [] : items.filter(({ id }) => (itemsWithPaths.find(v => v.id === id))),
  }
};

export const isContentTypeEligible = (
  uid: string = ''
) => {
  const isOneOfAllowedType = ALLOWED_CONTENT_TYPES.filter(_ => uid.includes(_)).length > 0;
  const isNoneOfRestricted = RESTRICTED_CONTENT_TYPES.filter(_ => uid.includes(_) || (uid === _)).length === 0;
  return uid && isOneOfAllowedType && isNoneOfRestricted;
}
