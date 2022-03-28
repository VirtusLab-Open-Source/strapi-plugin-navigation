import pluralize from 'pluralize';
import slugify from 'slugify';
import { validate as isUuid } from 'uuid';
import {
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
} from 'lodash';

import { ALLOWED_CONTENT_TYPES, KIND_TYPES, RESTRICTED_CONTENT_TYPES } from './utils/constant';
import {
  buildNestedStructure,
  checkDuplicatePath,
  composeItemTitle,
  extractMeta,
  filterByPath,
  filterOutUnpublished,
  isContentTypeEligible,
  prepareAuditLog,
  sendAuditLog,
  singularize,
  templateNameFactory,
} from './utils/functions';
import { renderType } from '../content-types/navigation/lifecycle';
import { type as itemType, additionalFields as configAdditionalFields } from '../content-types/navigation-item/lifecycle';
//@ts-ignore
import errors from '@strapi/utils';
import { StrapiContentType, StrapiContext, StrapiStore } from 'strapi-typed';

import { Audience, AuditLogContext, ContentTypeEntity, Id, Navigation, NavigationActions, NavigationActionsPerItem, NavigationItem, NavigationItemRelated, NavigationPluginConfig, NavigationService, RenderType, RFRNavItem, ToBeFixed } from '../../types';
const { NotFoundError } = errors
const contentTypesNameFieldsDefaults = ['title', 'subject', 'name'];

