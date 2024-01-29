import {
  capitalize,
  find,
  first,
  flatten,
  get,
  includes,
  isArray,
  isEmpty,
  isNil,
  isObject,
  isString,
  last,
  uniqBy,
  zipWith,
} from 'lodash';
import { PopulateClause, StrapiContext } from 'strapi-typed';
import { Id, IStrapi, Primitive, StrapiContentType, StringMap, StrapiContentTypeFullSchema } from "strapi-typed";

import {
  assertNotEmpty,
  AuditLogContext,
  AuditLogParams,
  ContentTypeEntity,
  Effect,
  IAdminService,
  IClientService,
  ICommonService,
  LifeCycleEvent,
  LifeCycleHookName,
  NavigationActions,
  NavigationItem,
  NavigationItemAdditionalField,
  NavigationItemCustomField,
  NavigationItemEntity,
  NavigationServiceName,
  NestedPath,
  NestedStructure,
  PluginConfigNameFields,
  PopulateQueryParam,
  ToBeFixed,
} from "../../types";
import { NavigationError } from '../../utils/NavigationError';
import { TEMPLATE_DEFAULT, ALLOWED_CONTENT_TYPES, RESTRICTED_CONTENT_TYPES, ContentType, allLifecycleHooks } from './constant';
declare var strapi: IStrapi;

type Populate =
  | string
  | undefined
  | boolean
  | Array<Populate>
  | Record<string, string | boolean | undefined>;

const UID_REGEX = /^(?<type>[a-z0-9-]+)\:{2}(?<api>[a-z0-9-]+)\.{1}(?<contentType>[a-z0-9-]+)$/i;

type TypeMap = {
  client: IClientService,
  admin: IAdminService,
  common: ICommonService
}

export function getPluginService<T extends NavigationServiceName>(name: T): T extends infer R extends NavigationServiceName 
  ? TypeMap[R] 
  : never {
  return strapi.plugin("navigation").service(name)
}

export const errorHandler = (ctx: ToBeFixed) => (error: NavigationError | string) => {
  if (error instanceof NavigationError) {
    return ctx.badRequest(error.message, error.additionalInfo);
  }
  throw error;
};

export const getCustomFields = (additionalFields: NavigationItemAdditionalField[]): NavigationItemCustomField[] =>
  additionalFields.filter(field => typeof field !== 'string') as NavigationItemCustomField[];

export const parseParams = <
  TParams extends StringMap<string> = StringMap<string>,
  TResult extends StringMap<Primitive> = StringMap<Primitive>
