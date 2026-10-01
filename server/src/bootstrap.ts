import type { Core } from '@strapi/strapi';

import { setupCacheStrategy } from './cache';
import { configSetup } from './config';
import { navigationSetup } from './i18n';
import { setupPermissions } from './permissions';
import { graphQLSetup } from './graphql';
import { getPluginService, removeNavigationsWithoutDefaultLocale } from './utils';

const bootstrap = async (context: { strapi: Core.Strapi }) => {
  await removeNavigationsWithoutDefaultLocale(context);
  await configSetup(context);
  await navigationSetup(context);
  await setupPermissions(context);
  await graphQLSetup(context);
  await setupCacheStrategy(context);

  await strapi.service('plugin::navigation.migrate').migrateRelatedIdToDocumentId();
};
export default bootstrap;
