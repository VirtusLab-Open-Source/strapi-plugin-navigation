const getTypes = require('./types');
const getQueries = require('./queries');
const getResolversConfig = require('./resolvers-config');

module.exports = () => {
	const extensionService = strapi.plugin('graphql').service('extension');

	extensionService.shadowCRUD('plugin::navigation.audience').disable();
	extensionService.shadowCRUD('plugin::navigation.navigation').disable();
	extensionService.shadowCRUD('plugin::navigation.navigation-item').disable();
	extensionService.shadowCRUD('plugin::navigation.navigations-items-related').disable();

	extensionService.use(({ nexus }) => {
		const types = getTypes({ strapi, nexus });
		const queries = getQueries({ strapi, nexus });
		const resolversConfig = getResolversConfig({ strapi });

		return {
			types: [types, queries],
			resolversConfig,
		}
	});
}
