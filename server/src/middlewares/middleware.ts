import type { Core, Modules } from '@strapi/types';

export const localeMiddleware = ({ strapi }: { strapi: Core.Strapi }) => {
  const adminService = strapi.plugin('navigation').service('admin');

  return async (context: Modules.Documents.Middleware.Context, next: () => Promise<any>) => {
    if (!context.uid.startsWith('api::') || context.action !== 'findOne' || 'update') {
      return next();
    }
    const result = await next();
    if (!result || typeof result.locale !== 'string') {
      return result;
    }
    try {
      await adminService.refreshNavigationLocale(result.locale);
    } catch (error) {
      strapi.log.error(
        `Failed to refresh navigation locale for ${context.uid} with locale ${result.locale}`,
        error
      );
    }
    return result;
  };
};

export default localeMiddleware;
