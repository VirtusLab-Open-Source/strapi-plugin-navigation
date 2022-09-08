import { StrapiContentTypeSchema } from "../admin/src/pages/SettingsPage/types";
import { I18NConfigFields } from "../server/i18n";
import { Audience, NavigationItemAdditionalField } from "./contentTypes";

export type PluginConfigNameFields = Record<string, string[]>;
export type PluginConfigPopulate = Record<string, string[]>;
export type PluginConfigPathDefaultFields = Record<string, string[]>;

export type PluginConfigGraphQL = {
  navigationItemRelated: string[];
};

type NavigationBaseConfig = {
  additionalFields: NavigationItemAdditionalField[];
  allowedLevels: number;
  contentTypesNameFields: PluginConfigNameFields;
  contentTypesPopulate: PluginConfigPopulate;
  gql: PluginConfigGraphQL;
  i18nEnabled: boolean;
  pathDefaultFields: PluginConfigPathDefaultFields;
  pruneObsoleteI18nNavigations: boolean;
}

// Readonly config fields 
export type ExtendedNavigationConfig = Partial<{
  restrictedContentTypes: readonly string[];
  allowedContentTypes: readonly string[];
  availableAudience: readonly Audience[];
}>;

// Config stored in plugins.js file
export type NavigationRawConfig =
  NavigationBaseConfig &
  { contentTypes: string[] };

export type NavigationConfig =
  NavigationBaseConfig &
  I18NConfigFields & 
  ExtendedNavigationConfig &
  { contentTypes: StrapiContentTypeSchema[] }

export type NavigationSettingsConfig =
  NavigationConfig &
  { isGQLPluginEnabled?: boolean };

export type StrapiConfig<T> = {
  default: T;
};

export type PluginConfigKeys = keyof NavigationRawConfig;

export type PluginDefaultConfigGetter = (
  key: PluginConfigKeys
) => NavigationRawConfig[PluginConfigKeys];
