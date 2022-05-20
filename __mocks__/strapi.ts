import { IStrapi, StrapiContentType, StrapiPlugin, StrapiDBQueryArgs, StringMap } from "strapi-typed";
import { default as defaultConfig } from '../server/config';
import { ToBeFixed } from "../types";

import { isMatch } from 'lodash';

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
  findMany: async (params: StrapiDBQueryArgs) => [{
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
  }].filter(item => params.where ? isMatch(item, params.where) : true),
};

const pageModelMock = {
  findOne: async () => ({
    "id": 1,
    "title": "Page nr 1",
    "createdAt": "2022-01-19T08:22:31.244Z",
    "updatedAt": "2022-01-19T08:22:31.244Z",
    "publishedAt": null
  }),
  findMany: async () => [{
    "id": 1,
    "title": "Page nr 1",
    "createdAt": "2022-01-19T08:22:31.244Z",
    "updatedAt": "2022-01-19T08:22:31.244Z",
    "publishedAt": null
  }, {
    "id": 2,
    "title": "Page nr 2",
    "createdAt": "2022-01-19T08:22:50.821Z",
    "updatedAt": "2022-01-19T08:22:50.821Z",
    "publishedAt": null
  }]

};

const plugins = (strapi: IStrapi): StringMap<StrapiPlugin> => ({
  navigation: {
    get services() { return require('../server/services') },
    service: (key: string) => (require('../server/services').default)[key]({ strapi }),
    get contentTypes() { return require('../server/content-types') },
    contentType: (key: string) => preparePluginContentType(require('../server/content-types').default[key].schema, 'navigation'),
    config: (key: string) => ({
      ...defaultConfig.default,
      contentTypes: ['api::pages.pages'],
    })[key],
    get controllers() { return {} },
    controller(): ToBeFixed { return {} },
  }
});

const contentTypes = {
  'api::pages.pages': {
    ...require('./pages.settings.json'),
    uid: 'api::pages.pages',
    modelName: 'page',
  },
};

const preparePluginContentType = (schema: ToBeFixed, plugin: string) => {
  const { name } = schema.info;

  return {
    ...schema,
    uid: `plugin::${plugin}.${name}`,
    modelName: name,
  }
}

declare var strapi: IStrapi;
const strapiFactory = (plugins: (strapi: IStrapi) => StringMap<StrapiPlugin>, contentTypes: StringMap<StrapiContentType<ToBeFixed>>) => ({
  get plugins() { return plugins(strapi) },
  plugin: (name: string) => plugins(strapi)[name],
  get contentTypes() { return contentTypes },
  contentType: (key: string) => contentTypes[key],
  query: (model: string) => {
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
  store: ({ type, name }: { type: string, name: string }) => {
    if (type === 'plugin' && name === 'navigation') {
      return {
        get: ({ key }: { key: string }) => key === 'config' ? {
          ...(defaultConfig.default),
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

export default setupStrapi;
