// @ts-ignore
import { errors } from "@strapi/utils"
import {
  assertIsNumber,
  assertNotEmpty,
  ToBeFixed,
} from "../../types";
import { getPluginService, parseParams } from "../utils";
import { errorHandler } from "../utils";
import { IAdminController } from "../../types";
import { Id, IStrapi, StringMap } from "strapi-typed";
import { InvalidParamNavigationError } from "../../utils/InvalidParamNavigationError";
import { NavigationError } from "../../utils/NavigationError";
import { getCacheStatus } from "../cache/utils";

const adminControllers: IAdminController = {
  getAdminService() {
    return getPluginService("admin");
  },
  getCommonService() {
    return getPluginService("common");
  },
  async get() {
    return await this.getAdminService().get();
  },
  post(ctx) {
    const { auditLog } = ctx;
    const { body = {} } = ctx.request;
    return this.getAdminService().post(body, auditLog);
  },
  put(ctx) {
    const { params, auditLog } = ctx;
    const { id } = parseParams<StringMap<string>, { id: Id }>(params);
    const { body = {} } = ctx.request;
    return this.getAdminService().put(id, body, auditLog).catch(errorHandler(ctx));
  },
  async delete(ctx) {
    const { params, auditLog } = ctx;
    const { id } = parseParams<StringMap<string>, { id: Id }>(params);

    try {
      assertNotEmpty(id, new InvalidParamNavigationError("Navigation's id is not a id"));

      await this.getAdminService().delete(id, auditLog);

      return {};
    } catch (error) {
      console.error(error);
      
      if (error instanceof NavigationError) {
        return errorHandler(ctx)(error)
      }

      throw error;
    }
  },
  async config() {
    return this.getAdminService().config();
  },

  async updateConfig(ctx) {
    try {
      await this.getAdminService().updateConfig(ctx.request.body);
    } catch (e: ToBeFixed) {
      errorHandler(ctx)(e);
    }
    return ctx.send({ status: 200 });
  },

  async restoreConfig(ctx) {
    try {
      await this.getAdminService().restoreConfig();
    } catch (e: ToBeFixed) {
      errorHandler(ctx)(e);
    }
    return ctx.send({ status: 200 });
  },

  async settingsConfig() {
    return this.getAdminService().config(true);
  },

  async settingsRestart(ctx) {
    try {
      await this.getAdminService().restart();
      return ctx.send({ status: 200 });
    } catch (e: ToBeFixed) {
      errorHandler(ctx)(e);
    }
  },
  async getById(ctx) {
    const { params } = ctx;
    const { id } = parseParams<StringMap<string>, { id: Id }>(params);
    return this.getAdminService().getById(id);
  },
  async getContentTypeItems(ctx) {
    const { params, query = {} } = ctx;
    const { model } = parseParams<StringMap<string>, { model: string }>(params);
    return this.getCommonService().getContentTypeItems(
      model,
      query
    );
  },

  fillFromOtherLocale(ctx) {
    const { params, auditLog } = ctx;
    const { source, target } = parseParams<
      StringMap<string>,
      { source: number; target: number }
    >(params);

    try {
      assertCopyParams(source, target);

      return this.getAdminService().fillFromOtherLocale({ source, target, auditLog });
    } catch (error) {
      if (error instanceof Error) {
        return ctx.badRequest(error.message)
      }

      throw error
    }
  },

  async readNavigationItemFromLocale(ctx) {
    const { params, query: { path } } = ctx;
    const { source, target } = parseParams<StringMap<string>, { source: number, target: number }>(
      params
    );

    try {
      assertCopyParams(source, target);
      assertNotEmpty(
        path, 
        new InvalidParamNavigationError("Path is missing")
      )

      return await this.getAdminService().readNavigationItemFromLocale({
        path,
        source,
        target,
      });
    } catch (error: any) {
      if (error instanceof errors.NotFoundError) {
        return ctx.notFound((error as Error).message, {
          messageKey: "popup.item.form.i18n.locale.error.unavailable"
        });
      }

      if (error instanceof Error) {
        return ctx.badRequest(error.message)
      }

      throw error
    }
  },

  getSlug(ctx) {
    const { query: { q } } = ctx;

    try {
      assertNotEmpty(q);

      return this.getCommonService().getSlug(q).then((slug) => ({ slug }));
    } catch (error) {
      if (error instanceof Error) {
        return ctx.badRequest(error.message)
      }

      throw error
    }
  },

  async purgeNavigationsCache() {
    const mappedStrapi = strapi as unknown as IStrapi;
    const { enabled } = await getCacheStatus({ strapi: mappedStrapi });

    if (!enabled) {
      return { success: false };
    }

    return await this.getAdminService().purgeNavigationsCache();
  },

  async purgeNavigationCache(ctx) {
    const { params: { id }, query: { clearLocalisations = 'false' } } = ctx;
    const mappedStrapi = strapi as unknown as IStrapi;
    const { enabled } = await getCacheStatus({ strapi: mappedStrapi });

    if (!enabled) {
      return { success: false };
    }
    
    return await this.getAdminService().purgeNavigationCache(id, JSON.parse(clearLocalisations));
  }
};

const assertCopyParams = (source: unknown, target: unknown) => {
    assertIsNumber(
      source,
      new InvalidParamNavigationError("Source's id is not a number")
    );
    assertIsNumber(
      target,
      new InvalidParamNavigationError("Target's id is not a number")
    );
}

export default adminControllers;
