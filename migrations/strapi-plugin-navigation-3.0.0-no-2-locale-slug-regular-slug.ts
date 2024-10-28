const SOURCE_TABLE_NAME = 'navigations';

export default {
  async up(knex) {
    // Get all entries and rewrite directly to the navigation_items table
    const all = await knex.from(SOURCE_TABLE_NAME).columns('id', 'slug', 'locale').select();

    const run = async () => {
      await Promise.all(
        all.map(async (item: { id: number; slug: string; locale: string }) => {
          const { id, slug, locale } = item;

          if (slug && locale && id) {
            const regex = new RegExp(`-${locale}$`);

            await knex
              .from(SOURCE_TABLE_NAME)
              .update({ slug: slug.replace(regex, '') })
              .where({ id });
          }
        })
      );
    };

    await strapi.db.transaction(async () => {
      // Run related id to document id migration
      await run();
    });
  },
};
