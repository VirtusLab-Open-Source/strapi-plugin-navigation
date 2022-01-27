module.exports = ({ nexus }) => nexus.objectType({
  name: "ContentTypesNameFields",
  definition(t) {
		t.nonNull.list.nonNull.string("default")
		const contentTypesNameFields = strapi.plugin('navigation').config('contentTypesNameFields')
		Object.keys(contentTypesNameFields || {}).forEach(key => t.nonNull.list.string(key))
  }
})