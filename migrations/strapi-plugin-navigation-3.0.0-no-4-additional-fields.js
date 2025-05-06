const SOURCE_TABLE_NAME_NAVIGATION_ITEMS = "navigations_items";

module.exports = {
  async up(knex) {
    const run = async () => {
      const navigationItems = await knex
        .from(SOURCE_TABLE_NAME_NAVIGATION_ITEMS)
        .columns("id", "additional_fields")
        .select();

      for (const item of navigationItems) {
        const { id, additional_fields, ...rest } = item;
        const parsedFields = additional_fields
          ? JSON.parse(additional_fields)
          : undefined;

        if (parsedFields) {
          await knex(SOURCE_TABLE_NAME_NAVIGATION_ITEMS)
            .where({ id })
            .update(
              {
                additional_fields: JSON.stringify(
                  Object.fromEntries(
                    Object.entries(parsedFields).map(([key, value]) => [
                      key,
                      typeof value === "boolean" ? value.toString() : value,
                    ])
                  )
                ),
              },
              ["id", "additional_fields"]
            );
        }
      }
    };

    await strapi.db.transaction(run);
  },
};
