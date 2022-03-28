import { find, get, isEmpty, isNil, last, map, upperFirst } from "lodash";
import pluralize from "pluralize";
import { Id, StrapiContentType, StrapiContext, StrapiStore } from "strapi-typed";
import { ContentTypeEntity, ICommonService, Navigation, NavigationActions, NavigationActionsPerItem, NavigationItem, NavigationItemRelated, NavigationPluginConfig, ToBeFixed } from "../../types";
import { checkDuplicatePath, extractMeta, getPluginService, isContentTypeEligible, KIND_TYPES, singularize } from "../utils";

const commonService: (context: StrapiContext) => ICommonService = ({ strapi }) => ({
	analyzeBranch(
		items: Array<NavigationItem> = [],
		masterEntity: Navigation | null = null,
		parentItem: NavigationItem | null = null,
		prevOperations: NavigationActions = {},
	): Promise<Array<NavigationActionsPerItem>> {
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

	async configContentTypes(viaSettingsPage: boolean = false): Promise<StrapiContentType<any>[]> {
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

	createBranch(
		items: Array<NavigationItem> = [],
		masterEntity: Navigation | null = null,
		parentItem: NavigationItem | null = null,
		operations: NavigationActions = {}
	) {
		const commonService = getPluginService<ICommonService>('common');
		const { itemModel } = extractMeta(strapi.plugins);
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
					? commonService.createBranch(
						item.items as NavigationItem[],
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

	async getContentTypeItems(uid: string): Promise<ContentTypeEntity[]> {
		const commonService = getPluginService<ICommonService>('common');
		const pluginStore = await commonService.getPluginStore();
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

	async getPluginStore(): Promise<StrapiStore> {
		return await strapi.store({ type: 'plugin', name: 'navigation' });
	},

	async getRelatedItems(entityItems: NavigationItem[]): Promise<NavigationItem[]> {
		const commonService = getPluginService<ICommonService>('common');
		const pluginStore = await commonService.getPluginStore();
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

	removeBranch(
		items: NavigationItem[] = [],
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
						this.removeRelated(related as NavigationItemRelated[], master as Navigation),
					]);
					return !isEmpty(item.items)
						? commonService.removeBranch(
							item.items as NavigationItem[],
							operations,
						)
						: operations;
				}),
		);
	},

	removeRelated(
		relatedItems: Array<NavigationItemRelated>,
		master: Navigation,
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

	async setDefaultConfig(): Promise<NavigationPluginConfig> {
		const commonService = getPluginService<ICommonService>('common');
		const pluginStore = await commonService.getPluginStore()
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
		await pluginStore.set({ key: 'config', value: defaultConfigValue });

		return defaultConfigValue;
	},

	async updateBranch(
		toUpdate: NavigationItem[],
		masterEntity: Navigation | null,
		parentItem: NavigationItem | null,
		operations: NavigationActions
	) {
		const commonService = getPluginService<ICommonService>('common');
		const { itemModel } = extractMeta(strapi.plugins);
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
					? commonService.analyzeBranch(
						items as NavigationItem[],
						masterEntity,
						currentItem,
						operations,
					)
					: operations;
			}),
		);
	},
});

export = commonService;