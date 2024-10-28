import { Core, UID } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import {
  differenceBy,
  find,
  get,
  isEmpty,
  isObject,
  last,
  pick,
  toString,
  upperFirst,
} from 'lodash';
import pluralize from 'pluralize';
import { FillNavigationError, InvalidParamNavigationError } from '../../app-errors';
import { ConfigContentTypeDTO, NavigationDTO, NavigationPluginConfigDTO } from '../../dtos';
import {
  getAudienceRepository,
  getGenericRepository,
  getNavigationItemRepository,
  getNavigationRepository,
} from '../../repositories';
import {
  NavigationDBSchema,
  NavigationItemCustomField,
  NavigationItemDBSchema,
  ReadNavigationItemFromLocaleSchema,
  configSchema,
  contentTypeFullSchema,
  readNavigationItemFromLocaleSchema,
} from '../../schemas';
import {
  ALLOWED_CONTENT_TYPES,
  CONTENT_TYPES_NAME_FIELDS_DEFAULTS,
  KIND_TYPES,
  RESTRICTED_CONTENT_TYPES,
  getPluginModels,
  getPluginService,
  isContentTypeEligible,
  singularize,
  validateAdditionalFields,
} from '../../utils';
import {
  ConfigInput,
  DeleteInput,
  FillFromOtherLocaleInput,
  GetByIdInput,
  GetContentTypeItemsInput,
  GetInput,
  I18nNavigationContentsCopyInput,
  PostInput,
  PutInput,
  ReadNavigationItemFromLocaleInput,
  UpdateConfigInput,
} from './types';
import { getCacheStatus, intercalate, prepareAuditLog, processItems, sendAuditLog } from './utils';

export type AdminService = ReturnType<typeof adminService>;

