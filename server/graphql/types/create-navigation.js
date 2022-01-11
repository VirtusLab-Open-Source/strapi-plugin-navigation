module.exports = ({ nexus }) => nexus.inputObjectType({
  name: "CreateNavigation",
  definition(t) {
    t.nonNull.string("name")
    t.nonNull.list.field("items", { type: 'CreateNavigationItem' })
  }
});