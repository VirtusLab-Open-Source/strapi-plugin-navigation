"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lifecycles_1 = __importDefault(require("../../src/content-types/navigation/lifecycles"));
const schema_1 = __importDefault(require("../../src/content-types/navigation/schema"));
describe('Navigation', () => {
    describe('Server', () => {
        describe('Content types', () => {
            describe('Navigation', () => {
                it('should provide valid content type', () => {
                    // Then
                    expect(schema_1.default).toMatchInlineSnapshot(`
{
  "attributes": {
    "items": {
      "configurable": false,
      "mappedBy": "master",
      "relation": "oneToMany",
      "target": "plugin::navigation.navigation-item",
      "type": "relation",
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
                    expect(lifecycles_1.default).toMatchInlineSnapshot(`
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
