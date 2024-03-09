import { AddCacheConfigFieldsInput, CacheConfigFields } from "./types";
import { getCacheStatus } from "./utils";

export const addCacheConfigFields = async <T>({
  previousConfig,
  strapi,
}: AddCacheConfigFieldsInput<T>): Promise<T & CacheConfigFields> => {
  const { enabled, hasCachePlugin } = await getCacheStatus({
    strapi,
  });

  return {
    ...previousConfig,
    isCacheEnabled: enabled,
    isCachePluginEnabled: hasCachePlugin,
  };
};
