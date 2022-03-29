import { isEmpty, isNil } from 'lodash';
import { ICommonService, Navigation } from '../types';
import permissions from '../permissions';
import { StrapiContext } from 'strapi-typed';
import { getPluginService } from './utils';

export default async ({ strapi }: StrapiContext) => {
  // Check if the plugin users-permissions is installed because the navigation needs it
  if (isNil(strapi.plugin('users-permissions'))) {
    throw new Error(
      "In order to make the navigation plugin work the users-permissions plugin is required",
    );
  }

  // Add permissions
  const actions = [
    {
      section: "plugins",
      displayName: "Read",
      uid: permissions.navigation.read,
      pluginName: "navigation",
    },
    {
      section: "plugins",
      displayName: "Update",
      uid: permissions.navigation.update,
      pluginName: "navigation",
    },
  ];
  await strapi.admin.services.permission.actionProvider.registerMany(actions);

  // Initialize first navigation
  const navigations = await strapi
    .query<Navigation>("plugin::navigation.navigation")
    .findMany({});
  if (isEmpty(navigations)) {
    await strapi
      .query<Navigation>("plugin::navigation.navigation")
      .create({
        data: {
          name: 'Main navigation',
          slug: 'main-navigation',
          visible: true,
        }
      });
  }
  // Initialize configuration
  const commonService = getPluginService<ICommonService>('common');
  const config = commonService.setDefaultConfig();

  if (strapi.plugin('graphql')) {
    const graphqlConfiguration = require('./graphql')
    await graphqlConfiguration({ strapi, config });
  }
};
