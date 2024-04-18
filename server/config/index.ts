import { NavigationPluginConfig, StrapiConfig } from "../../types";

export * from "./setupStrategy";

const config: StrapiConfig<NavigationPluginConfig> = {
  default: {
    additionalFields: [],
    allowedLevels: 2,
    contentTypes: [],
    contentTypesNameFields: {},
    contentTypesPopulate: {},
    gql: {
      navigationItemRelated: [],
    },
    i18nEnabled: false,
    pathDefaultFields: {},
    pruneObsoleteI18nNavigations: false,
    cascadeMenuAttached: true,
    isCacheEnabled: false,
  },
};

export default config;
