const { getPluginService } = require("../../utils");

module.exports = ({ strapi, nexus }) => {
  const { nonNull, list, stringArg, booleanArg } = nexus;
  return {
    type: nonNull(list("NavigationItem")),
    args: {
      id: nonNull(stringArg()),
      childUiKey: nonNull(stringArg()),
      type: "NavigationRenderType",
      menuOnly: booleanArg(),
    },
    resolve(obj, args) {
      const { id, childUIKey, type, menuOnly } = args;

      return getPluginService("client").renderChildren({
        idOrSlug: id,
        childUIKey,
        type,
        menuOnly,
      });
    },
  };
}
