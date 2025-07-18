"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("../../schemas");
const utils_1 = require("../../utils");
exports.default = ({ nexus, strapi }) => nexus.objectType({
    name: 'ContentTypesNameFields',
    async definition(t) {
        t.nonNull.list.nonNull.string('default');
        const commonService = (0, utils_1.getPluginService)({ strapi }, 'common');
        const pluginStore = await commonService.getPluginStore();
        const config = schemas_1.DynamicSchemas.configSchema.parse(await pluginStore.get({ key: 'config' }));
        const contentTypesNameFields = config.contentTypesNameFields;
        Object.keys(contentTypesNameFields || {}).forEach((key) => t.nonNull.list.string(key));
    },
});
