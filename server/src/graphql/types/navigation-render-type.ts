export default ({ nexus }: any) =>
  nexus.enumType({
    name: 'NavigationRenderType',
    members: ['FLAT', 'TREE'],
  });
