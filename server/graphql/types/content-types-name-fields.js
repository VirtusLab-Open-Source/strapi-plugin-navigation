module.exports = ({ nexus }) => nexus.objectType({
  name: "ContentTypesNameFields",
  async definition(t) {
		t.nonNull.list.nonNull.string("default")
		const pluginStore = strapi.store({ type: 'plugin', name: 'navigation' });
		const config = await pluginStore.get({ key: 'config' });
		const contentTypesNameFields = config.contentTypesNameFields;
		Object.keys(contentTypesNameFields || {}).forEach(key => t.nonNull.list.string(key))
  }
})