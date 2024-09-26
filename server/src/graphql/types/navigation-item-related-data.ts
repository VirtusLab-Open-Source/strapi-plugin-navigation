export default ({ nexus }: any) =>
  nexus.objectType({
    name: 'NavigationItemRelatedData',
    definition(t: any) {
      t.nonNull.int('id');
      t.nonNull.string('documentId');
      t.field('attributes', { type: 'NavigationItemRelated' });
    },
  });
