// @ts-ignore
import { errors } from "@strapi/utils";
import { differenceBy, get, isEmpty, isNil, isObject } from "lodash";
import { Id, StrapiContext, StrapiDBQueryArgs } from "strapi-typed";
import {
  Audience,
  AuditLogContext,
  IAdminService,
  Navigation,
  NavigationItem,
  NavigationItemCustomField,
  NavigationItemEntity,
  NavigationPluginConfig,
  ToBeFixed,
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
  validateAdditionalFields,
} from "../utils";
import {
  addI18NConfigFields,
  getI18nStatus,
  I18NConfigFields,
  i18nNavigationContentsCopy,
  i18nNavigationSetupStrategy,
  i18nNavigationItemRead,
} from "../i18n";
import { NavigationError } from "../../utils/NavigationError";
import { addCacheConfigFields } from "../cache/serviceEnhancers";
import { CacheConfigFields } from "../cache/types";

type SettingsPageConfig = NavigationPluginConfig & I18NConfigFields & CacheConfigFields;

const adminService: (context: StrapiContext) => IAdminService = ({
  strapi,
}) => ({
  async config(viaSettingsPage = false): Promise<SettingsPageConfig> {
    const commonService = getPluginService("common");
    const { audienceModel } = getPluginModels();
    const pluginStore = await commonService.getPluginStore();
    const config = await pluginStore.get<string, NavigationPluginConfig>({
      key: "config",
    });

    const additionalFields = config.additionalFields;
    const cascadeMenuAttached = config.cascadeMenuAttached;
    const contentTypesNameFields = config.contentTypesNameFields;
    const contentTypesPopulate = config.contentTypesPopulate;
    const pathDefaultFields = config.pathDefaultFields;
    const allowedLevels = config.allowedLevels;
    const isGQLPluginEnabled = !isNil(strapi.plugin("graphql"));

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
      contentTypesPopulate: isObject(contentTypesPopulate)
        ? contentTypesPopulate
        : {},
      pathDefaultFields: isObject(pathDefaultFields) ? pathDefaultFields : {},
      allowedLevels,
      additionalFields: viaSettingsPage
        ? additionalFields
        : additionalFields.filter(
            (field) => typeof field === "string" || get(field, "enabled", false)
          ),
      gql: {
        navigationItemRelated: configContentTypes.map(({ labelSingular }) =>
          labelSingular.replace(/\s+/g, "")
        ),
      },
      isGQLPluginEnabled: viaSettingsPage ? isGQLPluginEnabled : undefined,
      cascadeMenuAttached,
    };
    const i18nConfig = await addI18NConfigFields({
      strapi,
      viaSettingsPage,
      previousConfig: {},
    });
    const cacheConfig = await addCacheConfigFields({ strapi, previousConfig: {} })

    if (additionalFields.includes("audience")) {
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
      ...cacheConfig,
    };
  },

  async get(ids, ignoreLocale = false): Promise<Navigation[]> {
    const { masterModel } = getPluginModels();
    const { enabled: i18nEnabled, locales } = await getI18nStatus({ strapi });
    const whereClause: StrapiDBQueryArgs<keyof Navigation, unknown>['where'] = {};

    if (ids) {
      whereClause.id = { $in: ids };
    }

    let entities = await strapi.query<Navigation>(masterModel.uid).findMany({
      limit: Number.MAX_SAFE_INTEGER,
      populate: DEFAULT_POPULATE,
      where: whereClause,
    });

    if (i18nEnabled && !ignoreLocale) {
      entities = entities.reduce((acc, entity) => {
        if (entity.localeCode && locales?.includes(entity.localeCode)) {
          acc.push({
            ...entity,
            localizations: entity.localizations?.filter(({ localeCode }) => localeCode && locales?.includes(localeCode)),
          });
        }

        return acc;
      }, [] as Navigation[]);
    }

    return entities;
  },

  async getById(id: Id): Promise<Navigation> {
    const commonService = getPluginService("common");

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
        orderBy: [{ order: "asc" }],
        populate: ["related", "parent", "audience"],
      });
    const entities = await commonService.getRelatedItems(entityItems);
    return {
      ...entity,
      items: buildNestedStructure(entities),
    };
  },

  async post(payload: ToBeFixed, auditLog: AuditLogContext) {
    const commonService = getPluginService("common");
    const adminService = getPluginService("admin");
    const { enabled: i18nEnabled, defaultLocale } = await getI18nStatus({
      strapi,
    });

    const { masterModel } = getPluginModels();
    const { name, visible } = payload;
    const data = {
      name,
      slug: await commonService.getSlug(name),
      visible,
      localeCode: i18nEnabled && defaultLocale ? defaultLocale : null
    };

    const existingEntity = await strapi
      .query<Navigation>(masterModel.uid)
      .create({ data });

    const result = await commonService
      .createBranch(payload.items, existingEntity, null, {})
      .then(() => adminService.getById(existingEntity.id))
      .then((newEntity: Navigation) => {
        sendAuditLog(auditLog, "onChangeNavigation", {
          actionType: "CREATE",
          oldEntity: existingEntity,
          newEntity,
        });
        return newEntity;
      });

    await commonService.emitEvent(
      masterModel.uid,
      "entry.create",
      existingEntity
    );

    if (i18nEnabled && defaultLocale) {
      await i18nNavigationSetupStrategy({ strapi });
    }

    return result;
  },

  async put(
    id: Id,
    payload: Navigation & { items: ToBeFixed },
    auditLog: AuditLogContext
  ) {
    const adminService = getPluginService("admin");
    const commonService = getPluginService("common");
    const { enabled: i18nEnabled } = await getI18nStatus({ strapi });

    const { masterModel } = getPluginModels();
    const { name, visible } = payload;

    const existingEntity = await adminService.getById(id);
    const detailsHaveChanged =
      existingEntity.name !== name || existingEntity.visible !== visible;

    if (detailsHaveChanged) {
      const newName = detailsHaveChanged ? name : existingEntity.name;
      const newSlug = detailsHaveChanged
        ? await commonService.getSlug(name)
        : existingEntity.slug;

      await strapi.query<Navigation>(masterModel.uid).update({
        where: { id },
        data: {
          name: newName,
          slug: newSlug,
          visible,
        },
      });

      if (i18nEnabled && existingEntity.localizations) {
        for (const locale of existingEntity.localizations) {
          await strapi.query<Navigation>(masterModel.uid).update({
            where: {
              id: locale.id,
            },
            data: {
              name: newName,
              slug: `${newSlug}-${locale.localeCode}`,
              visible,
            },
          });
        }
      }
    }
    const result = await commonService
      .analyzeBranch(payload.items, existingEntity)
      .then((auditLogsOperations: ToBeFixed) =>
        Promise.all([
          auditLog
            ? prepareAuditLog(
                (auditLogsOperations || []).flat(Number.MAX_SAFE_INTEGER)
              )
            : [],
          adminService.getById(existingEntity.id),
        ])
      )
      .then(([actionType, newEntity]: ToBeFixed) => {
        sendAuditLog(auditLog, "onChangeNavigation", {
          actionType,
          oldEntity: existingEntity,
          newEntity,
        });
        return newEntity;
      });

    const navigationEntity = await strapi
      .query<Navigation>(masterModel.uid)
      .findOne({ where: { id } });
    await commonService.emitEvent(
      masterModel.uid,
      "entry.update",
      navigationEntity
    );
    return result;
  },

  async delete(id, auditLog) {
    const { masterModel, itemModel } = getPluginModels();
    const adminService = getPluginService("admin");
    const entity = await adminService.getById(id);
    const { enabled: i18nEnabled } = await getI18nStatus({ strapi });
    // TODO: remove when cascade deletion is present
    // NOTE: Delete many with relation `where` crashes ORM
    const cleanNavigationItems = async (masterIds: Array<Id>) => {
      if (masterIds.length < 1) {
        return;
      }

      const navigationItems = await strapi.query<NavigationItem>(itemModel.uid).findMany({
        where: {
          $or: masterIds.map((id) => ({ master: id }))
        },
        limit: Number.MAX_SAFE_INTEGER,
      });

      await strapi.query<NavigationItem>(itemModel.uid).deleteMany({
        where: {
          id:  navigationItems.map(({ id }) => ( id )),
        },
      });
    };

    await cleanNavigationItems([id]);
    await strapi.query<Navigation>(masterModel.uid).delete({
      where: {
        id,
      },
    });

    if (i18nEnabled && entity.localizations) {
      await cleanNavigationItems(entity.localizations.map(_ => _.id));
      await strapi.query<Navigation>(masterModel.uid).deleteMany({
        where: {
          id: {
            $in: entity.localizations.map((_) => _.id),
          },
        },
      });
    }

    sendAuditLog(auditLog, "onNavigationDeletion", {
      entity,
      actionType: "DELETE",
    });
  },

  async restart(): Promise<void> {
    setImmediate(() => strapi.reload());
  },

  async restoreConfig(): Promise<void> {
    const commonService = getPluginService("common", strapi);
    const pluginStore = await commonService.getPluginStore();
    await pluginStore.delete({ key: "config" });
    await commonService.setDefaultConfig();
  },

  async updateConfig(newConfig: NavigationPluginConfig): Promise<void> {
    const commonService = getPluginService("common");
    const pluginStore = await commonService.getPluginStore();
    const config = await pluginStore.get<string, NavigationPluginConfig>({
      key: "config",
    });
    validateAdditionalFields(newConfig.additionalFields);
    await pluginStore.set({ key: "config", value: newConfig });

    const removedFields = differenceBy(
      config.additionalFields,
      newConfig.additionalFields,
      "name"
    ).filter((i) => i !== "audience") as NavigationItemCustomField[];
    if (!isEmpty(removedFields)) {
      await commonService.pruneCustomFields(removedFields);
    }
  },

  async fillFromOtherLocale({ target, source, auditLog }) {
    const { enabled } = await getI18nStatus({ strapi });

    if (!enabled) {
      throw new NavigationError("Not yet implemented.");
    }

    const adminService = getPluginService("admin");
    const commonService = getPluginService("common");
    const targetEntity = await adminService.getById(target);

    return await i18nNavigationContentsCopy({
      source: await adminService.getById(source),
      target: targetEntity,
      service: commonService,
      strapi,
    })
      .then(() => adminService.getById(target))
      .then((updated) => {
        sendAuditLog(auditLog, "onChangeNavigation", {
          actionType: "UPDATE",
          oldEntity: targetEntity,
          newEntity: updated,
        });
        return updated;
      });
  },
  async readNavigationItemFromLocale({ source, target, path }) {
    const sourceNavigation = await this.getById(source);
    const targetNavigation = await this.getById(target);

    if (!sourceNavigation) {
      throw new errors.NotFoundError(
        "Unable to find source navigation for specified query"
      );
    }

    if (!targetNavigation) {
      throw new errors.NotFoundError(
        "Unable to find target navigation for specified query"
      );
    }

    return await i18nNavigationItemRead({
      path,
      source: sourceNavigation,
      target: targetNavigation,
      strapi,
    });
  },

  async purgeNavigationCache(id, clearLocalisations) {
    const entity = await this.getById(id);
    const regexps = [];
    const mapToRegExp = (id: Id) => new RegExp(`/api/navigation/render/${id}`);

    if (!entity) {
      throw new errors.NotFoundError("Navigation is not defined");
    }

    if (clearLocalisations) {
      const { enabled: isI18nEnabled } = await getI18nStatus({ strapi });

      if (isI18nEnabled) {
        entity.localizations?.forEach((navigation) => {
          regexps.push(mapToRegExp(navigation.id));
        });
      }
    }

    const restCachePlugin = strapi.plugin("rest-cache");
    const cacheStore = restCachePlugin.service("cacheStore");

    regexps.push(mapToRegExp(id));

    await cacheStore.clearByRegexp(regexps);

    return { success: true };
  },

  async purgeNavigationsCache() {
    const restCachePlugin = strapi.plugin("rest-cache");
    const cacheStore = restCachePlugin.service("cacheStore");

    const regex = new RegExp("/api/navigation/render(.*)");

    await cacheStore.clearByRegexp([regex]);

    return { success: true };
  }
});

export default adminService;
