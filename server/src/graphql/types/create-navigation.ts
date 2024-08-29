export default ({ nexus }: any) =>
  nexus.inputObjectType({
    name: 'CreateNavigation',
    definition(t: any) {
      t.nonNull.string('name');
      t.nonNull.list.field('items', { type: 'CreateNavigationItem' });
    },
  });
