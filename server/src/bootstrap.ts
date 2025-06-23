import type { Core } from '@strapi/strapi';

import { configSetup } from './config';
import { navigationSetup } from './i18n';
import { setupPermissions } from './permissions';
import { graphQLSetup } from './graphql';
import { getPluginService } from './utils';

const bootstrap = async (context: { strapi: Core.Strapi }) => {
  await configSetup(context);
  await navigationSetup(context);
  await setupPermissions(context);
  await graphQLSetup(context);

  await strapi.service('plugin::navigation.migrate').migrateRelatedIdToDocumentId();

  strapi.db.lifecycles.subscribe({
    models: ['plugin::i18n.locale'],
    async afterCreate(event) {
      const adminService = getPluginService(context, 'admin');
      await adminService.refreshNavigationLocale(event.result?.code);
    },
  });
};
export default bootstrap;
