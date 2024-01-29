//@ts-ignore
import { errors, sanitize } from "@strapi/utils";
import { Id, StringMap } from "strapi-typed";
import { IClientController, ToBeFixed } from "../../types";
import { getPluginService, parseParams, sanitizePopulateField } from "../utils";

const clientControllers: IClientController = {
  getService() {
    return getPluginService("client");
  },

  async readAll(ctx) {
    const { query = {} } = ctx;
    const { locale, orderBy, orderDirection } = query;

    try {
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

  async render(ctx) {
    const { params, query = {} } = ctx;
    const { type, menu: menuOnly, path: rootPath, locale, populate } = query;
    const { idOrSlug } = parseParams<StringMap<string>, { idOrSlug: Id }>(
      params
    );
    try {
      return await this.getService().render({
        idOrSlug,
        type,
        menuOnly,
        rootPath,
        locale,
        populate: sanitizePopulateField(populate) as ToBeFixed,
      });
    } catch (error: unknown) {
      if (error instanceof errors.NotFoundError) {
        return ctx.notFound((error as ToBeFixed).message);
      }

      if (error instanceof Error) {
        return ctx.badRequest(error.message);
      }

      throw error;
    }
  },
  async renderChild(ctx) {
    const { params, query = {} } = ctx;
    const { type, menu: menuOnly, locale } = query;
    const { idOrSlug, childUIKey } = parseParams<
      StringMap<string>,
      { idOrSlug: Id; childUIKey: string }
    >(params);
    try {
      return await this.getService().renderChildren({
        idOrSlug,
        childUIKey,
        type,
        menuOnly,
        locale,
      });
    } catch (error: unknown) {
      if (error instanceof errors.NotFoundError) {
        return ctx.notFound((error as ToBeFixed).message);
      }

      if (error instanceof Error) {
        return ctx.badRequest(error.message);
      }

      throw error;
    }
  },
};

export default clientControllers;
