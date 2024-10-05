import { Core } from '@strapi/strapi';
import { Context as KoaContext } from 'koa';
import * as z from 'zod';
import { getPluginService } from '../utils';
import { parseId, sanitizePopulateField } from './utils';
import {
  populateSchema,
  readAllQuerySchema,
  renderChildQueryParams,
  renderQuerySchema,
} from './validators';

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
      } = renderQuerySchema.parse(query);
      const idOrSlug = parseId(z.string().parse(params.idOrSlug));

      return await this.getService().render({
        idOrSlug,
        type,
        menuOnly: menuOnly === 'true',
        rootPath,
        locale,
        populate: sanitizePopulateField(
          populateSchema.parse(
            populate === 'true'
              ? true
              : populate === 'false'
                ? false
                : Array.isArray(populate)
                  ? populate.map((x) => (x === 'true' ? true : x === 'false' ? false : populate))
                  : populate
          )
        ),
      });
    },

    async renderChild(ctx: KoaContext) {
      const { params, query = {} } = ctx;
      const { type, menu: menuOnly, locale } = renderChildQueryParams.parse(query);

      const idOrSlug = parseId(z.string().parse(params.id));
      const childUIKey = z.string().parse(params.childUIKey);

      return await this.getService().renderChildren({
        idOrSlug,
        childUIKey,
        type,
        menuOnly: menuOnly === 'true',
        locale,
      });
    },
  };
}
