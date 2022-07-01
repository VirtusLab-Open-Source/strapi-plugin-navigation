import { NavigationPluginConfig, StrapiConfig } from "../../types";

export * from "./setupStrategy";

const config: StrapiConfig<NavigationPluginConfig> = {
  default: {
    additionalFields: [],
    contentTypes: [],
    contentTypesNameFields: {},
    contentTypesPopulate: {},
    allowedLevels: 2,
    i18nEnabled: false,
    pruneObsoleteI18nNavigations: false,
    gql: {
      navigationItemRelated: [],
    },
    slugify: {},
  },
};

export default config;
