import { Core, UID } from '@strapi/strapi';
import { isNaN } from 'lodash';
import { getNavigationItemRepository } from '../../repositories';
import { RELATED_ITEM_SEPARATOR } from '../../utils';

const TARGET_TABLE_NAME = 'navigations_items';
const TARGET_COLUMN_NAME = 'related';

export type MigrationService = ReturnType<typeof migrationService>;

const migrationService = (context: { strapi: Core.Strapi }) => ({
  async migrateRelatedIdToDocumentId(): Promise<void> {
    const hasColumn = await strapi.db.connection.schema.hasColumn(
      TARGET_TABLE_NAME,
      TARGET_COLUMN_NAME
    );
    if (!hasColumn) {
      return;
    }

    console.log('Navigation plugin :: Migrations :: Related id to document id - START');

    const navigationItemRepository = getNavigationItemRepository(context);
    const all = await navigationItemRepository.findV4({
      filters: {},
      limit: Number.MAX_SAFE_INTEGER,
    });

    await Promise.all(
      all.map(async (item) => {
        const related: string | unknown = item.related;

        if (related && typeof related === 'string') {
          const [__type, id] = related.split(RELATED_ITEM_SEPARATOR);

          if (!isNaN(parseInt(id, 10))) {
            const relatedItem = await context.strapi
              .query(__type as UID.Schema)
              .findOne({ where: { id } });

            if (relatedItem) {
              await navigationItemRepository.save({
                item: {
                  documentId: item.documentId,
                  related: { __type, documentId: relatedItem.documentId },
                },
              });
            }
          }
        }
      })
    );

    await strapi.db.connection.schema.alterTable(TARGET_TABLE_NAME, (table) => {
      table.dropColumn(TARGET_COLUMN_NAME);
    });

    console.log('Navigation plugin :: Migrations :: Related id to document id - DONE');
  },
});

export default migrationService;
