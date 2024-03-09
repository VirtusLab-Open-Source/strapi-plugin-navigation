import Router from "@koa/router";
import { IRestCacheSetupStrategy, ToBeFixed } from "../../types";
import clientRoutes from "../routes/client";
import { getCacheStatus } from "./utils";

export const setupCacheStrategy: IRestCacheSetupStrategy = async ({
  strapi,
}) => {
  const { enabled, hasCachePlugin } = await getCacheStatus({ strapi });
  if (hasCachePlugin && enabled) {
    const cachePlugin: ToBeFixed = strapi.plugin("rest-cache");
    const createCacheMiddleware = cachePlugin?.middleware("recv");

    if (!createCacheMiddleware) {
      console.warn("Cache middleware not present in cache plugin. Stopping");
      console.warn("Notify strapi-navigation-plugin-team");
      return;
    }

    const pluginOption: ToBeFixed = strapi.config.get("plugin.rest-cache");
    const router = new Router();

    const buildPathFrom = (route: ToBeFixed) =>
      `/api/${route.info.pluginName}${route.path}`;
    const buildFrom = (route: ToBeFixed) => ({
      maxAge: pluginOption.strategy?.maxAge ?? 6 * 60 * 1000,
      path: buildPathFrom(route),
      method: "GET",
      paramNames: ["idOrSlug", "childUIKey"],
      keys: { useHeaders: [], useQueryParams: true },
      hitpass: false,
    });

    clientRoutes.routes.forEach((route) => {
      router.get(
        buildPathFrom(route),
        createCacheMiddleware(
          { cacheRouteConfig: buildFrom(route) },
          { strapi }
        )
      );
    });

    (strapi as ToBeFixed).server.router.use(router.routes());
  }
};
