"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@strapi/utils");
const slugify_1 = __importDefault(require("@sindresorhus/slugify"));
const lodash_1 = require("lodash");
const config_1 = require("../../config");
const repositories_1 = require("../../repositories");
const schemas_1 = require("../../schemas");
const utils_2 = require("./utils");
const lifecycleHookListeners = {
    navigation: {},
    'navigation-item': {},
};
const commonService = (context) => ({
    async getPluginStore() {
        return await strapi.store({ type: 'plugin', name: 'navigation' });
    },
    async mapToNavigationItemDTO({ locale, master, navigationItems, parent, populate, }) {
        const result = [];
        const pluginStore = await this.getPluginStore();
        const config = await pluginStore
            .get({
            key: 'config',
        })
            .then(schemas_1.DynamicSchemas.configSchema.parse);
        const extendedNavigationItems = await Promise.all(navigationItems.map(async (item) => {
            var _a;
            if (!((_a = item.related) === null || _a === void 0 ? void 0 : _a.__type) || !item.related.documentId) {
                return item;
            }
            const fieldsToPopulate = config.contentTypesPopulate[item.related.__type];
            if (!(fieldsToPopulate === null || fieldsToPopulate === void 0 ? void 0 : fieldsToPopulate.length)) {
                return item;
            }
            const repository = (0, repositories_1.getGenericRepository)({ strapi }, item.related.__type);
            const related = await repository.findById(item.related.documentId, fieldsToPopulate, 'published', {
                locale,
            });
            return {
                ...item,
                related: {
                    ...related,
                    __type: item.related.__type,
                    documentId: item.related.documentId,
                },
            };
        }));
        for (const navigationItem of extendedNavigationItems) {
            const { items = [], ...base } = navigationItem;
            result.push({
                ...base,
                parent: parent !== null && parent !== void 0 ? parent : base.parent,
                items: await this.mapToNavigationItemDTO({
                    navigationItems: items,
                    populate,
                    master,
                    parent: base,
                    locale,
                }),
            });
        }
        return result;
    },
    setDefaultConfig() {
        return (0, config_1.configSetup)({ strapi, forceDefault: true });
    },
    getBranchName({ item }) {
        const hasId = !!item.documentId;
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
    async analyzeBranch({ masterEntity, navigationItems = [], parentItem, prevAction = {}, }) {
        const { toCreate, toRemove, toUpdate } = navigationItems.reduce((acc, navigationItem) => {
            const branchName = this.getBranchName({
                item: navigationItem,
            });
            return branchName ? { ...acc, [branchName]: [...acc[branchName], navigationItem] } : acc;
        }, {
            toRemove: [],
            toCreate: [],
            toUpdate: [],
        });
        const action = {
            create: prevAction.create || toCreate.length > 0,
            update: prevAction.update || toUpdate.length > 0,
            remove: prevAction.remove || toRemove.length > 0,
        };
        const checkData = [...toCreate, ...toUpdate];
        await (0, utils_2.checkDuplicatePath)({
            checkData,
            parentItem,
        });
        return Promise.all([
            this.createBranch({
                action,
                masterEntity,
                navigationItems: toCreate,
                parentItem,
            }),
            this.removeBranch({
                navigationItems: toRemove,
                action,
            }),
            this.updateBranch({
                action,
                masterEntity,
                navigationItems: toUpdate,
                parentItem,
            }),
        ]).then(([a, b, c]) => [...a, ...b, ...c]);
    },
    async removeBranch({ navigationItems = [], action = {}, }) {
        var _a;
        const navigationActions = [];
        for (const navigationItem of navigationItems) {
            if (!navigationItem.documentId) {
                continue;
            }
            action.remove = true;
            await (0, repositories_1.getNavigationItemRepository)(context).remove(navigationItem);
            navigationActions.push(action);
            if (!!((_a = navigationItem.items) === null || _a === void 0 ? void 0 : _a.length)) {
                const innerResult = await this.removeBranch({
                    navigationItems: navigationItem.items,
                });
                innerResult.forEach((_) => {
                    navigationActions.push(_);
                });
            }
        }
        return navigationActions;
    },
    async createBranch({ action, masterEntity, navigationItems, parentItem, }) {
        var _a;
        let navigationActions = [];
        for (const navigationItem of navigationItems) {
            action.create = true;
            const { parent, master, items, documentId, id, ...params } = navigationItem;
            const insertDetails = documentId && id
                ? {
                    ...params,
                    documentId,
                    id,
                    master: masterEntity ? masterEntity.id : undefined,
                    parent: parentItem ? parentItem.id : undefined,
                }
                : {
                    ...params,
                    documentId: undefined,
                    id: undefined,
                    master: masterEntity ? masterEntity.id : undefined,
                    parent: parentItem ? parentItem.id : undefined,
                };
            const nextParentItem = await (0, repositories_1.getNavigationItemRepository)(context).save({
                item: insertDetails,
                locale: masterEntity === null || masterEntity === void 0 ? void 0 : masterEntity.locale,
            });
            if (!!((_a = navigationItem.items) === null || _a === void 0 ? void 0 : _a.length)) {
                const innerActions = await this.createBranch({
                    action: {},
                    masterEntity,
                    navigationItems: navigationItem.items,
                    parentItem: nextParentItem,
                });
                navigationActions = navigationActions.concat(innerActions).concat([action]);
            }
            else {
                navigationActions.push(action);
            }
        }
        return navigationActions;
    },
    async updateBranch({ masterEntity, navigationItems, action, parentItem, }) {
        const result = [];
        for (const updateDetails of navigationItems) {
            action.update = true;
            const { documentId, updated, parent, master, items, ...params } = updateDetails;
            let currentItem;
            if (updated) {
                currentItem = await (0, repositories_1.getNavigationItemRepository)(context).save({
                    item: {
                        documentId,
                        ...params,
                    },
                    locale: masterEntity === null || masterEntity === void 0 ? void 0 : masterEntity.locale,
                });
            }
            else {
                currentItem = updateDetails;
            }
            if (!!(items === null || items === void 0 ? void 0 : items.length)) {
                const innerResult = await this.analyzeBranch({
                    navigationItems: items,
                    prevAction: {},
                    masterEntity,
                    parentItem: currentItem,
                });
                innerResult.forEach((_) => {
                    result.push(_);
                });
            }
            else {
                result.push(action);
            }
        }
        return result;
    },
    async emitEvent({ entity, event, uid }) {
        // TODO: This could be enhanced by reacting not only with webhook but by firing all listeners in Navigation Event Hub
        // Any developer could register new listener for any event in Navigation Plugin
        // For now there is only one event 'navigation.update' so implementing Event hub is not valid.
        const model = strapi.getModel(uid);
        const sanitizedEntity = await utils_1.sanitize.sanitizers.defaultSanitizeOutput({
            ...model,
            schema: model.__schema__,
            getModel: () => model,
        }, entity);
        if (strapi.webhookRunner) {
            strapi.webhookRunner.eventHub.emit(event, {
                model: model.modelName,
                entry: sanitizedEntity,
            });
        }
        else {
            console.warn('Webhook runner not present. Contact with Strapi Navigation Plugin team.');
        }
    },
    async pruneCustomFields({ removedFields }) {
        const removedFieldsKeys = removedFields.map(({ name }) => `additionalFields.${name}`);
        const removedFieldsNames = removedFields.map(({ name }) => name);
        const navigationItems = await (0, repositories_1.getNavigationItemRepository)(context).find({
            filters: {
                additionalFields: {
                    $contains: [removedFieldsNames],
                },
            },
        });
        const navigationItemsToUpdate = navigationItems.map((navigationItem) => (0, lodash_1.omit)(navigationItem, removedFieldsKeys));
        for (const item of navigationItemsToUpdate) {
            await (0, repositories_1.getNavigationItemRepository)(context).save({
                item: {
                    documentId: item.documentId,
                    additionalFields: item.additionalFields,
                },
            });
        }
    },
    async getSlug({ query }) {
        let slug = (0, slugify_1.default)(query);
        if (slug) {
            const existingItems = await (0, repositories_1.getNavigationItemRepository)(context).count({
                $or: [
                    {
                        uiRouterKey: {
                            $startsWith: slug,
                        },
                    },
                    { uiRouterKey: slug },
                ],
            });
            if (existingItems) {
                slug = `${slug}-${existingItems}`;
            }
        }
        return slug.toLowerCase();
    },
    registerLifeCycleHook({ callback, contentTypeName, hookName }) {
        var _a;
        if (!lifecycleHookListeners[contentTypeName][hookName]) {
            lifecycleHookListeners[contentTypeName][hookName] = [];
        }
        (_a = lifecycleHookListeners[contentTypeName][hookName]) === null || _a === void 0 ? void 0 : _a.push(callback);
    },
    async runLifeCycleHook({ contentTypeName, event, hookName }) {
        var _a;
        const hookListeners = (_a = lifecycleHookListeners[contentTypeName][hookName]) !== null && _a !== void 0 ? _a : [];
        for (const listener of hookListeners) {
            await listener(event);
        }
    },
    buildNestedStructure({ navigationItems, id, }) {
        var _a;
        return ((_a = navigationItems === null || navigationItems === void 0 ? void 0 : navigationItems.reduce((acc, navigationItem) => {
            var _a;
            if (id && ((_a = navigationItem.parent) === null || _a === void 0 ? void 0 : _a.id) !== id) {
                return acc;
            }
            acc.push({
                ...(0, lodash_1.omit)(navigationItem, ['related', 'items']),
                related: navigationItem.related,
                items: this.buildNestedStructure({
                    navigationItems,
                    id: navigationItem.id,
                }),
            });
            return acc;
        }, [])) !== null && _a !== void 0 ? _a : []);
    },
    async readLocale() {
        const localeService = strapi.plugin('i18n').service('locales');
        let defaultLocale = await localeService.getDefaultLocale();
        let restLocale = (await localeService.find({}))
            .map(({ code }) => code)
            .filter((code) => code !== defaultLocale);
        if (!defaultLocale) {
            defaultLocale = restLocale[0];
            restLocale = restLocale.slice(1);
        }
        return {
            defaultLocale,
            restLocale,
        };
    },
    updateConfigSchema: schemas_1.updateConfigSchema,
    updateCreateNavigationSchema: schemas_1.updateCreateNavigationSchema,
    updateNavigationItemAdditionalField: schemas_1.updateNavigationItemAdditionalField,
    updateNavigationItemCustomField: schemas_1.updateNavigationItemCustomField,
    updateUpdateNavigationSchema: schemas_1.updateUpdateNavigationSchema,
});
exports.default = commonService;
