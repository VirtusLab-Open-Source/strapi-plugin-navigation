export default {
  collectionName: 'navigations',
  info: {
    singularName: 'navigation',
    pluralName: 'navigations',
    displayName: 'Navigation',
    name: 'navigation',
  },
  options: {
    comment: '',
  },
  pluginOptions: {
    'content-manager': {
      visible: false,
    },
    'content-type-builder': {
      visible: false,
    },
    i18n: {
      localized: true,
    },
  },
  attributes: {
    name: {
      type: 'text',
      configurable: false,
      required: true,
    },
    slug: {
      type: 'uid',
      target: 'name',
      configurable: false,
      required: true,
    },
    visible: {
      type: 'boolean',
      default: false,
      configurable: false,
    },
    items: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'plugin::navigation.navigation-item',
      configurable: false,
      mappedBy: 'master',
    },
  },
};
