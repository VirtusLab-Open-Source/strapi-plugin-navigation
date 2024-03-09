import { StrapiContext } from "strapi-typed";
import {
  assertNotEmpty,
  IConfigSetupStrategy,
  NavigationItemAdditionalField,
  NavigationPluginConfig,
  PluginConfigGraphQL,
  PluginConfigKeys,
  PluginConfigNameFields,
  PluginConfigPathDefaultFields,
  PluginConfigPopulate,
  PluginDefaultConfigGetter,
} from "../../types";
import { resolveGlobalLikeId, validateAdditionalFields } from "../utils";

export const configSetupStrategy: IConfigSetupStrategy = async ({ strapi }) => {
  const pluginStore = strapi.store({
    type: "plugin",
    name: "navigation",
  });
  const getFromPluginDefaults: PluginDefaultConfigGetter = await strapi.plugin(
    "navigation"
  ).config;
  const hasI18nPlugin: boolean = !!strapi.plugin("i18n");
  // TODO: Mark config from store as Partial<NavigationPluginConfig>
  let config: NavigationPluginConfig = await pluginStore.get({
    key: "config",
  });
  const getWithFallback = getWithFallbackFactory(config, getFromPluginDefaults);

  config = {
    additionalFields:
      getWithFallback<NavigationItemAdditionalField[]>("additionalFields"),
    contentTypes: getWithFallback<string[]>("contentTypes"),
    contentTypesNameFields: getWithFallback<PluginConfigNameFields>(
      "contentTypesNameFields"
    ),
    contentTypesPopulate: getWithFallback<PluginConfigPopulate>(
      "contentTypesPopulate"
    ),
    allowedLevels: getWithFallback<number>("allowedLevels"),
    gql: getWithFallback<PluginConfigGraphQL>("gql"),
    i18nEnabled: hasI18nPlugin && getWithFallback<boolean>("i18nEnabled"),
    pruneObsoleteI18nNavigations: false,
    pathDefaultFields:
      getWithFallback<PluginConfigPathDefaultFields>("pathDefaultFields"),
    cascadeMenuAttached: getWithFallback<boolean>("cascadeMenuAttached"),
    isCacheEnabled: getWithFallback<boolean>("isCacheEnabled"),
  };

  handleDeletedContentTypes(config, { strapi });

  validateAdditionalFields(config.additionalFields);

  await pluginStore.set({
    key: "config",
    value: config,
  });

  return config;
};

const getWithFallbackFactory =
  (config: NavigationPluginConfig, fallback: PluginDefaultConfigGetter) =>
  <T extends ReturnType<PluginDefaultConfigGetter>>(key: PluginConfigKeys) => {
    const value = config?.[key] ?? fallback(key);

    assertNotEmpty(
      value,
      new Error(`[Navigation] Config "${key}" is undefined`)
    );

    return value as T;
  };

const handleDeletedContentTypes = (
  config: NavigationPluginConfig,
  { strapi }: StrapiContext
): void => {
  const notAvailableContentTypes = config.contentTypes.filter(
    (contentType) => !strapi.contentTypes[contentType]
  );

  if (notAvailableContentTypes.length === 0) {
    return;
  }

  const notAvailableContentTypesGraphQL =
    notAvailableContentTypes.map(resolveGlobalLikeId);

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
