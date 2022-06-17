const { addI18NRenderNavigationArgs } = require("../../i18n");
const { getPluginService } = require("../../utils");

module.exports = ({ strapi, nexus }) => {
  const { nonNull, list, stringArg, booleanArg } = nexus;
  const defaultArgs = {
    navigationIdOrSlug: nonNull(stringArg()),
    type: "NavigationRenderType",
    menuOnly: booleanArg(),
    path: stringArg(),
  };
  const hasI18nPlugin = !!strapi.plugin("i18n");
  const args = hasI18nPlugin ? addI18NRenderNavigationArgs({
    previousArgs: defaultArgs,
    nexus,
  }) : defaultArgs;

  return {
    args,
    type: nonNull(list("NavigationItem")),
    resolve(
      obj,
      { navigationIdOrSlug: idOrSlug, type, menuOnly, path: rootPath, locale }
    ) {
      return getPluginService('client').render({ 
        idOrSlug,
        type,
        rootPath, 
        locale, 
        menuOnly,
        wrapRelated: true 
      })
    },
  };
};
