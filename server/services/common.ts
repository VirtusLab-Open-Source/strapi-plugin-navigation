import { find, get, isEmpty, isNil, last, map, upperFirst } from "lodash";
import pluralize from "pluralize";
import { Id, StrapiContentType, StrapiContext, StrapiStore, StringMap } from "strapi-typed";
//@ts-ignore
import { sanitize } from '@strapi/utils';
import { ContentTypeEntity, ICommonService, Navigation, NavigationActions, NavigationActionsPerItem, NavigationItem, NavigationItemEntity, NavigationItemRelated, NavigationPluginConfig, NestedStructure, RelatedRef, ToBeFixed } from "../../types";
import { configSetupStrategy } from "../config";
import { addI18nWhereClause } from "../i18n";
import { checkDuplicatePath, extractMeta, getPluginService, isContentTypeEligible, KIND_TYPES, singularize } from "../utils";

const commonService: (context: StrapiContext) => ICommonService = ({ strapi }) => ({
  analyzeBranch(
    items: NestedStructure<NavigationItem>[] = [],
    masterEntity: Navigation | null = null,
    parentItem: NavigationItemEntity | null = null,
    prevOperations: NavigationActions = {},
  ): Promise<NavigationActionsPerItem[]> {
    const commonService = getPluginService<ICommonService>('common');
    const { toCreate, toRemove, toUpdate } = items
      .reduce((acc: NavigationActionsPerItem, _) => {
        const branchName: keyof NavigationActionsPerItem | void = commonService.getBranchName(_);
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
    return checkDuplicatePath(parentItem || masterEntity, toCreate.concat(toUpdate))
      .then(() => Promise.all(
        [
          commonService.createBranch(toCreate, masterEntity, parentItem, operations),
          commonService.removeBranch(toRemove, operations),
          commonService.updateBranch(toUpdate, masterEntity, parentItem, operations),
        ],
      ));
  },

  async configContentTypes(viaSettingsPage: boolean = false): Promise<StrapiContentType<ToBeFixed>[]> {
    const commonService = getPluginService<ICommonService>('common');
    const pluginStore = await commonService.getPluginStore()
    const config: NavigationPluginConfig = await pluginStore.get({ key: 'config' });
    const eligibleContentTypes =
      await Promise.all(
        config.contentTypes
          .filter(contentType => !!strapi.contentTypes[contentType] && isContentTypeEligible(contentType))
          .map(
            async (key) => {
              const item = strapi.contentTypes[key];

              const { kind, options, uid } = item;
              const { draftAndPublish } = options;

              const isSingleType = kind === KIND_TYPES.SINGLE;
              const isSingleTypeWithPublishFlow = isSingleType && draftAndPublish;

              const returnType = (available: boolean) => ({
                key,
                available,
              });

              if (isSingleType) {
                if (isSingleTypeWithPublishFlow) {
                  const itemsCountOrBypass = isSingleTypeWithPublishFlow ?
                    await strapi.query<StrapiContentType<ToBeFixed>>(uid).count({
                      where: {
                        published_at: { $notNull: true },
                      },
                    }) :
                    true;
                  return returnType(itemsCountOrBypass !== 0);
                }
                const isAvailable = await strapi.query<StrapiContentType<ToBeFixed>>(uid).count({});
                return isAvailable !== 0 ?
                  returnType(true) :
                  (viaSettingsPage ? returnType(false) : undefined);
              }
              return returnType(true);
            },
          ),
      )

    return eligibleContentTypes
      .filter(key => key)
      .map((value) => {
        if (value === undefined) return;
        const { key, available } = value;
        const item = strapi.contentTypes[key];
        const relatedField = (item.associations || []).find((_: ToBeFixed) => _.model === 'navigationitem');
        const { uid, options, info, collectionName, modelName, apiName, plugin, kind, pluginOptions } = item;
        const { visible = true } = pluginOptions['content-manager'] || {};
        const { name, description } = info;
        const { hidden, templateName, draftAndPublish } = options;
        const findRouteConfig = find(get(strapi.api, `[${modelName}].config.routes`, []),
          route => route.handler.includes('.find'));
        const findRoutePath = findRouteConfig && findRouteConfig.path.split('/')[1];
        const apiPath = findRoutePath && (findRoutePath !== apiName) ? findRoutePath : apiName || modelName;
        const isSingle = kind === KIND_TYPES.SINGLE;
        const endpoint = isSingle ? apiPath : pluralize(apiPath);
        const relationName = singularize(modelName);
        const relationNameParts = typeof uid === 'string' ? last((uid).split('.'))!.split('-') : [];
        const contentTypeName = relationNameParts.length > 1 ? relationNameParts.reduce(
          (prev, curr) => `${prev}${upperFirst(curr)}`, '') : upperFirst(modelName);
        const labelSingular = name ||
          (upperFirst(relationNameParts.length > 1 ? relationNameParts.join(' ') : relationName));
        return {
          uid,
          name: relationName,
          draftAndPublish,
          isSingle,
          description,
          collectionName,
          contentTypeName,
          label: isSingle ? labelSingular : pluralize(name || labelSingular),
          relatedField: relatedField ? relatedField.alias : undefined,
          labelSingular: singularize(labelSingular),
          endpoint,
          plugin,
          available: available && !hidden,
          visible,
          templateName,
        };
      })
      .filter((item) => viaSettingsPage || (item && item.available));
  },

  async createBranch(
    items,
    masterEntity,
    parentItem,
    operations,
  ) {
    const commonService = getPluginService<ICommonService>('common');
    const { itemModel } = extractMeta(strapi.plugins);

    return await Promise.all<NavigationActions[]>(
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
          .query<NavigationItemEntity>(itemModel.uid)
          .create({ data, populate: ['related'] });
        return !isEmpty(item.items)
          ? commonService.createBranch(
            item.items,
            masterEntity,
            navigationItem,
            operations,
          )
          : operations;
      }),
    );
  },

  getBranchName(
    item: NavigationItem
  ): keyof NavigationActionsPerItem | void {
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

  async getContentTypeItems(uid: string, query: StringMap<string>): Promise<ContentTypeEntity[]> {
    const commonService = getPluginService<ICommonService>('common');
    const pluginStore = await commonService.getPluginStore();
    const config: NavigationPluginConfig = await pluginStore.get({ key: 'config' });
    const where = await addI18nWhereClause({
      strapi,
      previousWhere: {},
      query,
      modelUid: uid,
    })
    try {
      const contentTypeItems = await strapi.query<StrapiContentType<ToBeFixed>>(uid).findMany({
        populate: config.contentTypesPopulate[uid] || [],
        where,
      });
      return contentTypeItems;
    } catch (err) {
      return [];
    }
  },

  async getIdsRelated(relatedItems, master): Promise<Id[] | void> {
    if (relatedItems) {
      return (
        await Promise.all(
          relatedItems.map(async (relatedItem) => {
            try {
              const model = strapi.query<NavigationItemRelated>(
                "plugin::navigation.navigations-items-related"
              );
              const entity = await model.findOne({
                where: {
                  related_id: relatedItem.refId,
                  related_type: relatedItem.ref,
                  field: relatedItem.field,
                  master,
                },
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
          })
        )
      ).reduce<Id[]>(
        (acc, id) => (id ? acc.concat([id]) : acc),
        []
      );
    }
  },

  async getPluginStore(): Promise<StrapiStore> {
    return await strapi.store({ type: 'plugin', name: 'navigation' });
  },

  async getRelatedItems(entityItems): Promise<NavigationItemEntity<ContentTypeEntity>[]> {
    const commonService = getPluginService<ICommonService>('common');
    const pluginStore = await commonService.getPluginStore();
    const config: NavigationPluginConfig = await pluginStore.get({ key: 'config' });
    const relatedTypes: Set<string> = new Set(entityItems.flatMap((item) => get(item.related, 'related_type', '')));
    const groupedItems = Array.from(relatedTypes).filter((relatedType) => relatedType).reduce((
      acc: { [uid: string]: NavigationItemRelated[] },
      relatedType
    ) => Object.assign(acc, {
      [relatedType]: [
        ...(acc[relatedType] || []),
        ...entityItems
          .filter((item => get(item.related, 'related_type') === relatedType))
          .flatMap((item) => Object.assign(item.related, { navigationItemId: item.id })),
      ],
    }), {});

    const data: Map<number, ContentTypeEntity> = new Map(
      (
        await Promise.all(
          Object.entries(groupedItems)
            .map(async ([model, related]) => {
              const relationData = await strapi
                .query<StrapiContentType<ToBeFixed>>(model)
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
                        ({ related_id }) => related_id === _.id!.toString())?.navigationItemId,
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
          return Object.assign(item, { related: relatedData });
        }
        return { ...item, related: null };
      });
  },

  removeBranch(
    items: NestedStructure<NavigationItem>[] = [],
    operations: NavigationActions = {}
  ) {
    const commonService = getPluginService<ICommonService>('common');
    const { itemModel } = extractMeta(strapi.plugins);
    return Promise.all(
      items
        .filter(item => item.id)
        .map(async (item) => {
          operations.remove = true;
          const { id, related, master } = item;
          await Promise.all([
            strapi
              .query<NavigationItem>(itemModel.uid)
              .delete({ where: { id } }),
            this.removeRelated(related, master),
          ]);
          return !isEmpty(item.items)
            ? commonService.removeBranch(
              item.items,
              operations,
            )
            : operations;
        }),
    );
  },

  removeRelated(
    relatedItems: RelatedRef[],
    master: number,
  ): ToBeFixed {
    return Promise.all((relatedItems || []).map(relatedItem => {
      const model = strapi.query<NavigationItemRelated>('plugin::navigation.navigations-items-related');
      const entityToRemove = {
        master,
        field: relatedItem.field,
        related_id: relatedItem.refId,
        related_type: relatedItem.ref,
      };
      return model.delete({ where: entityToRemove });
    }));
  },

  setDefaultConfig(): Promise<NavigationPluginConfig> {
    return configSetupStrategy({ strapi });
  },

  async updateBranch(
    toUpdate: NestedStructure<NavigationItem>[],
    masterEntity: Navigation | null,
    parentItem: NavigationItemEntity | null,
    operations: NavigationActions
  ) {
    const commonService = getPluginService<ICommonService>('common');
    const { itemModel } = extractMeta(strapi.plugins);
    const databaseModel = strapi.query<NavigationItemEntity>(itemModel.uid);
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
          ? commonService.analyzeBranch(
            items,
            masterEntity,
            currentItem,
            operations,
          )
          : operations;
      }),
    );
  },

  async emitEvent(uid, event, entity) {
    // TODO: This could be enhanced by reacting not only with webhook but by firing all listeners in Navigation Event Hub
    // Any developer could register new listener for any event in Navigation Plugin
    // For now there is only one event 'navigation.update' so implementing Event hub is not valid.
    const model: ToBeFixed = strapi.getModel(uid);
    const sanitizedEntity = await sanitize.sanitizers.defaultSanitizeOutput(model, entity);
  
    strapi.webhookRunner.eventHub.emit(event, {
      model: model.modelName,
      entry: sanitizedEntity,
    });
  }
});

export default commonService;
