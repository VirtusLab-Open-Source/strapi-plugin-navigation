import {
  assertNotEmpty,
  IConfigSetupStrategy,
  NavigationItemAdditionalField,
  PluginConfigGraphQL,
  PluginConfigKeys,
  PluginConfigNameFields,
  PluginConfigPathDefaultFields,
  PluginConfigPopulate,
  PluginDefaultConfigGetter,
  NavigationRawConfig,
} from "../../types";
import { validateAdditionalFields } from "../utils";

export const configSetupStrategy: IConfigSetupStrategy = async ({ strapi }) => {
  const pluginStore = strapi.store({
    type: "plugin",
    name: "navigation",
  });
  const getFromPluginDefaults: PluginDefaultConfigGetter = await strapi.plugin(
    "navigation"
  ).config;
  const hasI18nPlugin: boolean = !!strapi.plugin("i18n");
  // TODO: Mark config from store as Partial<NavigationConfig>
  let config: NavigationRawConfig = await pluginStore.get({
    key: "config",
  });
  const getWithFallback = getWithFallbackFactory(config, getFromPluginDefaults);

  config = {
    additionalFields: getWithFallback<NavigationItemAdditionalField[]>("additionalFields"),
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
    pathDefaultFields: getWithFallback<PluginConfigPathDefaultFields>("pathDefaultFields"),
  };

  validateAdditionalFields(config.additionalFields);
  
  await pluginStore.set({
    key: "config",
    value: config,
  });

  return config;
};

const getWithFallbackFactory =
  (config: NavigationRawConfig, fallback: PluginDefaultConfigGetter) =>
  <T extends ReturnType<PluginDefaultConfigGetter>>(key: PluginConfigKeys) => {
    const value = config?.[key] ?? fallback(key);

    assertNotEmpty(
      value,
      new Error(`[Navigation] Config "${key}" is undefined`)
    );

    return value as T;
  };
