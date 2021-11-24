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
  };
}