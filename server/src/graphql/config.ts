import { Core } from '@strapi/strapi';

import { configSchema } from '../schemas';
import { getPluginService } from '../utils';
import { getTypes } from './types';
import { getQueries } from './queries';
import { getResolversConfig } from './resolvers-config';

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.shadowCRUD('plugin::navigation.audience').disable();
  extensionService.shadowCRUD('plugin::navigation.navigation').disable();
  extensionService.shadowCRUD('plugin::navigation.navigation-item').disable();
  extensionService.shadowCRUD('plugin::navigation.navigations-items-related').disable();

  const commonService = getPluginService({ strapi }, 'common');
  const pluginStore = await commonService.getPluginStore();
  const config = configSchema.parse(await pluginStore.get({ key: 'config' }));

  extensionService.use(({ strapi, nexus }: any) => {
    const types = getTypes({ strapi, nexus, config });
    const queries = getQueries({ strapi, nexus });
    const resolversConfig = getResolversConfig();

    return {
      types: [types, queries],
      resolversConfig,
    };
  });
};
