"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@strapi/utils");
const lodash_1 = require("lodash");
const app_errors_1 = require("../../app-errors");
const repositories_1 = require("../../repositories");
const utils_2 = require("../../utils");
const utils_3 = require("./utils");
const clientService = (context) => ({
    async readAll({ locale, orderBy = 'createdAt', orderDirection = 'DESC' }) {
        const repository = (0, repositories_1.getNavigationRepository)(context);
        const navigations = repository.find({
            locale,
            orderBy: { [orderBy]: orderDirection },
        });
        return navigations;
    },
    renderRFRNavigationItem({ item }) {
        const { uiRouterKey, title, path, type, audience, additionalFields } = item;
        const itemCommon = {
            label: title,
            type: type,
            audience: audience === null || audience === void 0 ? void 0 : audience.map(({ key }) => key),
            additionalFields,
        };
        if (type === 'WRAPPER') {
            return { ...itemCommon };
        }
        if (type === 'EXTERNAL') {
            (0, utils_2.assertNotEmpty)(path, new app_errors_1.NavigationError("External navigation item's path is undefined", item));
            return {
                ...itemCommon,
                url: path,
            };
        }
        if (type === 'INTERNAL') {
            return {
                ...itemCommon,
                page: uiRouterKey,
            };
        }
        if (type === 'WRAPPER') {
            return {
                ...itemCommon,
            };
        }
        throw new app_errors_1.NavigationError('Unknown item type', item);
    },
    renderRFRPage({ item, parent, enabledCustomFieldsNames }) {
        const { documentId, uiRouterKey, title, path, related, type, audience, menuAttached, additionalFields, } = item;
        const additionalFieldsRendered = enabledCustomFieldsNames.reduce((acc, field) => ({ ...acc, [field]: additionalFields === null || additionalFields === void 0 ? void 0 : additionalFields[field] }), {});
        return {
            id: uiRouterKey,
            documentId,
            title,
            related: type === 'INTERNAL' && (related === null || related === void 0 ? void 0 : related.documentId) && (related === null || related === void 0 ? void 0 : related.__type)
                ? {
                    contentType: related.__type,
                    documentId: related.documentId,
                }
                : undefined,
            path,
            parent,
            audience,
            menuAttached,
            additionalFields: additionalFieldsRendered,
        };
    },
    renderRFR({ items, parent, parentNavItem, contentTypes = [], enabledCustomFieldsNames, }) {
        const navItems = [];
        let nav = {};
        let pages = {};
        items.forEach((item) => {
            const { items: itemChildren, ...restOfItem } = item;
            const itemNav = this.renderRFRNavigationItem({
                item: restOfItem,
            });
            const itemPage = this.renderRFRPage({
                item: restOfItem,
                parent,
                enabledCustomFieldsNames,
            });
            if (item.type !== 'EXTERNAL') {
                pages = {
                    ...pages,
                    [itemPage.documentId]: {
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
            }
            else {
                const navigationLevel = navItems.filter((navItem) => navItem.type);
                if (!(0, lodash_1.isEmpty)(navigationLevel))
                    nav = {
                        ...nav,
                        [parent]: navigationLevel.concat(parentNavItem ? parentNavItem : []),
                    };
            }
            if (!(0, lodash_1.isEmpty)(itemChildren)) {
                const { nav: nestedNavs } = this.renderRFR({
                    items: itemChildren !== null && itemChildren !== void 0 ? itemChildren : [],
                    parent: itemPage.documentId,
                    parentNavItem: itemNav,
                    contentTypes,
                    enabledCustomFieldsNames,
                });
                const { pages: nestedPages } = this.renderRFR({
                    items: itemChildren || [],
                    parent: itemPage.documentId,
                    parentNavItem: itemNav,
                    contentTypes,
                    enabledCustomFieldsNames,
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
    renderTree({ items = [], documentId, path = '', itemParser = (i) => Promise.resolve(i), }) {
        return Promise.all(items.reduce((acc, item) => {
            var _a;
            if (((_a = item.parent) === null || _a === void 0 ? void 0 : _a.documentId) === documentId) {
                acc.push(itemParser((0, lodash_1.cloneDeep)(item), path));
            }
            return acc;
        }, [])).then((result) => result.sort((x, y) => {
            if (x.order !== undefined && y.order !== undefined) {
                return x.order - y.order;
            }
            return 0;
        }));
    },
    getCustomFields(additionalFields) {
        return additionalFields.reduce((acc, field) => {
            if (field !== 'audience') {
                acc.push(field);
            }
            return acc;
        }, []);
    },
    async renderType({ criteria = {}, filter, itemCriteria = {}, locale, populate, rootPath, type = 'FLAT', wrapRelated, }) {
        var _a, _b;
        const adminService = (0, utils_2.getPluginService)(context, 'admin');
        const commonService = (0, utils_2.getPluginService)(context, 'common');
        const entityWhereClause = {
            ...criteria,
            visible: true,
        };
        const navigationRepository = (0, repositories_1.getNavigationRepository)(context);
        const navigationItemRepository = (0, repositories_1.getNavigationItemRepository)(context);
        let navigation;
        if (locale) {
            navigation = await navigationRepository.find({
                filters: {
                    ...entityWhereClause,
                },
                locale,
                limit: 1,
            });
        }
        else {
            navigation = await navigationRepository.find({
                filters: entityWhereClause,
                limit: 1,
            });
        }
        if ((0, lodash_1.isArray)(navigation)) {
            navigation = (0, lodash_1.first)(navigation);
        }
        if (navigation && navigation.documentId) {
            const navigationItems = await navigationItemRepository.find({
                filters: {
                    master: (0, lodash_1.pick)(navigation, ['slug', 'id']),
                    ...itemCriteria,
                },
                locale,
                limit: Number.MAX_SAFE_INTEGER,
                order: [{ order: 'asc' }],
                populate: ['audience', 'parent', 'related'],
            });
            const mappedItems = await commonService.mapToNavigationItemDTO({
                locale,
                master: navigation,
                navigationItems,
                populate,
            });
            const { contentTypes, contentTypesNameFields, additionalFields } = await adminService.config({
                viaSettingsPage: false,
            });
            const enabledCustomFieldsNames = this.getCustomFields(additionalFields).reduce((acc, curr) => (curr.enabled ? [...acc, curr.name] : acc), []);
            const wrapContentType = (itemContentType) => wrapRelated && itemContentType
                ? {
                    documentId: itemContentType.documentId,
                    ...itemContentType,
                }
                : itemContentType;
            const customFieldsDefinitions = additionalFields.filter((_) => typeof _ !== 'string');
            const additionalFieldsMapper = (item) => (acc, field) => {
                var _a;
                const fieldDefinition = customFieldsDefinitions.find(({ name }) => name === field);
                let content = (_a = item.additionalFields) === null || _a === void 0 ? void 0 : _a[field];
                if (content) {
                    switch (fieldDefinition === null || fieldDefinition === void 0 ? void 0 : fieldDefinition.type) {
                        case 'media':
                            content = JSON.parse(content);
                            break;
                        case 'boolean':
                            content = content === 'true';
                            break;
                        default:
                            break;
                    }
                }
                return { ...acc, [field]: content };
            };
            switch (type) {
                case 'TREE':
                case 'RFR':
                    const itemParser = async (item, path = '') => {
                        var _a, _b;
                        const isExternal = item.type === 'EXTERNAL';
                        const parentPath = isExternal
                            ? undefined
                            : `${path === '/' ? '' : path}/${(0, lodash_1.first)(item.path) === '/' ? item.path.substring(1) : item.path}`;
                        const slug = typeof parentPath === 'string'
                            ? await commonService.getSlug({
                                query: ((0, lodash_1.first)(parentPath) === '/'
                                    ? parentPath.substring(1)
                                    : parentPath).replace(/\//g, '-'),
                            })
                            : undefined;
                        const lastRelated = (0, lodash_1.isArray)(item.related) ? (0, lodash_1.last)(item.related) : item.related;
                        const relatedContentType = wrapContentType(lastRelated);
                        const customFields = enabledCustomFieldsNames.reduce(additionalFieldsMapper(item), {});
                        return {
                            id: item.id,
                            documentId: item.documentId,
                            title: (_a = (0, utils_3.composeItemTitle)(item, contentTypesNameFields, contentTypes)) !== null && _a !== void 0 ? _a : 'Title missing',
                            menuAttached: item.menuAttached,
                            order: item.order,
                            path: (_b = (isExternal ? item.externalPath : parentPath)) !== null && _b !== void 0 ? _b : 'Path is missing',
                            type: item.type,
                            uiRouterKey: item.uiRouterKey,
                            slug: !slug && item.uiRouterKey
                                ? await commonService.getSlug({ query: item.uiRouterKey })
                                : slug,
                            related: isExternal || !lastRelated
                                ? undefined
                                : {
                                    ...relatedContentType,
                                },
                            audience: !(0, lodash_1.isEmpty)(item.audience) ? item.audience : undefined,
                            items: await this.renderTree({
                                itemParser,
                                path: parentPath,
                                documentId: item.documentId,
                                items: mappedItems,
                            }),
                            collapsed: item.collapsed,
                            additionalFields: customFields || {},
                        };
                    };
                    const { items: itemsFilteredByPath, root: rootElement } = (0, utils_3.filterByPath)(mappedItems, rootPath);
                    const treeStructure = (await this.renderTree({
                        itemParser,
                        items: (0, lodash_1.isNil)(rootPath) ? mappedItems : itemsFilteredByPath,
                        path: (_a = rootElement === null || rootElement === void 0 ? void 0 : rootElement.parent) === null || _a === void 0 ? void 0 : _a.path,
                        documentId: (_b = rootElement === null || rootElement === void 0 ? void 0 : rootElement.parent) === null || _b === void 0 ? void 0 : _b.documentId,
                    }));
                    const filteredStructure = filter
                        ? treeStructure.filter((item) => item.uiRouterKey === filter)
                        : treeStructure;
                    if (type === 'RFR') {
                        return this.renderRFR({
                            items: filteredStructure,
                            contentTypes: contentTypes.map((_) => _.contentTypeName),
                            enabledCustomFieldsNames,
                        });
                    }
                    return filteredStructure;
                default:
                    const result = (0, lodash_1.isNil)(rootPath) ? mappedItems : (0, utils_3.filterByPath)(mappedItems, rootPath).items;
                    const defaultCache = new Map();
                    const getNestedOrders = (documentId, cache = defaultCache) => {
                        const cached = cache.get(documentId);
                        if (!(0, lodash_1.isNil)(cached))
                            return cached;
                        const item = result.find((item) => item.documentId === documentId);
                        if ((0, lodash_1.isNil)(item))
                            return [];
                        const { order, parent } = item;
                        const nestedOrders = parent
                            ? getNestedOrders(parent.documentId, cache).concat(order)
                            : [order];
                        cache.set(documentId, nestedOrders);
                        return nestedOrders;
                    };
                    return result
                        .map((item) => {
                        var _a;
                        const additionalFieldsMapped = enabledCustomFieldsNames.reduce(additionalFieldsMapper(item), {});
                        return {
                            ...item,
                            audience: (_a = item.audience) === null || _a === void 0 ? void 0 : _a.map((_) => _.key),
                            title: (0, utils_3.composeItemTitle)(item, contentTypesNameFields, contentTypes) || '',
                            related: wrapContentType(item.related),
                            items: null,
                            additionalFields: additionalFieldsMapped,
                        };
                    })
                        .sort((a, b) => (0, utils_3.compareArraysOfNumbers)(getNestedOrders(a.documentId), getNestedOrders(b.documentId)));
            }
        }
        throw new utils_1.errors.NotFoundError();
    },
    renderChildren({ childUIKey, idOrSlug, locale, menuOnly, type = 'FLAT', wrapRelated, }) {
        const criteria = { $or: [{ documentId: idOrSlug }, { slug: idOrSlug }] };
        const filter = type === 'FLAT' ? undefined : childUIKey;
        const itemCriteria = {
            ...(menuOnly && { menuAttached: true }),
            ...(type === 'FLAT' ? { uiRouterKey: childUIKey } : {}),
        };
        return this.renderType({
            type,
            criteria,
            itemCriteria,
            filter,
            wrapRelated,
            locale,
        });
    },
    render({ idOrSlug, locale, menuOnly, populate, rootPath, type = 'FLAT', wrapRelated, }) {
        const criteria = { $or: [{ documentId: idOrSlug }, { slug: idOrSlug }] };
        const itemCriteria = menuOnly ? { menuAttached: true } : {};
        return this.renderType({
            type,
            criteria,
            itemCriteria,
            rootPath,
            wrapRelated,
            locale,
            populate,
        });
    },
});
exports.default = clientService;
