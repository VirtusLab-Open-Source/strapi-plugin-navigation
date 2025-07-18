"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = __importDefault(require("../../src/content-types/audience/schema"));
describe('Navigation', () => {
    describe('Server', () => {
        describe('Content types', () => {
            describe('Audience', () => {
                it('should provide valid content type', () => {
                    // Then
                    expect(schema_1.default).toMatchInlineSnapshot(`
{
  "attributes": {
    "key": {
      "targetField": "name",
      "type": "uid",
    },
    "name": {
      "required": true,
      "type": "string",
    },
  },
  "collectionName": "audience",
  "info": {
    "displayName": "Audience",
    "name": "audience",
    "pluralName": "audiences",
    "singularName": "audience",
  },
  "options": {
    "comment": "Audience",
    "increments": true,
  },
}
`);
                });
            });
        });
    });
});
