module.exports = async ({ strapi, nexus }) => {
	const pluginStore = await strapi.store({ type: 'plugin', name: 'navigation' });
	const config = await pluginStore.get({ key: 'config' })
	const related = config.gql?.navigationItemRelated;
	const name = "NavigationRelated";

	if (related?.length) {
		return nexus.unionType({
			name,
			definition(t) {
				t.members(...related)
			},
			resolveType: (item) => strapi.contentTypes[item.__contentType]?.globalId
		});
	}
	
	return nexus.objectType({
		name,
		definition(t) {
			t.int("id")
			t.string("title")
			t.string("name")
		}
	})
}