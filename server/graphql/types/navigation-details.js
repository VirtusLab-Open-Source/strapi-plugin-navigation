module.exports = ({ nexus }) => nexus.objectType({
  name: "NavigationDetails",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.string("name")
    t.nonNull.string("slug")
    t.nonNull.boolean("visible")
    t.nonNull.list.field("items", { type: 'NavigationItem' })
  }
})