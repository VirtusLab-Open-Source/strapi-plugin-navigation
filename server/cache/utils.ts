import { IStrapi } from "strapi-typed";
import { NavigationPluginConfig } from "../../types/config";
import { ToBeFixed } from "../../types";

type GetCacheStatusInput = {
  strapi: IStrapi;
};

type CacheStatus = {
  hasCachePlugin: boolean;
  enabled: boolean;
};

export const getCacheStatus = async ({
  strapi,
}: GetCacheStatusInput): Promise<CacheStatus> => {
  const cachePlugin: null | ToBeFixed = strapi.plugin("rest-cache");
  const hasCachePlugin = !!cachePlugin;
  const pluginStore = strapi.store({
    type: "plugin",
    name: "navigation",
  });

  const config: NavigationPluginConfig = await pluginStore.get({
    key: "config",
  });

  return hasCachePlugin
    ? { hasCachePlugin, enabled: config.isCacheEnabled }
    : { hasCachePlugin, enabled: false };
};
