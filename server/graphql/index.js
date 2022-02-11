const getTypes = require('./types');
const getQueries = require('./queries');
const getResolversConfig = require('./resolvers-config');

module.exports = async ({ strapi, config }) => {
	const extensionService = strapi.plugin('graphql').service('extension');
	extensionService.shadowCRUD('plugin::navigation.audience').disable();
	extensionService.shadowCRUD('plugin::navigation.navigation').disable();
	extensionService.shadowCRUD('plugin::navigation.navigation-item').disable();
	extensionService.shadowCRUD('plugin::navigation.navigations-items-related').disable();

	extensionService.use(({strapi, nexus}) => {
		const types = getTypes({ strapi, nexus, config });
		const queries = getQueries({ strapi, nexus });
		const resolversConfig = getResolversConfig({ strapi });

		return {
			types: [types, queries],
			resolversConfig,
		}
	});
}
