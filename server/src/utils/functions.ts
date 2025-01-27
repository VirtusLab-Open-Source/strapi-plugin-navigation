import { Core } from '@strapi/strapi';
import { capitalize, find, includes, isNil, last, uniqBy } from 'lodash';
import {
  NavigationItemAdditionalField,
  NavigationPluginConfigDBSchema,
  configSchema,
} from '../schemas';
import { AdminService, ClientService, CommonService } from '../services';
import {
  ContentType,
  Effect,
  LifeCycleEvent,
  LifeCycleHookName,
  StrapiContentTypeFullSchema,
} from '../types';
import {
  ALLOWED_CONTENT_TYPES,
  FORBIDDEN_CUSTOM_FIELD_NAMES,
  RESTRICTED_CONTENT_TYPES,
  UID_REGEX,
  allLifecycleHooks,
} from './constants';

type ServiceTypeMap = {
  common: CommonService;
  admin: AdminService;
  client: ClientService;
};

export const getCustomFields = (
  additionalFields: NavigationItemAdditionalField[]
): NavigationItemAdditionalField[] => additionalFields.filter((field) => field !== 'audience');

export const validateAdditionalFields = (additionalFields: NavigationItemAdditionalField[]) => {
  const customFields = getCustomFields(additionalFields);

  if (customFields.length !== uniqBy(customFields, 'name').length) {
    throw new Error('All names of custom fields must be unique.');
  }

  if (
    !isNil(
      find(
        customFields,
        (field) => typeof field === 'object' && includes(FORBIDDEN_CUSTOM_FIELD_NAMES, field.name)
      )
    )
  ) {
    throw new Error(
      `Name of custom field cannot be one of: ${FORBIDDEN_CUSTOM_FIELD_NAMES.join(', ')}`
    );
  }
};

export const assertNotEmpty: <T>(
  value: T | null | undefined,
  customError?: Error
) => asserts value is T = (value, customError) => {
  if (value !== undefined && value !== null) {
    return;
  }

  throw customError ?? new Error('Non-empty value expected, empty given');
};

export const resolveGlobalLikeId = (uid = '') => {
  const parse = (str: string) =>
    str
      .split('-')
      .map((_) => capitalize(_))
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

export function assertConfig(config: unknown): asserts config is NavigationPluginConfigDBSchema {
  if (configSchema.safeParse(config).success) {
    return;
  }

  throw new Error('Navigation plugin schema invalid');
}

export const buildHookListener =
  (contentTypeName: ContentType, context: { strapi: Core.Strapi }) =>
  (hookName: LifeCycleHookName): [LifeCycleHookName, Effect<LifeCycleEvent>] => [
    hookName,
    async (event) => {
      await getPluginService(context, 'common').runLifeCycleHook({
        contentTypeName,
        hookName,
        event,
      });
    },
  ];

export const buildAllHookListeners = (
  contentTypeName: ContentType,
  context: { strapi: Core.Strapi }
): Record<LifeCycleHookName | string, Effect<LifeCycleEvent>> =>
  Object.fromEntries(allLifecycleHooks.map(buildHookListener(contentTypeName, context)));

export const getPluginModels = ({
  strapi,
}: {
  strapi: Core.Strapi;
}): Record<
  'masterModel' | 'itemModel' | 'relatedModel' | 'audienceModel',
  StrapiContentTypeFullSchema
> => {
  const plugin = strapi.plugin('navigation');

  return {
    masterModel: plugin.contentType('navigation'),
    itemModel: plugin.contentType('navigation-item'),
    relatedModel: plugin.contentType('navigations-items-related'),
    audienceModel: plugin.contentType('audience'),
  };
};

export function getPluginService<TName extends keyof ServiceTypeMap>(
  { strapi }: { strapi: Core.Strapi },
  name: TName
) {
  return strapi.plugin('navigation').service(name) as TName extends infer TKey extends
    keyof ServiceTypeMap
    ? ServiceTypeMap[TKey]
    : never;
}

export const parsePopulateQuery = (populate: any) => {
  if (populate === '*') {
    return '*';
  } else if (typeof populate === 'string') {
    return [populate];
  } else if (populate === false) {
    return [];
  } else if (populate === true) {
    return '*';
  } else {
    return populate;
  }
};

export const isContentTypeEligible = (uid = '') => {
  const isOneOfAllowedType = !!ALLOWED_CONTENT_TYPES.find((_) => uid.includes(_));
  const isNoneOfRestricted = !RESTRICTED_CONTENT_TYPES.find((_) => uid.includes(_) || uid === _);

  return !!uid && isOneOfAllowedType && isNoneOfRestricted;
};
