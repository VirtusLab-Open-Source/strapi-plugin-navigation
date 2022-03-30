module.exports = {
    TEMPLATE_DEFAULT: 'Generic',

    KIND_TYPES: {
        SINGLE: 'singleType',
        COLLECTION: 'collectionType'
    },

    MODEL_TYPES: {
        CONTENT_TYPE: 'contentType'
    },
    ALLOWED_CONTENT_TYPES: [
        'api::',
        'plugin::'
    ],
    RESTRICTED_CONTENT_TYPES: [
        'plugin::users-permissions',
        'plugin::i18n.locale',
        'plugin::navigation',
    ],
};
