export default {
  collectionName: "navigations_items",
  info: {
    singularName: "navigation-item",
    pluralName: "navigation-items",
    displayName: "Navigation Item",
    name: "navigation-item"
  },
  options: {
    increments: true,
    timestamps: true,
    comment: "Navigation Item"
  },
  pluginOptions: {
    "content-manager": {
      visible: false
    },
    "content-type-builder": {
      visible: false
    },
    i18n: {
      localized: false
    }
  },
  attributes: {
    title: {
      type: "text",
      configurable: false,
      required: true,
      pluginOptions: {
        i18n: {
          localized: false
        }
      }
    },
    type: {
      type: "enumeration",
      enum: [
        "INTERNAL",
        "EXTERNAL",
        "WRAPPER"
      ],
      default: "INTERNAL",
      configurable: false
    },
    path: {
      type: "text",
      targetField: "title",
      configurable: false
    },
    externalPath: {
      type: "text",
      configurable: false
    },
    uiRouterKey: {
      type: "string",
      configurable: false
    },
    menuAttached: {
      type: "boolean",
      default: false,
      configurable: false
    },
    order: {
      type: "integer",
      default: 0,
      configurable: false
    },
    collapsed: {
      type: "boolean",
      default: false,
      configurable: false
    },
    related: {
      type: "relation",
      relation: "oneToOne",
      target: "plugin::navigation.navigations-items-related",
      configurable: false
    },
    parent: {
      type: "relation",
      relation: "oneToOne",
      target: "plugin::navigation.navigation-item",
      configurable: false,
      default: null
    },
    master: {
      type: "relation",
      relation: "manyToOne",
      target: "plugin::navigation.navigation",
      configurable: false
    },
    audience: {
      type: "relation",
      relation: "oneToMany",
      target: "plugin::navigation.audience"
    },
    additionalFields: {
      type: "json",
      require: false,
      default: {},
    }
  }
}
