"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_1 = __importDefault(require("../permissions"));
const routes = {
    type: 'admin',
    routes: [
        {
            method: 'GET',
            path: '/',
            handler: 'admin.get',
            config: {
                policies: [
                    {
                        name: 'admin::hasPermissions',
                        config: {
                            actions: [permissions_1.default.render('read')],
                        },
                    },
                ],
            },
        },
        {
            method: 'POST',
            path: '/',
            handler: 'admin.post',
            config: {
                policies: [
                    {
                        name: 'admin::hasPermissions',
                        config: {
                            actions: [permissions_1.default.render('update')],
                        },
                    },
                ],
            },
        },
        {
            method: 'GET',
            path: '/config',
            handler: 'admin.config',
            config: {
                policies: [
                    {
                        name: 'admin::hasPermissions',
                        config: {
                            actions: [permissions_1.default.render('read')],
                        },
                    },
                ],
            },
        },
        {
            method: 'PUT',
            path: '/config',
            handler: 'admin.updateConfig',
            config: {
                policies: [
                    {
                        name: 'admin::hasPermissions',
                        config: {
                            actions: [permissions_1.default.render('settings')],
                        },
                    },
                ],
            },
        },
        {
            method: 'DELETE',
            path: '/config',
            handler: 'admin.restoreConfig',
            config: {
                policies: [
                    {
                        name: 'admin::hasPermissions',
                        config: {
                            actions: [permissions_1.default.render('settings')],
                        },
                    },
                ],
            },
        },
        {
            method: 'GET',
            path: '/slug',
            handler: 'admin.getSlug',
            config: {
                policies: ['admin::isAuthenticatedAdmin'],
            },
        },
        {
            method: 'GET',
            path: '/:documentId',
            handler: 'admin.getById',
            config: {
                policies: [
                    {
                        name: 'admin::hasPermissions',
                        config: {
                            actions: [permissions_1.default.render('read')],
                        },
                    },
                ],
            },
        },
        {
            method: 'PUT',
            path: '/:documentId',
            handler: 'admin.put',
            config: {
                policies: [
                    {
                        name: 'admin::hasPermissions',
                        config: {
                            actions: [permissions_1.default.render('update')],
                        },
                    },
                ],
            },
        },
        {
            method: 'DELETE',
            path: '/:documentId',
            handler: 'admin.delete',
            config: {
                policies: [
                    {
                        name: 'admin::hasPermissions',
                        config: {
                            actions: [permissions_1.default.render('update')],
                        },
                    },
                ],
            },
        },
        {
            method: 'GET',
            path: '/content-type-items/:model',
            handler: 'admin.getContentTypeItems',
            config: {
                policies: ['admin::isAuthenticatedAdmin'],
            },
        },
        {
            method: 'GET',
            path: '/settings/locale',
            handler: 'admin.settingsLocale',
            config: {
                policies: ['admin::isAuthenticatedAdmin'],
            },
        },
        {
            method: 'GET',
            path: '/settings/config',
            handler: 'admin.settingsConfig',
            config: {
                policies: [
                    {
                        name: 'admin::hasPermissions',
                        config: {
                            actions: [permissions_1.default.render('settings')],
                        },
                    },
                ],
            },
        },
        {
            method: 'GET',
            path: '/settings/restart',
            handler: 'admin.settingsRestart',
            config: {
                policies: [
                    {
                        name: 'admin::hasPermissions',
                        config: {
                            actions: [permissions_1.default.render('settings')],
                        },
                    },
                ],
            },
        },
        {
            method: 'PUT',
            path: '/i18n/copy/:documentId/:source/:target',
            handler: 'admin.fillFromOtherLocale',
            config: {
                policies: [
                    {
                        name: 'admin::hasPermissions',
                        config: {
                            actions: [permissions_1.default.render('update')],
                        },
                    },
                ],
            },
        },
        {
            method: 'GET',
            path: '/i18n/item/read/:source/:target',
            handler: 'admin.readNavigationItemFromLocale',
            config: {
                policies: [
                    {
                        name: 'admin::hasPermissions',
                        config: {
                            actions: [permissions_1.default.render('read')],
                        },
                    },
                ],
            },
        },
    ],
};
exports.default = routes;
