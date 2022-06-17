const { RENDER_TYPES } = require("../../utils");

module.exports = ({nexus}) => nexus.enumType({
  name: "NavigationRenderType",
  members: Object.values(RENDER_TYPES),
});