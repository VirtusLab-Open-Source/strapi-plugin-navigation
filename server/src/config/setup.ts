import { Core } from '@strapi/strapi';

import configBase from '.';
import {
  NavigationItemAdditionalField,
  NavigationPluginConfigDBSchema,
  PluginConfigKeys,
  configSchema,
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

export const configSetup = async ({ strapi }: { strapi: Core.Strapi }) => {
  const pluginStore = strapi.store({
    type: 'plugin',
    name: 'navigation',
  });
  const getFromPluginDefaults: PluginDefaultConfigGetter = await strapi.plugin('navigation').config;
  const configRaw = {
    ...configBase.default,
    ...((await pluginStore.get({
      key: 'config',
    })) ?? configBase.default),
  };

  let config = configSchema.parse(configRaw);

  const getWithFallback = getWithFallbackFactory(config, getFromPluginDefaults);

  config = {
    additionalFields: getWithFallback<NavigationItemAdditionalField[]>('additionalFields'),
    contentTypes: getWithFallback<string[]>('contentTypes'),
    contentTypesNameFields: getWithFallback<PluginConfigNameFields>('contentTypesNameFields'),
    contentTypesPopulate: getWithFallback<PluginConfigPopulate>('contentTypesPopulate'),
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
