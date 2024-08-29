export default ({ strapi, nexus, config }: any) => {
	const related = config.gql?.navigationItemRelated;
	const name = "NavigationItemRelated";

	debugger;

	if (related?.length) {
		return nexus.unionType({
			name,
			definition(t: any) {
				t.members(...related)
			},
			resolveType: (item: { uid: string }) => {
				return strapi.contentTypes[item.uid]?.globalId
			}
		});
	}
	
	return nexus.objectType({
		name,
		definition(t: any) {
			t.int("id")
			t.string("title")
			t.string("name")
		}
	})
}