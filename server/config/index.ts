import { NavigationConfig, StrapiConfig } from "../../types";

export * from "./setupStrategy";

const config: StrapiConfig<NavigationConfig> = {
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
  },
};

export default config;
