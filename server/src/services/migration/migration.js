"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const repositories_1 = require("../../repositories");
const utils_1 = require("../../utils");
const TARGET_TABLE_NAME = 'navigations_items';
const TARGET_COLUMN_NAME = 'related';
const migrationService = (context) => ({
    async migrateRelatedIdToDocumentId() {
        const hasColumn = await strapi.db.connection.schema.hasColumn(TARGET_TABLE_NAME, TARGET_COLUMN_NAME);
        if (!hasColumn) {
            return;
        }
        console.log('Navigation plugin :: Migrations :: Related id to document id - START');
        const navigationItemRepository = (0, repositories_1.getNavigationItemRepository)(context);
        const all = await navigationItemRepository.findV4({
            filters: {},
            limit: Number.MAX_SAFE_INTEGER,
        });
        await Promise.all(all.map(async (item) => {
            const related = item.related;
            if (related && typeof related === 'string') {
                const [__type, id] = related.split(utils_1.RELATED_ITEM_SEPARATOR);
                if (!(0, lodash_1.isNaN)(parseInt(id, 10))) {
                    const relatedItem = await context.strapi
                        .query(__type)
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
        }));
        await strapi.db.connection.schema.alterTable(TARGET_TABLE_NAME, (table) => {
            table.dropColumn(TARGET_COLUMN_NAME);
        });
        console.log('Navigation plugin :: Migrations :: Related id to document id - DONE');
    },
});
exports.default = migrationService;