const adminService = (context: { strapi: Core.Strapi }) => ({
  async config({ viaSettingsPage = false }: ConfigInput): Promise<NavigationPluginConfigDTO> {
    const commonService = getPluginService(context, 'common');
    const cacheStatus = await getCacheStatus(context);

    const pluginStore = await commonService.getPluginStore();
    const config = await pluginStore
      .get({
        key: 'config',
      })
      .then(configSchema.parse);

    const {
      additionalFields,
      cascadeMenuAttached,
      contentTypesPopulate,
      contentTypesNameFields,
      pathDefaultFields,
      allowedLevels,
      preferCustomContentTypes,
    } = config;

    const isGQLPluginEnabled = !!strapi.plugin('graphql');

    let extendedResult: Record<string, unknown> = {
      allowedContentTypes: ALLOWED_CONTENT_TYPES,
      restrictedContentTypes: RESTRICTED_CONTENT_TYPES,
      availableAudience: [],
    };
    const configContentTypes = await this.configContentTypes({});

    const result = {
      contentTypes: await this.configContentTypes({ viaSettingsPage }),
      contentTypesNameFields: {
        default: CONTENT_TYPES_NAME_FIELDS_DEFAULTS,
        ...(isObject(contentTypesNameFields) ? contentTypesNameFields : {}),
      },
      contentTypesPopulate: isObject(contentTypesPopulate) ? contentTypesPopulate : {},
      pathDefaultFields: isObject(pathDefaultFields) ? pathDefaultFields : {},
      allowedLevels,
      additionalFields: viaSettingsPage
        ? additionalFields
        : additionalFields.filter((field) => typeof field === 'string' || !!field.enabled),
      gql: {
        navigationItemRelated: configContentTypes.map(({ labelSingular }) =>
          labelSingular.replace(/\s+/g, '')
        ),
      },
      isGQLPluginEnabled: viaSettingsPage ? isGQLPluginEnabled : undefined,
      cascadeMenuAttached,
      preferCustomContentTypes,
    };

    if (additionalFields.includes('audience')) {
      const audienceItems = await getAudienceRepository(context).find({}, Number.MAX_SAFE_INTEGER);

      extendedResult = {
        ...extendedResult,
        availableAudience: audienceItems,
      };
    }

    return {
      ...result,
      ...extendedResult,
      isCacheEnabled: cacheStatus.enabled,
      isCachePluginEnabled: cacheStatus.hasCachePlugin,
    };
  },

  async configContentTypes({
    viaSettingsPage = false,
  }: ConfigInput): Promise<ConfigContentTypeDTO[]> {
    const commonService = getPluginService(context, 'common');

    const pluginStore = await commonService.getPluginStore();

    const config = await pluginStore.get({ key: 'config' }).then(configSchema.parse);

    const eligibleContentTypes = await Promise.all(
      config.contentTypes
        .filter(
          (contentType) =>
            !!context.strapi.contentTypes[contentType as any] && isContentTypeEligible(contentType)
        )
        .map(async (key) => {
          const item = contentTypeFullSchema.parse(strapi.contentTypes[key as any]);

          const { kind, options, uid } = item;
          const draftAndPublish = options?.draftAndPublish;

          const isSingleType = kind === KIND_TYPES.SINGLE;
          const isSingleTypeWithPublishFlow = isSingleType && draftAndPublish;

          const returnType = (available: boolean) => ({
            key,
            available,
          });

          if (isSingleType) {
            const repository = getGenericRepository(context, uid as UID.ContentType);

            if (isSingleTypeWithPublishFlow) {
              const itemsCountOrBypass = isSingleTypeWithPublishFlow
                ? await repository.count({}, 'published')
                : true;

              return returnType(itemsCountOrBypass !== 0);
            }

            const isAvailable = await repository.count({});

            return isAvailable !== 0
              ? returnType(true)
              : viaSettingsPage
                ? returnType(false)
                : undefined;
          }

          return returnType(true);
        })
    );

    return eligibleContentTypes.reduce((acc, current) => {
      if (!current?.key) {
        return acc;
      }

      const { key, available } = current;
      const item = contentTypeFullSchema.parse(context.strapi.contentTypes[key as any]);

      const relatedField = (item.associations || []).find(
        ({ model }) => model === 'navigationitem'
      );

      const {
        uid,
        options,
        info,
        collectionName,
        modelName,
        apiName,
        plugin,
        kind,
        pluginOptions = {},
      } = item;

      const isAvailable = available && !options?.hidden;

      if (!isAvailable) {
        return acc;
      }

      const { visible = true } = pluginOptions['content-manager'] || {};
      const { name = '', description = '' } = info;

      const findRouteConfig = find(
        get(context.strapi.api, `[${modelName}].config.routes`, []),
        <T extends { handler: string; path: string }>(route: T) => route.handler.includes('.find')
      );

      const findRoutePath = findRouteConfig && findRouteConfig.path.split('/')[1];

      const apiPath =
        findRoutePath && findRoutePath !== apiName ? findRoutePath : apiName || modelName;
      const isSingle = kind === KIND_TYPES.SINGLE;
      const endpoint = isSingle ? apiPath : pluralize(apiPath!);
      const relationName = singularize(modelName);
      const relationNameParts = typeof uid === 'string' ? last(uid.split('.'))!.split('-') : [];
      const contentTypeName =
        relationNameParts.length > 1
          ? relationNameParts.reduce((prev, curr) => `${prev}${upperFirst(curr)}`, '')
          : upperFirst(modelName);
      const labelSingular =
        name ||
        upperFirst(relationNameParts.length > 1 ? relationNameParts.join(' ') : relationName);

      acc.push({
        uid,
        name: relationName,
        draftAndPublish: options?.draftAndPublish,
        isSingle,
        description,
        collectionName,
        contentTypeName,
        label: isSingle ? labelSingular : pluralize(name || labelSingular),
        relatedField: relatedField ? relatedField.alias : undefined,
        labelSingular: singularize(labelSingular),
        endpoint: endpoint!,
        plugin,
        available: isAvailable,
        visible,
        templateName: options?.templateName,
      });

      return acc;
    }, [] as ConfigContentTypeDTO[]);
  },

  async get({ ids, locale }: GetInput): Promise<NavigationDBSchema[]> {
    let filters: Record<string, unknown> = {};

    if (ids && ids.length) {
      filters.id = { $in: ids };
    }

    const dbResults = await getNavigationRepository(context).find({
      filters,
      locale: locale || '*',
      limit: Number.MAX_SAFE_INTEGER,
      populate: ['items', 'items.parent', 'items.audience'],
    });

    const buildItemsStructure = ({
      allItems,
      item,
      parent,
    }: {
      item: NavigationItemDBSchema;
      parent?: NavigationItemDBSchema;
      allItems: Array<NavigationItemDBSchema>;
    }): NavigationItemDBSchema => {
      const children = allItems.filter((child) => child.parent?.documentId === item.documentId);

      return {
        ...item,
        parent,
        items: children
          .map((child) =>
            buildItemsStructure({
              parent: item,
              item: child,
              allItems,
            })
          )
          .sort((a, b) => a.order - b.order),
      };
    };

    return dbResults.map((navigation: NavigationDBSchema) => ({
      ...navigation,
      items: navigation.items
        ?.filter((item) => !item.parent)
        .map((item) =>
          buildItemsStructure({
            allItems: navigation.items ?? [],
            item,
          })
        )
        .sort((a, b) => a.order - b.order),
    }));
  },

  async getById({ documentId, locale }: GetByIdInput): Promise<NavigationDBSchema> {
    const commonService = getPluginService(context, 'common');
    const { defaultLocale } = await commonService.readLocale();
    const filters: Record<string, any> = {
      documentId,
    };

    const navigation = await getNavigationRepository(context).findOne({
      filters,
      locale: locale || defaultLocale,
    });

    const dbNavigationItems = await getNavigationItemRepository(context).find({
      filters: { master: navigation.id },
      locale: locale || defaultLocale,
      limit: Number.MAX_SAFE_INTEGER,
      order: [{ order: 'asc' }],
      populate: ['parent', 'audience'],
    });

    return {
      ...navigation,
      items: commonService
        .buildNestedStructure({
          navigationItems: dbNavigationItems,
        })
        .filter(({ parent }) => !parent),
    };
  },

  async post({ auditLog, payload }: PostInput): Promise<NavigationDTO> {
    const { masterModel } = getPluginModels(context);

    const commonService = getPluginService(context, 'common');

    const { defaultLocale, restLocale } = await commonService.readLocale();

    const repository = getNavigationRepository(context);

    const navigationSummary: NavigationDBSchema[] = [];

    const { name, visible } = payload;
    const slug = await commonService.getSlug({ query: name });

    const mainNavigation = await repository.save({
      name,
      visible,
      locale: defaultLocale,
      slug,
    });

    navigationSummary.push(await this.getById({ documentId: mainNavigation.documentId }));

    for (const localeCode of restLocale) {
      const newLocaleNavigation = await repository.save({
        name,
        visible,
        locale: localeCode,
        slug,
        documentId: mainNavigation.documentId,
      });

      navigationSummary.push(await this.getById({ documentId: newLocaleNavigation.documentId }));
    }

    navigationSummary.map((navigation) => {
      sendAuditLog(auditLog, 'onChangeNavigation', {
        actionType: 'CREATE',
        oldEntity: navigation,
        newEntity: navigation,
      });
    });

    await commonService.emitEvent({
      entity: mainNavigation,
      event: 'entry.create',
      uid: masterModel.uid,
    });

    return {
      ...mainNavigation,
      items: [],
    };
  },

  async put({ auditLog, payload }: PutInput): Promise<NavigationDBSchema> {
    const { masterModel } = getPluginModels(context);

    const commonService = getPluginService(context, 'common');
    const { defaultLocale, restLocale } = await commonService.readLocale();

    const repository = getNavigationRepository(context);

    const { name, visible, items } = payload;

    const currentNavigation = await repository.findOne({
      filters: { documentId: payload.documentId },
      locale: payload.locale,
      populate: '*',
    });
    const currentNavigationAsDTO = await this.getById({
      documentId: payload.documentId,
      locale: payload.locale,
    });

    const detailsHaveChanged =
      currentNavigation.name !== name || currentNavigation.visible !== visible;

    if (detailsHaveChanged) {
      const newSlug = name
        ? await commonService.getSlug({
            query: name,
          })
        : currentNavigation.slug;

      const allNavigations = await Promise.all(
        [defaultLocale, ...restLocale].map((locale) =>
          repository.findOne({
            filters: { documentId: currentNavigation.documentId },
            locale,
          })
        )
      );

      for (const navigation of allNavigations) {
        await repository.save({
          documentId: navigation.documentId,
          id: navigation.id,
          slug: newSlug,
          locale: navigation.locale,
          name,
          visible,
        });
      }
    }

    const updatedNavigationAsDTO = await commonService
      .analyzeBranch({
        navigationItems: items ?? [],
        masterEntity: currentNavigation,
        prevAction: {},
      })
      .then(prepareAuditLog)
      .then(async (actionType) => {
        const newEntity = await this.getById({ documentId: currentNavigation.documentId });

        sendAuditLog(auditLog, 'onChangeNavigation', {
          actionType,
          oldEntity: currentNavigationAsDTO,
          newEntity,
        });

        return newEntity;
      });

    await commonService.emitEvent({
      entity: await repository.findOne({
        filters: { documentId: payload.documentId },
        populate: '*',
      }),
      event: 'entry.update',
      uid: masterModel.uid,
    });

    return updatedNavigationAsDTO;
  },

  async delete({ auditLog, documentId }: DeleteInput): Promise<void> {
    const navigationRepository = getNavigationRepository(context);
    const navigationItemRepository = getNavigationItemRepository(context);

    const navigationAsDTO = await this.getById({ documentId });

    // TODO: remove when cascade deletion is present
    // NOTE: Delete many with relation `where` crashes ORM
    const cleanNavigationItems = async (masterIds: Array<string>) => {
      if (masterIds.length < 1) {
        return;
      }

      await navigationItemRepository.removeForIds(
        await navigationItemRepository
          .findForMasterIds(masterIds)
          .then((_: Array<NavigationItemDBSchema>) =>
            _.reduce<Array<string>>((acc, { documentId }) => {
              if (documentId) {
                acc.push(documentId);
              }

              return acc;
            }, [])
          )
      );
    };

    const navigation = await navigationRepository.findOne({
      filters: { documentId },
      populate: '*',
    });
    const allNavigations = await navigationRepository.find({
      filters: { documentId: navigation.documentId },
      populate: '*',
    });

    await cleanNavigationItems(
      allNavigations.map(({ documentId }: NavigationDBSchema) => documentId)
    );
    await navigationRepository.remove({ documentId: navigation.documentId });

    sendAuditLog(auditLog, 'onNavigationDeletion', {
      entity: navigationAsDTO,
      actionType: 'DELETE',
    });
  },

  async restart(): Promise<void> {
    setImmediate(() => context.strapi.reload());
  },

  async restoreConfig(): Promise<void> {
    const commonService = getPluginService(context, 'common');

    const pluginStore = await commonService.getPluginStore();
    await pluginStore.delete({ key: 'config' });
    await commonService.setDefaultConfig();
  },

  async updateConfig({ config: newConfig }: UpdateConfigInput): Promise<void> {
    const commonService = getPluginService(context, 'common');

    const pluginStore = await commonService.getPluginStore();

    const config = await pluginStore
      .get({
        key: 'config',
      })
      .then(configSchema.parse);

    validateAdditionalFields(newConfig.additionalFields);

    await pluginStore.set({ key: 'config', value: newConfig });

    const removedFields = differenceBy(
      config.additionalFields,
      newConfig.additionalFields,
      'name'
    ).reduce<NavigationItemCustomField[]>((acc, field) => {
      if (typeof field === 'string') {
        return acc;
      }

      acc.push(field);

      return acc;
    }, []);

    if (!isEmpty(removedFields)) {
      await commonService.pruneCustomFields({ removedFields });
    }
  },

  async fillFromOtherLocale({
    auditLog,
    source,
    target,
    documentId,
  }: FillFromOtherLocaleInput): Promise<NavigationDBSchema> {
    const targetEntity = await this.getById({ documentId, locale: target });

    return await this.i18nNavigationContentsCopy({
      source: await this.getById({ documentId, locale: source }),
      target: targetEntity,
    })
      .then(() => this.getById({ documentId, locale: target }))
      .then((newEntity) => {
        sendAuditLog(auditLog, 'onChangeNavigation', {
          actionType: 'UPDATE',
          oldEntity: targetEntity,
          newEntity,
        });

        return newEntity;
      });
  },

  async i18nNavigationContentsCopy({
    source,
    target,
  }: I18nNavigationContentsCopyInput): Promise<void> {
    const commonService = getPluginService(context, 'common');
    const sourceItems = source.items ?? [];
    const navigationRepository = getNavigationRepository(context);

    if (target.items?.length) {
      throw new FillNavigationError('Current navigation is non-empty');
    }

    if (!target.locale) {
      throw new FillNavigationError('Current navigation does not have specified locale');
    }

    if (!sourceItems.length) {
      throw new FillNavigationError('Source navigation is empty');
    }

    const entities = new Map();

    const itemProcessor = processItems({
      master: target,
      locale: target.locale,
      strapi,
      entities,
    });

    await commonService.createBranch({
      action: { create: true },
      masterEntity: await navigationRepository.findOne({
        filters: { documentId: target.documentId },
        locale: target.locale,
        populate: '*',
      }),
      navigationItems: await Promise.all(sourceItems.map(itemProcessor)),
      parentItem: undefined,
    });
  },

  async readNavigationItemFromLocale({
    path,
    source,
    target,
  }: ReadNavigationItemFromLocaleInput): Promise<ReadNavigationItemFromLocaleSchema> {
    const sourceNavigation = await this.getById({ documentId: source });
    const targetNavigation = await this.getById({ documentId: target });

    if (!sourceNavigation) {
      throw new errors.NotFoundError('Unable to find source navigation for specified query');
    }

    if (!targetNavigation) {
      throw new errors.NotFoundError('Unable to find target navigation for specified query');
    }

    const requiredFields = [
      'path',
      'related',
      'type',
      'uiRouterKey',
      'title',
      'externalPath',
    ] as const;
    const structurePath = path.split('.').map((p) => parseInt(p, 10));

    if (!structurePath.some(Number.isNaN) || !structurePath.length) {
      new InvalidParamNavigationError('Path is invalid');
    }

    let result = get(
      sourceNavigation.items,
      intercalate<string, string>('items', structurePath.map(toString))
    );

    if (!result) {
      throw new errors.NotFoundError('Unable to find navigation item');
    }

    return readNavigationItemFromLocaleSchema.parse(pick(result, requiredFields));
  },

  async getContentTypeItems({
    query,
    uid,
  }: GetContentTypeItemsInput): Promise<{ documentId: string }[]> {
    const commonService = getPluginService(context, 'common');
    const pluginStore = await commonService.getPluginStore();
    const config = await pluginStore.get({ key: 'config' }).then(configSchema.parse);
    const where: Record<string, any> = {
      publishedAt: {
        $notNull: true,
      },
    };
    const contentType = get(context.strapi.contentTypes, uid);
    const { draftAndPublish } = contentType.options;
    const { localized = false } = contentType?.pluginOptions?.i18n || {};

    if (localized && query.locale) {
      where.locale = query.locale;
    }

    const repository = getGenericRepository(context, uid as UID.ContentType);

    try {
      const contentTypeItems = await repository.findMany(
        where,
        config.contentTypesPopulate[uid] || [],
        draftAndPublish ? 'published' : undefined
      );

      return contentTypeItems;
    } catch (err) {
      console.error(err);

      return [];
    }
  },

  async purgeNavigationCache(documentId: string, clearLocalisations?: boolean) {
    const navigationRepository = getNavigationRepository(context);
    const entity = await navigationRepository.findOne({ filters: { documentId } });

    if (!entity) {
      throw new errors.NotFoundError('Navigation is not defined');
    }

    const mapToRegExp = (documentId: string) => new RegExp(`/api/navigation/render/${documentId}`);

    let regexps = [mapToRegExp(entity.documentId)];

    if (clearLocalisations) {
      const navigations = await navigationRepository.find({
        filters: {
          documentId: entity.documentId,
        },
      });

      regexps = navigations.map(({ documentId }: NavigationDBSchema) => mapToRegExp(documentId));
    }

    const restCachePlugin = strapi.plugin('rest-cache');
    const cacheStore = restCachePlugin.service('cacheStore');

    regexps.push(mapToRegExp(documentId));

    await cacheStore.clearByRegexp(regexps);

    return { success: true };
  },

  async purgeNavigationsCache() {
    const restCachePlugin = strapi.plugin('rest-cache');
    const cacheStore = restCachePlugin.service('cacheStore');

    const regex = new RegExp('/api/navigation/render(.*)');

    await cacheStore.clearByRegexp([regex]);

    return { success: true };
  },
});

export default adminService;
