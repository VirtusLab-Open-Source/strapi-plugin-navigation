"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const i18n_1 = require("./i18n");
const permissions_1 = require("./permissions");
const graphql_1 = require("./graphql");
const utils_1 = require("./utils");
const bootstrap = async (context) => {
    await (0, config_1.configSetup)(context);
    await (0, i18n_1.navigationSetup)(context);
    await (0, permissions_1.setupPermissions)(context);
    await (0, graphql_1.graphQLSetup)(context);
    await strapi.service('plugin::navigation.migrate').migrateRelatedIdToDocumentId();
    strapi.db.lifecycles.subscribe({
        models: ['plugin::i18n.locale'],
        async afterCreate(event) {
            var _a;
            const adminService = (0, utils_1.getPluginService)(context, 'admin');
            await adminService.refreshNavigationLocale((_a = event.result) === null || _a === void 0 ? void 0 : _a.code);
        },
    });
};
exports.default = bootstrap;
