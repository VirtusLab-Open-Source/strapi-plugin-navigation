const pluralize = require('pluralize');
const {
  find,
  get,
  isNil,
  isObject,
  isEmpty,
  last,
  upperFirst,
  map,
  toNumber,
  isString,
  first,
} = require('lodash');
const { validate: isUuid } = require('uuid');
const slugify = require('slugify');
const { KIND_TYPES, ALLOWED_CONTENT_TYPES, RESTRICTED_CONTENT_TYPES } = require('./utils/constant');
const utilsFunctionsFactory = require('./utils/functions');
const { renderType } = require('../content-types/navigation/lifecycle');
const { type: itemType, additionalFields: configAdditionalFields } = require('../content-types/navigation-item').lifecycle;
const { NotFoundError } = require('@strapi/utils').errors
const contentTypesNameFieldsDefaults = ['title', 'subject', 'name'];

module.exports = ({ strapi }) => {
  const utilsFunctions = utilsFunctionsFactory(strapi);

  return {
    // Get all available navigations
    async get() {
      const { masterModel } = utilsFunctions.extractMeta(strapi.plugins);
      const entities = await strapi
        .query(masterModel.uid)
        .findMany({
          limit: Number.MAX_SAFE_INTEGER,
        });
      return entities;
    },

    async getById(id) {
      const { masterModel, itemModel } = utilsFunctions.extractMeta(strapi.plugins);
      const entity = await strapi
        .query(masterModel.uid)
        .findOne({ where: { id } });

      const entityItems = await strapi
        .query(itemModel.uid)
        .findMany({
          where: {
            master: id,
          },
          limit: Number.MAX_SAFE_INTEGER,
          sort: ['order:asc'],
          populate: ['related', 'parent', 'audience']
        });
      const entities = await this.getRelatedItems(entityItems);
      return {
        ...entity,
        items: utilsFunctions.buildNestedStructure(entities),
      };
    },

    async restart() {
      setImmediate(() => strapi.reload());
    },

    // Get plugin config
    async config(viaSettingsPage = false) {
      const { audienceModel } = utilsFunctions.extractMeta(strapi.plugins);
      const pluginStore = await this.getPluginStore()
      const config = await pluginStore.get({ key: 'config' });
      const additionalFields = config.additionalFields;
      const contentTypesNameFields = config.contentTypesNameFields;
      const contentTypesPopulate = config.contentTypesPopulate;
      const allowedLevels = config.allowedLevels;
      const isGQLPluginEnabled = !isNil(strapi.plugin('graphql'));

      let extendedResult = {
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        restrictedContentTypes: RESTRICTED_CONTENT_TYPES,
      };
      const result = {
        contentTypes: await this.configContentTypes(viaSettingsPage),
        contentTypesNameFields: {
          default: contentTypesNameFieldsDefaults,
          ...(isObject(contentTypesNameFields) ? contentTypesNameFields : {}),
        },
        contentTypesPopulate: {
          ...(isObject(contentTypesPopulate) ? contentTypesPopulate : {}),
        },
        allowedLevels,
        additionalFields,
        isGQLPluginEnabled: viaSettingsPage ? isGQLPluginEnabled : undefined,
      };

      if (additionalFields.includes(configAdditionalFields.AUDIENCE)) {
        const audienceItems = await strapi
          .query(audienceModel.uid)
          .findMany({
            limit: Number.MAX_SAFE_INTEGER,
          });
        extendedResult = {
          ...extendedResult,
          availableAudience: audienceItems,
        };
      }
      return {
        ...result,
        ...extendedResult,
      };
    },

    async updateConfig(newConfig) {
      const pluginStore = await this.getPluginStore()
      await pluginStore.set({ key: 'config', value: newConfig });
    },

    async getPluginStore() {
      return await strapi.store({ type: 'plugin', name: 'navigation' });
    },

    async setDefaultConfig() {
      const pluginStore = await this.getPluginStore()
      const config = await pluginStore.get({ key: 'config' });
      const pluginDefaultConfig = await strapi.plugin('navigation').config

      // If new value gets introduced to the config it either is read from plugin store or from default plugin config
      // This is fix for backwards compatibility and migration of config to newer version of the plugin
      const defaultConfigValue = {
        additionalFields: get(config, 'additionalFields', pluginDefaultConfig('additionalFields')),
        contentTypes: get(config, 'contentTypes', pluginDefaultConfig('contentTypes')),
        contentTypesNameFields: get(config, 'contentTypesNameFields', pluginDefaultConfig('contentTypesNameFields')),
        contentTypesPopulate: get(config, 'contentTypesPopulate', pluginDefaultConfig('contentTypesPopulate')),
        allowedLevels: get(config, 'allowedLevels', pluginDefaultConfig('allowedLevels')),
        gql: get(config, 'gql', pluginDefaultConfig('gql')),
      }
      pluginStore.set({ key: 'config', value: defaultConfigValue });

      return defaultConfigValue;
    },

    async restoreConfig() {
      const pluginStore = await this.getPluginStore()
      await pluginStore.delete({ key: 'config' });
      await strapi.plugin('navigation').service('navigation').setDefaultConfig();
    },

    async configContentTypes(viaSettingsPage = false) {
      const pluginStore = await this.getPluginStore()
      const config = await pluginStore.get({ key: 'config' });
      const eligibleContentTypes =
        await Promise.all(
          config.contentTypes
            .filter(contentType => !!strapi.contentTypes[contentType] && utilsFunctions.isContentTypeEligible(contentType))
            .map(
              async (key) => {
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
                        publicationState: 'live',
                      }) :
                      true;
                    return returnType(itemsCountOrBypass !== 0);
                  }
                  const isAvailable = await strapi.query(uid).count();
                  return isAvailable === 1 ? 
                    returnType(true) : 
                    (viaSettingsPage ? returnType(false) : undefined);
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
          const { uid, options, info, collectionName, modelName, apiName, plugin, kind, pluginOptions } = item;
          const { visible = true } =  pluginOptions['content-manager'] || {};
          const { name, description } = info;
          const { hidden, templateName } = options;
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
            available: available && !hidden,
            visible,
            templateName,
          };
        })
        .filter((item) => viaSettingsPage || (item && item.available));
    },

    async getRelatedItems(entityItems) {
      const pluginStore = await strapi.plugin('navigation').service('navigation').getPluginStore()
      const config = await pluginStore.get({ key: 'config' });
      const relatedTypes = new Set(entityItems.flatMap((item) => get(item.related, 'related_type')));
      const groupedItems = Array.from(relatedTypes).filter((relatedType) => relatedType).reduce(
        (acc, relatedType) => Object.assign(acc, {
          [relatedType]: [
            ...(acc[relatedType] || []),
            ...entityItems
              .filter((item => item.related?.related_type === relatedType))
              .flatMap((item) => Object.assign(item.related, { navigationItemId: item.id })),
          ],
        }),
        {});

      const data = new Map(
        (
          await Promise.all(
            Object.entries(groupedItems)
              .map(async ([model, related]) => {
                const relationData = await strapi
                  .query(model)
                  .findMany({
                    where: {
                      id: { $in: map(related, 'related_id') },
                    },
                    populate: config.contentTypesPopulate[model] || []
                  });
                return relationData
                  .flatMap(_ =>
                    Object.assign(
                      _,
                      {
                        __contentType: model,
                        navigationItemId: related.find(
                          ({ related_id }) => related_id === _.id.toString())?.navigationItemId,
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

    async getContentTypeItems(model) {
      const pluginStore = await strapi.plugin('navigation').service('navigation').getPluginStore()
      const config = await pluginStore.get({ key: 'config' });
      try {
        const contentTypeItems = await strapi.query(model).findMany({
          populate: config.contentTypesPopulate[model] || []
        })
        return contentTypeItems;
      } catch (err) {
        return [];
      }
    },

    async post(payload, auditLog) {
      const { masterModel, service } = utilsFunctions.extractMeta(strapi.plugins);
      const { name, visible } = payload;
      const data = {
        name,
        slug: slugify(name).toLowerCase(),
        visible,
      }

      const existingEntity = await strapi
        .query(masterModel.uid)
        .create({ data });

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
      const { masterModel, service } = utilsFunctions.extractMeta(strapi.plugins);
      const { name, visible } = payload;

      const existingEntity = await service.getById(id);
      const entityNameHasChanged = existingEntity.name !== name || existingEntity.visible !== visible;
      if (entityNameHasChanged) {

        await strapi.query(masterModel.uid).update({
          where: { id },
          data: {
            name: entityNameHasChanged ? name : existingEntity.name,
            slug: entityNameHasChanged ? slugify(name).toLowerCase() : existingEntity.slug,
            visible,
          },
        });
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

      return service.renderType({ type, criteria, itemCriteria, filter });
    },

    async render({ idOrSlug, type = renderType.FLAT, menuOnly = false, rootPath = null }) {
      const { service } = utilsFunctions.extractMeta(strapi.plugins);

      const findById = !isNaN(toNumber(idOrSlug)) || isUuid(idOrSlug);
      const criteria = findById ? { id: idOrSlug } : { slug: idOrSlug };
      const itemCriteria = menuOnly ? { menuAttached: true } : {};

      return service.renderType({ type, criteria, itemCriteria, rootPath });
    },

    async renderType({ type = renderType.FLAT, criteria = {}, itemCriteria = {}, filter = null, rootPath = null }) {
      const { pluginName, service, masterModel, itemModel } = utilsFunctions.extractMeta(
        strapi.plugins,
      );

      const entity = await strapi
        .query(masterModel.uid)
        .findOne({
          where: {
            ...criteria,
            visible: true,
          }
        });
      if (entity && entity.id) {
        const entities = await strapi.query(itemModel.uid).findMany({
          where: {
            master: entity.id,
            ...itemCriteria,
          },
          limit: Number.MAX_SAFE_INTEGER,
          sort: ['order:asc'],
          populate: ['related', 'audience', 'parent'],
        });

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
              const parentPath = isExternal ? undefined : `${path === '/' ? '' : path}/${first(item.path) === '/'
                ? item.path.substring(1)
                : item.path}`;
              const slug = isString(parentPath) ? slugify(
                (first(parentPath) === '/' ? parentPath.substring(1) : parentPath).replace(/\//g, '-')) : undefined;
              const lastRelated = item.related ? last(item.related) : undefined;
              return {
                id: item.id,
                title: utilsFunctions.composeItemTitle(item, contentTypesNameFields, contentTypes),
                menuAttached: item.menuAttached,
                order: item.order,
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

            const {
              items: itemsFilteredByPath,
              root: rootElement,
            } = utilsFunctions.filterByPath(items, rootPath);

            const treeStructure = service.renderTree({
              items: isNil(rootPath) ? items : itemsFilteredByPath,
              field: 'parent',
              id: get(rootElement, 'parent.id'),
              path: get(rootElement, 'parent.path'),
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
            const publishedItems = items
              .filter(utilsFunctions.filterOutUnpublished)
              .map((item) => ({
                ...item,
                audience: item.audience?.map(_ => _.key),
                title: utilsFunctions.composeItemTitle(item, contentTypesNameFields, contentTypes),
                related: last(item.related?.map(({ localizations, ...item }) => item)),
                items: null,
              }));
            return isNil(rootPath) ? publishedItems : utilsFunctions.filterByPath(publishedItems, rootPath).items;
        }
      }
      throw new NotFoundError();
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
        }, path, field))
        .sort((x, y) => {
          return x.order - y.order;
       });
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

    createBranch(items = [], masterEntity = null, parentItem = null, operations = {}) {
      const { itemModel, service } = utilsFunctions.extractMeta(strapi.plugins);
      return Promise.all(
        items.map(async (item) => {
          operations.create = true;
          const { parent, master, related, ...params } = item;
          const relatedItems = await this.getIdsRelated(related, master);
          const data = {
            ...params,
            related: relatedItems,
            master: masterEntity,
            parent: parentItem ? { ...parentItem, _id: parentItem.id } : null,
          }
          const navigationItem = await strapi
            .query(itemModel.uid)
            .create({ data, populate: ['related', 'items'] });
          return !isEmpty(item.items)
            ? service.createBranch(
              item.items,
              masterEntity,
              navigationItem,
              operations,
            )
            : operations;
        }),
      );
    },

    removeBranch(items = [], operations = {}) {
      const { itemModel, service } = utilsFunctions.extractMeta(strapi.plugins);
      return Promise.all(
        items
          .filter(item => item.id)
          .map(async (item) => {
            operations.remove = true;
            const { id, related, master } = item;
            await Promise.all([
              strapi
                .query(itemModel.uid)
                .delete({ where: { id } }),
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
      const { itemModel, service } = utilsFunctions.extractMeta(strapi.plugins);
      const databaseModel = strapi.query(itemModel.uid);
      return Promise.all(
        toUpdate.map(async (item) => {
          operations.update = true;
          const { id, updated, parent, master, related, items, ...params } = item;
          let currentItem;
          if (updated) {
            const relatedItems = await this.getIdsRelated(related, master);
            currentItem = await databaseModel
              .update({
                where: { id },
                data: {
                  ...params,
                  related: relatedItems,
                  master: masterEntity,
                  parent: parentItem ? { ...parentItem, _id: parentItem.id } : null,
                },
              });
          } else {
            currentItem = item;
          }
          return !isEmpty(items)
            ? service.analyzeBranch(
              items,
              masterEntity,
              currentItem,
              operations,
            )
            : operations;
        }),
      );
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

    getIdsRelated(relatedItems, master) {
      if (relatedItems) {
        return Promise.all(relatedItems.map(async relatedItem => {
          try {
            const model = strapi.query('plugin::navigation.navigations-items-related');
            const entity = await model
              .findOne({
                where: {
                  related_id: relatedItem.refId,
                  related_type: relatedItem.ref,
                  field: relatedItem.field,
                  master,
                }
              });
            if (!entity) {
              const newEntity = {
                master,
                order: 1,
                field: relatedItem.field,
                related_id: relatedItem.refId,
                related_type: relatedItem.ref,
              };
              return model.create({ data: newEntity }).then(({ id }) => id);
            }
            return entity.id;
          } catch (e) {
            console.error(e);
          }
        }));
      }
    },

    removeRelated(relatedItems, master) {
      return Promise.all((relatedItems || []).map(relatedItem => {
        const model = strapi.query('plugin::navigation.navigations-items-related');
        const entityToRemove = {
          master,
          field: relatedItem.field,
          related_id: relatedItem.refId,
          related_type: relatedItem.ref,
        };
        return model.delete({ where: entityToRemove });
      }));
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
  }
}