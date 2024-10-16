import { Core, UID } from '@strapi/strapi';
import { isNaN } from 'lodash';
import { getNavigationItemRepository } from '../../repositories';
import { RELATED_ITEM_SEPARATOR } from '../../utils';

export type MigrationService = ReturnType<typeof migrationService>;

const migrationService = (context: { strapi: Core.Strapi }) => ({
  async migrateRelatedIdToDocumentId(): Promise<void> {
    console.log("Navigation plugin :: Migrations :: Relared id to document id - START");

    const navigationItemRepository = getNavigationItemRepository(context);
    const all = await navigationItemRepository.find({ filters: {}, limit: Number.MAX_SAFE_INTEGER });

    await Promise.all(
      all.map(async (item) => {
        if (item.related) {
          const [uid, id] = item.related.split(RELATED_ITEM_SEPARATOR);

          if (!isNaN(parseInt(id, 10))) {
            const relatedItem = await context.strapi.query(uid as UID.Schema).findOne({ where: { id } })

            if (relatedItem) {
              await navigationItemRepository.save({
                documentId: item.documentId,
                related: `${uid}${RELATED_ITEM_SEPARATOR}${relatedItem.documentId}`,
              });
            }
          }
        }
      })
    );

    console.log("Navigation plugin :: Migrations :: Relared id to document id - DONE");
  },
});

export default migrationService;
