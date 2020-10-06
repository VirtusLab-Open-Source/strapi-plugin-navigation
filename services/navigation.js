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
  get,
  upperFirst,
  isString,
} = require("lodash");
const { renderType } = require("../models/navigation");
const { type: itemType } = require("../models/navigationItem");
const navigationItem = require("../models/navigationItem");

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
        const { options, info, collectionName, plugin } = item;
        const { name, label, description } = info;
        const { isManaged, hidden } = options;
        return {
          name,
          description,
          collectionName,
          label: upperFirst(collectionName),
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
      .find({ master: id }, ["related", "audience"]);

    return {
      ...sanitizeEntity(entity,
        { model: masterModel },
      ),
      items: buildNestedStructure(entityItems),
    };
  },

  post: async (payload) => {
    const { pluginName, masterModel, service } = extractMeta(strapi.plugins);
    const { name, visible } = payload;

    const entity = await strapi
      .query(masterModel.modelName, pluginName)
      .create({
        name,
        slug: slugify(name).toLowerCase(),
        visible,
      });

    return service
      .createBranch(payload.items, entity, null)
      .then(() => service.getById(entity.id));
  },

  put: async (id, payload) => {
    const { pluginName, masterModel, service } = extractMeta(strapi.plugins);
    const { name, visible } = payload;

    const existingEntity = service.getById(id);
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
      .then(() => service.getById(entity.id));
  },

  render: async (idOrSlug, type = renderType.FLAT, menuOnly = false) => {
    const { pluginName, service, masterModel, itemModel } = extractMeta(
      strapi.plugins,
    );
    const findById = isNumber(idOrSlug) || uuidValidate(idOrSlug);
    const criteria = findById ? { id: idOrSlug } : { slug: idOrSlug };
    const itemCriteria = menuOnly ? { menuAttached: true } : {};

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
        },
        ["related", "audience"],
      );

      if (!items) {
        return [];
      }

      switch (type) {
        case renderType.TREE:
        case renderType.RFR:
          const itemParser = (item, path, field) => {
            const isExternal = item.type === itemType.EXTERNAL;
            const parentPath = isExternal ? undefined : `${path}/${item.path}`;
            return {
              title: item.title,
              menuAttached: item.menuAttached,
              path: isExternal ? item.externalPath : parentPath,
              type: item.type,
              uiRouterKey: item.uiRouterKey,
              slug: isString(parentPath) ? slugify(parentPath.replace('/', '-')) : undefined,
              external: isExternal,
              related: isExternal ? undefined : first(item.related),
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

  renderRFR: (items, parent = null) => {
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

      navItems.push(itemNav);

      if (!parent) {
        nav = {
          ...nav,
          root: navItems,
        };
      } else {
        nav = {
          ...nav,
          [parent]: navItems,
        };
      }

      if (!isEmpty(itemChilds)) {
        const { nav: nestedNavs } = service.renderRFR(itemChilds, itemPage.id);
        const { pages: nestedPages } = service.renderRFR(itemChilds.filter(child => child.type === navigationItem.type.INTERNAL), itemPage.id);
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
    const { __contentType, id } = related || {};
    const contentTypes = service.configContentTypes();
    const contentType = (__contentType || '').toLowerCase() || undefined;
    const { collectionName } = find(contentTypes, ctItem => ctItem.name === contentType) || {};
    return {
      id: uiRouterKey,
      title,
      templateName: `${collectionName}:${id}`,
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

  createBranch: async (items = [], masterEntity = null, parentItem = null) => {
    const { pluginName, itemModel, service } = extractMeta(strapi.plugins);
    return Promise.all(
      items.map(async (item) => {
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
            )
          : null;
      }),
    );
  },

  removeBranch: async (items = []) => {
    const { pluginName, itemModel, service } = extractMeta(strapi.plugins);
    return Promise.all(
      items
        .filter(item => item.id)
        .map(async (item) => {
          const { id } = item;
          await strapi
            .query(itemModel.modelName, pluginName)
            .delete({ id });
          return !isEmpty(item.items)
            ? service.removeBranch(
                item.items,
              )
            : null;
        }),
    );
  },

  analyzeBranch: async (items = [], masterEntity = null, parentItem = null) => {
    const { pluginName, itemModel, service } = extractMeta(strapi.plugins);
    const needToCreate = items.filter((item) => isNil(item.id) && !item.removed);
    const needToAnalyzeAndUpdate = items.filter((item) => !isNil(item.id) && !item.removed);
    const needToRemove = items.filter((item) => !isNil(item.id) && item.removed);

    return Promise.all([
      service.createBranch(needToCreate, masterEntity, parentItem),
      service.removeBranch(needToRemove),
      Promise.all(
        needToAnalyzeAndUpdate.map(async (item) => {
          const { id, updated, parent, master, related, items, ...params } = item;
          let currentItem;
          if (updated) {
            const relatedItem =
              isNil(related) || params.type === itemType.EXTERNAL
                ? []
                : related;
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
              )
            : null;
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
