const { isEmpty } = require("lodash");
const permissions = require('./../permissions');

module.exports = async ({ strapi }) => {
  // Check if the plugin users-permissions is installed because the navigation needs it
  if (Object.keys(strapi.plugins).indexOf("users-permissions") === -1) {
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
    .query("plugin::navigation.navigation")
    .findMany();
  if (isEmpty(navigations)) {
    await strapi
      .query("plugin::navigation.navigation")
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
    environment: '',
    type: 'plugin',
    name: 'navigation',
  });

  const config = await pluginStore.get({ key: 'config' });
  const defaultConfig = await strapi.plugin('navigation').config
  
  if (!config) {
    pluginStore.set({
      key: 'config', value: {
        additionalFields: defaultConfig('additionalFields'),
        contentTypes: defaultConfig('contentTypes'),
        contentTypesNameFields: defaultConfig('contentTypesNameFields'),
        allowedLevels: defaultConfig('allowedLevels'),
        gql: defaultConfig('gql'),
      }
    });
  }
};
