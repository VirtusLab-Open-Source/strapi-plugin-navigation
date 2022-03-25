import { StrapiContext } from 'strapi-typed';
import { StrapiControllerContext, StrapiControllerContextParams, ToBeFixed } from '../../types';
import { NavigationError } from '../../utils/NavigationError'; 

const getService = ({strapi}: StrapiContext) => strapi.plugin('navigation').service('navigation');

const parseParams = (params: StrapiControllerContextParams): any =>
  Object.keys(params).reduce((prev, curr) => {
    const value = params[curr];
    const parsedValue = isNaN(Number(value)) ? value : parseInt(value, 10);
    return {
      ...prev,
      [curr]: parsedValue,
    };
  }, {});

const errorHandler = (ctx: StrapiControllerContext) => (error: NavigationError | string) => {
  if (error instanceof NavigationError) {
    return ctx.badRequest(error.message, error.additionalInfo);
  }
  throw error;
};

export default (strapiContext: StrapiContext) => ({
  async config() {
    return getService(strapiContext).config();
  },

  async updateConfig(ctx: StrapiControllerContext) {
    try {
      await getService(strapiContext).updateConfig(ctx.request.body);
    } catch (e: ToBeFixed) { 
      errorHandler(ctx)(e);
    }
    return ctx.send({ status: 200 });
  },

  async restoreConfig(ctx: StrapiControllerContext) {
    try {
      await getService(strapiContext).restoreConfig();
    } catch (e: ToBeFixed) { 
      errorHandler(ctx)(e);
    }
    return ctx.send({ status: 200 })
  },

  async settingsConfig() {
    return getService(strapiContext).config(true);
  },

  async settingsRestart(ctx: StrapiControllerContext) {
    try {
      await getService(strapiContext).restart();
      return ctx.send({ status: 200 });
    } catch (e: ToBeFixed) {
      errorHandler(ctx)(e);
    }
  },

  async get() {
    return getService(strapiContext).get();
  },
  async getById(ctx: StrapiControllerContext) {
    const { params } = ctx;
    const { id } = parseParams(params);
    return getService(strapiContext).getById(id);
  },
  async getContentTypeItems(ctx: StrapiControllerContext) {
    const { params } = ctx;
    const { model } = parseParams(params);
    return getService(strapiContext).getContentTypeItems(model)
  },
  post(ctx: StrapiControllerContext) {
    const { auditLog } = ctx;
    const { body = {} } = ctx.request;
    return getService(strapiContext).post(body, auditLog);
  },
  put(ctx: StrapiControllerContext) {
    const { params, auditLog } = ctx;
    const { id } = parseParams(params);
    const { body = {} } = ctx.request;
    return getService(strapiContext).put(id, body, auditLog)
      .catch(errorHandler(ctx));
  },
  async render(ctx: StrapiControllerContext) {
    const { params, query = {} } = ctx;
    const { type, menu: menuOnly, path: rootPath } = query;
    const { idOrSlug } = parseParams(params);
    return getService(strapiContext).render(
      idOrSlug,
      type,
      menuOnly,
      rootPath
    );
  },
  async renderChild(ctx: StrapiControllerContext) {
    const { params, query = {} } = ctx;
    const { type, menu: menuOnly } = query;
    const { idOrSlug, childUIKey } = parseParams(params);
    return getService(strapiContext).renderChildren(
      idOrSlug,
      childUIKey,
      type,
      menuOnly
    );
  },
});