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

module.exports = {
  async config() {
    return getService().config();
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
};