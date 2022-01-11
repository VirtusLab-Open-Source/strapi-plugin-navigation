module.exports = ({ nexus }) => nexus.objectType({
  name: "Navigation",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.string("name")
    t.nonNull.string("slug")
    t.nonNull.boolean("visible")
  }
})