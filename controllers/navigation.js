'use strict';

const { NavigationError } = require('../utils/NavigationError');
/**
 * navigation.js controller
 *
 * @description: A set of functions called "actions" of the `navigation` plugin.
 */

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
  getService() {
    return strapi.plugins.navigation.services.navigation;
  },
  /**
   * Default action.
   *
   * @return {Object}
   */
  async config() {
    return await this.getService().config();
  },

  async get() {
    return await this.getService().get();
  },

  async getById(ctx) {
    const { params } = ctx;
    const { id } = parseParams(params);
    return await this.getService().getById(id);
  },

  async render(ctx) {
    const { params, query = {} } = ctx;
    const { type, menu: menuOnly } = query;
    const { idOrSlug } = parseParams(params);
    return await this.getService().render(
      idOrSlug,
      type,
      menuOnly,
    );
  },
  async renderChild(ctx) {
    const { params, query = {} } = ctx;
    const { type, menu: menuOnly } = query;
    const { idOrSlug, childUIKey } = parseParams(params);
    return await this.getService().renderChildren(
      idOrSlug,
      childUIKey,
      type,
      menuOnly
    );
  },

  post(ctx) {
    const { auditLog } = ctx;
    const { body = {} } = ctx.request;
    return this.getService().post(body, auditLog);
  },

  put(ctx) {
    const { params, auditLog } = ctx;
    const { id } = parseParams(params);
    const { body = {} } = ctx.request;
    return this.getService().put(id, body, auditLog)
      .catch(errorHandler(ctx));
  },
};
