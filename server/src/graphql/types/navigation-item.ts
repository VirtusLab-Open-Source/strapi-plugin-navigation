import { NavigationItemAdditionalField } from '../../schemas';

export default ({ nexus, config }: any) =>
  nexus.objectType({
    name: 'NavigationItem',
    definition(t: any) {
      t.nonNull.int('id');
      t.nonNull.string('documentId');
      t.nonNull.string('title');
      t.nonNull.string('type');
      t.string('path');
      t.string('externalPath');
      t.nonNull.string('uiRouterKey');
      t.nonNull.boolean('menuAttached');
      t.nonNull.int('order');
      t.field('parent', { type: 'NavigationItem' });
      t.string('master');
      t.list.field('items', { type: 'NavigationItem' });
      t.field('related', { type: 'NavigationItemRelated' });

      if (config.additionalFields.find((field: NavigationItemAdditionalField) => field === 'audience')) {
        t.list.string('audience');
      }

      t.field('additionalFields', { type: 'NavigationItemAdditionalFields' });

      // SQL
      t.string('created_at');
      t.string('updated_at');
      t.string('created_by');
      t.string('updated_by');
      // MONGO
      t.string('createdAt');
      t.string('updatedAt');
      t.string('createdBy');
      t.string('updatedBy');
    },
  });
