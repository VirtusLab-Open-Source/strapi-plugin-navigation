import { IStrapi, OnlyStrings, StringMap, WhereClause } from "strapi-typed";
import { assertNotEmpty, ToBeFixed } from "../../types";
import { I18N_DEFAULT_POPULATE } from "./constant";
import { DefaultLocaleMissingError } from "./errors";
import { getI18nStatus } from "./utils";

type AddI18NConfigFieldsInput<T> = {
  previousConfig: T;
  strapi: IStrapi;
  viaSettingsPage?: boolean;
};

type HandleLocaleParamInput = {
  locale?: string;
  strapi: IStrapi;
};

type I18nAwareEntityReadHandlerInput<T> = {
  entity: T | undefined | null;
  entityUid: string;
  whereClause: WhereClause<OnlyStrings<keyof T>>;
  localeCode?: string;
  strapi: IStrapi;
  populate?: string[];
};

export type I18NConfigFields = {
  i18nEnabled: boolean;
  isI18NPluginEnabled: boolean | undefined;
  pruneObsoleteI18nNavigations: boolean;
  defaultLocale?: string | null;
};

export type AddI18nWhereClause<T> = {
  previousWhere: T;
  strapi: IStrapi;
  query: StringMap<string> & { localeCode?: string };
  modelUid: string;
};

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
    populate: [...populate, ...I18N_DEFAULT_POPULATE],
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
  const modelSchema: {
    attributes: {
      locale?: StringMap<unknown>;
    };
    // TODO: Update after strapi-typed updated with detailed type
  } = strapi.getModel<ToBeFixed>(modelUid);

  if (enabled && query.localeCode && modelSchema.attributes.locale) {
    return {
      ...previousWhere,
      locale: query.localeCode,
    };
  }

  return previousWhere;
};
