'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPermissions = void 0;
const permissions = {
    render: function (uid) {
        return `plugin::navigation.${uid}`;
    },
    navigation: {
        read: 'read',
        update: 'update',
        settings: 'settings',
    },
};
const setupPermissions = async ({ strapi }) => {
    // Add permissions
    const actions = [
        {
            section: 'plugins',
            displayName: 'Read',
            uid: permissions.navigation.read,
            pluginName: 'navigation',
        },
        {
            section: 'plugins',
            displayName: 'Update',
            uid: permissions.navigation.update,
            pluginName: 'navigation',
        },
        {
            section: 'plugins',
            displayName: 'Settings',
            uid: permissions.navigation.settings,
            pluginName: 'navigation',
        },
    ];
    await strapi.admin.services.permission.actionProvider.registerMany(actions);
};
exports.setupPermissions = setupPermissions;
exports.default = permissions;
