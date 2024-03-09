import { IStrapi } from "strapi-typed";

export type AddCacheConfigFieldsInput<T> = {
  previousConfig: T;
  strapi: IStrapi;
  viaSettingsPage?: boolean;
};

export type CacheConfigFields = {
  isCacheEnabled: boolean;
  isCachePluginEnabled: boolean;
};
