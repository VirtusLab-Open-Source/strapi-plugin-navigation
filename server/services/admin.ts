// @ts-ignore
import { errors } from "@strapi/utils"
import slugify from "@sindresorhus/slugify";
import { differenceBy, isEmpty, isNil, isObject } from "lodash";
import { Id, StrapiContext } from "strapi-typed";
import {
  Audience,
  AuditLogContext,
  IAdminService,
  ICommonService,
  Navigation,
  NavigationItemCustomField,
  NavigationItemEntity,
  NavigationPluginConfig,
  ToBeFixed
} from "../../types";
import {
  ALLOWED_CONTENT_TYPES,
  buildNestedStructure,
  CONTENT_TYPES_NAME_FIELDS_DEFAULTS,
  DEFAULT_POPULATE,
  getPluginModels,
  getPluginService,
  prepareAuditLog,
  RESTRICTED_CONTENT_TYPES,
  sendAuditLog,
} from "../utils";
import { addI18NConfigFields, getI18nStatus, I18NConfigFields, i18nNavigationContentsCopy, i18nNavigationSetupStrategy, i18nNavigationItemRead } from "../i18n";
import { NavigationError } from "../../utils/NavigationError";

type SettingsPageConfig = NavigationPluginConfig & I18NConfigFields

const adminService: (context: StrapiContext) => IAdminService = ({ strapi }) => ({
  async config(viaSettingsPage = false): Promise<SettingsPageConfig> {
    const commonService = getPluginService<ICommonService>('common');
    const { audienceModel } = getPluginModels();
    const pluginStore = await commonService.getPluginStore()
    const config = await pluginStore.get<string, NavigationPluginConfig>({ key: 'config' });

    const additionalFields = config.additionalFields;
    const contentTypesNameFields = config.contentTypesNameFields;
    const contentTypesPopulate = config.contentTypesPopulate;
    const allowedLevels = config.allowedLevels;
    const slugify = config.slugify;
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
      slugify,
    };
    const i18nConfig = await addI18NConfigFields({ strapi, viaSettingsPage, previousConfig: {} });

    if (additionalFields.includes('audience')) {
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
    const { masterModel } = getPluginModels();
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

    const { masterModel, itemModel } = getPluginModels();
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
    const { enabled: i18nEnabled, defaultLocale } = await getI18nStatus({ strapi })
    const { slugify: customSlugifyConfig } = await adminService.config(false);

    const { masterModel } = getPluginModels();
    const { name, visible } = payload;
    const data = {
      name,
      slug: slugify(name, customSlugifyConfig).toLowerCase(),
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

    if (i18nEnabled && defaultLocale) {
      await i18nNavigationSetupStrategy({ strapi });
    }

    return result
  },

  async put(id: Id, payload: Navigation & { items: ToBeFixed }, auditLog: AuditLogContext) {
    const adminService = getPluginService<IAdminService>('admin');
    const commonService = getPluginService<ICommonService>('common');
    const { enabled: i18nEnabled } = await getI18nStatus({ strapi })
    const { slugify: customSlugifyConfig } = await adminService.config(false);

    const { masterModel } = getPluginModels();
    const { name, visible } = payload;

    const existingEntity = await adminService.getById(id);
    const detailsHaveChanged = existingEntity.name !== name || existingEntity.visible !== visible;

    if (detailsHaveChanged) {
      const newName = detailsHaveChanged ? name : existingEntity.name;
      const newSlug = detailsHaveChanged ? slugify(name, customSlugifyConfig).toLowerCase() : existingEntity.slug;

      await strapi.query<Navigation>(masterModel.uid).update({
        where: { id },
        data: {
          name: newName,
          slug: newSlug,
          visible,
        },
      });

      if (i18nEnabled && existingEntity.localizations) {
        await Promise.all(existingEntity.localizations.map((locale) => 
          strapi.query<Navigation>(masterModel.uid).update({
            where: {
              id: locale.id,
            },
            data: {
              name: newName,
              slug: `${newSlug}-${locale.localeCode}`,
              visible,
            },
          })
        ));
      }
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

  async delete(id, auditLog) {
    const { masterModel } = getPluginModels();
    const adminService = getPluginService<IAdminService>('admin');
    const entity = await adminService.getById(id);
    const { enabled: i18nEnabled } = await getI18nStatus({ strapi })

    await strapi.query<Navigation>(masterModel.uid).delete({
      where: {
        id,
      }
    });

    if (i18nEnabled && entity.localizations) {
      await Promise.all(entity.localizations.map((localeVersion) =>
        strapi.query<Navigation>(masterModel.uid).delete({
          where: {
            id: localeVersion.id,
          }
        })
      ));
    }

    sendAuditLog(auditLog, 'onNavigationDeletion', { entity, actionType: "DELETE" });
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
    const config = await pluginStore.get<string, NavigationPluginConfig>({ key: 'config' });
    await pluginStore.set({ key: 'config', value: newConfig });

    const removedFields = differenceBy(config.additionalFields, newConfig.additionalFields, 'name').filter(i => i !== 'audience') as NavigationItemCustomField[];
    !isEmpty(removedFields) && await commonService.pruneCustomFields(removedFields);
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
