"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPermissions = void 0;
const permissions_1 = __importDefault(require("./permissions"));
const setupPermissions = async ({ strapi }) => {
    // Add permissions
    const actions = [
        {
            section: 'plugins',
            displayName: 'Read',
            uid: permissions_1.default.navigation.read,
            pluginName: 'navigation',
        },
        {
            section: 'plugins',
            displayName: 'Update',
            uid: permissions_1.default.navigation.update,
            pluginName: 'navigation',
        },
        {
            section: 'plugins',
            displayName: 'Settings',
            uid: permissions_1.default.navigation.settings,
            pluginName: 'navigation',
        },
    ];
    await strapi.admin.services.permission.actionProvider.registerMany(actions);
};
exports.setupPermissions = setupPermissions;
