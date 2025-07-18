"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.singularize = exports.isContentTypeEligible = exports.parsePopulateQuery = exports.getPluginModels = exports.buildAllHookListeners = exports.buildHookListener = exports.resolveGlobalLikeId = exports.assertNotEmpty = exports.validateAdditionalFields = exports.getCustomFields = void 0;
exports.assertConfig = assertConfig;
exports.getPluginService = getPluginService;
const lodash_1 = require("lodash");
const schemas_1 = require("../schemas");
const constants_1 = require("./constants");
const getCustomFields = (additionalFields) => additionalFields.filter((field) => field !== 'audience');
exports.getCustomFields = getCustomFields;
const validateAdditionalFields = (additionalFields) => {
    const customFields = (0, exports.getCustomFields)(additionalFields);
    if (customFields.length !== (0, lodash_1.uniqBy)(customFields, 'name').length) {
        throw new Error('All names of custom fields must be unique.');
    }
    if (!(0, lodash_1.isNil)((0, lodash_1.find)(customFields, (field) => typeof field === 'object' && (0, lodash_1.includes)(constants_1.FORBIDDEN_CUSTOM_FIELD_NAMES, field.name)))) {
        throw new Error(`Name of custom field cannot be one of: ${constants_1.FORBIDDEN_CUSTOM_FIELD_NAMES.join(', ')}`);
    }
};
exports.validateAdditionalFields = validateAdditionalFields;
const assertNotEmpty = (value, customError) => {
    if (value !== undefined && value !== null) {
        return;
    }
    throw customError !== null && customError !== void 0 ? customError : new Error('Non-empty value expected, empty given');
};
exports.assertNotEmpty = assertNotEmpty;
const resolveGlobalLikeId = (uid = '') => {
    const parse = (str) => str
        .split('-')
        .map((_) => (0, lodash_1.capitalize)(_))
        .join('');
    const [type, scope, contentTypeName] = splitTypeUid(uid);
    if (type === 'api') {
        return parse(contentTypeName);
    }
    return `${parse(scope)}${parse(contentTypeName)}`;
};
exports.resolveGlobalLikeId = resolveGlobalLikeId;
const splitTypeUid = (uid = '') => {
    return uid.split(constants_1.UID_REGEX).filter((s) => s && s.length > 0);
};
function assertConfig(config) {
    if (schemas_1.DynamicSchemas.configSchema.safeParse(config).success) {
        return;
    }
    throw new Error('Navigation plugin schema invalid');
}
const buildHookListener = (contentTypeName, context) => (hookName) => [
    hookName,
    async (event) => {
        await getPluginService(context, 'common').runLifeCycleHook({
            contentTypeName,
            hookName,
            event,
        });
    },
];
exports.buildHookListener = buildHookListener;
const buildAllHookListeners = (contentTypeName, context) => Object.fromEntries(constants_1.allLifecycleHooks.map((0, exports.buildHookListener)(contentTypeName, context)));
exports.buildAllHookListeners = buildAllHookListeners;
const getPluginModels = ({ strapi, }) => {
    const plugin = strapi.plugin('navigation');
    return {
        masterModel: plugin.contentType('navigation'),
        itemModel: plugin.contentType('navigation-item'),
        relatedModel: plugin.contentType('navigations-items-related'),
        audienceModel: plugin.contentType('audience'),
    };
};
exports.getPluginModels = getPluginModels;
function getPluginService({ strapi }, name) {
    return strapi.plugin('navigation').service(name);
}
const parsePopulateQuery = (populate) => {
    if (populate === '*') {
        return '*';
    }
    else if (typeof populate === 'string') {
        return [populate];
    }
    else if (populate === false) {
        return [];
    }
    else if (populate === true) {
        return '*';
    }
    else {
        return populate;
    }
};
exports.parsePopulateQuery = parsePopulateQuery;
const isContentTypeEligible = (uid = '') => {
    const isOneOfAllowedType = !!constants_1.ALLOWED_CONTENT_TYPES.find((_) => uid.includes(_));
    const isNoneOfRestricted = !constants_1.RESTRICTED_CONTENT_TYPES.find((_) => uid.includes(_) || uid === _);
    return !!uid && isOneOfAllowedType && isNoneOfRestricted;
};
exports.isContentTypeEligible = isContentTypeEligible;
const singularize = (value = '') => {
    return (0, lodash_1.last)(value) === 's' ? value.substr(0, value.length - 1) : value;
};
exports.singularize = singularize;
