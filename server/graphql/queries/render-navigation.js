const { addI18NRenderNavigationArgs } = require("../../i18n");

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
      const service = strapi.plugin("navigation").service("client");
      return service.render({ idOrSlug, type, menuOnly, rootPath, locale });
    },
  };
};
