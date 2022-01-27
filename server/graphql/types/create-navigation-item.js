module.exports = ({ nexus }) => nexus.inputObjectType({
  name: "CreateNavigationItem",
  definition(t) {
    t.nonNull.string("title")
    t.nonNull.string("type")
    t.string("path")
    t.string("externalPath")
    t.nonNull.string("uiRouterKey")
    t.nonNull.boolean("menuAttached")
    t.nonNull.int("order")
    t.int("parent")
    t.int("master")
    t.list.field("items", { type: 'CreateNavigationItem' })
    t.list.string("audience")
    t.field("related", { type: 'CreateNavigationRelated' })
  }
});