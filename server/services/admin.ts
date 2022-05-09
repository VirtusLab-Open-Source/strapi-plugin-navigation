// @ts-ignore
import { errors } from "@strapi/utils"
import slugify from "slugify";
import { isNil, isObject } from "lodash";
import { Id, StrapiContext } from "strapi-typed";
import { Audience, AuditLogContext, IAdminService, ICommonService, Navigation, NavigationItemEntity, NavigationPluginConfig, ToBeFixed } from "../../types";
import { ADDITIONAL_FIELDS, ALLOWED_CONTENT_TYPES, buildNestedStructure, CONTENT_TYPES_NAME_FIELDS_DEFAULTS, DEFAULT_POPULATE, extractMeta, getPluginService, prepareAuditLog, RESTRICTED_CONTENT_TYPES, sendAuditLog } from "../utils";
import { addI18NConfigFields, getI18nStatus, I18NConfigFields, i18nNavigationContentsCopy, i18nNavigationItemRead } from "../i18n";
import { NavigationError } from "../../utils/NavigationError";

type SettingsPageConfig = NavigationPluginConfig & I18NConfigFields

const adminService: (context: StrapiContext) => IAdminService = ({ strapi }) => ({
  async config(viaSettingsPage = false): Promise<SettingsPageConfig> {
    const commonService = getPluginService<ICommonService>('common');
    const { audienceModel } = extractMeta(strapi.plugins);
    const pluginStore = await commonService.getPluginStore()
    const config: NavigationPluginConfig = await pluginStore.get({ key: 'config' });

    const additionalFields = config.additionalFields;
    const contentTypesNameFields = config.contentTypesNameFields;
    const contentTypesPopulate = config.contentTypesPopulate;
    const allowedLevels = config.allowedLevels;
    const isGQLPluginEnabled = !isNil(strapi.plugin('graphql'));

    let extendedResult: Record<string, unknown> = {
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
    const i18nConfig = await addI18NConfigFields({ strapi, viaSettingsPage, previousConfig: {} });

    if (additionalFields.includes(ADDITIONAL_FIELDS.AUDIENCE)) {
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
      ...i18nConfig,
    };
  },

  async get(): Promise<Navigation[]> {
    const { masterModel } = extractMeta(strapi.plugins);
    const entities = await strapi
      .query<Navigation>(masterModel.uid)
      .findMany({
        limit: Number.MAX_SAFE_INTEGER,
        populate: DEFAULT_POPULATE,
      });
    return entities;
  },

  async getById(id: Id): Promise<Navigation> {
    const commonService = getPluginService<ICommonService>('common');

    const { masterModel, itemModel } = extractMeta(strapi.plugins);
    const entity = await strapi
      .query<Navigation>(masterModel.uid)
      .findOne({ where: { id }, populate: DEFAULT_POPULATE });

    const entityItems = await strapi
      .query<NavigationItemEntity>(itemModel.uid)
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

    const result = commonService
      .createBranch(payload.items, existingEntity, null, {})
      .then(() => adminService.getById(existingEntity.id))
      .then((newEntity: Navigation) => {
        sendAuditLog(auditLog, 'onChangeNavigation',
          { actionType: 'CREATE', oldEntity: existingEntity, newEntity });
        return newEntity;
      });

    await commonService.emitEvent(masterModel.uid, 'entry.create', existingEntity);
    return result
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
    const result = commonService
      .analyzeBranch(payload.items, existingEntity)
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

    const navigationEntity = await strapi.query<Navigation>(masterModel.uid).findOne({ where: { id } });
    await commonService.emitEvent(masterModel.uid, 'entry.update', navigationEntity);
    return result
  },

  async restart(): Promise<void> {
    setImmediate(() => strapi.reload());
  },

  async restoreConfig(): Promise<void> {
    const commonService = getPluginService<ICommonService>('common');
    const pluginStore = await commonService.getPluginStore();
    await pluginStore.delete({ key: 'config' });
    await commonService.setDefaultConfig();
  },

  async updateConfig(newConfig: NavigationPluginConfig): Promise<void> {
    const commonService = getPluginService<ICommonService>('common');
    const pluginStore = await commonService.getPluginStore()
    await pluginStore.set({ key: 'config', value: newConfig });
  },

  async fillFromOtherLocale({ target, source, auditLog }) {
    const { enabled } = await getI18nStatus({ strapi })

    if (!enabled) {
      throw new NavigationError("Not yet implemented.");
    }

    const adminService = getPluginService<IAdminService>('admin');
    const commonService = getPluginService<ICommonService>('common');
    const targetEntity = await adminService.getById(target);

    return await i18nNavigationContentsCopy({
      source: await adminService.getById(source),
      target: targetEntity,
      service: commonService,
      strapi,
    })
      .then(() => adminService.getById(target))
      .then((updated) => {
        sendAuditLog(auditLog, 'onChangeNavigation',
          { actionType: 'UPDATE', oldEntity: targetEntity, newEntity: updated });
        return updated;
      });
  },
  async readNavigationItemFromLocale({ source, target, path }) {
    const sourceNavigation = await this.getById(source);
    const targetNavigation = await this.getById(target);

    if (!sourceNavigation) {
      throw new errors.NotFoundError("Unable to find source navigation for specified query");
    }

    if (!targetNavigation) {
      throw new errors.NotFoundError("Unable to find target navigation for specified query");
    }

    return await i18nNavigationItemRead({
      path,
      source: sourceNavigation,
      target: targetNavigation,
      strapi,
    });
  },
});

export default adminService;
