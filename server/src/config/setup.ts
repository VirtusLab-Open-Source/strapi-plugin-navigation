import { Core } from '@strapi/strapi';

import { isEmpty } from 'lodash';
import configBase from '.';
import {
  ConfigSchema,
  NavigationItemAdditionalField,
  NavigationPluginConfigDBSchema,
  PluginConfigKeys,
  DynamicSchemas,
} from '../schemas';
import {
  PluginConfigGraphQL,
  PluginConfigNameFields,
  PluginConfigPathDefaultFields,
  PluginConfigPopulate,
} from '../types';
import { assertNotEmpty, resolveGlobalLikeId, validateAdditionalFields } from '../utils';

type PluginDefaultConfigGetter = (
  key: PluginConfigKeys
) => NavigationPluginConfigDBSchema[PluginConfigKeys];

export const configSetup = async ({
  strapi,
  forceDefault = false,
}: {
  strapi: Core.Strapi;
  forceDefault?: boolean;
}) => {
  const pluginStore = strapi.store({
    type: 'plugin',
    name: 'navigation',
  });
  const getFromPluginDefaults: PluginDefaultConfigGetter = await strapi.plugin('navigation').config;
  const configRaw = forceDefault
    ? ({} as NavigationPluginConfigDBSchema)
    : {
        ...configBase.default,
        ...((await pluginStore.get({
          key: 'config',
        })) ?? configBase.default),
      };

  let config = isEmpty(configRaw)
    ? configRaw
    : (DynamicSchemas.configSchema.parse(configRaw) as unknown as ConfigSchema);

  const getWithFallback = getWithFallbackFactory(config, getFromPluginDefaults);

  config = {
    additionalFields: getWithFallback<NavigationItemAdditionalField[]>('additionalFields'),
    contentTypes: getWithFallback<string[]>('contentTypes'),
    contentTypesNameFields: getWithFallback<PluginConfigNameFields>('contentTypesNameFields'),
    contentTypesPopulate: getWithFallback<PluginConfigPopulate>('contentTypesPopulate'),
    defaultContentType: getWithFallback<string>('defaultContentType'),
    allowedLevels: getWithFallback<number>('allowedLevels'),
    gql: getWithFallback<PluginConfigGraphQL>('gql'),
    pathDefaultFields: getWithFallback<PluginConfigPathDefaultFields>('pathDefaultFields'),
    cascadeMenuAttached: getWithFallback<boolean>('cascadeMenuAttached'),
    preferCustomContentTypes: getWithFallback<boolean>('preferCustomContentTypes'),
    isCacheEnabled: getWithFallback<boolean>('isCacheEnabled'),
  };

  handleDeletedContentTypes(config, { strapi });

  validateAdditionalFields(config.additionalFields);

  await pluginStore.set({
    key: 'config',
    value: config,
  });

  return config;
};

const getWithFallbackFactory =
  (config: NavigationPluginConfigDBSchema, fallback: PluginDefaultConfigGetter) =>
  <T extends ReturnType<PluginDefaultConfigGetter>>(key: PluginConfigKeys) => {
    const value = config?.[key] ?? fallback(key);

    assertNotEmpty(value, new Error(`[Navigation] Config "${key}" is undefined`));

    return value as T;
  };

const handleDeletedContentTypes = (
  config: NavigationPluginConfigDBSchema,
  { strapi }: { strapi: Core.Strapi }
): void => {
  const notAvailableContentTypes = config.contentTypes.filter(
    (contentType) => !strapi.contentTypes[contentType as any]
  );

  if (notAvailableContentTypes.length === 0) {
    return;
  }

  const notAvailableContentTypesGraphQL = notAvailableContentTypes.map(resolveGlobalLikeId);

  config.contentTypes = config.contentTypes.filter(
    (contentType) => !notAvailableContentTypes.includes(contentType)
  );

  config.contentTypesNameFields = Object.fromEntries(
    Object.entries(config.contentTypesNameFields).filter(
      ([contentType]) => !notAvailableContentTypes.includes(contentType)
    )
  );

  config.gql.navigationItemRelated = config.gql.navigationItemRelated.filter(
    (contentType) => !notAvailableContentTypesGraphQL.includes(contentType)
  );
};
