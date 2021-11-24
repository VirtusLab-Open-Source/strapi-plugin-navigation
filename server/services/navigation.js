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
	}

}