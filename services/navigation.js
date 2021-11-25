'use strict';

const { isUuid } = require('uuidv4');
const slugify = require('slugify');
const pluralize = require('pluralize');
const { sanitizeEntity } = require('strapi-utils');
const {
  isEmpty,
  isObject,
  isNil,
  toNumber,
  isNaN,
  find,
  first,
  get,
  last,
  upperFirst,
  isString,
  map,
} = require('lodash');
const { KIND_TYPES } = require('./utils/constant');
const utilsFunctions = require('./utils/functions');
const { renderType } = require('../models/navigation');
const { type: itemType, additionalFields: configAdditionalFields } = require('../models/navigationItem');

/**
 * navigation.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const excludedContentTypes = ['strapi::'];

const contentTypesNameFieldsDefaults = [
  'title',
  'subject',
  'name',
];
const getContentTypesNameFields = () => get(
  strapi.config,
  'plugins.navigation.contentTypesNameFields',
  {},
);

module.exports = {
  isMongoDB() {
    const { pluginName, model } = utilsFunctions.extractMeta(strapi.plugins);
    const orm = strapi.query(model.modelName, pluginName).model.orm;
    return orm === 'mongoose';
  },
  // Get plugin configuration
  async config() {
    const { pluginName, service, audienceModel } = utilsFunctions.extractMeta(strapi.plugins);
    const additionalFields = get(strapi.config, 'plugins.navigation.additionalFields', []);
    let extendedResult = {};
    const result = {
      contentTypes: await service.configContentTypes(),
      contentTypesNameFields: {
        default: contentTypesNameFieldsDefaults,
        ...getContentTypesNameFields(),
      },
      allowedLevels: get(strapi.config, 'plugins.navigation.allowedLevels'),
      additionalFields,
    };

    if (additionalFields.includes(configAdditionalFields.AUDIENCE)) {
      const audienceItems = await strapi
        .query(audienceModel.modelName, pluginName)
        .find({
          _limit: -1,
        });
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

  async configContentTypes() {
    const eligibleContentTypes =
      await Promise.all(
        strapi.config.get('plugins.navigation.relatedContentTypes', [])
          .filter(contentType => !!strapi.contentTypes[contentType])
          .map(
            async (key) => {
              if (find(excludedContentTypes, name => key.includes(name))) { // exclude internal content types
                return;
              }
              const item = strapi.contentTypes[key];
              const { kind, options, uid } = item;
              const { draftAndPublish } = options;

              const isSingleType = kind === KIND_TYPES.SINGLE;
              const isSingleTypeWithPublishFlow = isSingleType && draftAndPublish;

              const returnType = (available) => ({
                key,
                available,
              });

              if (isSingleType) {
                if (isSingleTypeWithPublishFlow) {
                  const itemsCountOrBypass = isSingleTypeWithPublishFlow ?
                    await strapi.query(uid).count({
                      _publicationState: 'live',
                    }) :
                    true;
                  return returnType(itemsCountOrBypass !== 0);
                }
                const isAvailable = await strapi.query(uid).count();
                return isAvailable === 1 ? returnType(true) : undefined;
              }
              return returnType(true);
            },
          ),
      );
    return eligibleContentTypes
      .filter(key => key)
      .map(({ key, available }) => {
        const item = strapi.contentTypes[key];
        const relatedField = (item.associations || []).find(_ => _.model === 'navigationitem');
        const { uid, options, info, collectionName, modelName, apiName, plugin, kind } = item;
        const { name, description } = info;
        const { isManaged, hidden, templateName } = options;
        const findRouteConfig = find(get(strapi.api, `[${modelName}].config.routes`, []),
          route => route.handler.includes('.find'));
        const findRoutePath = findRouteConfig && findRouteConfig.path.split('/')[1];
        const apiPath = findRoutePath && (findRoutePath !== apiName) ? findRoutePath : apiName || modelName;
        const isSingle = kind === KIND_TYPES.SINGLE;
        const endpoint = isSingle ? apiPath : pluralize(apiPath);
        const relationName = utilsFunctions.singularize(modelName);
        const relationNameParts = last(uid.split('.')).split('-');
        const contentTypeName = relationNameParts.length > 1 ? relationNameParts.reduce(
          (prev, curr) => `${prev}${upperFirst(curr)}`, '') : upperFirst(modelName);
        const labelSingular = name ||
          (upperFirst(relationNameParts.length > 1 ? relationNameParts.join(' ') : relationName));
        return {
          uid,
          name: relationName,
          isSingle,
          description,
          collectionName,
          contentTypeName,
          label: isSingle ? labelSingular : pluralize(name || labelSingular),
          relatedField: relatedField ? relatedField.alias : undefined,
          labelSingular: utilsFunctions.singularize(labelSingular),
          endpoint,
          plugin,
          available,
          visible: (isManaged || isNil(isManaged)) && !hidden,
          templateName,
        };
      })
      .filter((item) => item && item.visible);
  },

  // Get all available navigations
  async get() {
    const { pluginName, masterModel } = utilsFunctions.extractMeta(strapi.plugins);
    const entities = await strapi
      .query(masterModel.modelName, pluginName)
      .find({
        _limit: -1,
      }, []);
    return entities.map((_) => sanitizeEntity(_, { model: masterModel }));
  },

  // Get navigation by id with related
  async getById(id) {
    const { pluginName, masterModel, itemModel } = utilsFunctions.extractMeta(strapi.plugins);
    const entity = await strapi
      .query(masterModel.modelName, pluginName)
      .findOne({ id });

    const entityItems = await strapi
      .query(itemModel.modelName, pluginName)
      .find({
        master: id,
        _limit: -1,
        _sort: 'order:asc',
      });
    const entities = await this.getRelatedItems(entityItems);
    return {
      ...sanitizeEntity(entity,
        { model: masterModel },
      ),
      items: utilsFunctions.buildNestedStructure(entities),
    };
  },

  async post(payload, auditLog) {
    const { pluginName, masterModel, service } = utilsFunctions.extractMeta(strapi.plugins);
    const { name, visible } = payload;

    const existingEntity = await strapi
      .query(masterModel.modelName, pluginName)
      .create({
        name,
        slug: slugify(name).toLowerCase(),
        visible: !!visible,
      });

    return service
      .createBranch(payload.items, existingEntity, null)
      .then(() => service.getById(existingEntity.id))
      .then((newEntity) => {
        utilsFunctions.sendAuditLog(auditLog, 'onChangeNavigation',
          { actionType: 'CREATE', oldEntity: existingEntity, newEntity });
        return newEntity;
      });
  },

  async put(id, payload, auditLog) {
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
          visible: !!visible,
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
        utilsFunctions.sendAuditLog(auditLog, 'onChangeNavigation',
          { actionType, oldEntity: existingEntity, newEntity });
        return newEntity;
      });
  },

  async render(idOrSlug, type = renderType.FLAT, menuOnly = false) {
    const { service } = utilsFunctions.extractMeta(
      strapi.plugins,
    );
    const findById = !isNaN(toNumber(idOrSlug)) || isUuid(idOrSlug);
    const criteria = findById ? { id: idOrSlug } : { slug: idOrSlug };
    const itemCriteria = menuOnly ? { menuAttached: true } : {};

    return service.renderType(type, criteria, itemCriteria);
  },

  async renderChildren(
    idOrSlug,
    childUIKey,
    type = renderType.FLAT,
    menuOnly = false,
  ) {
    const { service } = utilsFunctions.extractMeta(strapi.plugins);
    const findById = !isNaN(toNumber(idOrSlug)) || isUuid(idOrSlug);
    const criteria = findById ? { id: idOrSlug } : { slug: idOrSlug };
    const filter = type === renderType.FLAT ? null : childUIKey;

    const itemCriteria = {
      ...(menuOnly && { menuAttached: true }),
      ...(type === renderType.FLAT ? { uiRouterKey: childUIKey } : {}),
    };

    return service.renderType(type, criteria, itemCriteria, filter);
  },

  async renderType(type = renderType.FLAT, criteria = {}, itemCriteria = {}, filter = null) {
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
      const entities = await strapi.query(itemModel.modelName, pluginName).find(
        {
          master: entity.id,
          ...itemCriteria,
          _limit: -1,
          _sort: 'order:asc',
        },
        ['related', 'audience'],
      );

      if (!entities) {
        return [];
      }
      const items = await this.getRelatedItems(entities);
      const { contentTypes, contentTypesNameFields } = await service.config();

      switch (type?.toLowerCase()) {
        case renderType.TREE:
        case renderType.RFR:
          const getTemplateName = await utilsFunctions.templateNameFactory(items, strapi, contentTypes);
          const itemParser = (item, path = '', field) => {
            const isExternal = item.type === itemType.EXTERNAL;
            const parentPath = isExternal ? undefined : `${path === '/' ? '' : path}/${item.path === '/'
              ? ''
              : item.path}`;
            const slug = isString(parentPath) ? slugify(
              (first(parentPath) === '/' ? parentPath.substring(1) : parentPath).replace(/\//g, '-')) : undefined;
            const lastRelated = item.related ? last(item.related) : undefined;
            return {
              id: item.id,
              title: utilsFunctions.composeItemTitle(item, contentTypesNameFields, contentTypes),
              menuAttached: item.menuAttached,
              path: isExternal ? item.externalPath : parentPath,
              type: item.type,
              uiRouterKey: item.uiRouterKey,
              slug: !slug && item.uiRouterKey ? slugify(item.uiRouterKey) : slug,
              external: isExternal,
              related: isExternal || !lastRelated ? undefined : {
                ...lastRelated,
                __templateName: getTemplateName(lastRelated.relatedType || lastRelated.__contentType, lastRelated.id),
              },
              audience: !isEmpty(item.audience) ? item.audience.map(aItem => aItem.key) : undefined,
              items: isExternal ? undefined : service.renderTree({
                items,
                id: item.id,
                field,
                path: parentPath,
                itemParser,
              }),
            };
          };
          const treeStructure = service.renderTree({
            items,
            field: 'parent',
            itemParser,
          });

          const filteredStructure = filter
            ? treeStructure.filter((item) => item.uiRouterKey === filter)
            : treeStructure;

          if (type === renderType.RFR) {
            return service.renderRFR({
              items: filteredStructure,
              contentTypes,
            });
          }
          return filteredStructure;
        default:
          return items
            .filter(utilsFunctions.filterOutUnpublished)
            .map((item) => ({
              ...sanitizeEntity(item, { model: itemModel }),
              audience: item.audience?.map(_ => _.key),
              title: utilsFunctions.composeItemTitle(item, contentTypesNameFields, contentTypes),
              related: item.related?.map(({ localizations, ...item }) => item),
              items: null,
            }));
      }
    }
    throw strapi.errors.notFound();
  },

  renderTree({
    items = [],
    id = null,
    field = 'parent',
    path = '',
    itemParser = (i) => i,
  }) {
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
      .filter(utilsFunctions.filterOutUnpublished)
      .map(item => itemParser({
        ...item,
      }, path, field));
  },

  renderRFR({ items, parent = null, parentNavItem = null, contentTypes = [] }) {
    const { service } = utilsFunctions.extractMeta(strapi.plugins);
    let pages = {};
    let nav = {};
    let navItems = [];

    items.forEach(item => {
      const { items: itemChilds, ...itemProps } = item;
      const itemNav = service.renderRFRNav(itemProps);
      const itemPage = service.renderRFRPage({
        item: itemProps,
        parent,
      });

      if (item.type === itemType.INTERNAL) {
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
          .filter(navItem => navItem.type === itemType.INTERNAL.toLowerCase());
        if (!isEmpty(navLevel))
          nav = {
            ...nav,
            [parent]: [].concat(parentNavItem ? parentNavItem : [], navLevel),
          };
      }

      if (!isEmpty(itemChilds)) {
        const { nav: nestedNavs } = service.renderRFR({
          items: itemChilds,
          parent: itemPage.id,
          parentNavItem: itemNav,
          contentTypes,
        });
        const { pages: nestedPages } = service.renderRFR({
          items: itemChilds.filter(child => child.type === itemType.INTERNAL),
          parent: itemPage.id,
          parentNavItem: itemNav,
          contentTypes,
        });
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

  renderRFRPage({ item, parent }) {
    const { uiRouterKey, title, path, slug, related, type, audience, menuAttached } = item;
    const { __contentType, id, __templateName } = related || {};
    const contentType = __contentType || '';
    return {
      id: uiRouterKey,
      title,
      templateName: __templateName,
      related: type === itemType.INTERNAL ? {
        contentType,
        id,
      } : undefined,
      path,
      slug,
      parent,
      audience,
      menuAttached,
    };
  },

  renderRFRNav(item) {
    const { uiRouterKey, title, path, type, audience } = item;
    return {
      label: title,
      type: type.toLowerCase(),
      page: type === itemType.INTERNAL ? uiRouterKey : undefined,
      url: type === itemType.EXTERNAL ? path : undefined,
      audience,
    };
  },

  createBranch(items = [], masterEntity = null, parentItem = null, operations = {}) {
    const { pluginName, itemModel, service } = utilsFunctions.extractMeta(strapi.plugins);
    return Promise.all(
      items.map(async (item) => {
        operations.create = true;
        const { parent, master, related, ...params } = item;
        const relatedItems = await this.getIdsRelated(related, master);
        const navigationItem = await strapi
          .query(itemModel.modelName, pluginName)
          .create({
            ...params,
            related: relatedItems,
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

  removeBranch(items = [], operations = {}) {
    const { pluginName, itemModel, service } = utilsFunctions.extractMeta(strapi.plugins);
    return Promise.all(
      items
        .filter(item => item.id)
        .map(async (item) => {
          operations.remove = true;
          const { id, related, master } = item;
          await Promise.all([
            strapi
              .query(itemModel.modelName, pluginName)
              .delete({ id }),
            this.removeRelated(related, master),
          ]);
          return !isEmpty(item.items)
            ? service.removeBranch(
              item.items,
              operations,
            )
            : operations;
        }),
    );
  },

  async updateBranch(toUpdate, masterEntity, parentItem, operations) {
    const { pluginName, itemModel, service } = utilsFunctions.extractMeta(strapi.plugins);
    const databaseModel = strapi.query(itemModel.modelName, pluginName);
    return Promise.all(
      toUpdate.map(async (item) => {
        operations.update = true;
        const { id, updated, parent, master, related, items, ...params } = item;
        let currentItem;
        if (updated) {
          const relatedItems = await this.getIdsRelated(related, master);
          currentItem = await databaseModel
            .update(
              { id },
              {
                ...params,
                related: relatedItems,
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
  getBranchName(item) {
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

  analyzeBranch(items = [], masterEntity = null, parentItem = null, prevOperations = {}) {
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

  async getRelatedItems(entityItems) {
    const relatedTypes = new Set(entityItems.flatMap((item) => map(item.related, 'relatedType')));
    const groupedItems = Array.from(relatedTypes).reduce(
      (acc, relatedType) => Object.assign(acc, {
        [relatedType]: [
          ...(acc[relatedType] || []),
          ...entityItems
            .filter((item => item?.related.some(related => related.relatedType === relatedType)))
            .flatMap((item) => item.related.map(related => Object.assign(related, { navigationItemId: item.id }))),
        ],
      }),
      {});

    const data = new Map(
      (
        await Promise.all(
          Object.entries(groupedItems)
            .map(async ([model, related]) => {
              const relationData = await strapi.query(model).find({ id_in: map(related, 'relatedId') });
              return relationData
                .flatMap(_ =>
                  Object.assign(
                    _,
                    {
                      __contentType: model,
                      navigationItemId: related.find(
                        ({ relatedId }) => relatedId === _.id.toString())?.navigationItemId,
                    },
                  ),
                );
            }),
        )
      )
        .flat(1)
        .map(_ => [_.navigationItemId, _]),
    );
    return entityItems
      .map(({ related, ...item }) => {
        const relatedData = data.get(item.id);
        if (relatedData) {
          return Object.assign(item, { related: [relatedData] });
        }
        return item;
      });
  },

  getIdsRelated(relatedItems, master) {
    if (relatedItems) {
      return Promise.all(relatedItems.map(async relatedItem => {
        try {
          const query = {
            related_id: relatedItem.refId,
            related_type: relatedItem.ref,
            field: relatedItem.field,
            master,
          };
          const model = strapi.query('navigations_items_related', 'navigation');
          const entity = await model
            .findOne(query);
          if (!entity) {
            const newEntity = {
              master,
              order: 1,
              field: relatedItem.field,
              related_id: relatedItem.refId,
              related_type: relatedItem.ref,
            };
            return model.create(newEntity).then(({ id }) => id);
          }
          return entity.id;
        } catch (e) {
          console.error(e);
        }
      }));
    }
  },

  removeRelated(relatedItems, master) {
    return Promise.all(relatedItems.map(relatedItem => {
      const model = strapi.query('navigations_items_related', 'navigation');
      const entityToRemove = {
        master,
        field: relatedItem.field,
        related_id: relatedItem.refId,
        related_type: relatedItem.ref,
      };
      return model.delete(entityToRemove).then(({ id }) => id);
    }));
  },
  sanitizeTreeStructure(entity) {
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
