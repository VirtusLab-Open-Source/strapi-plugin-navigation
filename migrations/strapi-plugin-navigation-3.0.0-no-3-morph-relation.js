const SOURCE_TABLE_NAME = "navigations";
const SOURCE_TABLE_NAME_NAVIGATION_ITEMS = "navigations_items";
const TARGET_TABLE_NAME = "navigations_items_related_mph";
const JOIN_TABLE = "navigations_items_master_lnk";

const RELATED_ITEM_SEPARATOR = "$";

module.exports = {
  async up(knex) {
    const run = async () => {
      let hasMorphTable = false;

      await knex.schema.hasTable(TARGET_TABLE_NAME).then((exists) => {
        hasMorphTable = exists;
      });

      if (hasMorphTable) {
        return;
      }

      await knex.schema.createTable(TARGET_TABLE_NAME, (table) => {
        table.increments("id");
        table.integer("navigation_item_id");
        table.integer("related_id");
        table.string("related_type");
        table.string("field");
        table.float("order");
      });

      const navigations = await knex
        .from(SOURCE_TABLE_NAME)
        .columns("id", "locale")
        .select();

      for (const navigation of navigations) {
        const items = await knex(SOURCE_TABLE_NAME_NAVIGATION_ITEMS)
          .join(
            JOIN_TABLE,
            `${JOIN_TABLE}.navigation_item_id`,
            "=",
            `${SOURCE_TABLE_NAME_NAVIGATION_ITEMS}.id`
          )
          .where(`${JOIN_TABLE}.navigation_id`, navigation.id)
          .select(
            `${SOURCE_TABLE_NAME_NAVIGATION_ITEMS}.id`,
            `${SOURCE_TABLE_NAME_NAVIGATION_ITEMS}.related`
          );

        for (const item of items) {
          if (!item.related) {
            continue;
          }

          const [uid, documentId] = item.related.split(RELATED_ITEM_SEPARATOR);
          const repository = uid ? strapi.documents(uid) : undefined;
          const related =
            uid && repository
              ? documentId
                ? await repository.findOne({
                    documentId,
                    locale: navigation.locale,
                  })
                : await repository.findFirst({ locale: navigation.locale })
              : undefined;

          await knex(TARGET_TABLE_NAME).insert({
            navigation_item_id: item.id,
            related_id: related.id,
            related_type: uid,
            order: 1,
          });
        }
      }

      knex.schema.alterTable(
        SOURCE_TABLE_NAME_NAVIGATION_ITEMS,
        function (table) {
          table.dropColumn("related");
        }
      );
    };

    await strapi.db.transaction(run);
  },
};
