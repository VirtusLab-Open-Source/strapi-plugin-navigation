"use strict";

const { NavigationError } = require('../utils/NavigationError');
/**
 * navigation.js controller
 *
 * @description: A set of functions called "actions" of the `navigation` plugin.
 */

const parseParams = (params) =>
  Object.keys(params).reduce((prev, curr) => {
    const value = params[curr];
    const parsedValue = isNaN(value) 
      ? value
      : parseInt(value, 10);
    return {
      ...prev,
      [curr]: parsedValue,
    };
  }, {});

const errorHandler = (ctx) => (error) => {
  if (error instanceof NavigationError) {
    return ctx.badRequest(error.message);
  }
  throw error;
};

module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */

  config: async () => {
    return await strapi.plugins.navigation.services.navigation.config();
  },

  get: async () => {
    return await strapi.plugins.navigation.services.navigation.get();
  },

  getById: async (ctx) => {
    const { params } = ctx;
    const { id } = parseParams(params);
    return await strapi.plugins.navigation.services.navigation.getById(id);
  },

  render: async (ctx) => {
    const { params, query = {} } = ctx;
    const { type, menu: menuOnly } = query;
    const { idOrSlug } = parseParams(params);
    return await strapi.plugins.navigation.services.navigation.render(
      idOrSlug,
      type,
      menuOnly,
    );
  },

  post: (ctx) => {
    const { auditLog } = ctx;
    const { body = {} } = ctx.request;
    return strapi.plugins.navigation.services.navigation.post(body, auditLog);
  },

  put: (ctx) => {
    const { params, auditLog } = ctx;
    const { id } = parseParams(params);
    const { body = {} } = ctx.request;
    return strapi.plugins.navigation.services.navigation.put(id, body, auditLog)
      .catch(errorHandler(ctx));
  },
};
