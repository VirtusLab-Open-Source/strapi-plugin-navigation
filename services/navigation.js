"use strict";

const { validate: uuidValidate } = require("uuid");
const slugify = require("slugify");
const { sanitizeEntity } = require("strapi-utils");
const {
  isArray,
  isEmpty,
  isObject,
  isNil,
  isNumber,
  find,
  first,
  flatten,
  get,
  last,
  upperFirst,
  isString,
} = require("lodash");
const { renderType } = require("../models/navigation");
const { type: itemType } = require("../models/navigationItem");
const navigationItem = require("../models/navigationItem");
const { TEMPLATE_DEFAULT } = require('./constant');

/**
 * navigation.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const extractMeta = (plugins) => {
  const { navigation: plugin } = plugins;
  const { navigation: service } = plugin.services;
  const {
    navigation: masterModel,
    navigationitem: itemModel,
    audience: audienceModel,
  } = plugin.models;
  return {
    masterModel,
    itemModel,
    audienceModel,
    service,
    plugin,
    pluginName: plugin.package.strapi.name.toLowerCase(),
  };
};

const excludedContentTypes = get(
  strapi.config,
  "custom.plugins.navigation.excludedContentTypes",
  ["plugins::", "strapi"],
);

const buildNestedStructure = (entities, id = null, field = 'parent') =>
  entities
    .filter(entity => (entity[field] === id) || (isObject(entity[field]) && (entity[field].id === id)))
    .map(entity => ({
      ...entity,
      items: buildNestedStructure(entities, entity.id, field),
    }));

  const getTemplateComponentFromTemplate = (
      template = [],
    ) => {
      const componentName = get(first(template), '__component');
      return componentName ? strapi.components[componentName] : null;
    };

const templateNameFactory = async (items, strapi) => {
  const flatRelated = flatten(items.map(i => i.related));
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
        ([contentType, ids]) => strapi.query(contentType).find({ id_in: ids }).then(res => ({ [contentType]: res }))),
  );
  const relatedResponseMap = responses.reduce((acc, curr) => ({ ...acc, ...curr }), {});

  return (contentType, id) => {
    const template = get(relatedResponseMap[contentType].find(data => data.id === id), 'template');
    const templateComponent = getTemplateComponentFromTemplate(template);
    return get(templateComponent, 'options.templateName', TEMPLATE_DEFAULT);
  };
}

const sendAuditLog = (auditLogInstance, event, data) => {
  if (auditLogInstance && auditLogInstance.emit) {
    auditLogInstance.emit(event, data);
  }
};

const prepareAuditLog = (actions) => {
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
};

module.exports = {
  // Get plugin configuration
  config: async () => {
    const { pluginName, service, audienceModel } = extractMeta(strapi.plugins);
    const additionalFields = get(strapi.config, 'custom.plugins.navigation.additionalFields', []);
    let extendedResult = {};
    const result = {
      contentTypes: service.configContentTypes(),
      allowedLevels: get(strapi.config, 'custom.plugins.navigation.allowedLevels'),
      additionalFields,
    }

    if (additionalFields.includes(navigationItem.additionalFields.AUDIENCE)) {
      const audienceItems = await strapi
        .query(audienceModel.modelName, pluginName)
        .find({});
      extendedResult = {
        ...extendedResult,
        availableAudience: audienceItems.map((_) =>
          sanitizeEntity(_, { model: audienceModel }),
        ),
      };
    }
    return {
      ...result,
      ...extendedResult,
    };
  },

  configContentTypes: () =>
    Object.keys(strapi.contentTypes)
      .filter(
        (key) =>
          excludedContentTypes.filter((ect) => key.includes(ect)).length ===
          0,
      )
      .map((key) => {
        const item = strapi.contentTypes[key];
        const { options, info, collectionName, apiName, plugin } = item;
        const { name, label, description } = info;
        const { isManaged, hidden } = options;
        return {
          name,
          description,
          collectionName,
          endpoint: last(apiName) === 's' ? apiName : `${apiName}s`,
          label: upperFirst(name || collectionName),
          plugin,
          visible: (isManaged || isNil(isManaged)) && !hidden,
        };
      })
      .filter((item) => item.visible),

  // Get all available navigations
  get: async () => {
    const { pluginName, masterModel } = extractMeta(strapi.plugins);
    const entities = await strapi
      .query(masterModel.modelName, pluginName)
      .find({}, []);
    return entities.map((_) => sanitizeEntity(_, { model: masterModel }));
  },

  // Get navigation by id with
  getById: async (id) => {
    const { pluginName, masterModel, itemModel } = extractMeta(strapi.plugins);
    const entity = await strapi
      .query(masterModel.modelName, pluginName)
      .findOne({ id });

    const entityItems = await strapi
      .query(itemModel.modelName, pluginName)
      .find({
        master: id,
        _sort: 'order:asc',
      }, ['related', 'audience']);

    return {
      ...sanitizeEntity(entity,
        { model: masterModel },
      ),
      items: buildNestedStructure(entityItems),
    };
  },

  post: async (payload, auditLog) => {
    const { pluginName, masterModel, service } = extractMeta(strapi.plugins);
    const { name, visible } = payload;

    const existingEntity = await strapi
      .query(masterModel.modelName, pluginName)
      .create({
        name,
        slug: slugify(name).toLowerCase(),
        visible,
      });

    return service
      .createBranch(payload.items, existingEntity, null)
      .then(() => service.getById(existingEntity.id))
      .then((newEntity) => {
        sendAuditLog(auditLog, 'onChangeNavigation', { actionType: 'CREATE', oldEntity: existingEntity, newEntity });
        return newEntity;
      })
  },

  put: async (id, payload, auditLog) => {
    const { pluginName, masterModel, service } = extractMeta(strapi.plugins);
    const { name, visible } = payload;

    const existingEntity = await service.getById(id);
    const entityNameHasChanged = existingEntity.name !== name;
    const entity = await strapi.query(masterModel.modelName, pluginName).update(
      { id },
      {
        name: entityNameHasChanged ? name : existingEntity.name,
        slug: entityNameHasChanged ? slugify(name).toLowerCase() : existingEntity.slug,
        visible,
      },
    );
    return service
      .analyzeBranch(payload.items, entity, null)
      .then((auditLogsOperations) =>
        Promise.all([
          prepareAuditLog((auditLogsOperations || []).flat(Number.MAX_SAFE_INTEGER)),
          service.getById(entity.id)],
        ))
      .then(([actionType, newEntity]) => {
        sendAuditLog(auditLog, 'onChangeNavigation', { actionType, oldEntity: existingEntity, newEntity });
        return newEntity;
      })
  },

  render: async (idOrSlug, type = renderType.FLAT, menuOnly = false) => {
    const { service } = extractMeta(
      strapi.plugins,
    );
    const findById = isNumber(idOrSlug) || uuidValidate(idOrSlug);
    const criteria = findById ? { id: idOrSlug } : { slug: idOrSlug };
    const itemCriteria = menuOnly ? { menuAttached: true } : {};

    return service.renderType(type, criteria, itemCriteria)
  },

  renderType: async (type = renderType.FLAT, criteria = {}, itemCriteria = {}) => {
    const { pluginName, service, masterModel, itemModel } = extractMeta(
      strapi.plugins,
    );

    const entity = await strapi
      .query(masterModel.modelName, pluginName)
      .findOne({
        ...criteria,
        visible: true,
      });
    if (entity && entity.id) {
      const items = await strapi.query(itemModel.modelName, pluginName).find(
        {
          master: entity.id,
          ...itemCriteria,
          _sort: 'order:asc',
        },
        ["related", "audience"],
      );

      if (!items) {
        return [];
      }
      const getTemplateName = await templateNameFactory(items, strapi)

      switch (type) {
        case renderType.TREE:
        case renderType.RFR:
          const itemParser = (item, path = '', field) => {
            const isExternal = item.type === itemType.EXTERNAL;
            const parentPath = isExternal ? undefined : `${path === '/' ? '' : path}/${item.path === '/' ? '' : item.path}`;
            const slug = isString(parentPath) ? slugify((first(parentPath) === '/' ? parentPath.substring(1) : parentPath).replace(/\//g, '-')) : undefined;
            const firstRelated = first(item.related);
            return {
              title: item.title,
              menuAttached: item.menuAttached,
              path: isExternal ? item.externalPath : parentPath,
              type: item.type,
              uiRouterKey: item.uiRouterKey,
              slug: !slug && item.uiRouterKey ? slugify(item.uiRouterKey) : slug,
              external: isExternal,
              related: isExternal ? undefined : {
                ...firstRelated,
                __templateName: getTemplateName(firstRelated.__contentType, firstRelated.id),
              },
              audience: !isEmpty(item.audience) ? item.audience.map(aItem => aItem.key) : undefined,
              items: isExternal ? undefined : service.renderTree(
                items,
                item.id,
                field,
                parentPath,
                itemParser,
              ),
            };
          };
          const treeStructure = service.renderTree(
            items,
            null,
            "parent",
            undefined,
            itemParser,
          );
          if (type === renderType.RFR) {
            return service.renderRFR(treeStructure);
          }
          return treeStructure;
        default:
          return items.map((item) => ({
            ...sanitizeEntity(item, { model: itemModel }),
            related: item.related,
            items: null,
          }));
      }
    }
    throw new Error("404!");
  },

  renderTree: (
    items = [],
    id = null,
    field = "parent",
    path = "",
    itemParser = (i) => i,
  ) => {
    return items
      .filter(
        (item) =>
          item[field] === id ||
          (isObject(item[field]) && item[field].id === id),
      )
      .map(item => itemParser({
        ...item
      }, path, field));
  },

  renderRFR: (items, parent = null, parentNavItem = null) => {
    const { service } = extractMeta(strapi.plugins);
    let pages = {};
    let nav = {};
    let navItems = [];

    items.forEach(item => {
      const { items: itemChilds, ...itemProps } = item;
      const itemNav = service.renderRFRNav(itemProps);
      const itemPage = service.renderRFRPage(itemProps, parent);

      if (item.type === navigationItem.type.INTERNAL) {
        pages = {
          ...pages,
          [itemPage.id]: {
            ...itemPage,
          },
        };
      }

      if (item.menuAttached) {
        navItems.push(itemNav);
      }

      if (!parent) {
        nav = {
          ...nav,
          root: navItems,
        };
      } else {
        const navLevel = navItems
          .filter(navItem => navItem.type === navigationItem.type.INTERNAL.toLowerCase())
        if (!isEmpty(navLevel))
          nav = {
            ...nav,
            [parent]: [].concat(parentNavItem ? parentNavItem : [], navLevel),
          };
      }

      if (!isEmpty(itemChilds)) {
        const { nav: nestedNavs } = service.renderRFR(itemChilds, itemPage.id, itemNav);
        const { pages: nestedPages } = service.renderRFR(itemChilds.filter(child => child.type === navigationItem.type.INTERNAL), itemPage.id, itemNav);
        pages = {
          ...pages,
          ...nestedPages,
        };
        nav = {
          ...nav,
          ...nestedNavs,
        };
      }
    });

    return {
      pages,
      nav,
    };
  },

  renderRFRPage: (item, parent) => {
    const { service } = extractMeta(strapi.plugins);
    const { uiRouterKey, title, path, slug, related, type, audience, menuAttached } = item;
    const { __contentType, id, __templateName } = related || {};
    const contentTypes = service.configContentTypes();
    const contentType = (__contentType || '').toLowerCase() || undefined;
    const { collectionName } = find(contentTypes, ctItem => ctItem.name === contentType) || {};
    return {
      id: uiRouterKey,
      title,
      templateName: __templateName,
      related: type === navigationItem.type.INTERNAL ? {
        contentType,
        collectionName,
        id,
      }: undefined,
      path,
      slug,
      parent,
      audience,
      menuAttached,
    };
  },

  renderRFRNav: (item) => {
    const { uiRouterKey, title, path, type, audience } = item;
    return {
      label: title,
      type: type.toLowerCase(),
      page: type === navigationItem.type.INTERNAL ? uiRouterKey : undefined,
      url: type === navigationItem.type.EXTERNAL ? path : undefined,
      audience,
    };
  },

  createBranch: (items = [], masterEntity = null, parentItem = null, operations = {}) => {
    const { pluginName, itemModel, service } = extractMeta(strapi.plugins);
    return Promise.all(
      items.map(async (item) => {
        operations.create = true;
        const { parent, master, related, ...params } = item;
        const relatedItem =
          isNil(related) || params.type === itemType.EXTERNAL ? [] : related;
        const navigationItem = await strapi
          .query(itemModel.modelName, pluginName)
          .create({
            ...params,
            related: isArray(relatedItem) ? relatedItem : [relatedItem],
            master: masterEntity,
            parent: parentItem,
          });
        return !isEmpty(item.items)
          ? service.createBranch(
            item.items,
            masterEntity,
            sanitizeEntity(navigationItem, { model: itemModel }),
            operations,
          )
          : operations;
      }),
    );
  },

  removeBranch: (items = [], operations = {}) => {
    const { pluginName, itemModel, service } = extractMeta(strapi.plugins);
    return Promise.all(
      items
        .filter(item => item.id)
        .map(async (item) => {
          operations.remove = true;
          const { id } = item;
          await strapi
            .query(itemModel.modelName, pluginName)
            .delete({ id });
          return !isEmpty(item.items)
            ? service.removeBranch(
              item.items,
              operations,
            )
            : operations;
        }),
    );
  },

  analyzeBranch: (items = [], masterEntity = null, parentItem = null, prevOperations = {}) => {
    const { pluginName, itemModel, service } = extractMeta(strapi.plugins);
    const needToCreate = items.filter((item) => isNil(item.id) && !item.removed);
    const needToAnalyzeAndUpdate = items.filter((item) => !isNil(item.id) && !item.removed);
    const needToRemove = items.filter((item) => !isNil(item.id) && item.removed);
    const operations = {
      create: prevOperations.create || !!needToCreate.length,
      update: prevOperations.update || !!needToAnalyzeAndUpdate.length,
      remove: prevOperations.remove || !!needToRemove.length,
    };
    return Promise.all([
      service.createBranch(needToCreate, masterEntity, parentItem, operations),
      service.removeBranch(needToRemove, operations),
      Promise.all(
        needToAnalyzeAndUpdate
          .map(async (item) => {
            const { id, updated, parent, master, related, items, ...params } = item;
            let currentItem;
            if (updated) {
              const relatedItem =
                isNil(related) || params.type === itemType.EXTERNAL
                  ? []
                  : related;
              await strapi
                .query(itemModel.modelName, pluginName)
                .update(
                  { id },
                  { related: [] },
                ); // clearing the relation to get it updated properly and not duplicate _morph records
              currentItem = await strapi
                .query(itemModel.modelName, pluginName)
                .update(
                  { id },
                  {
                    ...params,
                    related: isArray(relatedItem) ? relatedItem : [relatedItem],
                    master: masterEntity,
                    parent: parentItem,
                  },
                );
            } else {
              currentItem = item;
            }
            return !isEmpty(items)
              ? service.analyzeBranch(
                items,
                masterEntity,
                sanitizeEntity(currentItem, { model: itemModel }),
                operations,
              )
              : operations;
          }),
      ),
    ]);
  },

  sanitizeTreeStructure: (entity) => {
    const { masterModel, itemModel } = extractMeta(strapi.plugins);
    return sanitizeEntity(
      {
        ...entity,
        items: entity.items.map((item) =>
          sanitizeEntity(item, { model: itemModel }),
        ),
      },
      { model: masterModel },
    );
  },
};
