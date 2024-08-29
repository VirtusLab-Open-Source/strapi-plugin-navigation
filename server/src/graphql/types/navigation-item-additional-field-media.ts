export default ({ nexus }: any) =>
  nexus.objectType({
    name: 'NavigationItemAdditionalFieldMedia',
    definition(t: any) {
      t.nonNull.string('name');
      t.nonNull.string('url');
      t.nonNull.string('mime');
      t.nonNull.int('width');
      t.nonNull.int('height');
      t.string('previewUrl');
    },
  });
