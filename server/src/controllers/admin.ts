import { Core } from '@strapi/strapi';
import { Context as KoaContext } from 'koa';
import * as z from 'zod';
import { configSchema, createNavigationSchema, updateNavigationSchema } from '../schemas';
import { getPluginService } from '../utils';
import { idSchema } from './validators';

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

    post(ctx: KoaContext & KoaContextExtension) {
      const { auditLog } = ctx;

      return this.getAdminService().post({
        payload: createNavigationSchema.parse(ctx.request.body),
        auditLog,
      });
    },

    put(ctx: KoaContext & KoaContextExtension) {
      const {
        params: { documentId },
        auditLog,
      } = ctx;
      const body = z.record(z.string(), z.unknown()).parse(ctx.request.body);

      return this.getAdminService().put({
        auditLog,
        payload: updateNavigationSchema.parse({
          ...body,
          documentId,
        }),
      });
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
        config: configSchema.parse(ctx.request.body),
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

    fillFromOtherLocale(ctx: KoaContext) {
      const {
        params: { source, target },
        auditLog,
      } = ctx;

      return this.getAdminService().fillFromOtherLocale({
        source: idSchema.parse(source),
        target,
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
