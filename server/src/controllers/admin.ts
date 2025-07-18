import { Core } from '@strapi/strapi';
import { Context as KoaContext } from 'koa';
import * as z from 'zod';
import { DynamicSchemas } from '../schemas';
import { getPluginService } from '../utils';
import { fillFromOtherLocaleParams, idSchema } from './validators';

export type KoaContextExtension = {
  request: KoaContext['request'] & {
    body: unknown;
  };
};

export default function adminController(context: { strapi: Core.Strapi }) {
  return {
    getAdminService() {
      return getPluginService(context, 'admin');
    },

    getCommonService() {
      return getPluginService(context, 'common');
    },

    async get() {
      return await this.getAdminService().get({});
    },

    async post(ctx: KoaContext & KoaContextExtension) {
      const { auditLog } = ctx;

      try {
        return await this.getAdminService().post({
          payload: DynamicSchemas.createNavigationSchema.parse(ctx.request.body),
          auditLog,
        });
      } catch (error) {
        const originalError =
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
              }
            : {};

        return ctx.internalServerError('Unable to create', { originalError });
      }
    },

    async put(ctx: KoaContext & KoaContextExtension) {
      const {
        params: { documentId },
        auditLog,
      } = ctx;
      const body = z.record(z.string(), z.unknown()).parse(ctx.request.body);

      try {
        return await this.getAdminService().put({
          auditLog,
          payload: DynamicSchemas.updateNavigationSchema.parse({
            ...body,
            documentId,
          }),
        });
      } catch (error) {
        const originalError =
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
              }
            : {};

        return ctx.internalServerError('Unable to update', { originalError });
      }
    },

    async delete(ctx: KoaContext) {
      const {
        auditLog,
        params: { documentId },
      } = ctx;

      await this.getAdminService().delete({
        documentId: idSchema.parse(documentId),
        auditLog,
      });

      return {};
    },

    config() {
      return this.getAdminService().config({ viaSettingsPage: false });
    },

    async updateConfig(ctx: KoaContext & KoaContextExtension) {
      await this.getAdminService().updateConfig({
        config: DynamicSchemas.configSchema.parse(ctx.request.body),
      });

      return {};
    },

    async restoreConfig() {
      await this.getAdminService().restoreConfig();

      return {};
    },

    settingsConfig() {
      return this.getAdminService().config({ viaSettingsPage: true });
    },

    async settingsRestart() {
      await this.getAdminService().restart();

      return {};
    },

    getById(ctx: KoaContext) {
      const {
        params: { documentId },
      } = ctx;

      return this.getAdminService().getById({ documentId: idSchema.parse(documentId) });
    },

    getContentTypeItems(ctx: KoaContext) {
      const {
        params: { model },
        query = {},
      } = ctx;

      return this.getAdminService().getContentTypeItems({
        query: z.record(z.string(), z.unknown()).parse(query),
        uid: z.string().parse(model),
      });
    },

    async fillFromOtherLocale(ctx: KoaContext) {
      const { params, auditLog } = ctx;
      const { source, target, documentId } = fillFromOtherLocaleParams.parse(params);

      return await this.getAdminService().fillFromOtherLocale({
        source,
        target,
        documentId,
        auditLog,
      });
    },

    readNavigationItemFromLocale(ctx: KoaContext) {
      const {
        params: { source, target },
        query: { path },
      } = ctx;

      return this.getAdminService().readNavigationItemFromLocale({
        path: z.string().parse(path),
        source: idSchema.parse(source),
        target: idSchema.parse(target),
      });
    },

    getSlug(ctx: KoaContext) {
      const {
        query: { q },
      } = ctx;

      return this.getCommonService()
        .getSlug({ query: z.string().parse(q) })
        .then((slug) => ({ slug }));
    },

    settingsLocale() {
      return this.getCommonService().readLocale();
    },
  };
}
