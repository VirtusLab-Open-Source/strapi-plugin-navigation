module.exports = {
  "collectionName": "audience",
  "info": {
    "singularName": "audience",
    "pluralName": "audiences",
    "displayName": "Audience",
    "name": "audience"
  },
  "options": {
    "increments": true,
    "comment": "Audience"
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "key": {
      "type": "uid",
      "targetField": "name"
    }
  }
}
