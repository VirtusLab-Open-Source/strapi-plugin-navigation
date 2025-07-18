"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("../schemas");
const utils_1 = require("../utils");
const queries_1 = require("./queries");
const resolvers_config_1 = require("./resolvers-config");
const types_1 = require("./types");
exports.default = async ({ strapi }) => {
    const extensionService = strapi.plugin('graphql').service('extension');
    extensionService.shadowCRUD('plugin::navigation.audience').disable();
    extensionService.shadowCRUD('plugin::navigation.navigation').disable();
    extensionService.shadowCRUD('plugin::navigation.navigation-item').disable();
    extensionService.shadowCRUD('plugin::navigation.navigations-items-related').disable();
    const commonService = (0, utils_1.getPluginService)({ strapi }, 'common');
    const pluginStore = await commonService.getPluginStore();
    const config = schemas_1.DynamicSchemas.configSchema.parse(await pluginStore.get({ key: 'config' }));
    extensionService.use(({ strapi, nexus }) => {
        const types = (0, types_1.getTypes)({ strapi, nexus, config });
        const queries = (0, queries_1.getQueries)({ strapi, nexus });
        const resolversConfig = (0, resolvers_config_1.getResolversConfig)();
        return {
            types: [types, queries],
            resolversConfig,
        };
    });
};
