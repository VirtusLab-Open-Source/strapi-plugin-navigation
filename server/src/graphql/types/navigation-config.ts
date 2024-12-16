export default ({ nexus }: any) =>
  nexus.objectType({
    name: 'NavigationConfig',
    definition(t: any) {
      t.int('allowedLevels');
      t.nonNull.list.string('additionalFields');
      t.field('contentTypesNameFields', { type: 'ContentTypesNameFields' });
      t.list.field('contentTypes', { type: 'ContentTypes' });
    },
  });