export default ({ strapi }: StrapiContext): NavigationService => {
  return {
    // Get all available navigations
    async get(): Promise<Navigation[]> {
      const { masterModel } = extractMeta(strapi.plugins);
      const entities = await strapi
        .query<Navigation>(masterModel.uid)
        .findMany({
          limit: Number.MAX_SAFE_INTEGER,
        });
      return entities;
    },

    async getById(id: Id): Promise<Navigation> {
      const { masterModel, itemModel } = extractMeta(strapi.plugins);
      const entity = await strapi
        .query<Navigation>(masterModel.uid)
        .findOne({ where: { id } });

      const entityItems = await strapi
        .query<NavigationItem>(itemModel.uid)
        .findMany({
          where: {
            master: id,
          },
          limit: Number.MAX_SAFE_INTEGER,
          orderBy: [{ order: 'asc', }],
          populate: ['related', 'parent', 'audience']
        });
      const entities = await this.getRelatedItems(entityItems);
      return {
        ...entity,
        items: buildNestedStructure(entities),
      };
    },

    async restart(): Promise<void> {
      setImmediate(() => strapi.reload());
    },

    // Get plugin config
    async config(viaSettingsPage = false): Promise<NavigationPluginConfig> {
      const { audienceModel } = extractMeta(strapi.plugins);
      const pluginStore = await this.getPluginStore();
      const config = await pluginStore.get({ key: 'config' });

      const additionalFields = config.additionalFields;
      const contentTypesNameFields = config.contentTypesNameFields;
      const contentTypesPopulate = config.contentTypesPopulate;
      const allowedLevels = config.allowedLevels;
      const isGQLPluginEnabled = !isNil(strapi.plugin('graphql'));

      let extendedResult: Record<string, unknown>= {
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        restrictedContentTypes: RESTRICTED_CONTENT_TYPES,
      };
      const configContentTypes = await this.configContentTypes();
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
        gql: {
          navigationItemRelated: configContentTypes.map(({ labelSingular }) => labelSingular.replace(/\s+/g, ''))
        },
        isGQLPluginEnabled: viaSettingsPage ? isGQLPluginEnabled : undefined,
      };

      if (additionalFields.includes(configAdditionalFields.AUDIENCE)) {
        const audienceItems = await strapi
          .query<Audience>(audienceModel.uid)
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

    async updateConfig(newConfig: NavigationPluginConfig): Promise<void> {
      const pluginStore = await this.getPluginStore()
      await pluginStore.set({ key: 'config', value: newConfig });
    },

    async getPluginStore(): Promise<StrapiStore> {
      return await strapi.store({ type: 'plugin', name: 'navigation' });
    },

    async setDefaultConfig(): Promise<NavigationPluginConfig> {
      const pluginStore = await this.getPluginStore()
      const config = await pluginStore.get({ key: 'config' });
      const pluginDefaultConfig = await strapi.plugin('navigation').config

      // If new value gets introduced to the config it either is read from plugin store or from default plugin config
      // This is fix for backwards compatibility and migration of config to newer version of the plugin
      const defaultConfigValue = {
        additionalFields: get(config, 'additionalFields', pluginDefaultConfig('additionalFields')),
        contentTypes: get(config, 'contentTypes', pluginDefaultConfig('contentTypes')),
        contentTypesNameFields: get(config, 'contentTypesNameFields',  pluginDefaultConfig('contentTypesNameFields')),
        contentTypesPopulate: get(config, 'contentTypesPopulate',  pluginDefaultConfig('contentTypesPopulate')),
        allowedLevels: get(config, 'allowedLevels',  pluginDefaultConfig('allowedLevels')),
        gql: get(config, 'gql',  pluginDefaultConfig('gql')),
      }
      await pluginStore.set({ key: 'config', value: defaultConfigValue });

      return defaultConfigValue;
    },

    async restoreConfig(): Promise<void> {
      const pluginStore = await this.getPluginStore()
      await pluginStore.delete({ key: 'config' });
      await this.setDefaultConfig();
    },

    async configContentTypes(viaSettingsPage: boolean = false): Promise<StrapiContentType<any>[]> {
      const pluginStore = await this.getPluginStore()
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
                      await strapi.query<StrapiContentType<any>>(uid).count({
                        where: {
                          publicationState: 'live',
                        }
                      }) :
                      true;
                    return returnType(itemsCountOrBypass !== 0);
                  }
                  const isAvailable = await strapi.query<StrapiContentType<any>>(uid).count({});
                  return isAvailable === 1 ?
                    returnType(true) :
                    (viaSettingsPage ? returnType(false) : undefined);
                }
                return returnType(true);
              },
            ),
        ) as Array<{ key: string, available: boolean }>;

      return eligibleContentTypes
        .filter(key => key)
        .map(({ key, available }) => {
          const item = strapi.contentTypes[key];
          const relatedField = (item.associations || []).find((_: ToBeFixed) => _.model === 'navigationitem');
          const { uid, options, info, collectionName, modelName, apiName, plugin, kind, pluginOptions } = item;
          const { visible = true } = pluginOptions['content-manager'] || {};
          const { name, description } = info;
          const { hidden, templateName } = options;
          const findRouteConfig = find(get(strapi.api, `[${modelName}].config.routes`, []),
            route => route.handler.includes('.find'));
          const findRoutePath = findRouteConfig && findRouteConfig.path.split('/')[1];
          const apiPath = findRoutePath && (findRoutePath !== apiName) ? findRoutePath : apiName || modelName;
          const isSingle = kind === KIND_TYPES.SINGLE;
          const endpoint = isSingle ? apiPath : pluralize(apiPath);
          const relationName = singularize(modelName);
          const relationNameParts = last((uid as string).split('.'))!.split('-');
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

    async getRelatedItems(entityItems: NavigationItem[]): Promise<NavigationItem[]> {
      const pluginStore = await this.getPluginStore();
      const config: NavigationPluginConfig = await pluginStore.get({ key: 'config' });
      const relatedTypes: Set<string> = new Set(entityItems.flatMap((item) => get(item.related, 'related_type')));
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

      const data = new Map(
        (
          await Promise.all(
            Object.entries(groupedItems)
              .map(async ([model, related]) => {
                const relationData = await strapi
                  .query<StrapiContentType<any>>(model)
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
            return Object.assign(item, { related: [relatedData] });
          }
          return item;
        });
    },

    async getContentTypeItems(uid: string): Promise<ContentTypeEntity[]> {
      const pluginStore = await this.getPluginStore();
      const config: NavigationPluginConfig = await pluginStore.get({ key: 'config' });
      try {
        const contentTypeItems = await strapi.query<StrapiContentType<any>>(uid).findMany({
          populate: config.contentTypesPopulate[uid] || []
        })
        return contentTypeItems;
      } catch (err) {
        return [];
      }
    },

    async post(payload: ToBeFixed, auditLog: AuditLogContext) {
      const { masterModel, service } = extractMeta(strapi.plugins);
      const { name, visible } = payload;
      const data = {
        name,
        slug: slugify(name).toLowerCase(),
        visible,
      }

      const existingEntity = await strapi
        .query<Navigation>(masterModel.uid)
        .create({ data });

      return service
        .createBranch(payload.items, existingEntity, null, {})
        .then(() => service.getById(existingEntity.id))
        .then((newEntity: Navigation) => {
          sendAuditLog(auditLog, 'onChangeNavigation',
            { actionType: 'CREATE', oldEntity: existingEntity, newEntity });
          return newEntity;
        });
    },

    async put(id: Id, payload: ToBeFixed, auditLog: AuditLogContext) {
      const { masterModel, service } = extractMeta(strapi.plugins);
      const { name, visible } = payload;

      const existingEntity = await service.getById(id);
      const entityNameHasChanged = existingEntity.name !== name || existingEntity.visible !== visible;
      if (entityNameHasChanged) {

        await strapi.query<Navigation>(masterModel.uid).update({
          where: { id },
          data: {
            name: entityNameHasChanged ? name : existingEntity.name,
            slug: entityNameHasChanged ? slugify(name).toLowerCase() : existingEntity.slug,
            visible,
          },
        });
      }
      return service
        .analyzeBranch(payload.items, existingEntity, null, {})
        .then((auditLogsOperations: ToBeFixed) =>
          Promise.all([
            auditLog ? prepareAuditLog((auditLogsOperations || []).flat(Number.MAX_SAFE_INTEGER)) : [],
            service.getById(existingEntity.id)],
          ))
        .then(([actionType, newEntity]: ToBeFixed) => {
          sendAuditLog(auditLog, 'onChangeNavigation',
            { actionType, oldEntity: existingEntity, newEntity });
          return newEntity;
        });
    },

    async renderChildren(
      idOrSlug: Id | string,
      childUIKey: string,
      type: RenderType = RenderType.FLAT,
      menuOnly: boolean = false,
    ): Promise<NavigationItem[]> {
      const { service } = extractMeta(strapi.plugins);
      const findById = !isNaN(toNumber(idOrSlug)) || isUuid(idOrSlug as string);
      const criteria = findById ? { id: idOrSlug } : { slug: idOrSlug };
      const filter = type === renderType.FLAT ? null : childUIKey;

      const itemCriteria = {
        ...(menuOnly && { menuAttached: true }),
        ...(type === renderType.FLAT ? { uiRouterKey: childUIKey } : {}),
      };

      return service.renderType(type, criteria, itemCriteria, filter, null);
    },

    async render(
      idOrSlug: Id | string,
      type: RenderType = RenderType.FLAT,
      menuOnly: boolean = false,
      rootPath: string | null = null,
    ): Promise<Array<NavigationItem>> {
      const { service } = extractMeta(strapi.plugins);

      const findById = !isNaN(toNumber(idOrSlug)) || isUuid(idOrSlug as string);
      const criteria = findById ? { id: idOrSlug } : { slug: idOrSlug };
      const itemCriteria = menuOnly ? { menuAttached: true } : {};
      const x = await service.renderType(type, criteria, itemCriteria, null, rootPath);
      return x;
    },

    async renderType(
      type: RenderType = RenderType.FLAT,
      criteria = {},
      itemCriteria = {},
      filter = null,
      rootPath: string | null = null
    ): Promise<Array<NavigationItem>> {
      const { service, masterModel, itemModel } = extractMeta(
        strapi.plugins,
      );

      const entity = await strapi
        .query<Navigation>(masterModel.uid)
        .findOne({
          where: {
            ...criteria,
            visible: true,
          }
        });
      if (entity && entity.id) {
        const entities = await strapi.query<NavigationItem>(itemModel.uid).findMany({
          where: {
            master: entity.id,
            ...itemCriteria,
          },
          limit: Number.MAX_SAFE_INTEGER,
          orderBy: [{ order: 'asc', }],
          populate: ['related', 'audience', 'parent'],
        });

        if (!entities) {
          return [];
        }
        const items = await this.getRelatedItems(entities);
        const { contentTypes, contentTypesNameFields } = await service.config(false);

        switch (type) {
          case RenderType.TREE:
          case RenderType.RFR:
            const getTemplateName = await templateNameFactory(items, strapi, contentTypes);
            const itemParser = (item: NavigationItem, path: string = '', field: keyof NavigationItem): NavigationItem => {
              const isExternal = item.type === itemType.EXTERNAL;
              const parentPath = isExternal ? undefined : `${path === '/' ? '' : path}/${first(item.path) === '/'
                ? item.path!.substring(1)
                : item.path}`;
              const slug = isString(parentPath) ? slugify(
                (first(parentPath) === '/' ? parentPath.substring(1) : parentPath).replace(/\//g, '-')) : undefined;
              const lastRelated = item.related ? last(item.related as Array<NavigationItemRelated>) : undefined;
              return {
                id: item.id,
                title: composeItemTitle(item, contentTypesNameFields, contentTypes),
                menuAttached: item.menuAttached,
                order: item.order,
                path: isExternal ? item.externalPath : parentPath,
                type: item.type,
                uiRouterKey: item.uiRouterKey,
                slug: !slug && item.uiRouterKey ? slugify(item.uiRouterKey) : slug,
                external: isExternal,
                related: isExternal || !lastRelated ? undefined : {
                  ...lastRelated,
                  __templateName: getTemplateName((lastRelated.relatedType || lastRelated.__contentType) as string, lastRelated.id),
                },
                audience: !isEmpty(item.audience) ? item.audience!.map(aItem => (aItem as Audience).key) : undefined,
                items: isExternal ? undefined : service.renderTree(
                  items,
                  item.id,
                  field,
                  parentPath,
                  itemParser,
                ),
              };
            };

            const {
              items: itemsFilteredByPath,
              root: rootElement,
            } = filterByPath(items, rootPath);

            const treeStructure = service.renderTree(
              isNil(rootPath) ? items : itemsFilteredByPath,
              get(rootElement, 'parent.id'),
              'parent',
              get(rootElement, 'parent.path'),
              itemParser,
            );

            const filteredStructure = filter
              ? treeStructure.filter((item: NavigationItem) => item.uiRouterKey === filter)
              : treeStructure;

            if (type === renderType.RFR) {
              return service.renderRFR(
                filteredStructure,
                null,
                null,
                contentTypes,
              );
            }
            return filteredStructure;
          default:
            const publishedItems: Array<NavigationItem> = items
              .filter(filterOutUnpublished)
              .map((item: NavigationItem) => ({
                ...item,
                audience: item.audience?.map(_ => (_ as Audience).key),
                title: composeItemTitle(item, contentTypesNameFields, contentTypes) || '',
                related: (item.related as NavigationItemRelated[])?.map(({ localizations, ...item }) => item),
                items: null,
              }));
            return isNil(rootPath) ? items : filterByPath(publishedItems, rootPath).items;
        }
      }
      throw new NotFoundError();
    },

    renderTree(
      items: Array<NavigationItem> = [],
      id: Id | null = null,
      field: keyof NavigationItem = 'parent',
      path: string = '',
      itemParser: (item: NavigationItem, path: string, field: keyof NavigationItem) => NavigationItem = (i) => i,
    ): Array<NavigationItem> {
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
            return (data && data === id) || (isObject(item[field]) && !isNil(item[field]) && ((item[field] as NavigationItem)!.id === id));
          },
        )
        .filter(filterOutUnpublished)
        .map(item => itemParser({
          ...item,
        }, path, field))
        .sort((x, y) => {
          if (x.order !== undefined && y.order !== undefined)
            return x.order - y.order;
          else
            return 0;
        });
    },

    renderRFR(
      items: Array<NavigationItem>,
      parent: Id | null = null,
      parentNavItem: RFRNavItem | null = null,
      contentTypes = []
    ) {
      const { service } = extractMeta(strapi.plugins);
      let pages = {};
      let nav = {};
      let navItems: RFRNavItem[] = [];

      items.forEach(item => {
        const { items: itemChilds, ...itemProps } = item;
        const itemNav = service.renderRFRNav(itemProps);
        const itemPage = service.renderRFRPage(
          itemProps,
          parent,
        );

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
              [parent]: ([] as RFRNavItem[]).concat(parentNavItem ? parentNavItem : [], navLevel),
            };
        }

        if (!isEmpty(itemChilds)) {
          const { nav: nestedNavs } = service.renderRFR(
            itemChilds as NavigationItem[],
            itemPage.id,
            itemNav,
            contentTypes,
          );
          const { pages: nestedPages } = service.renderRFR(
            (itemChilds as NavigationItem[]).filter(child => child.type === itemType.INTERNAL),
            itemPage.id,
            itemNav,
            contentTypes,
          );
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

    renderRFRNav(
      item: NavigationItem
    ): RFRNavItem {
      const { uiRouterKey, title, path, type, audience } = item;
      return {
        label: title,
        type: type,
        page: type === itemType.INTERNAL ? uiRouterKey : undefined,
        url: type === itemType.EXTERNAL ? path : undefined,
        audience,
      };
    },

    renderRFRPage(
      item: NavigationItem,
      parent: Id | null,
    ) {
      const { uiRouterKey, title, path, slug, related, type, audience, menuAttached } = item;
      const { __contentType, id, __templateName } = related as NavigationItemRelated || {};
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

    createBranch(
      items: Array<NavigationItem> = [],
      masterEntity: Navigation | null = null,
      parentItem: NavigationItem | null = null,
      operations: NavigationActions = {}
    ) {
      const { itemModel, service } = extractMeta(strapi.plugins);
      return Promise.all(
        items.map(async (item) => {
          operations.create = true;
          const { parent, master, related, ...params } = item;
          const relatedItems = await this.getIdsRelated(related as NavigationItemRelated[], master as Navigation);
          const data = {
            ...params,
            related: relatedItems,
            master: masterEntity,
            parent: parentItem ? { ...parentItem, _id: parentItem.id } : null,
          }
          const navigationItem = await strapi
            .query<NavigationItem>(itemModel.uid)
            .create({ data, populate: ['related', 'items'] });
          return !isEmpty(item.items)
            ? service.createBranch(
              item.items as NavigationItem[],
              masterEntity,
              navigationItem,
              operations,
            )
            : operations;
        }),
      );
    },

    removeBranch(
      items: NavigationItem[] = [],
      operations: NavigationActions = {}
    ) {
      const { itemModel, service } = extractMeta(strapi.plugins);
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
              this.removeRelated(related as NavigationItemRelated[], master as Navigation),
            ]);
            return !isEmpty(item.items)
              ? service.removeBranch(
                item.items as NavigationItem[],
                operations,
              )
              : operations;
          }),
      );
    },

    async updateBranch(
      toUpdate: NavigationItem[],
      masterEntity: Navigation | null,
      parentItem: NavigationItem | null,
      operations: NavigationActions
    ) {
      const { itemModel, service } = extractMeta(strapi.plugins);
      const databaseModel = strapi.query<NavigationItem>(itemModel.uid);
      return Promise.all(
        toUpdate.map(async (item) => {
          operations.update = true;
          const { id, updated, parent, master, related, items, ...params } = item;
          let currentItem;
          if (updated) {
            const relatedItems = await this.getIdsRelated(related as NavigationItemRelated[], master as Navigation);
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
              items as NavigationItem[],
              masterEntity,
              currentItem,
              operations,
            )
            : operations;
        }),
      );
    },

    analyzeBranch(
      items: Array<NavigationItem> = [],
      masterEntity: Navigation | null = null,
      parentItem: NavigationItem | null = null,
      prevOperations: NavigationActions = {},
    ): Promise<Array<NavigationActionsPerItem>> {
      const { service } = extractMeta(strapi.plugins);
      const { toCreate, toRemove, toUpdate } = items
        .reduce((acc: NavigationActionsPerItem, _) => {
          const branchName: keyof NavigationActionsPerItem | void = service.getBranchName(_);
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
            service.createBranch(toCreate, masterEntity, parentItem, operations),
            service.removeBranch(toRemove, operations),
            service.updateBranch(toUpdate, masterEntity, parentItem, operations),
          ],
        ));
    },

    getIdsRelated(
      relatedItems: Array<NavigationItemRelated> | null,
      master: Navigation,
    ): Promise<Array<Id | undefined>> | void {
      if (relatedItems) {
        return Promise.all(relatedItems.map(async relatedItem => {
          try {
            const model = strapi.query<NavigationItemRelated>('plugin::navigation.navigations-items-related');
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

    removeRelated(
      relatedItems: Array<NavigationItemRelated>,
      master: Navigation,
    ): ToBeFixed{
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
  }
}