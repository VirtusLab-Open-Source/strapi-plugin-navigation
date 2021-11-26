const pluralize = require('pluralize');
const {
	find,
	get,
	isNil,
	isObject,
	last,
	upperFirst,
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
			const { pluginName, masterModel } = utilsFunctions.extractMeta(strapi.plugins);
			const entities = await strapi
				.query(`plugin::${pluginName}.${masterModel.modelName}`)
				.findMany({
					_limit: -1,
				}, []);
			return entities;
		},

		async getById(id) {
			const { pluginName, masterModel, itemModel } = utilsFunctions.extractMeta(strapi.plugins);
			const entity = await strapi
				.query(`plugin::${pluginName}.${masterModel.modelName}`)
				.findOne({ id });

			const entityItems = await strapi
				.query(`plugin::${pluginName}.${itemModel.modelName}`)
				.findMany({
					master: id,
					_limit: -1,
					_sort: 'order:asc',
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
			const relatedTypes = new Set(entityItems.flatMap((item) => map(item.related, 'relatedType')));
			const groupedItems = Array.from(relatedTypes).reduce(
				(acc, relatedType) => Object.assign(acc, {
					[relatedType]: [
						...(acc[relatedType] || []),
						...entityItems
							.filter((item => item?.related.some(related => related.relatedType === relatedType)))
							.flatMap((item) => item.related.map(related => Object.assign(related, { navigationItemId: item.id }))),
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
													({ relatedId }) => relatedId === _.id.toString())?.navigationItemId,
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
		}
	}
}