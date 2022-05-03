module.exports = ({ nexus }) =>
	nexus.objectType({
		name: "NavigationItemRelatedData",
		definition(t) {
			t.nonNull.int("id")
			t.field("attributes", { type: 'NavigationItemRelated' })
		}
	});