import { NavigationItemRelatedDTO } from '../../dtos';

export default ({ strapi, nexus, config }: any) => {
  const related = config.gql?.navigationItemRelated;
  const name = 'NavigationItemRelated';

  if (related?.length) {
    return nexus.unionType({
      name,
      definition(t: any) {
        t.members(...related);
      },
      resolveType: (item: NavigationItemRelatedDTO) => {
        return strapi.contentTypes[item.__type]?.globalId;
      },
    });
  }

  return nexus.objectType({
    name,
    definition(t: any) {
      t.int('id');
      t.string('documentId');
      t.string('title');
      t.string('name');
    },
  });
};
