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
  const dbConfig = forceDefault
    ? ({} as Partial<NavigationPluginConfigDBSchema>)
    : (((await pluginStore.get({ key: 'config' })) ?? {}) as Partial<NavigationPluginConfigDBSchema>);

  const configRaw = forceDefault
    ? ({} as NavigationPluginConfigDBSchema)
    : ({ ...configBase.default, ...dbConfig } as NavigationPluginConfigDBSchema);

  if (!isEmpty(configRaw)) {
    DynamicSchemas.configSchema.parse(configRaw);
  }

  const getWithFallback = getWithFallbackFactory(dbConfig, getFromPluginDefaults);

  const config: ConfigSchema = {
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
  (dbConfig: Partial<NavigationPluginConfigDBSchema>, fallback: PluginDefaultConfigGetter) =>
  <T extends ReturnType<PluginDefaultConfigGetter>>(key: PluginConfigKeys) => {
    const value =
      dbConfig?.[key] ??
      fallback(key) ??
      (configBase.default as Record<string, unknown>)[key];

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
