import { first, get, isEmpty, isNil, isObject, isString, last, toNumber } from "lodash";
import slugify from "slugify";
import { Id, StrapiContext } from "strapi-typed";
import { validate } from "uuid";
import { Audience, IAdminService, IClientService, ICommonService, Navigation, NavigationItem, NavigationItemRelated, NavigationItemType, RenderType, RFRNavItem } from "../../types"
import { composeItemTitle, extractMeta, filterByPath, filterOutUnpublished, getPluginService, templateNameFactory } from "../utils";
//@ts-ignore
import errors from '@strapi/utils';

const clientService: (context: StrapiContext) => IClientService = ({ strapi }) => ({
	async render(
		idOrSlug: Id | string,
		type: RenderType = RenderType.FLAT,
		menuOnly: boolean = false,
		rootPath: string | null = null,
	): Promise<Array<NavigationItem>> {
		const clientService = getPluginService<IClientService>('client');

		const findById = !isNaN(toNumber(idOrSlug)) || validate(idOrSlug as string);
		const criteria = findById ? { id: idOrSlug } : { slug: idOrSlug };
		const itemCriteria = menuOnly ? { menuAttached: true } : {};
		const x = await clientService.renderType(type, criteria, itemCriteria, null, rootPath);
		return x;
	},

	async renderChildren(
		idOrSlug: Id | string,
		childUIKey: string,
		type: RenderType = RenderType.FLAT,
		menuOnly: boolean = false,
	): Promise<NavigationItem[]> {
		const clientService = getPluginService<IClientService>('client');
		const findById = !isNaN(toNumber(idOrSlug)) || validate(idOrSlug as string);
		const criteria = findById ? { id: idOrSlug } : { slug: idOrSlug };
		const filter = type === RenderType.FLAT ? null : childUIKey;

		const itemCriteria = {
			...(menuOnly && { menuAttached: true }),
			...(type === RenderType.FLAT ? { uiRouterKey: childUIKey } : {}),
		};

		return clientService.renderType(type, criteria, itemCriteria, filter, null);
	},

	renderRFR(
		items: Array<NavigationItem>,
		parent: Id | null = null,
		parentNavItem: RFRNavItem | null = null,
		contentTypes = []
	) {
		const clientService = getPluginService<IClientService>('client');
		let pages = {};
		let nav = {};
		let navItems: RFRNavItem[] = [];

		items.forEach(item => {
			const { items: itemChilds, ...itemProps } = item;
			const itemNav = clientService.renderRFRNav(itemProps);
			const itemPage = clientService.renderRFRPage(
				itemProps,
				parent,
			);

			if (item.type === NavigationItemType.INTERNAL) {
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
					.filter(navItem => navItem.type === NavigationItemType.INTERNAL.toLowerCase());
				if (!isEmpty(navLevel))
					nav = {
						...nav,
						[parent]: ([] as RFRNavItem[]).concat(parentNavItem ? parentNavItem : [], navLevel),
					};
			}

			if (!isEmpty(itemChilds)) {
				const { nav: nestedNavs } = clientService.renderRFR(
					itemChilds as NavigationItem[],
					itemPage.id,
					itemNav,
					contentTypes,
				);
				const { pages: nestedPages } = clientService.renderRFR(
					(itemChilds as NavigationItem[]).filter(child => child.type === NavigationItemType.INTERNAL),
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
			page: type === NavigationItemType.INTERNAL ? uiRouterKey : undefined,
			url: type === NavigationItemType.EXTERNAL ? path : undefined,
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
			related: type === NavigationItemType.INTERNAL ? {
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

	async renderType(
		type: RenderType = RenderType.FLAT,
		criteria = {},
		itemCriteria = {},
		filter = null,
		rootPath: string | null = null
	): Promise<Array<NavigationItem>> {
		const clientService = getPluginService<IClientService>('client');
		const adminService = getPluginService<IAdminService>('admin');
		const commonService = getPluginService<ICommonService>('common');

		const { masterModel, itemModel } = extractMeta(
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
			const items = await commonService.getRelatedItems(entities);
			const { contentTypes, contentTypesNameFields } = await adminService.config(false);

			switch (type) {
				case RenderType.TREE:
				case RenderType.RFR:
					const getTemplateName = await templateNameFactory(items, strapi, contentTypes);
					const itemParser = (item: NavigationItem, path: string = '', field: keyof NavigationItem): NavigationItem => {
						const isExternal = item.type === NavigationItemType.EXTERNAL;
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
							items: isExternal ? undefined : clientService.renderTree(
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

					const treeStructure = clientService.renderTree(
						isNil(rootPath) ? items : itemsFilteredByPath,
						get(rootElement, 'parent.id'),
						'parent',
						get(rootElement, 'parent.path'),
						itemParser,
					);

					const filteredStructure = filter
						? treeStructure.filter((item: NavigationItem) => item.uiRouterKey === filter)
						: treeStructure;

					if (type === RenderType.RFR) {
						return clientService.renderRFR(
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
		throw new errors.NotFoundError();
	},
});

export = clientService;
