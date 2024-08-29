import { assertConfig } from '../utils';

export * from './setup';

export default {
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
    preferCustomContentTypes: false,
    isCacheEnabled: false,
  },
  validator(config: unknown) {
    assertConfig(config);
  },
};
