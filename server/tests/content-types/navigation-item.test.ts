import navigationItemLifecycles from '../../src/content-types/navigation-item/lifecycles';
import navigationItem from '../../src/content-types/navigation-item/schema';

describe('Navigation', () => {
  describe('Server', () => {
    describe('Content types', () => {
      describe('Navigation', () => {
        it('should provide valid content type', () => {
          // Then
          expect(navigationItem).toMatchInlineSnapshot(`
{
  "attributes": {
    "additionalFields": {
      "default": {},
      "require": false,
      "type": "json",
    },
    "audience": {
      "relation": "oneToMany",
      "target": "plugin::navigation.audience",
      "type": "relation",
    },
    "autoSync": {
      "configurable": false,
      "default": true,
      "type": "boolean",
    },
    "collapsed": {
      "configurable": false,
      "default": false,
      "type": "boolean",
    },
    "externalPath": {
      "configurable": false,
      "type": "text",
    },
    "master": {
      "configurable": false,
      "inversedBy": "items",
      "relation": "manyToOne",
      "target": "plugin::navigation.navigation",
      "type": "relation",
    },
    "menuAttached": {
      "configurable": false,
      "default": false,
      "type": "boolean",
    },
    "order": {
      "configurable": false,
      "default": 0,
      "type": "integer",
    },
    "parent": {
      "configurable": false,
      "default": null,
      "relation": "oneToOne",
      "target": "plugin::navigation.navigation-item",
      "type": "relation",
    },
    "path": {
      "configurable": false,
      "targetField": "title",
      "type": "text",
    },
    "related": {
      "configurable": false,
      "relation": "morphToMany",
      "required": true,
      "type": "relation",
    },
    "title": {
      "configurable": false,
      "pluginOptions": {
        "i18n": {
          "localized": false,
        },
      },
      "required": true,
      "type": "text",
    },
    "type": {
      "configurable": false,
      "default": "INTERNAL",
      "enum": [
        "INTERNAL",
        "EXTERNAL",
        "WRAPPER",
      ],
      "type": "enumeration",
    },
    "uiRouterKey": {
      "configurable": false,
      "type": "string",
    },
  },
  "collectionName": "navigations_items",
  "info": {
    "displayName": "Navigation Item",
    "name": "navigation-item",
    "pluralName": "navigation-items",
    "singularName": "navigation-item",
  },
  "options": {
    "comment": "Navigation Item",
    "increments": true,
    "timestamps": true,
  },
  "pluginOptions": {
    "content-manager": {
      "visible": false,
    },
    "content-type-builder": {
      "visible": false,
    },
    "i18n": {
      "localized": false,
    },
  },
}
`);
        });

        it('should provide valid lifecycle hooks', () => {
          // Then
          expect(navigationItemLifecycles).toMatchInlineSnapshot(`
{
  "afterCount": [Function],
  "afterCreate": [Function],
  "afterCreateMany": [Function],
  "afterDelete": [Function],
  "afterDeleteMany": [Function],
  "afterFindMany": [Function],
  "afterFindOne": [Function],
  "afterUpdate": [Function],
  "afterUpdateMany": [Function],
  "beforeCount": [Function],
  "beforeCreate": [Function],
  "beforeCreateMany": [Function],
  "beforeDelete": [Function],
  "beforeDeleteMany": [Function],
  "beforeFindMany": [Function],
  "beforeFindOne": [Function],
  "beforeUpdate": [Function],
  "beforeUpdateMany": [Function],
}
`);
        });
      });
    });
  });
});
