export default ({ nexus }: any) =>
  nexus.inputObjectType({
    name: 'CreateNavigationItem',
    definition(t: any) {
      t.nonNull.string('title');
      t.nonNull.field('type', { type: 'NavigationItemType' });
      t.string('path');
      t.string('externalPath');
      t.nonNull.string('uiRouterKey');
      t.nonNull.boolean('menuAttached');
      t.nonNull.int('order');
      t.string('parent');
      t.string('master');
      t.list.field('items', { type: 'CreateNavigationItem' });
      t.list.string('audience');
      t.field('related', { type: 'CreateNavigationRelated' });
    },
  });
