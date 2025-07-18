"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORBIDDEN_CUSTOM_FIELD_NAMES = exports.DEFAULT_POPULATE = exports.KIND_TYPES = exports.CONTENT_TYPES_NAME_FIELDS_DEFAULTS = exports.RESTRICTED_CONTENT_TYPES = exports.ALLOWED_CONTENT_TYPES = exports.RELATED_ITEM_SEPARATOR = exports.allLifecycleHooks = exports.UID_REGEX = void 0;
exports.UID_REGEX = /^(?<type>[a-z0-9-]+)\:{2}(?<api>[a-z0-9-]+)\.{1}(?<contentType>[a-z0-9-]+)$/i;
exports.allLifecycleHooks = [
    'beforeCreate',
    'beforeCreateMany',
    'afterCreate',
    'afterCreateMany',
    'beforeUpdate',
    'beforeUpdateMany',
    'afterUpdate',
    'afterUpdateMany',
    'beforeDelete',
    'beforeDeleteMany',
    'afterDelete',
    'afterDeleteMany',
    'beforeCount',
    'afterCount',
    'beforeFindOne',
    'afterFindOne',
    'beforeFindMany',
    'afterFindMany',
];
exports.RELATED_ITEM_SEPARATOR = '$';
exports.ALLOWED_CONTENT_TYPES = ['api::', 'plugin::'];
exports.RESTRICTED_CONTENT_TYPES = [
    'admin::',
    'plugin::content-releases',
    'plugin::i18n.locale',
    'plugin::navigation',
    'plugin::review-workflows',
    'plugin::users-permissions',
    'plugin::upload.folder',
];
exports.CONTENT_TYPES_NAME_FIELDS_DEFAULTS = ['title', 'subject', 'name'];
exports.KIND_TYPES = { SINGLE: 'singleType', COLLECTION: 'collectionType' };
exports.DEFAULT_POPULATE = [];
exports.FORBIDDEN_CUSTOM_FIELD_NAMES = [
    'title',
    'type',
    'path',
    'externalPath',
    'uiRouterKey',
    'menuAttached',
    'order',
    'collapsed',
    'related',
    'parent',
    'master',
    'audience',
    'additionalFields',
];
