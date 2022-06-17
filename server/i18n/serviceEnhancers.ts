// @ts-ignore
import { errors } from "@strapi/utils"
import { get, toString } from "lodash";
import { pick } from "lodash/fp";
import { OnlyStrings } from "strapi-typed";
import {
  assertIsNumber,
  assertNotEmpty,
  RelatedRef,
  RelatedRefBase,
  ToBeFixed,
} from "../../types";
import { InvalidParamNavigationError } from "../../utils/InvalidParamNavigationError";
import { intercalate } from "../utils";
import { I18N_DEFAULT_POPULATE } from "./constant";
import { DefaultLocaleMissingError, FillNavigationError } from "./errors";
import {
  AddI18NConfigFieldsInput,
  AddI18nWhereClause,
  FillCopyContext,
  HandleLocaleParamInput,
  I18nAwareEntityReadHandlerInput,
  I18NConfigFields,
  I18nNavigationContentsCopyInput,
  MinimalEntityWithI18n,
  ResultNavigationItem,
  SourceNavigationItem,
  I18nNavigationItemReadInput,
} from "./types";
import { getI18nStatus } from "./utils";

export const addI18NConfigFields = async <T>({
  previousConfig,
  strapi,
  viaSettingsPage = false,
}: AddI18NConfigFieldsInput<T>): Promise<T & I18NConfigFields> => {
  const { enabled, hasI18NPlugin, defaultLocale } = await getI18nStatus({
    strapi,
  });

  return {
    ...previousConfig,
    defaultLocale,
    i18nEnabled: enabled,
    isI18NPluginEnabled: viaSettingsPage ? hasI18NPlugin : undefined,
    pruneObsoleteI18nNavigations: false,
  };
};

export const handleLocaleQueryParam = async ({
  locale,
  strapi,
}: HandleLocaleParamInput) => {
  const { enabled } = await getI18nStatus({ strapi });

  if (locale) {
    return locale;
  }

  const localeService = strapi.plugin("i18n").service("locales");
  const defaultLocale: string | null = await localeService.getDefaultLocale();

  assertNotEmpty(defaultLocale, new DefaultLocaleMissingError());

  return enabled ? defaultLocale : undefined;
};

export const i18nAwareEntityReadHandler = async <
  T extends { localeCode?: string | null; localizations?: T[] | null }
>({
  entity,
  entityUid,
  localeCode,
  populate = [],
  strapi,
  whereClause,
}: I18nAwareEntityReadHandlerInput<T>): Promise<T | undefined | null> => {
  const { defaultLocale, enabled } = await getI18nStatus({ strapi });

  if (!enabled) {
    return entity;
  }

  if (entity && (!localeCode || entity.localeCode === localeCode)) {
    return entity;
  }

  const locale = localeCode || defaultLocale;

  const rerun = await strapi.query<T>(entityUid).findOne({
    where: whereClause,
    populate: [...populate, ...I18N_DEFAULT_POPULATE] as Array<
      OnlyStrings<keyof T>
    >,
  });

  if (rerun) {
    if (rerun.localeCode === locale) {
      return rerun;
    }

    return rerun.localizations?.find(
      (localization) => localization.localeCode === locale
    );
  }
};

export const addI18nWhereClause = async <T>({
  modelUid,
  previousWhere,
  query,
  strapi,
}: AddI18nWhereClause<T>): Promise<T & { locale?: string }> => {
  const { enabled } = await getI18nStatus({ strapi });
  const modelSchema = strapi.getModel<T & { locale?: string }>(modelUid);

  if (enabled && query.localeCode && modelSchema.attributes.locale) {
    return {
      ...previousWhere,
      locale: query.localeCode,
    };
  }

  return previousWhere;
};

export const i18nNavigationContentsCopy = async ({
  target,
  source,
  strapi,
  service,
}: I18nNavigationContentsCopyInput): Promise<void> => {
  const sourceItems = source.items ?? [];

  if (target.items?.length) {
    throw new FillNavigationError("Current navigation is non-empty");
  }

  if (!target.localeCode) {
    throw new FillNavigationError(
      "Current navigation does not have specified locale"
    );
  }

  if (!sourceItems.length) {
    throw new FillNavigationError("Source navigation is empty");
  }

  const newItems = await Promise.all(
    sourceItems.map(
      processItems({
        master: target,
        localeCode: target.localeCode,
        strapi,
      })
    )
  );

  await service.createBranch(newItems, target, null, { create: true });
};

export const i18nNavigationItemRead = async ({
  target,
  source,
  path,
  strapi
}: I18nNavigationItemReadInput) => {
    const pickFields = pick(['path', 'related', 'type', 'uiRouterKey', 'title', 'externalPath']);
    const structurePath = path.split('.').map(p => parseInt(p, 10));

    if (!structurePath.some(Number.isNaN) || !structurePath.length) {
      new InvalidParamNavigationError("Path is invalid");
    }

    let result = get(source.items, intercalate("items", structurePath.map(toString)))

    if (!result) {
      throw new errors.NotFoundError("Unable to find navigation item");
    }

    let { related } = result;

    if (related) {
      const fullRelated = await strapi.query<MinimalEntityWithI18n>(related.__contentType).findOne({
        where: {
          id: related.id,
        },
        populate: I18N_DEFAULT_POPULATE,
      })
      if (fullRelated.localizations?.length) {
        const localeVersion = fullRelated.localizations.find(({ locale }) => locale === target.localeCode);

        if (localeVersion) {
          related = {
            ...localeVersion,
            __contentType: related.__contentType
          }
        }
      }
    }

    return pickFields({
      ...result,
      related
    });
}

const processItems =
  (context: FillCopyContext) =>
  async (item: SourceNavigationItem): Promise<ResultNavigationItem> => ({
    title: item.title,
    path: item.path,
    audience: item.audience as ToBeFixed,
    type: item.type,
    uiRouterKey: item.uiRouterKey,
    order: item.order,
    collapsed: item.collapsed,
    menuAttached: item.menuAttached,
    removed: false,
    updated: true,
    externalPath: item.externalPath ?? undefined,
    items: item.items
      ? await Promise.all(item.items.map(processItems(context)))
      : [],
    master: parseInt(context.master.id.toString(), 10),
    parent: null,
    related: item.related ? [await processRelated(item.related, context)] : [],
  });

const processRelated = async (
  related: RelatedRef,
  { localeCode, strapi }: FillCopyContext
): Promise<RelatedRefBase> => {
  const { __contentType, id } = related;

  assertNotEmpty(
    __contentType,
    new FillNavigationError("Related item's content type is missing")
  );
  assertIsNumber(
    id,
    new FillNavigationError("Related item's id is not a number")
  );

  const relatedItemWithLocalizations = await strapi
    .query<MinimalEntityWithI18n>(__contentType)
    .findOne({ where: { id }, populate: I18N_DEFAULT_POPULATE });
  const localization = relatedItemWithLocalizations.localizations?.find(
    ({ locale }) => locale === localeCode
  );

  return {
    refId: localization?.id ?? id,
    ref: __contentType,
    field: related.field,
  };
};
