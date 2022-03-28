import slugify from "slugify";
import { isNil, isObject } from "lodash";
import { Id, StrapiContext } from "strapi-typed";
import { Audience, AuditLogContext, IAdminService, ICommonService, Navigation, NavigationItem, NavigationPluginConfig, ToBeFixed } from "../../types";
import { ALLOWED_CONTENT_TYPES, buildNestedStructure, CONTENT_TYPES_NAME_FIELDS_DEFAULTS, extractMeta, getPluginService, prepareAuditLog, RESTRICTED_CONTENT_TYPES, sendAuditLog } from "../utils";
import { additionalFields as configAdditionalFields } from '../content-types/navigation-item/lifecycle';

const adminService: (context: StrapiContext) => IAdminService = ({ strapi }) => ({
	async config(viaSettingsPage = false): Promise<NavigationPluginConfig> {
		const commonService = getPluginService<ICommonService>('common');
		const { audienceModel } = extractMeta(strapi.plugins);
		const pluginStore = await commonService.getPluginStore()
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
		const configContentTypes = await commonService.configContentTypes();
		const result = {
			contentTypes: await commonService.configContentTypes(viaSettingsPage),
			contentTypesNameFields: {
				default: CONTENT_TYPES_NAME_FIELDS_DEFAULTS,
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
		const commonService = getPluginService<ICommonService>('common');

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
		const entities = await commonService.getRelatedItems(entityItems);
		return {
			...entity,
			items: buildNestedStructure(entities),
		};
	},

	async post(payload: ToBeFixed, auditLog: AuditLogContext) {
		const commonService = getPluginService<ICommonService>('common');
		const adminService = getPluginService<IAdminService>('admin');
		
		const { masterModel } = extractMeta(strapi.plugins);
		const { name, visible } = payload;
		const data = {
			name,
			slug: slugify(name).toLowerCase(),
			visible,
		}

		const existingEntity = await strapi
			.query<Navigation>(masterModel.uid)
			.create({ data });

		return commonService
			.createBranch(payload.items, existingEntity, null, {})
			.then(() => adminService.getById(existingEntity.id))
			.then((newEntity: Navigation) => {
				sendAuditLog(auditLog, 'onChangeNavigation',
					{ actionType: 'CREATE', oldEntity: existingEntity, newEntity });
				return newEntity;
			});
	},

	async put(id: Id, payload: ToBeFixed, auditLog: AuditLogContext) {
		const adminService = getPluginService<IAdminService>('admin');
		const commonService = getPluginService<ICommonService>('common');

		const { masterModel } = extractMeta(strapi.plugins);
		const { name, visible } = payload;

		const existingEntity = await adminService.getById(id);
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
		return commonService
			.analyzeBranch(payload.items, existingEntity, null, {})
			.then((auditLogsOperations: ToBeFixed) =>
				Promise.all([
					auditLog ? prepareAuditLog((auditLogsOperations || []).flat(Number.MAX_SAFE_INTEGER)) : [],
					adminService.getById(existingEntity.id)],
				))
			.then(([actionType, newEntity]: ToBeFixed) => {
				sendAuditLog(auditLog, 'onChangeNavigation',
					{ actionType, oldEntity: existingEntity, newEntity });
				return newEntity;
			});
	},

	async restart(): Promise<void> {
		setImmediate(() => strapi.reload());
	},

	async restoreConfig(): Promise<void> {
		const commonService = getPluginService<ICommonService>('common');
		const pluginStore = await commonService.getPluginStore()
		await pluginStore.delete({ key: 'config' });
		await strapi.plugin('navigation').service('navigation').setDefaultConfig();
	},

	async updateConfig(newConfig: NavigationPluginConfig): Promise<void> {
		const commonService = getPluginService<ICommonService>('common');
		const pluginStore = await commonService.getPluginStore()
		await pluginStore.set({ key: 'config', value: newConfig });
	},
});

export = adminService;
