import { Core } from '@strapi/strapi';
import { Context as KoaContext } from 'koa';
import * as z from 'zod';
import { getPluginService } from '../utils';
import { readAllQuerySchema, renderChildQueryParams, renderQuerySchema } from './validators';

export default function clientController(context: { strapi: Core.Strapi }) {
  return {
    getService() {
      return getPluginService(context, 'client');
    },

    async readAll(ctx: KoaContext) {
      try {
        const { query = {} } = ctx;
        const { locale, orderBy, orderDirection } = readAllQuerySchema.parse(query);

        return await this.getService().readAll({
          locale,
          orderBy,
          orderDirection,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          return ctx.badRequest(error.message);
        }

        throw error;
      }
    },

    async render(ctx: KoaContext) {
      const { params, query = {} } = ctx;
      const {
        type,
        menu: menuOnly,
        path: rootPath,
        locale,
        populate,
        status = 'published',
      } = renderQuerySchema.parse(query);
      const idOrSlug = z.string().parse(params.idOrSlug);

      return await this.getService().render({
        idOrSlug,
        type,
        menuOnly: menuOnly === 'true',
        rootPath,
        locale,
        populate,
        status,
      });
    },

    async renderChild(ctx: KoaContext) {
      const { params, query = {} } = ctx;
      const {
        type,
        menu: menuOnly,
        locale,
        status = 'published',
      } = renderChildQueryParams.parse(query);

      const idOrSlug = z.string().parse(params.idOrSlug);
      const childUIKey = z.string().parse(params.childUIKey);

      return await this.getService().renderChildren({
        idOrSlug,
        childUIKey,
        type,
        menuOnly: menuOnly === 'true',
        locale,
        status,
      });
    },
  };
}
