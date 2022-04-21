const { addI18NRenderNavigationArgs } = require("../../i18n");
const { getPluginService } = require("../../utils");

module.exports = ({ strapi, nexus }) => {
  const { nonNull, list, stringArg, booleanArg } = nexus;
  const args = addI18NRenderNavigationArgs({
    previousArgs: {
      navigationIdOrSlug: nonNull(stringArg()),
      type: "NavigationRenderType",
      menuOnly: booleanArg(),
      path: stringArg(),
    },
    nexus,
  });

  return {
    args,
    type: nonNull(list("NavigationItem")),
    resolve(
      obj,
      { navigationIdOrSlug: idOrSlug, type, menuOnly, path: rootPath, locale }
    ) {
      return getPluginService('client').render({ idOrSlug, type, menuOnly, rootPath, locale })
    },
  };
};
