module.exports = {
  "collectionName": "navigations_items_related",
  "info": {
    "singularName": "navigations-items-related",
    "pluralName": "navigations-items-relateds",
    "displayName": "Navigations Items Related",
    "name": "navigations_items_related"
  },
  "options": {
    "increments": true,
    "timestamps": false,
    "populateCreatorFields": false
  },
  "pluginOptions": {
    "content-manager": {
      "visible": false
    },
    "content-type-builder": {
      "visible": false
    },
    "i18n": {
      "localized": false
    }
  },
  "attributes": {
    "related_id": {
      "type": "string",
      "required": true
    },
    "related_type": {
      "type": "string",
      "required": true
    },
    "field": {
      "type": "string",
      "required": true
    },
    "order": {
      "type": "integer",
      "required": true
    },
    "master": {
      "type": "string",
      "required": true
    }
  }
}
