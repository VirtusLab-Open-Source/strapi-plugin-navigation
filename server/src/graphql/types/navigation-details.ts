export default ({ nexus }: any) =>
  nexus.objectType({
    name: 'NavigationDetails',
    definition(t: any) {
      t.nonNull.string('id');
      t.nonNull.string('documentId');
      t.nonNull.string('name');
      t.nonNull.string('slug');
      t.nonNull.boolean('visible');
      t.nonNull.list.field('items', { type: 'NavigationItem' });
    },
  });
