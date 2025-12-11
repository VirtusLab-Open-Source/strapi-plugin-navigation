import type { Core } from '@strapi/types';
import type { Context, Next } from 'koa';

export const localeMiddleware = ({ strapi }: { strapi: Core.Strapi }) => {
  const adminService = strapi.plugin('navigation').service('admin');

  return async (ctx: Context, next: Next) => {
    await next();

    const isCreateLocaleRoute = ctx.method === 'POST' && ctx.path === '/i18n/locales';
    if (!isCreateLocaleRoute) return;

    const locale = (ctx.body as { code?: string })?.code;
    if (!locale || typeof locale !== 'string') return;

    try {
      await adminService.refreshNavigationLocale(locale);
    } catch (error) {
      strapi.log.error(`Failed to refresh navigation for new locale ${locale}`, error);
    }
  };
};

export default localeMiddleware;
