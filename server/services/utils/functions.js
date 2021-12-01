const {
  last,
  isObject,
  isEmpty,
} = require('lodash');

const { type: itemType } = require('../../content-types/navigation-item');
const { NavigationError } = require('../../../utils/NavigationError');
const { TEMPLATE_DEFAULT } = require('./constant');

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
          if (entity[field] == null && id === null) {
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

    prepareAuditLog(actions) {
      return [
        ...new Set(
          actions
            .filter(_ => !!_)
            .flatMap(({ remove, create, update }) => {
              return [create ? 'CREATE' : '', update ? 'UPDATE' : '', remove ? 'REMOVE' : '']
                .filter(_ => !!_);
            }),
        ),
      ]
        .join('_');
    },

    sendAuditLog(auditLogInstance, event, data) {
      if (auditLogInstance && auditLogInstance.emit) {
        auditLogInstance.emit(event, data);
      }
    },

    checkDuplicatePath(parentItem, checkData) {
      return new Promise((resolve, reject) => {
        if (parentItem && parentItem.items) {
          for (let item of checkData) {
            for (let _ of parentItem.items) {
              if (_.path === item.path && (_.id !== item.id) && (item.type === itemType.INTERNAL)) {
                return reject(
                  new NavigationError(
                    `Duplicate path:${item.path} in parent: ${parentItem.title || 'root'} for ${item.title} and ${_.title} items`,
                    {
                      parentTitle: parentItem.title,
                      parentId: parentItem.id,
                      path: item.path,
                      errorTitles: [item.title, _.title],
                    },
                  ),
                );
              }
            }
          }
        }
        return resolve();
      });
    },
  };
}