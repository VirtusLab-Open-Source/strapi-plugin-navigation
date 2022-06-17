const { getPluginService } = require("../../utils");

module.exports = ({ nexus, strapi }) => nexus.objectType({
  name: "ContentTypesNameFields",
  async definition(t) {
    t.nonNull.list.nonNull.string("default");
    const commonService = getPluginService('common');
		const pluginStore = await commonService.getPluginStore();
		const config = await pluginStore.get({ key: 'config' });
		const contentTypesNameFields = config.contentTypesNameFields;
		Object.keys(contentTypesNameFields || {}).forEach(key => t.nonNull.list.string(key))
  }
})