import navigationLifecycles from '../../src/content-types/navigation/lifecycles';
import navigation from '../../src/content-types/navigation/schema';

describe('Navigation', () => {
  describe('Server', () => {
    describe('Content types', () => {
      describe('Navigation', () => {
        it('should provide valid content type', () => {
          // Then
          expect(navigation).toMatchInlineSnapshot(`
{
  "attributes": {
    "items": {
      "configurable": false,
      "mappedBy": "master",
      "relation": "oneToMany",
      "target": "plugin::navigation.navigation-item",
      "type": "relation",
    },
    "localeCode": {
      "configurable": false,
      "type": "string",
    },
    "name": {
      "configurable": false,
      "required": true,
      "type": "text",
    },
    "slug": {
      "configurable": false,
      "required": true,
      "target": "name",
      "type": "uid",
    },
    "visible": {
      "configurable": false,
      "default": false,
      "type": "boolean",
    },
  },
  "collectionName": "navigations",
  "info": {
    "displayName": "Navigation",
    "name": "navigation",
    "pluralName": "navigations",
    "singularName": "navigation",
  },
  "options": {
    "comment": "",
  },
  "pluginOptions": {
    "content-manager": {
      "visible": false,
    },
    "content-type-builder": {
      "visible": false,
    },
    "i18n": {
      "localized": true,
    },
  },
}
`);
        });

        it('should provide valid lifecycle hooks', () => {
          // Then
          expect(navigationLifecycles).toMatchInlineSnapshot(`
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
