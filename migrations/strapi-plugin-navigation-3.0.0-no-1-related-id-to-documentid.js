const SOURCE_TABLE_NAME = 'navigations_items_related';
const SOURCE_LINK_TABLE_NAME = 'navigations_items_related_links';
const TARGET_TABLE_NAME = 'navigations_items';
const RELATED_ITEM_SEPARATOR = '$';

module.exports = {
  async up(knex) {
    console.log('Navigation plugin :: Migrations :: Backup navigation item related table - START');

    // Get all entries and rewrite directly to the navigation_items table
    const all = await knex
      .from(SOURCE_TABLE_NAME)
      .columns('id', 'related_id', 'related_type')
      .select();

    await knex.schema.alterTable(TARGET_TABLE_NAME, function (table) {
      table.string('related');
    });

    await Promise.all(
      all.map(async (item) => {
        const { related_id, related_type, id: row_id } = item;

        if (related_id && related_type && !isNaN(parseInt(related_id, 10))) {
          const newRelatedId = `${related_type}${RELATED_ITEM_SEPARATOR}${related_id}`;
          const link = await knex
            .from(SOURCE_LINK_TABLE_NAME)
            .columns('navigation_item_id', 'navigations_items_related_id')
            .select()
            .where({ navigations_items_related_id: row_id });
          const nav_id = link[0]?.navigation_item_id;

          if (!nav_id) {
            return;
          }

          await knex
            .from(TARGET_TABLE_NAME)
            .update({ related: newRelatedId })
            .where({ id: nav_id });
        }
      })
    );

    // Drop the old tables
    await knex.schema.dropTable(SOURCE_TABLE_NAME);
    await knex.schema.dropTable(SOURCE_LINK_TABLE_NAME);

    console.log('Navigation plugin :: Migrations :: Backup navigation item related table - DONE');
  },
};
