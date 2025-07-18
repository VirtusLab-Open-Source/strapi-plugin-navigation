"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configSetup = void 0;
const lodash_1 = require("lodash");
const _1 = __importDefault(require("."));
const schemas_1 = require("../schemas");
const utils_1 = require("../utils");
const configSetup = async ({ strapi, forceDefault = false, }) => {
    var _a;
    const pluginStore = strapi.store({
        type: 'plugin',
        name: 'navigation',
    });
    const getFromPluginDefaults = await strapi.plugin('navigation').config;
    const configRaw = forceDefault
        ? {}
        : {
            ..._1.default.default,
            ...((_a = (await pluginStore.get({
                key: 'config',
            }))) !== null && _a !== void 0 ? _a : _1.default.default),
        };
    let config = (0, lodash_1.isEmpty)(configRaw) ? configRaw : schemas_1.DynamicSchemas.configSchema.parse(configRaw);
    const getWithFallback = getWithFallbackFactory(config, getFromPluginDefaults);
    config = {
        additionalFields: getWithFallback('additionalFields'),
        contentTypes: getWithFallback('contentTypes'),
        contentTypesNameFields: getWithFallback('contentTypesNameFields'),
        contentTypesPopulate: getWithFallback('contentTypesPopulate'),
        defaultContentType: getWithFallback('defaultContentType'),
        allowedLevels: getWithFallback('allowedLevels'),
        gql: getWithFallback('gql'),
        pathDefaultFields: getWithFallback('pathDefaultFields'),
        cascadeMenuAttached: getWithFallback('cascadeMenuAttached'),
        preferCustomContentTypes: getWithFallback('preferCustomContentTypes'),
        isCacheEnabled: getWithFallback('isCacheEnabled'),
    };
    handleDeletedContentTypes(config, { strapi });
    (0, utils_1.validateAdditionalFields)(config.additionalFields);
    await pluginStore.set({
        key: 'config',
        value: config,
    });
    return config;
};
exports.configSetup = configSetup;
const getWithFallbackFactory = (config, fallback) => (key) => {
    var _a;
    const value = (_a = config === null || config === void 0 ? void 0 : config[key]) !== null && _a !== void 0 ? _a : fallback(key);
    (0, utils_1.assertNotEmpty)(value, new Error(`[Navigation] Config "${key}" is undefined`));
    return value;
};
const handleDeletedContentTypes = (config, { strapi }) => {
    const notAvailableContentTypes = config.contentTypes.filter((contentType) => !strapi.contentTypes[contentType]);
    if (notAvailableContentTypes.length === 0) {
        return;
    }
    const notAvailableContentTypesGraphQL = notAvailableContentTypes.map(utils_1.resolveGlobalLikeId);
    config.contentTypes = config.contentTypes.filter((contentType) => !notAvailableContentTypes.includes(contentType));
    config.contentTypesNameFields = Object.fromEntries(Object.entries(config.contentTypesNameFields).filter(([contentType]) => !notAvailableContentTypes.includes(contentType)));
    config.gql.navigationItemRelated = config.gql.navigationItemRelated.filter((contentType) => !notAvailableContentTypesGraphQL.includes(contentType));
};
