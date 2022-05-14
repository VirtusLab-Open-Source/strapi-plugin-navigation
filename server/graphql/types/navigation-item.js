module.exports = ({ nexus, config }) =>
  nexus.objectType({
    name: "NavigationItem",
    definition(t) {
      t.nonNull.int("id");
      t.nonNull.string("title");
      t.nonNull.string("type");
      t.string("path");
      t.string("externalPath");
      t.nonNull.string("uiRouterKey");
      t.nonNull.boolean("menuAttached");
      t.nonNull.int("order");
      t.field("parent", { type: "NavigationItem" })
      t.int("master");
      t.list.field("items", { type: 'NavigationItem' });
      t.field("related", { type: 'NavigationItemRelatedData' });

      // SQL
      t.string("created_at");
      t.string("updated_at");
      t.string("created_by");
      t.string("updated_by");
      // MONGO
      t.string("createdAt");
      t.string("updatedAt");
      t.string("createdBy");
      t.string("updatedBy");

      // Additional Fields
      config.additionalFields.forEach(field => {
        if (field !== 'audience') {
          switch (field.type) {
            case 'string':
              t.string(field.name);
              break;
            case 'boolean':
              t.boolean(field.name);
              break;
            default:
              throw new Error(`Type "${field.type}" is unsupported by custom fields`);
          }
        } else {
          t.list.string("audience");
        }
      });
    }
  });
