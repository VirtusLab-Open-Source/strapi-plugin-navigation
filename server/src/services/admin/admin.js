"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@strapi/utils");
const lodash_1 = require("lodash");
const pluralize_1 = __importDefault(require("pluralize"));
const app_errors_1 = require("../../app-errors");
const repositories_1 = require("../../repositories");
const schemas_1 = require("../../schemas");
const utils_2 = require("../../utils");
const utils_3 = require("./utils");
const adminService = (context) => ({
    async config({ viaSettingsPage = false }) {
        const commonService = (0, utils_2.getPluginService)(context, 'common');
        const cacheStatus = await (0, utils_3.getCacheStatus)(context);
        const pluginStore = await commonService.getPluginStore();
        const config = await pluginStore
            .get({
            key: 'config',
        })
            .then(schemas_1.DynamicSchemas.configSchema.parse);
        const { additionalFields, cascadeMenuAttached, contentTypesPopulate, contentTypesNameFields, defaultContentType, pathDefaultFields, allowedLevels, preferCustomContentTypes, } = config;
        const isGQLPluginEnabled = !!strapi.plugin('graphql');
        let extendedResult = {
            allowedContentTypes: utils_2.ALLOWED_CONTENT_TYPES,
            restrictedContentTypes: utils_2.RESTRICTED_CONTENT_TYPES,
            availableAudience: [],
        };
        const configContentTypes = await this.configContentTypes({});
        const result = {
            contentTypes: await this.configContentTypes({ viaSettingsPage }),
            contentTypesNameFields: {
                default: utils_2.CONTENT_TYPES_NAME_FIELDS_DEFAULTS,
                ...((0, lodash_1.isObject)(contentTypesNameFields) ? contentTypesNameFields : {}),
            },
            contentTypesPopulate: (0, lodash_1.isObject)(contentTypesPopulate) ? contentTypesPopulate : {},
            defaultContentType,
            pathDefaultFields: (0, lodash_1.isObject)(pathDefaultFields) ? pathDefaultFields : {},
            allowedLevels,
            additionalFields: viaSettingsPage
                ? additionalFields
                : additionalFields.filter((field) => typeof field === 'string' || !!field.enabled),
            gql: {
                navigationItemRelated: configContentTypes.map(({ labelSingular }) => labelSingular.replace(/\s+/g, '')),
            },
            isGQLPluginEnabled: viaSettingsPage ? isGQLPluginEnabled : undefined,
            cascadeMenuAttached,
            preferCustomContentTypes,
        };
        if (additionalFields.includes('audience')) {
            const audienceItems = await (0, repositories_1.getAudienceRepository)(context).find({}, Number.MAX_SAFE_INTEGER);
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
    async configContentTypes({ viaSettingsPage = false, }) {
        const commonService = (0, utils_2.getPluginService)(context, 'common');
        const pluginStore = await commonService.getPluginStore();
        const config = await pluginStore.get({ key: 'config' }).then(schemas_1.DynamicSchemas.configSchema.parse);
        const eligibleContentTypes = await Promise.all(config.contentTypes
            .filter((contentType) => !!context.strapi.contentTypes[contentType] && (0, utils_2.isContentTypeEligible)(contentType))
            .map(async (key) => {
            const item = schemas_1.contentTypeFullSchema.parse(strapi.contentTypes[key]);
            const { kind, options, uid } = item;
            const draftAndPublish = options === null || options === void 0 ? void 0 : options.draftAndPublish;
            const isSingleType = kind === utils_2.KIND_TYPES.SINGLE;
            const isSingleTypeWithPublishFlow = isSingleType && draftAndPublish;
            const returnType = (available) => ({
                key,
                available,
            });
            if (isSingleType) {
                const repository = (0, repositories_1.getGenericRepository)(context, uid);
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
        }));
        return eligibleContentTypes.reduce((acc, current) => {
            if (!(current === null || current === void 0 ? void 0 : current.key)) {
                return acc;
            }
            const { key, available } = current;
            const item = schemas_1.contentTypeFullSchema.parse(context.strapi.contentTypes[key]);
            const relatedField = (item.associations || []).find(({ model }) => model === 'navigationitem');
            const { uid, options, info, collectionName, modelName, apiName, plugin, kind, pluginOptions = {}, } = item;
            const isAvailable = available && !(options === null || options === void 0 ? void 0 : options.hidden);
            if (!isAvailable) {
                return acc;
            }
            const { visible = true } = pluginOptions['content-manager'] || {};
            const { name = '', description = '' } = info;
            const findRouteConfig = (0, lodash_1.find)((0, lodash_1.get)(context.strapi.api, `[${modelName}].config.routes`, []), (route) => route.handler.includes('.find'));
            const findRoutePath = findRouteConfig && findRouteConfig.path.split('/')[1];
            const apiPath = findRoutePath && findRoutePath !== apiName ? findRoutePath : apiName || modelName;
            const isSingle = kind === utils_2.KIND_TYPES.SINGLE;
            const endpoint = isSingle ? apiPath : (0, pluralize_1.default)(apiPath);
            const relationName = (0, utils_2.singularize)(modelName);
            const relationNameParts = typeof uid === 'string' ? (0, lodash_1.last)(uid.split('.')).split('-') : [];
            const contentTypeName = relationNameParts.length > 1
                ? relationNameParts.reduce((prev, curr) => `${prev}${(0, lodash_1.upperFirst)(curr)}`, '')
                : (0, lodash_1.upperFirst)(modelName);
            const labelSingular = name ||
                (0, lodash_1.upperFirst)(relationNameParts.length > 1 ? relationNameParts.join(' ') : relationName);
            acc.push({
                uid,
                name: relationName,
                draftAndPublish: options === null || options === void 0 ? void 0 : options.draftAndPublish,
                isSingle,
                description,
                collectionName,
                contentTypeName,
                label: isSingle ? labelSingular : (0, pluralize_1.default)(name || labelSingular),
                relatedField: relatedField ? relatedField.alias : undefined,
                labelSingular: (0, utils_2.singularize)(labelSingular),
                endpoint: endpoint,
                plugin,
                available: isAvailable,
                visible,
                templateName: options === null || options === void 0 ? void 0 : options.templateName,
            });
            return acc;
        }, []);
    },
    async get({ ids, locale }) {
        let filters = {};
        if (ids && ids.length) {
            filters.id = { $in: ids };
        }
        const dbResults = await (0, repositories_1.getNavigationRepository)(context).find({
            filters,
            locale: locale || '*',
            limit: Number.MAX_SAFE_INTEGER,
            populate: ['items', 'items.parent', 'items.audience', 'items.related'],
        });
        const buildItemsStructure = ({ allItems, item, parent, }) => {
            const children = allItems.filter((child) => { var _a; return ((_a = child.parent) === null || _a === void 0 ? void 0 : _a.documentId) === item.documentId; });
            return {
                ...item,
                parent,
                items: children
                    .map((child) => buildItemsStructure({
                    parent: item,
                    item: child,
                    allItems,
                }))
                    .sort((a, b) => a.order - b.order),
            };
        };
        return dbResults.map((navigation) => {
            var _a;
            return ({
                ...navigation,
                items: (_a = navigation.items) === null || _a === void 0 ? void 0 : _a.filter((item) => !item.parent).map((item) => {
                    var _a;
                    return buildItemsStructure({
                        allItems: (_a = navigation.items) !== null && _a !== void 0 ? _a : [],
                        item,
                    });
                }).sort((a, b) => a.order - b.order),
            });
        });
    },
    async getById({ documentId, locale, populate = [] }) {
        const commonService = (0, utils_2.getPluginService)(context, 'common');
        const { defaultLocale } = await commonService.readLocale();
        const filters = {
            documentId,
        };
        const navigation = await (0, repositories_1.getNavigationRepository)(context).findOne({
            filters,
            locale: locale || defaultLocale,
        });
        const dbNavigationItems = await (0, repositories_1.getNavigationItemRepository)(context).find({
            filters: { master: navigation.id },
            locale: locale || defaultLocale,
            limit: Number.MAX_SAFE_INTEGER,
            order: [{ order: 'asc' }],
            populate: ['parent', 'audience', ...populate],
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
    async post({ auditLog, payload }) {
        const { masterModel } = (0, utils_2.getPluginModels)(context);
        const commonService = (0, utils_2.getPluginService)(context, 'common');
        const { defaultLocale, restLocale } = await commonService.readLocale();
        const repository = (0, repositories_1.getNavigationRepository)(context);
        const navigationSummary = [];
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
            (0, utils_3.sendAuditLog)(auditLog, 'onChangeNavigation', {
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
    async put({ auditLog, payload }) {
        const { masterModel } = (0, utils_2.getPluginModels)(context);
        const commonService = (0, utils_2.getPluginService)(context, 'common');
        const { defaultLocale, restLocale } = await commonService.readLocale();
        const repository = (0, repositories_1.getNavigationRepository)(context);
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
        const detailsHaveChanged = currentNavigation.name !== name || currentNavigation.visible !== visible;
        if (detailsHaveChanged) {
            const newSlug = name
                ? await commonService.getSlug({
                    query: name,
                })
                : currentNavigation.slug;
            const allNavigations = await Promise.all([defaultLocale, ...restLocale].map((locale) => repository.findOne({
                filters: { documentId: currentNavigation.documentId },
                locale,
            })));
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
        await commonService
            .analyzeBranch({
            navigationItems: items !== null && items !== void 0 ? items : [],
            masterEntity: currentNavigation,
            prevAction: {},
        })
            .then(utils_3.prepareAuditLog)
            .then(async (actionType) => {
            const newEntity = await this.getById({ documentId: currentNavigation.documentId });
            (0, utils_3.sendAuditLog)(auditLog, 'onChangeNavigation', {
                actionType,
                oldEntity: currentNavigationAsDTO,
                newEntity,
            });
        });
        await commonService.emitEvent({
            entity: await repository.findOne({
                filters: { documentId: payload.documentId },
                populate: '*',
            }),
            event: 'entry.update',
            uid: masterModel.uid,
        });
        return await this.getById({
            documentId: payload.documentId,
            locale: payload.locale,
            populate: ['related'],
        });
    },
    async delete({ auditLog, documentId }) {
        const navigationRepository = (0, repositories_1.getNavigationRepository)(context);
        const navigationItemRepository = (0, repositories_1.getNavigationItemRepository)(context);
        const navigationAsDTO = await this.getById({ documentId });
        // TODO: remove when cascade deletion is present
        // NOTE: Delete many with relation `where` crashes ORM
        const cleanNavigationItems = async (masterIds) => {
            if (masterIds.length < 1) {
                return;
            }
            await navigationItemRepository.removeForIds(await navigationItemRepository
                .findForMasterIds(masterIds)
                .then((_) => _.reduce((acc, { documentId }) => {
                if (documentId) {
                    acc.push(documentId);
                }
                return acc;
            }, [])));
        };
        const navigation = await navigationRepository.findOne({
            filters: { documentId },
            populate: '*',
        });
        const allNavigations = await navigationRepository.find({
            filters: { documentId: navigation.documentId },
            populate: '*',
        });
        await cleanNavigationItems(allNavigations.map(({ id }) => id));
        await navigationRepository.remove({ documentId: navigation.documentId });
        (0, utils_3.sendAuditLog)(auditLog, 'onNavigationDeletion', {
            entity: navigationAsDTO,
            actionType: 'DELETE',
        });
    },
    async restart() {
        context.strapi.reload.isWatching = false;
        setImmediate(() => context.strapi.reload());
    },
    async restoreConfig() {
        console.log('restore');
        const commonService = (0, utils_2.getPluginService)(context, 'common');
        const pluginStore = await commonService.getPluginStore();
        await pluginStore.delete({ key: 'config' });
        await commonService.setDefaultConfig();
    },
    async refreshNavigationLocale(newLocale) {
        if (!newLocale) {
            return;
        }
        const commonService = (0, utils_2.getPluginService)(context, 'common');
        const { defaultLocale } = await commonService.readLocale();
        const repository = (0, repositories_1.getNavigationRepository)(context);
        const navigations = await repository.find({
            limit: Number.MAX_SAFE_INTEGER,
            locale: defaultLocale,
        });
        await Promise.all(navigations.map(({ name, visible, slug, documentId }) => repository.save({
            name,
            visible,
            locale: newLocale,
            slug,
            documentId,
        })));
    },
    async updateConfig({ config: newConfig }) {
        const commonService = (0, utils_2.getPluginService)(context, 'common');
        const pluginStore = await commonService.getPluginStore();
        const config = await pluginStore
            .get({
            key: 'config',
        })
            .then(schemas_1.DynamicSchemas.configSchema.parse);
        (0, utils_2.validateAdditionalFields)(newConfig.additionalFields);
        await pluginStore.set({ key: 'config', value: newConfig });
        const removedFields = (0, lodash_1.differenceBy)(config.additionalFields, newConfig.additionalFields, 'name').reduce((acc, field) => {
            if (typeof field === 'string') {
                return acc;
            }
            acc.push(field);
            return acc;
        }, []);
        if (!(0, lodash_1.isEmpty)(removedFields)) {
            await commonService.pruneCustomFields({ removedFields });
        }
    },
    async fillFromOtherLocale({ auditLog, source, target, documentId, }) {
        const targetEntity = await this.getById({ documentId, locale: target });
        return await this.i18nNavigationContentsCopy({
            source: await this.getById({ documentId, locale: source, populate: ['related'] }),
            target: targetEntity,
        })
            .then(() => this.getById({ documentId, locale: target, populate: ['related'] }))
            .then((newEntity) => {
            (0, utils_3.sendAuditLog)(auditLog, 'onChangeNavigation', {
                actionType: 'UPDATE',
                oldEntity: targetEntity,
                newEntity,
            });
            return newEntity;
        });
    },
    async i18nNavigationContentsCopy({ source, target, }) {
        var _a, _b;
        const commonService = (0, utils_2.getPluginService)(context, 'common');
        const sourceItems = (_a = source.items) !== null && _a !== void 0 ? _a : [];
        const navigationRepository = (0, repositories_1.getNavigationRepository)(context);
        if ((_b = target.items) === null || _b === void 0 ? void 0 : _b.length) {
            throw new app_errors_1.FillNavigationError('Current navigation is non-empty');
        }
        if (!target.locale) {
            throw new app_errors_1.FillNavigationError('Current navigation does not have specified locale');
        }
        if (!sourceItems.length) {
            throw new app_errors_1.FillNavigationError('Source navigation is empty');
        }
        const entities = new Map();
        const itemProcessor = (0, utils_3.processItems)({
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
    async readNavigationItemFromLocale({ path, source, target, }) {
        const sourceNavigation = await this.getById({ documentId: source });
        const targetNavigation = await this.getById({ documentId: target });
        if (!sourceNavigation) {
            throw new utils_1.errors.NotFoundError('Unable to find source navigation for specified query');
        }
        if (!targetNavigation) {
            throw new utils_1.errors.NotFoundError('Unable to find target navigation for specified query');
        }
        const requiredFields = [
            'path',
            'related',
            'type',
            'uiRouterKey',
            'title',
            'externalPath',
        ];
        const structurePath = path.split('.').map((p) => parseInt(p, 10));
        if (!structurePath.some(Number.isNaN) || !structurePath.length) {
            new app_errors_1.InvalidParamNavigationError('Path is invalid');
        }
        let result = (0, lodash_1.get)(sourceNavigation.items, (0, utils_3.intercalate)('items', structurePath.map(lodash_1.toString)));
        if (!result) {
            throw new utils_1.errors.NotFoundError('Unable to find navigation item');
        }
        return schemas_1.readNavigationItemFromLocaleSchema.parse((0, lodash_1.pick)(result, requiredFields));
    },
    async getContentTypeItems({ query, uid, }) {
        var _a;
        const commonService = (0, utils_2.getPluginService)(context, 'common');
        const pluginStore = await commonService.getPluginStore();
        const config = await pluginStore.get({ key: 'config' }).then(schemas_1.DynamicSchemas.configSchema.parse);
        const where = {
            publishedAt: {
                $notNull: true,
            },
        };
        const contentType = (0, lodash_1.get)(context.strapi.contentTypes, uid);
        const { draftAndPublish } = contentType.options;
        const { localized = false } = ((_a = contentType === null || contentType === void 0 ? void 0 : contentType.pluginOptions) === null || _a === void 0 ? void 0 : _a.i18n) || {};
        if (localized && query.locale) {
            where.locale = query.locale;
        }
        const repository = (0, repositories_1.getGenericRepository)(context, uid);
        try {
            const contentTypeItems = await repository.findMany(where, config.contentTypesPopulate[uid] || [], draftAndPublish ? 'published' : undefined);
            return contentTypeItems;
        }
        catch (err) {
            console.error(err);
            return [];
        }
    },
    async purgeNavigationCache(documentId, clearLocalisations) {
        const navigationRepository = (0, repositories_1.getNavigationRepository)(context);
        const entity = await navigationRepository.findOne({ filters: { documentId } });
        if (!entity) {
            throw new utils_1.errors.NotFoundError('Navigation is not defined');
        }
        const mapToRegExp = (documentId) => new RegExp(`/api/navigation/render/${documentId}`);
        let regexps = [mapToRegExp(entity.documentId)];
        if (clearLocalisations) {
            const navigations = await navigationRepository.find({
                filters: {
                    documentId: entity.documentId,
                },
            });
            regexps = navigations.map(({ documentId }) => mapToRegExp(documentId));
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
exports.default = adminService;
