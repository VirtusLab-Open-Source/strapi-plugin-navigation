import { IStrapi, OnlyStrings, StringMap, WhereClause } from "strapi-typed";
import {
  ICommonService,
  Navigation,
  NavigationItemInput,
  NestedStructure,
  NotVoid,
} from "../../types";

export type AddI18NConfigFieldsInput<T> = {
  previousConfig: T;
  strapi: IStrapi;
  viaSettingsPage?: boolean;
};

export type HandleLocaleParamInput = {
  locale?: string;
  strapi: IStrapi;
};

export type I18nAwareEntityReadHandlerInput<T> = {
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

export type I18nNavigationContentsCopyInput = {
  target: Navigation;
  source: Navigation;
  service: ICommonService;
  strapi: IStrapi;
};

export type I18nNavigationItemReadInput = {
  path: string;
  source: Navigation;
  strapi: IStrapi;
  target: Navigation;
};

export type SourceNavigationItem = NestedStructure<
  NotVoid<Navigation["items"]>[0]
>;

export type ResultNavigationItem = NestedStructure<NavigationItemInput>;

export type FillCopyContext = {
  master: Navigation;
  strapi: IStrapi;
  localeCode: string;
};

export type MinimalEntityWithI18n = {
  id: number;
  localizations?: Array<{
    id: number;
    locale?: string;
  }>;
};