>(params: TParams): TResult =>
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
    if (isNil(curr) || typeof curr.__contentType !== "string") return acc;
    
    const index = curr.__contentType;
    if (isNil(acc[index])) acc[index] = [];
    
    return {...acc, [index]: [...acc[index], curr.id]};
  }, {});
  const responses = await Promise.all(
    Object.entries(relatedMap)
      .map(
        ([contentType, ids]) => {
          assertNotEmpty(find(contentTypes, cnt => cnt.uid === contentType));
          return strapi.query<ContentTypeEntity>(contentType)
            .findMany({
              where: { id: { $in: ids } },
              limit: Number.MAX_SAFE_INTEGER,
              populate: ["template"],
            })
            .then(res => ({ [contentType]: res }));
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
    .reduce((acc: NestedPath[], entity): NestedPath[] => {
      const path = `${parentPath || ''}/${entity.path}`.replace("//", "/")

      return [
        {
          id: entity.id,
          parent: parentPath ? {
            id: get(entity, ['parent', 'id']),
            path: parentPath,
          } : undefined,
          path,
        },
        ...buildNestedPaths(items, entity.id, path),
        ...acc,
      ];
    }, [] as NestedPath[]);};

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

export const compareArraysOfNumbers = (arrA: number[], arrB: number[]) => {
  const diff = zipWith(arrA, arrB, (a, b) => {
    if (isNil(a))
      return -1;
    if (isNil(b))
      return 1;
    return a - b
  });
  return find(diff, a => a !== 0) || 0;
}

export const getPluginModels = (): Record<'masterModel' | 'itemModel' | 'relatedModel' | 'audienceModel', StrapiContentTypeFullSchema> => {
  const plugin = strapi.plugin('navigation');
  return {
    masterModel: plugin.contentType('navigation'),
    itemModel: plugin.contentType('navigation-item'),
    relatedModel: plugin.contentType('navigations-items-related'),
    audienceModel: plugin.contentType('audience'),
  }
};

export const validateAdditionalFields = (additionalFields: NavigationItemAdditionalField[]) => {
  const forbiddenNames = [
    'title', 'type', 'path',
    'externalPath', 'uiRouterKey', 'menuAttached',
    'order', 'collapsed', 'related',
    'parent', 'master', 'audience',
    'additionalFields',
  ];
  const customFields = getCustomFields(additionalFields);

  if (customFields.length !== uniqBy(customFields, 'name').length) {
    throw new Error('All names of custom fields must be unique.');
  }

  if (!isNil(find(customFields, item => includes(forbiddenNames, item.name)))) {
    throw new Error(`Name of custom field cannot be one of: ${forbiddenNames.join(', ')}`);
  }
};

export const parsePopulateQuery = (populate: PopulateQueryParam): PopulateClause => {
  if (populate === "*") {
    return true;
  } else if (typeof populate === "string") {
    return [populate];
  } else {
    return populate;
  }
}

export const purgeSensitiveData = (data: ToBeFixed): ToBeFixed => {
  if (!data || !(typeof data === "object") || !Object.keys(data).length) {
    return data;
  }

  const { createdBy = undefined, updatedBy = undefined, ...rest } = data;

  if (!createdBy && !updatedBy) {
    return data;
  }

  return {
    ...Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [key, purgeSensitiveData(value)])
    ),
    ...(createdBy ? { createdBy: purgeSensitiveDataFromUser(createdBy) } : {}),
    ...(updatedBy ? { updatedBy: purgeSensitiveDataFromUser(updatedBy) } : {}),
  }
}

export const purgeSensitiveDataFromUser = (data: any = {}) => {
  if (!data) {
    return undefined;
  }

  const allowedFields = ['username', 'firstname', 'lastname', 'email'];

  return Object.keys(data)
    .filter((key: string) => allowedFields.includes(key.toLowerCase()))
    .reduce((prev, curr) => ({
      ...prev,
      [curr]: data[curr],
    }), {});
};

export const resolveGlobalLikeId = (uid = '') =>  {
    const parse = (str: string) => str.split('-')
        .map(_ => capitalize(_))
        .join('');

    const [type, scope, contentTypeName] = splitTypeUid(uid);

    if (type === 'api') {
        return parse(contentTypeName);
    }
    return `${parse(scope)}${parse(contentTypeName)}`;
};

const splitTypeUid = (uid = '') => {
    return uid.split(UID_REGEX).filter((s) => s && s.length > 0);
};

export const sanitizePopulateField = (populate: Populate): Populate => {
  if (!populate || populate === true || populate === "*") {
    return undefined;
  }

  if (Array.isArray(populate)) {
    return populate
      .map((item): Populate => sanitizePopulateField(item));
  }

  if ("object" === typeof populate) {
    return Object.fromEntries(
      Object.entries(populate).map(
        ([key, value]) => [key, sanitizePopulateField(value)] as const
      )
    ) as Record<string, string | boolean | undefined>;
  }

  return populate;
};

export const buildHookListener =
  (contentTypeName: ContentType, { strapi }: StrapiContext) =>
  (hookName: LifeCycleHookName): [LifeCycleHookName, Effect<LifeCycleEvent>] =>
    [
      hookName,
      async (event) => {
        const commonService: ICommonService = strapi
          .plugin("navigation")
          .service("common");

        await commonService.runLifecycleHook({
          contentTypeName,
          hookName,
          event,
        });
      },
    ];

export const buildAllHookListeners = (
  contentTypeName: ContentType,
  context: StrapiContext,
): Record<LifeCycleHookName, Effect<LifeCycleEvent>> =>
  Object.fromEntries(
    allLifecycleHooks.map(buildHookListener(contentTypeName, context))
  ) as ToBeFixed;