const { NavigationError } = require('../../utils/NavigationError'); 

const getService = () => strapi.plugin('navigation').service('navigation');

const parseParams = (params) =>
  Object.keys(params).reduce((prev, curr) => {
    const value = params[curr];
    const parsedValue = isNaN(Number(value)) ? value : parseInt(value, 10);
    return {
      ...prev,
      [curr]: parsedValue,
    };
  }, {});

const errorHandler = (ctx) => (error) => {
  if (error instanceof NavigationError) {
    return ctx.badRequest(error.message, error.additionalInfo);
  }
  throw error;
};

module.exports = ({strapi}) => ({
  async config() {
    return getService().config();
  },

  async updateConfig(ctx) {
    try {
      await getService().updateConfig(ctx.request.body);
    } catch (e) { 
      errorHandler(ctx)(e);
    }
    return ctx.send({ status: 200 });
  },

  async restoreConfig(ctx) {
    try {
      await getService().restoreConfig();
    } catch (e) { 
      errorHandler(ctx)(e);
    }
    return ctx.send({ status: 200 })
  },

  async settingsConfig() {
    return getService().config(true);
  },

  async settingsRestart(ctx) {
    try {
      await getService().restart();
      return ctx.send({ status: 200 });
    } catch (e) {
      errorHandler(ctx)(e);
    }
  },

  async get() {
    return getService().get();
  },
  async getById(ctx) {
    const { params } = ctx;
    const { id } = parseParams(params);
    return getService().getById(id);
  },
  async getContentTypeItems(ctx) {
    const { params } = ctx;
    const { model } = parseParams(params);
    return getService().getContentTypeItems(model)
  },
  post(ctx) {
    const { auditLog } = ctx;
    const { body = {} } = ctx.request;
    return getService().post(body, auditLog);
  },
  put(ctx) {
    const { params, auditLog } = ctx;
    const { id } = parseParams(params);
    const { body = {} } = ctx.request;
    return getService().put(id, body, auditLog)
      .catch(errorHandler(ctx));
  },
  async render(ctx) {
    const { params, query = {} } = ctx;
    const { type, menu: menuOnly, path: rootPath } = query;
    const { idOrSlug } = parseParams(params);
    return getService().render({
      idOrSlug,
      type,
      menuOnly,
      rootPath
    });
  },
  async renderChild(ctx) {
    const { params, query = {} } = ctx;
    const { type, menu: menuOnly } = query;
    const { idOrSlug, childUIKey } = parseParams(params);
    return getService().renderChildren(
      idOrSlug,
      childUIKey,
      type,
      menuOnly
    );
  },
});