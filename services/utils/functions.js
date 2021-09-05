const {
  isArray,
  isEmpty,
  isObject,
  isString,
  first,
  find,
  flatten,
  get,
  last,
} = require('lodash');

const { type: itemType } = require('../../models/navigationItem');
const { NavigationError } = require('../../utils/NavigationError');
const { TEMPLATE_DEFAULT } = require('./constant');

module.exports = {
  extractMeta(plugins) {
      const { navigation: plugin } = plugins;
      const { navigation: service } = plugin.services;
      const {
        navigation: masterModel,
        navigationitem: itemModel,
        audience: audienceModel,
        navigations_items_related: relatedModel,
      } = plugin.models;
      return {
        masterModel,
        itemModel,
        relatedModel,
        audienceModel,
        service,
        plugin,
        pluginName: plugin.package.strapi.name.toLowerCase(),
      };
    },

  singularize(value = '') {
    return last(value) === 's' ? value.substr(0, value.length - 1) : value;
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

  async templateNameFactory(items, strapi, contentTypes = []) {
    const flatRelated = flatten(items.map(i => i.related)).filter(_ => !!_);
    const relatedMap = flatRelated.reduce((acc, curr) => {
      if (!acc[curr.__contentType]) {
        acc[curr.__contentType] = [];
      }
      acc[curr.__contentType].push(curr.id);
      return acc;
    }, {});
    const responses = await Promise.all(
      Object.entries(relatedMap)
        .map(
          ([contentType, ids]) => {
            const contentTypeUid = get(find(contentTypes, cnt => cnt.uid === contentType), 'uid');
            return strapi.query(contentTypeUid)
              .find({ id_in: ids, _limit: -1 })
              .then(res => ({ [contentType]: res }))
          }),
    );
    const relatedResponseMap = responses.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    const singleTypes = new Map(
      contentTypes
        .filter(x => x.isSingle)
        .map(({ contentTypeName, templateName }) => [contentTypeName, templateName || contentTypeName])
    );

    return (contentType, id) => {
      const template = get(relatedResponseMap[contentType].find(data => data.id === id), 'template');

      if (template) {
        const templateComponent = this.getTemplateComponentFromTemplate(template);
        return get(templateComponent, 'options.templateName', TEMPLATE_DEFAULT);
      }

      if (singleTypes.get(contentType)) {
        return singleTypes.get(contentType);
      }

      return TEMPLATE_DEFAULT;
    };
  },

  getTemplateComponentFromTemplate(template = []) {
    const componentName = get(first(template), '__component');
    return componentName ? strapi.components[componentName] : null;
  },

  sendAuditLog(auditLogInstance, event, data) {
    if (auditLogInstance && auditLogInstance.emit) {
      auditLogInstance.emit(event, data);
    }
  },

  filterOutUnpublished(item) {
    const relatedItem = item.related && last(item.related);
    const isHandledByPublshFlow =  relatedItem ? 'published_at' in relatedItem : false;

    if (isHandledByPublshFlow) {
      const isRelatedDefinedAndPublished = relatedItem ?
        isHandledByPublshFlow && get(relatedItem, 'published_at') :
        false;
      return item.type === itemType.INTERNAL ? isRelatedDefinedAndPublished  : true;
    }
    return (item.type === itemType.EXTERNAL) || relatedItem;
  },

  composeItemTitle(item = {}, fields = {}, contentTypes = []) {
    const { title, related } = item;
    if (title) {
      return isString(title) && !isEmpty(title) ? title : undefined;
    } else if (related) {
      const relationTitle = this.extractItemRelationTitle(isArray(related) ? last(related) : related, fields, { contentTypes });
      return isString(relationTitle) && !isEmpty(relationTitle) ? relationTitle : undefined;
    }
    return undefined;
  },

  extractItemRelationTitle(relatedItem = {}, fields = {}, contentTypes = []) {
    const { __contentType } = relatedItem;
    const contentType = find(contentTypes, _ => _.contentTypeName === __contentType);
    const { default: defaultFields = [] } = fields;
    return get(fields, `${contentType ? contentType.collectionName : ''}`, defaultFields).map((_) => relatedItem[_]).filter((_) => _)[0] || '';
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

};
