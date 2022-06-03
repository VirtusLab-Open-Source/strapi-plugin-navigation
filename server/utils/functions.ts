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
import { Id, IStrapi, Primitive, StrapiContentType, StrapiPlugin, StringMap } from "strapi-typed";

import { AuditLogContext, AuditLogParams, ContentTypeEntity, NavigationActions, NavigationItem, NavigationItemEntity, NavigationService, NavigationServiceName, NestedPath, NestedStructure, PluginConfigNameFields, ToBeFixed } from "../../types";
import { NavigationError } from '../../utils/NavigationError';
import { TEMPLATE_DEFAULT, ALLOWED_CONTENT_TYPES, RESTRICTED_CONTENT_TYPES } from './constant';
declare var strapi: IStrapi;

export const getPluginService = <T extends NavigationService>(name: NavigationServiceName): T =>
  strapi.plugin("navigation").service(name);

export const errorHandler = (ctx: ToBeFixed) => (error: NavigationError | string) => {
  if (error instanceof NavigationError) {
    return ctx.badRequest(error.message, error.additionalInfo);
  }
  throw error;
};

export const parseParams = <
  TParams extends StringMap<string> = StringMap<string>,
  TResult extends StringMap<Primitive> = StringMap<Primitive>
>(params: TParams): TResult  =>
  Object.keys(params).reduce((prev, curr) => {
    const value = params[curr];
    const parsedValue = isNaN(Number(value)) ? value : parseInt(value, 10);
    return {
      ...prev,
      [curr]: parsedValue,
    };
  }, {} as TResult);

export const templateNameFactory = async (
  items: NavigationItemEntity<ContentTypeEntity[] | ContentTypeEntity>[] = [],
  strapi: IStrapi,
  contentTypes: StrapiContentType<ToBeFixed>[] = [],
) => {
  const flatRelated = flatten(items.map(i => i.related)).filter(_ => !!_);
  const relatedMap = (flatRelated).reduce((acc: { [key: string]: Id[] }, curr) => {
    if (curr === null) return acc;
    const index = curr.__contentType;
    if (typeof index !== 'string') return acc;
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
              limit: Number.MAX_SAFE_INTEGER,
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

  return (contentType: ToBeFixed, id: Id) => {
    const template = get(relatedResponseMap[contentType].find(data => data.id === id), 'template');

    if (template && template instanceof Array) {
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
  template: ToBeFixed[] = [],
) => {
  const componentName = get(first(template), '__component');
  return !!componentName ? strapi.components[componentName] : null;
};

export const prepareAuditLog = (
  actions: NavigationActions[]
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
  item: NavigationItemEntity<ContentTypeEntity[] | ContentTypeEntity>,
  fields: PluginConfigNameFields = {},
  contentTypes: StrapiContentType<ToBeFixed>[] = []
): string | undefined => {
  const { title, related } = item;
  const lastRelated = isArray(related) ? last(related) : related;

  if (title) {
    return isString(title) && !isEmpty(title) ? title : undefined;
  } else if (lastRelated) {
    const relationTitle = extractItemRelationTitle(lastRelated, fields, contentTypes);
    return isString(relationTitle) && !isEmpty(relationTitle) ? relationTitle : undefined;
  }
  return undefined;
};

export const extractItemRelationTitle = (
  relatedItem: ContentTypeEntity,
  fields: PluginConfigNameFields = {},
  contentTypes: StrapiContentType<ToBeFixed>[] = []
) => {
  const { __contentType } = relatedItem;
  const contentType = find(contentTypes, _ => _.contentTypeName === __contentType);
  const { default: defaultFields = [] } = fields;
  return get(fields, `${contentType ? contentType.collectionName : ''}`, defaultFields).map((_) => relatedItem[_]).filter((_) => _)[0] || '';
};

export const filterOutUnpublished = (
  item: NavigationItemEntity<ContentTypeEntity | ContentTypeEntity[]>
) => {
  const relatedItem = item.related && (isArray(item.related) ? last(item.related) : item.related);
  const isHandledByPublishFlow = relatedItem ? 'published_at' in relatedItem : false;

  if (isHandledByPublishFlow) {
    const isRelatedDefinedAndPublished = relatedItem ?
      isHandledByPublishFlow && get(relatedItem, 'published_at') :
      false;
    return item.type === "INTERNAL" ? isRelatedDefinedAndPublished : true;
  }
  return (item.type !== "INTERNAL") || relatedItem;
};

export const checkDuplicatePath = (
  parentItem: ToBeFixed | null,
  checkData: NavigationItem[],
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (parentItem && parentItem.items) {
      for (let item of checkData) {
        for (let _ of parentItem.items) {
          if (_.path === item.path && (_.id !== item.id) && (item.type === "INTERNAL")) {
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
  value = '',
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
    plugin,
    pluginName: 'navigation',
  };
};

export const buildNestedStructure = (
  entities: NavigationItemEntity<ContentTypeEntity>[],
  id: Id | null = null,
  field: keyof NavigationItemEntity = 'parent',
): NestedStructure<NavigationItemEntity<ContentTypeEntity>>[] => {
  return entities
    .filter(entity => {
      let data = entity[field];
      if (data == null && id === null) {
        return true;
      }
      if (data && typeof id === 'string') {
        data = data.toString();
      }
      if (!!data && typeof data === 'object' && 'id' in data) {
        return (data).id === id
      }
      return (data && data === id)
    })
    .map(entity => {
      return ({
        ...entity,
        related: entity.related,
        items: buildNestedStructure(entities, entity.id, field),
      });
    });
};

export const buildNestedPaths = <T extends Pick<NavigationItemEntity, 'parent' | 'id' | 'path'>>(
  items: T[],
  id: Id | null = null,
  parentPath: string | null = null
): NestedPath[] => {
  return items
    .filter(entity => {
      let data: NavigationItemEntity | string | null = entity.parent;
      if (data == null && id === null) {
        return true;
      }
      if (data && typeof id === 'string') {
        data = data.toString();
      }
      return (data && data === id) || (isObject(entity.parent) && ((entity.parent).id === id));
    })
    .reduce((acc: NestedPath[], entity) => {
      const path = `${parentPath || ''}/${entity.path}`
      return [
        {
          id: entity.id,
          parent: parentPath ? {
            id: get(entity, 'parent.id'),
            path: parentPath,
          } : undefined,
          path,
        },
        ...buildNestedPaths(items, entity.id, path),
        ...acc,
      ];
    }, []);
};

export const filterByPath = <T extends Pick<NavigationItemEntity, 'parent' | 'id' | 'path'>>(
  items: T[],
  path: string | null,
): { root?: NestedPath, items: T[] } => {
  const itemsWithPaths = path ? buildNestedPaths(items).filter(({ path: itemPath }) => itemPath.includes(path)) : [];
  const root = itemsWithPaths.find(({ path: itemPath }) => itemPath === path);

  return {
    root,
    items: isNil(root) ? [] : items.filter(({ id }) => (itemsWithPaths.find(v => v.id === id))),
  }
};

export const isContentTypeEligible = (
  uid = ''
) => {
  const isOneOfAllowedType = ALLOWED_CONTENT_TYPES.filter(_ => uid.includes(_)).length > 0;
  const isNoneOfRestricted = RESTRICTED_CONTENT_TYPES.filter(_ => uid.includes(_) || (uid === _)).length === 0;
  return uid && isOneOfAllowedType && isNoneOfRestricted;
}

export const intercalate = <T, U extends T>(glue: T, arr: U[]) =>
  arr.slice(1).reduce<Array<T | U>>((acc, element) => acc.concat([glue, element]), arr.slice(0, 1));
