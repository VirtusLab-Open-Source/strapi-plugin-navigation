export default ({ nexus }: any) =>
  nexus.enumType({
    name: 'NavigationItemType',
    members: ['INTERNAL', 'EXTERNAL', 'WRAPPER'],
  });
