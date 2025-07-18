'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    render: function (uid) {
        return `plugin::navigation.${uid}`;
    },
    navigation: {
        read: 'read',
        update: 'update',
        settings: 'settings',
    },
};
