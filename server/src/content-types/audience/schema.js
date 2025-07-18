"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    collectionName: 'audience',
    info: {
        singularName: 'audience',
        pluralName: 'audiences',
        displayName: 'Audience',
        name: 'audience',
    },
    options: {
        increments: true,
        comment: 'Audience',
    },
    attributes: {
        name: {
            type: 'string',
            required: true,
        },
        key: {
            type: 'uid',
            targetField: 'name',
        },
    },
};
