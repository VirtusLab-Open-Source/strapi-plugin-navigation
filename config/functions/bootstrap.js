const { isEmpty } = require("lodash");

module.exports = async () => {
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
      displayName: "Access the Navigation",
      uid: "read",
      pluginName: "navigation",
    },
    {
      section: "plugins",
      displayName: "Ability to change the Navigation",
      uid: "update",
      pluginName: "navigation",
    },
  ];

  const navigations = await strapi
    .query('navigation', 'navigation')
    .find();
  if (isEmpty(navigations)) {
    await strapi
      .query('navigation', 'navigation')
      .create({
        name: 'Main navigation',
        slug: 'main-navigation',
        visible: true,
      });
  }

  const { actionProvider } = strapi.admin.services.permission;
  await actionProvider.registerMany(actions);
};
