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
} = require('lodash');
const { KIND_TYPES } = require('./utils/constant');
const utilsFunctionsFactory = require('./utils/functions');
const { additionalFields: configAdditionalFields } = require('../content-types/navigation-item').lifecycle;

const excludedContentTypes = ['strapi::'];
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
          _limit: -1,
        }, []);
      return entities;
    },

    async getById(id) {
      const { masterModel, itemModel } = utilsFunctions.extractMeta(strapi.plugins);
      const entity = await strapi
        .query(masterModel.uid)
        .findOne({ id });

      const entityItems = await strapi
        .query(itemModel.uid)
        .findMany({
          where: {
            master: id,
          },
          paggination: {
            limit: -1,
          },
          sort: ['order:asc'],
          populate: ['related', 'parent']
        });
      const entities = await this.getRelatedItems(entityItems);
      return {
        ...entity,
        items: utilsFunctions.buildNestedStructure(entities),
      };
    },

    // Get plugin config
    async config() {
      const { pluginName, audienceModel } = utilsFunctions.extractMeta(strapi.plugins);
      const additionalFields = strapi.plugin(pluginName).config('additionalFields')
      const contentTypesNameFields = strapi.plugin(pluginName).config('contentTypesNameFields');
      const allowedLevels = strapi.plugin(pluginName).config('allowedLevels');

      let extendedResult = {};
      const result = {
        contentTypes: await strapi.plugin(pluginName).service('navigation').configContentTypes(),
        contentTypesNameFields: {
          default: contentTypesNameFieldsDefaults,
          ...(isObject(contentTypesNameFields) ? contentTypesNameFields : {}),
        },
        allowedLevels,
        additionalFields,
      };

      if (additionalFields.includes(configAdditionalFields.AUDIENCE)) {
        const audienceItems = await strapi
          .query(`plugin::${pluginName}.${audienceModel.modelName}`)
          .findMany({
            _limit: -1,
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

    async configContentTypes() {
      const eligibleContentTypes =
        await Promise.all(
          strapi.plugin('navigation').config('contentTypes')
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

    async getRelatedItems(entityItems) {
      const relatedTypes = new Set(entityItems.flatMap((item) => get(item.related, 'related_type')));
      const groupedItems = Array.from(relatedTypes).reduce(
        (acc, relatedType) => Object.assign(acc, {
          [relatedType]: [
            ...(acc[relatedType] || []),
            ...entityItems
              .filter((item => item?.related.related_type === relatedType))
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
                    id_in: map(related, 'relatedId')
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
      try {
        const contentTypeItems = await strapi.query(model).findMany()
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
            .create({ data });
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
      return Promise.all(relatedItems.map(relatedItem => {
        const model = strapi.query('plugin::navigation.navigations-items-related');
        const entityToRemove = {
          master,
          field: relatedItem.field,
          related_id: relatedItem.refId,
          related_type: relatedItem.ref,
        };
        return model.delete({ where: entityToRemove }).then(({ id }) => id);
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