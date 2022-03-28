import { isEmpty, isNil } from 'lodash';
import { Navigation, NavigationPluginConfig } from '../types';
import permissions from '../permissions';
import { StrapiContext } from 'strapi-typed';

export = async ({ strapi }: StrapiContext) => {
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
  const pluginStore = strapi.store({
    type: 'plugin',
    name: 'navigation',
  });

  const config: NavigationPluginConfig = await pluginStore.get({ key: 'config' });
  const pluginDefaultConfig = await strapi.plugin('navigation').config
  const defaultConfigValue = {
    additionalFields: config?.additionalFields || pluginDefaultConfig('additionalFields'),
    contentTypes: config?.contentTypes || pluginDefaultConfig('contentTypes'),
    contentTypesNameFields: config?.contentTypesNameFields || pluginDefaultConfig('contentTypesNameFields'),
    contentTypesPopulate: config?.contentTypesPopulate || pluginDefaultConfig('contentTypesPopulate'),
    allowedLevels: config?.allowedLevels || pluginDefaultConfig('allowedLevels'),
    gql: config?.gql || pluginDefaultConfig('gql'),
  }

  pluginStore.set({
    key: 'config', value: defaultConfigValue
  });


  if (strapi.plugin('graphql')) {
    const graphqlConfiguration = require('./graphql')
    await graphqlConfiguration({ strapi, config });
  }
};
