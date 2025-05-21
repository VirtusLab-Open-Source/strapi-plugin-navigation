import type { Core } from '@strapi/strapi';

import { configSetup } from './config';
import { navigationSetup } from './i18n';
import { setupPermissions } from './permissions';
import { graphQLSetup } from './graphql';

const bootstrap = async (context: { strapi: Core.Strapi }) => {
  await configSetup(context);
  await navigationSetup(context);
  await setupPermissions(context);
  await graphQLSetup(context);

  await strapi.service('plugin::navigation.migrate').migrateRelatedIdToDocumentId();
};
export default bootstrap;
