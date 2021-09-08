const {get} = require('lodash');
const NAVIGATION_DATE = `
# SQL
  created_at: String
  updated_at: String
# MONGO
  createdAt: String
  updatedAt: String
`;

const NAVIGATION_USER = `
# SQL
 created_by: String
 updated_by: String
# MONGO
 createdBy: String
 updatedBy: String
`;

const NAVIGATION = `
 id: String!
 name: String!
 slug: String!
 visible: Boolean!
`;

const getContentTypesNamesFields = () => {
  const contentTypesNameFields = strapi.config.get('custom.plugins.navigation.contentTypesNameFields');
  return Object.keys(contentTypesNameFields || {}).map(key => `${key}: [String]!`).join('\n');
};

const getNavigationRelated = () => {
  const related = strapi.config.get('custom.plugins.navigation.gql.navigationItemRelated');
  if (related) {
    return related;
  }
  return `
    type NavigationRelated { 
      id: Int
      title: String
      name: String
    }
  `;
};

module.exports = {
  // language=GraphQL
  definition: `
  enum NavigationRenderType {
      FLAT,
      TREE,
      RFR
  }
  
  ${getNavigationRelated()}


  type NavigationItem { 
    id: Int!
    title: String!
    type: String!
    path: String
    externalPath: String
    uiRouterKey: String!
    menuAttached: Boolean!
    order: Int!
    parent: Int
    master: Int
    items: [NavigationItem]
    related: NavigationRelated
    audience: [String]
    ${NAVIGATION_DATE}
    ${NAVIGATION_USER}
  }

  type Navigation { 
    ${NAVIGATION}
  }
  
  type NavigationDetails { 
    ${NAVIGATION}  
    items: [NavigationItem]!
  }
  
  
  type ContentTypesNameFields { 
    default: [String!]!
    ${getContentTypesNamesFields()}
  }

  type ContentTypes { 
    uid: String!
    name: String!
    isSingle: Boolean!
    collectionName: String!
    contentTypeName: String!
    label: String!
    relatedField: String!
    labelSingular: String!
    endpoint: String!
    available: Boolean!
    visible: Boolean!
  }

  type NavigationConfig { 
    allowedLevels: Int
    availableAudience: [NavigationAudience]!
    additionalFields: [String]!
    contentTypesNameFields: ContentTypesNameFields
    contentTypes: [ContentTypes] 
  }

  input CreateNavigationRelated {
    ref: String!
    field: String!
    refId: String!
  }
  
  input CreateNavigationItem {
    title: String!
    type: String!
    path: String
    externalPath: String
    uiRouterKey: String!
    menuAttached: Boolean!
    order: Int!
    parent: Int
    master: Int
    items: [CreateNavigationItem]
    audience: [String]
    related: CreateNavigationRelated
  }

  input CreateNavigation {
    name: String!
    items: [CreateNavigationItem]!
  }
  `,
  query: `
    renderNavigation(navigationIdOrSlug: String!, type: NavigationRenderType, menuOnly: Boolean): [NavigationItem]!
    renderNavigationChild(id: String!, childUIKey: String!, type: NavigationRenderType, menuOnly: Boolean): [NavigationItem]!
    getNavigation: [Navigation]!
    configNavigation: NavigationConfig
    getByIdNavigation(id: String!): NavigationItem
  `,
  type: {},
  mutation: `
    navigationCreate(newNavigation: CreateNavigation!): Navigation!
    navigationUpdate(id: String!, navigation: CreateNavigation!): Navigation!
  `,
  resolver: {
    Query: {
      renderNavigation: {
        resolverOf: 'plugins::navigation.navigation.render',
        resolver(obj, options) {
          const { navigationIdOrSlug, type, menuOnly } = options;
          return strapi.plugins.navigation.services.navigation.render(navigationIdOrSlug, type, menuOnly);
        },
      },
      renderNavigationChild: {
        resolverOf: 'plugins::navigation.navigation.renderChild',
        async resolver(obj, options) {
          const { id, childUIKey, type, menuOnly } = options;
          return strapi.plugins.navigation.services.navigation.renderChildren(id, childUIKey, type, menuOnly);
        },
      },
      getNavigation: {
        resolverOf: 'plugins::navigation.navigation.get',
        resolver() {
          return strapi.plugins.navigation.services.navigation.get();
        },
      },
      configNavigation: {
        resolverOf: 'plugins::navigation.navigation.config',
        resolver() {
          return strapi.plugins.navigation.services.navigation.config();
        },
      },
      getByIdNavigation: {
        resolverOf: 'plugins::navigation.navigation.getById',
        async resolver(obj, options) {
          const { id } = options;
          return strapi.plugins.navigation.services.navigation.getById(id);
        },
      },
    },
    Mutation: {
      navigationCreate: {
        resolverOf: 'plugins::navigation.navigation.post',
        resolver(obj, options) {
          const { newNavigation } = options;
          return strapi.plugins.navigation.services.navigation.post(newNavigation);
        },
      },
      navigationUpdate: {
        resolverOf: 'plugins::navigation.navigation.put',
        resolver(obj, options) {
          const { id, navigation } = options;
          return  strapi.plugins.navigation.services.navigation.put(id, navigation);
        },
      },
    },
  },
};

