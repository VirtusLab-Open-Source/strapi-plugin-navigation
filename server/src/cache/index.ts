import Router from '@koa/router';
import { Core } from '@strapi/strapi';
import clientRoutes, { NavigationServerRoute } from '../routes/client';
import { getCacheStatus } from '../services/admin/utils';

export const setupCacheStrategy = async ({ strapi }: { strapi: Core.Strapi }) => {
  const { enabled, hasCachePlugin } = await getCacheStatus({ strapi });

  if (hasCachePlugin && enabled) {
    const cachePlugin: any = strapi.plugin('rest-cache');
    const createCacheMiddleware = cachePlugin?.middleware('recv');

    if (!createCacheMiddleware) {
      console.warn('Cache middleware not present in cache plugin. Stopping');
      console.warn('Notify strapi-navigation-plugin-team');
      return;
    }

    const pluginOption: any = strapi.config.get('plugin::rest-cache');
    const router = new Router();

    const buildPathFrom = (route: NavigationServerRoute) =>
      `/api/${route.info?.pluginName ?? 'navigation'}${route.path}`;
    const buildFrom = (route: NavigationServerRoute) => ({
      maxAge: pluginOption.strategy?.maxAge ?? 6 * 60 * 1000,
      path: buildPathFrom(route),
      method: 'GET',
      paramNames: ['idOrSlug', 'childUIKey'],
      keys: { useHeaders: [], useQueryParams: true },
      hitpass: false,
    });

    clientRoutes.routes.forEach((route) => {
      router.get(
        buildPathFrom(route),
        createCacheMiddleware({ cacheRouteConfig: buildFrom(route) }, { strapi })
      );
    });

    (strapi as any).server.router.use(router.routes());
  }
};
