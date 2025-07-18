"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheStatus = exports.intercalate = exports.processItems = exports.prepareAuditLog = exports.sendAuditLog = void 0;
const schemas_1 = require("../../schemas");
const sendAuditLog = (auditLogInstance, event, data) => {
    if (auditLogInstance && auditLogInstance.emit) {
        auditLogInstance.emit(event, data);
    }
};
exports.sendAuditLog = sendAuditLog;
const prepareAuditLog = (actions) => {
    return [
        ...new Set(actions
            .filter((_) => !!_)
            .flatMap(({ remove, create, update }) => {
            return [create ? 'CREATE' : '', update ? 'UPDATE' : '', remove ? 'REMOVE' : ''].filter((_) => !!_);
        })),
    ].join('_');
};
exports.prepareAuditLog = prepareAuditLog;
const processItems = (context) => async (item) => {
    return {
        title: item.title,
        path: item.path,
        audience: item.audience,
        type: item.type,
        uiRouterKey: item.uiRouterKey,
        order: item.order,
        collapsed: item.collapsed,
        menuAttached: item.menuAttached,
        removed: false,
        updated: true,
        externalPath: item.externalPath,
        items: item.items
            ? await Promise.all(item.items.map((0, exports.processItems)(context)))
            : [],
        master: context.master,
        parent: undefined,
        related: item.related,
        additionalFields: item.additionalFields,
    };
};
exports.processItems = processItems;
const intercalate = (glue, arr) => arr.slice(1).reduce((acc, element) => acc.concat([glue, element]), arr.slice(0, 1));
exports.intercalate = intercalate;
const getCacheStatus = async ({ strapi, }) => {
    const cachePlugin = strapi.plugin('rest-cache');
    const hasCachePlugin = !!cachePlugin;
    const pluginStore = strapi.store({
        type: 'plugin',
        name: 'navigation',
    });
    const config = schemas_1.DynamicSchemas.configSchema.parse(await pluginStore.get({
        key: 'config',
    }));
    return hasCachePlugin
        ? { hasCachePlugin, enabled: !!config.isCacheEnabled }
        : { hasCachePlugin, enabled: false };
};
exports.getCacheStatus = getCacheStatus;
