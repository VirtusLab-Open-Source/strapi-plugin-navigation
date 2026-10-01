import { Core } from '@strapi/strapi';

import configBase from '.';
import {
  ConfigSchema,
  NavigationPluginConfigDBSchema,
  PluginConfigKeys,
  DynamicSchemas,
} from '../schemas';
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

  const partialConfigSchema = DynamicSchemas.configSchema.partial();
  const hardcodedDefaults = partialConfigSchema.parse(configBase.default);
  const dbConfig = partialConfigSchema.parse(
    forceDefault ? {} : ((await pluginStore.get({ key: 'config' })) ?? {})
  );

  const getWithFallback = getWithFallbackFactory(
    dbConfig,
    getFromPluginDefaults,
    hardcodedDefaults
  );

  const config: ConfigSchema = DynamicSchemas.configSchema.parse({
    additionalFields: getWithFallback('additionalFields'),
    contentTypes: getWithFallback('contentTypes'),
    contentTypesNameFields: getWithFallback('contentTypesNameFields'),
    contentTypesPopulate: getWithFallback('contentTypesPopulate'),
    defaultContentType: getWithFallback('defaultContentType'),
    allowedLevels: getWithFallback('allowedLevels'),
    gql: getWithFallback('gql'),
    pathDefaultFields: getWithFallback('pathDefaultFields'),
    cascadeMenuAttached: getWithFallback('cascadeMenuAttached'),
    preferCustomContentTypes: getWithFallback('preferCustomContentTypes'),
    isCacheEnabled: getWithFallback('isCacheEnabled'),
  });

  handleDeletedContentTypes(config, { strapi });

  validateAdditionalFields(config.additionalFields);

  await pluginStore.set({
    key: 'config',
    value: config,
  });

  return config;
};

const getWithFallbackFactory =
  (
    dbConfig: Partial<NavigationPluginConfigDBSchema>,
    fallback: PluginDefaultConfigGetter,
    hardcodedDefaults: Partial<NavigationPluginConfigDBSchema>
  ) =>
  (key: PluginConfigKeys) => {
    const value = dbConfig[key] ?? fallback(key) ?? hardcodedDefaults[key];

    assertNotEmpty(value, new Error(`[Navigation] Config "${key}" is undefined`));

    return value;
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
