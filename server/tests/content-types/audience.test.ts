import audience from '../../src/content-types/audience/schema';

describe('Navigation', () => {
  describe('Server', () => {
    describe('Content types', () => {
      describe('Audience', () => {
        it('should provide valid content type', () => {
          // Then
          expect(audience).toMatchInlineSnapshot(`
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
