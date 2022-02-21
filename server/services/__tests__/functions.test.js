const { setupStrapi } = require('../../../__mocks__/strapi');
const utilsFunctionsFactory = require('../utils/functions');

describe('Utilities functions', () => {
	beforeAll(async () => {
		setupStrapi();
	});

	describe('Path rendering functions', () => {
		it('Can build nested path structure', async () => {
			const utilsFunctions = utilsFunctionsFactory({ strapi });
			const { itemModel } = utilsFunctions.extractMeta(strapi.plugins);
			const rootPath = '/home/side';
			const entities = await strapi
				.query(itemModel.uid)
				.findMany({
					where: {
						master: 1
					}
				});
			const nested = utilsFunctions.buildNestedPaths({ items: entities });

			expect(nested.length).toBe(2);
			expect(nested[1].path).toBe(rootPath);
		});

		it('Can filter items by path', async () => {
			const utilsFunctions = utilsFunctionsFactory({ strapi });
			const { itemModel } = utilsFunctions.extractMeta(strapi.plugins);
			const rootPath = '/home/side';
			const entities = await strapi
				.query(itemModel.uid)
				.findMany({
					where: {
						master: 1
					}
				});
			const {
				root,
				items
			} = utilsFunctions.filterByPath(entities, rootPath);

			expect(root).toBeDefined();
			expect(root.path).toBe(rootPath);
			expect(items.length).toBe(1)
		});
	});
});
