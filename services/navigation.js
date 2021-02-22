'use strict';

const { isUuid } = require('uuidv4');
const slugify = require('slugify');
const pluralize = require('pluralize');
const { sanitizeEntity } = require('strapi-utils');
const {
  isArray,
  isEmpty,
  isObject,
  isNil,
  isNumber,
  find,
  first,
  get,
  last,
  upperFirst,
  isString,
} = require('lodash');
const { KIND_TYPES } = require("./utils/constant");
const utilsFunctions = require('./utils/functions');
const { renderType } = require('../models/navigation');
const { type: itemType } = require('../models/navigationItem');
const navigationItem = require('../models/navigationItem');

/**
 * navigation.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */



const excludedContentTypes = get(
  strapi.config,
  "custom.plugins.navigation.excludedContentTypes",
  [
    "plugins::",
    "strapi",
  ],
);

const contentTypesNameFieldsDefaults = [
  "title",
  "subject",
  "name",
];
const contentTypesNameFields = get(
  strapi.config,
  "custom.plugins.navigation.contentTypesNameFields",
  {},
);

module.exports = {
  // Get plugin configuration
  config: async () => {
    const { pluginName, service, audienceModel } = utilsFunctions.extractMeta(strapi.plugins);
    const additionalFields = get(strapi.config, 'custom.plugins.navigation.additionalFields', []);
    let extendedResult = {};
    const result = {
      contentTypes: service.configContentTypes(),
      contentTypesNameFields: {
        default: contentTypesNameFieldsDefaults,
        ...(isObject(contentTypesNameFields) ? contentTypesNameFields : {}),
      },
      allowedLevels: get(strapi.config, 'custom.plugins.navigation.allowedLevels'),
      additionalFields,
    };

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
        const relatedField = (item.associations || []).find(_ => _.collection === 'navigationitem');
        const { uid, options, info, collectionName, apiName, plugin, kind } = item;
        const { name, description } = info;
        const { isManaged, hidden } = options;
        const isSingle = kind === KIND_TYPES.SINGLE;
        const endpoint = isSingle ? apiName : pluralize(apiName);
        const relationName = last(apiName) === 's' ? apiName.substr(0, apiName.length - 1) : apiName;
        const relationNameParts = relationName.split('-');
        const contentTypeName = relationNameParts.length > 1 ? relationNameParts.reduce((prev, curr) => `${prev}${upperFirst(curr)}`, '') : upperFirst(relationName);
        const labelSingular = upperFirst(relationNameParts.length > 1 ? relationNameParts.join(' ') : relationName);
        return {
          uid,
          name: relationName,
          isSingle,
          description,
          collectionName,
          contentTypeName,
          label: isSingle ? labelSingular : pluralize(labelSingular || name),
          relatedField: relatedField ? relatedField.alias : undefined,
          labelSingular,
          endpoint,
          plugin,
          visible: (isManaged || isNil(isManaged)) && !hidden,
        };
      })
      .filter((item) => item.visible),

  // Get all available navigations
  get: async () => {
    const { pluginName, masterModel } = utilsFunctions.extractMeta(strapi.plugins);
    const entities = await strapi
      .query(masterModel.modelName, pluginName)
      .find({}, []);
    return entities.map((_) => sanitizeEntity(_, { model: masterModel }));
  },

  // Get navigation by id with related
  getById: async (id) => {
    const { pluginName, masterModel, itemModel } = utilsFunctions.extractMeta(strapi.plugins);
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
      items: utilsFunctions.buildNestedStructure(entityItems),
    };
  },

  post: async (payload, auditLog) => {
    const { pluginName, masterModel, service } = utilsFunctions.extractMeta(strapi.plugins);
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
        utilsFunctions.sendAuditLog(auditLog, 'onChangeNavigation', { actionType: 'CREATE', oldEntity: existingEntity, newEntity });
        return newEntity;
      });
  },

  put: async (id, payload, auditLog) => {
    const { pluginName, masterModel, service } = utilsFunctions.extractMeta(strapi.plugins);
    const { name, visible } = payload;

    const existingEntity = await service.getById(id);
    const entityNameHasChanged = existingEntity.name !== name || existingEntity.visible !== visible;
    if (entityNameHasChanged) {
      await strapi.query(masterModel.modelName, pluginName).update(
        { id },
        {
          name: entityNameHasChanged ? name : existingEntity.name,
          slug: entityNameHasChanged ? slugify(name).toLowerCase() : existingEntity.slug,
          visible,
        },
      );
    }
    return service
      .analyzeBranch(payload.items, existingEntity, null)
      .then((auditLogsOperations) =>
        Promise.all([
          auditLog ? utilsFunctions.prepareAuditLog((auditLogsOperations || []).flat(Number.MAX_SAFE_INTEGER)) : [],
          service.getById(existingEntity.id)],
        ))
      .then(([actionType, newEntity]) => {
        utilsFunctions.sendAuditLog(auditLog, 'onChangeNavigation', { actionType, oldEntity: existingEntity, newEntity });
        return newEntity;
      });
  },

  render: async (idOrSlug, type = renderType.FLAT, menuOnly = false) => {
    const { service } = utilsFunctions.extractMeta(
      strapi.plugins,
    );
    const findById = isNumber(idOrSlug) || isUuid(idOrSlug);
    const criteria = findById ? { id: idOrSlug } : { slug: idOrSlug };
    const itemCriteria = menuOnly ? { menuAttached: true } : {};

    return service.renderType(type, criteria, itemCriteria);
  },

  renderType: async (type = renderType.FLAT, criteria = {}, itemCriteria = {}) => {
    const { pluginName, service, masterModel, itemModel } = utilsFunctions.extractMeta(
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
      const getTemplateName = await utilsFunctions.templateNameFactory(items, strapi, service.configContentTypes())

      switch (type) {
        case renderType.TREE:
        case renderType.RFR:
          const itemParser = (item, path = '', field) => {
            const isExternal = item.type === itemType.EXTERNAL;
            const parentPath = isExternal ? undefined : `${path === '/' ? '' : path}/${item.path === '/' ? '' : item.path}`;
            const slug = isString(parentPath) ? slugify((first(parentPath) === '/' ? parentPath.substring(1) : parentPath).replace(/\//g, '-')) : undefined;
            const lastRelated = last(item.related);
            return {
              title: item.title,
              menuAttached: item.menuAttached,
              path: isExternal ? item.externalPath : parentPath,
              type: item.type,
              uiRouterKey: item.uiRouterKey,
              slug: !slug && item.uiRouterKey ? slugify(item.uiRouterKey) : slug,
              external: isExternal,
              related: isExternal || !lastRelated ? undefined : {
                ...lastRelated,
                __templateName: getTemplateName(lastRelated.__contentType, lastRelated.id),
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
            'parent',
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
    throw strapi.errors.notFound();
  },

  renderTree: (
    items = [],
    id = null,
    field = 'parent',
    path = '',
    itemParser = (i) => i,
  ) => {
    return items
      .filter(
        (item) => {
          if (item[field] === null && id === null) {
            return true;
          }
          let data = item[field];
          if (data && typeof id === 'string') {
            data = data.toString();
          }
          return (data && data === id) || (isObject(item[field]) && (item[field].id === id));
        },
      )
      .map(item => itemParser({
        ...item
      }, path, field));
  },

  renderRFR: (items, parent = null, parentNavItem = null) => {
    const { service } = utilsFunctions.extractMeta(strapi.plugins);
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
          .filter(navItem => navItem.type === navigationItem.type.INTERNAL.toLowerCase());
        if (!isEmpty(navLevel))
          nav = {
            ...nav,
            [parent]: [].concat(parentNavItem ? parentNavItem : [], navLevel),
          };
      }

      if (!isEmpty(itemChilds)) {
        const { nav: nestedNavs } = service.renderRFR(itemChilds, itemPage.id, itemNav);
        const { pages: nestedPages } = service.renderRFR(
          itemChilds.filter(child => child.type === navigationItem.type.INTERNAL), itemPage.id, itemNav);
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
    const { service } = utilsFunctions.extractMeta(strapi.plugins);
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
      } : undefined,
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
    const { pluginName, itemModel, service } = utilsFunctions.extractMeta(strapi.plugins);
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
            parent: parentItem ? { ...parentItem, _id: parentItem.id } : null,
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
    const { pluginName, itemModel, service } = utilsFunctions.extractMeta(strapi.plugins);
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

  updateBranch: async (toUpdate, masterEntity, parentItem, operations) => {
    const { pluginName, itemModel, service } = utilsFunctions.extractMeta(strapi.plugins);
    const databaseModel = strapi.query(itemModel.modelName, pluginName);
    return Promise.all(
      toUpdate.map(async (item) => {
        operations.update = true;
        const { id, updated, parent, master, related, items, ...params } = item;
        let currentItem;
        if (updated) {
          const relatedItem =
            isNil(related) || params.type === itemType.EXTERNAL
              ? []
              : related;
          await databaseModel
            .update(
              { id },
              { related: [] },
            ); // clearing the relation to get it updated properly and not duplicate _morph records
          currentItem = await databaseModel
            .update(
              { id },
              {
                ...params,
                related: isArray(relatedItem) ? relatedItem : [relatedItem],
                master: masterEntity,
                parent: parentItem ? { ...parentItem, _id: parentItem.id } : null,
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
    );
  },
  getBranchName: (item) => {
    const hasId = !isNil(item.id);
    const toRemove = item.removed;
    if (hasId && !toRemove) {
      return 'toUpdate';
    }
    if (hasId && toRemove) {
      return 'toRemove';
    }
    if (!hasId && !toRemove) {
      return 'toCreate';
    }
  },

  analyzeBranch: (items = [], masterEntity = null, parentItem = null, prevOperations = {}) => {
    const { service } = utilsFunctions.extractMeta(strapi.plugins);
    const { toCreate, toRemove, toUpdate } = items
      .reduce((acc, _) => {
          const branchName = service.getBranchName(_);
          if (branchName) {
            return { ...acc, [branchName]: [...acc[branchName], _] };
          }
          return acc;
        },
        { toRemove: [], toCreate: [], toUpdate: [] },
      );
    const operations = {
      create: prevOperations.create || !!toCreate.length,
      update: prevOperations.update || !!toUpdate.length,
      remove: prevOperations.remove || !!toRemove.length,
    };
    return utilsFunctions.checkDuplicatePath(parentItem || masterEntity, toCreate.concat(toUpdate))
      .then(() => Promise.all(
        [
          service.createBranch(toCreate, masterEntity, parentItem, operations),
          service.removeBranch(toRemove, operations),
          service.updateBranch(toUpdate, masterEntity, parentItem, operations),
        ],
      ));
  },

  sanitizeTreeStructure: (entity) => {
    const { masterModel, itemModel } = utilsFunctions.extractMeta(strapi.plugins);
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
