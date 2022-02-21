const { isMatch } = require('lodash');

const masterModelMock = {
    findOne: () => ({
        id: 1,
        name: "Main navigation",
        slug: "main-navigation",
        visible: true,
        createdAt: "2021-12-30T14:05:50.276Z",
        updatedAt: "2021-12-30T14:05:50.276Z",
    }),
    findMany: () => [{
        id: 1,
        name: "Main navigation",
        slug: "main-navigation",
        visible: true,
        createdAt: "2021-12-30T14:05:50.276Z",
        updatedAt: "2021-12-30T14:05:50.276Z",
    }],
};

const itemModelMock = {
    findOne: async () => ({
        id: 1,
        title: "home",
        type: "INTERNAL",
        path: "home1",
        externalPath: null,
        uiRouterKey: "home",
        menuAttached: true,
        order: 1,
        createdAt: "2021-12-31T10:04:54.812Z",
        updatedAt: "2022-01-14T13:36:29.430Z",
        related: {
            id: 1,
            related_id: "1",
            related_type: "api::pages.pages",
            field: "navigation",
            order: 1,
            master: "3",
            createdAt: "2021-12-31T10:04:54.800Z",
            updatedAt: "2021-12-31T10:04:54.800Z",
            navigationItemId: 56,
        },
        parent: null,
    }),
    findMany: async ({ where }) => [{
        id: 1,
        title: "home",
        type: "INTERNAL",
        path: "home",
        externalPath: null,
        uiRouterKey: "home",
        menuAttached: true,
        order: 1,
        createdAt: "2021-12-31T10:04:54.812Z",
        updatedAt: "2022-01-14T13:36:29.430Z",
        master: 1,
        related: {
            id: 1,
            related_id: "1",
            related_type: "api::pages.pages",
            field: "navigation",
            order: 1,
            master: "3",
            createdAt: "2021-12-31T10:04:54.800Z",
            updatedAt: "2021-12-31T10:04:54.800Z",
            navigationItemId: 56,
        },
        parent: null,
    }, {
        id: 2,
        title: "side",
        type: "INTERNAL",
        path: "side",
        externalPath: null,
        uiRouterKey: "side",
        menuAttached: false,
        order: 1,
        createdAt: "2021-12-31T10:04:54.824Z",
        updatedAt: "2021-12-31T12:47:20.508Z",
        master: 1,
        related: {
            id: 2,
            related_id: "2",
            related_type: "api::pages.pages",
            field: "navigation",
            order: 1,
            master: "3",
            createdAt: "2021-12-31T10:04:54.823Z",
            updatedAt: "2021-12-31T10:04:54.823Z",
            navigationItemId: 57,
        },
        parent: {
            id: 1,
            title: "home",
            type: "INTERNAL",
            path: "home1",
            externalPath: null,
            uiRouterKey: "home",
            menuAttached: true,
            order: 1,
            createdAt: "2021-12-31T10:04:54.812Z",
            updatedAt: "2022-01-14T13:36:29.430Z",
        },
    }].filter(item => isMatch(item, where)),
};

const pageModelMock = {
    findOne: async ({ where }) => ({
        "id": 1,
        "attributes": {
            "title": "Page nr 1",
            "createdAt": "2022-01-19T08:22:31.244Z",
            "updatedAt": "2022-01-19T08:22:31.244Z",
            "publishedAt": null
        }
    }),
    findMany: async ({ where }) => [{
        "id": 1,
        "attributes": {
            "title": "Page nr 1",
            "createdAt": "2022-01-19T08:22:31.244Z",
            "updatedAt": "2022-01-19T08:22:31.244Z",
            "publishedAt": null
        }
    }, {
        "id": 2,
        "attributes": {
            "title": "Page nr 2",
            "createdAt": "2022-01-19T08:22:50.821Z",
            "updatedAt": "2022-01-19T08:22:50.821Z",
            "publishedAt": null
        }
    }]

};

const plugins = (strapi) => ({
    navigation: {
        get services() { return require('../server/services') },
        service: (key) => (require('../server/services'))[key]({ strapi }),
        get contentTypes() { return require('../server/content-types') },
        contentType: (key) => preparePluginContentType(require('../server/content-types')[key].schema, 'navigation'),
        config: (key) => ({
            ...require('../server/config').default,
            contentTypes: ['api::pages.pages'],
        })[key],
    }
});

const contentTypes = {
    'api::pages.pages': {
        ...require('./pages.settings.json'),
        uid: 'api::pages.pages',
        modelName: 'page',
    },
};

const preparePluginContentType = (schema, plugin) => {
    const { name } = schema.info;

    return {
        ...schema,
        uid: `plugin::${plugin}.${name}`,
        modelName: name,
    }
}

const strapiFactory = (plugins, contentTypes) => ({
    get plugins() { return plugins(strapi) },
    plugin: (name) => plugins(strapi)[name],
    get contentTypes() { return contentTypes },
    contentType: (key) => contentTypes[key],
    query: (model) => {
        switch (model) {
            case 'plugin::navigation.navigation':
                return masterModelMock;
            case 'plugin::navigation.navigation-item':
                return itemModelMock;
            case 'api::pages.pages':
                return pageModelMock;
            default:
                return {
                    findOne: () => ({}),
                    findMany: () => [],
                }
        }
    },
    store: ({ type, name }) => {
        if (type === 'plugin' && name === 'navigation') {
            return {
                get: ({ key }) => key === 'config' ? {
                    ...require('../server/config').default,
                    contentTypes: ['api::pages.pages']
                } : null,
                set: () => null,
            }
        }
    }
});

const setupStrapi = () => {
    Object.defineProperty(global, 'strapi', { value: strapiFactory(plugins, contentTypes) });
}

module.exports = { setupStrapi };
