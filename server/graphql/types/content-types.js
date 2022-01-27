module.exports = ({ nexus }) => nexus.objectType({
  name: "ContentTypes",
  definition(t) {
    t.nonNull.string("uid")
    t.nonNull.string("name")
    t.nonNull.boolean("isSingle")
    t.nonNull.string("collectionName")
    t.nonNull.string("contentTypeName")
    t.nonNull.string("label")
    t.nonNull.string("relatedField")
    t.nonNull.string("labelSingular")
    t.nonNull.string("endpoint")
    t.nonNull.boolean("available")
    t.nonNull.boolean("visible")
  }
})