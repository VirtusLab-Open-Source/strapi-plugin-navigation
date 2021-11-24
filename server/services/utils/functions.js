const {
  last,
} = require('lodash');

module.exports = ({ strapi }) => {
  return {
    singularize(value = '') {
      return last(value) === 's' ? value.substr(0, value.length - 1) : value;
    },
    
    extractMeta(plugins) {
      const { navigation: plugin } = plugins;
      const { navigation: service } = plugin.services;
      const {
        navigation: masterModel,
        'navigation-item': itemModel,
        audience: audienceModel,
        'navigations-items-related': relatedModel,
      } = plugin.contentTypes;
      // FIXME: Plugin Name should be fetched from the package file
      return {
        masterModel,
        itemModel,
        relatedModel,
        audienceModel,
        service,
        plugin,
        pluginName: 'navigation',
      };
    },

    buildNestedStructure(entities, id = null, field = 'parent') {
      return entities
        .filter(entity => {
          if (entity[field] === null && id === null) {
            return true;
          }
          let data = entity[field];
          if (data && typeof id === 'string') {
            data = data.toString();
          }
          return (data && data === id) || (isObject(entity[field]) && (entity[field].id === id));
        })
        .map(entity => {
          return ({
            ...entity,
            related: !isEmpty(entity.related) ? [last(entity.related)] : entity.related,
            items: this.buildNestedStructure(entities, entity.id, field),
          });
        });
    },
  };
}