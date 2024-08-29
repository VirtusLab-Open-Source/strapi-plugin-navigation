export default ({ nexus }: any) =>
  nexus.inputObjectType({
    name: 'CreateNavigationRelated',
    definition(t: any) {
      t.nonNull.string('ref');
      t.nonNull.string('field');
      t.nonNull.string('refId');
    },
  });
