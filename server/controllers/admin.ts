import { IAdminService, ICommonService, ToBeFixed } from '../../types';
import { getPluginService, parseParams } from '../utils';
import { errorHandler } from '../utils';
import { IAdminController } from '../../types'

const adminControllers: IAdminController = {
  getService<T = IAdminService>(name = "admin") {
    return getPluginService<T>(name);
  },
  async get() {
    return await this.getService().get();
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
  async config() {
    return this.getService().config();
  },
  
	async updateConfig(ctx) {
    try {
      await this.getService().updateConfig(ctx.request.body);
    } catch (e: ToBeFixed) { 
      errorHandler(ctx)(e);
    }
    return ctx.send({ status: 200 });
	},
	
	async restoreConfig(ctx) {
    try {
      await this.getService().restoreConfig();
    } catch (e: ToBeFixed) { 
      errorHandler(ctx)(e);
    }
    return ctx.send({ status: 200 })
  },

  async settingsConfig() {
    return this.getService().config(true);
  },

  async settingsRestart(ctx) {
    try {
      await this.getService().restart();
      return ctx.send({ status: 200 });
    } catch (e: ToBeFixed) {
      errorHandler(ctx)(e);
    }
  },
  async getById(ctx) {
    const { params } = ctx;
    const { id } = parseParams(params);
    return this.getService().getById(id);
  },
  async getContentTypeItems(ctx) {
    const { params } = ctx;
    const { model } = parseParams(params);
    return this.getService<ICommonService>('common').getContentTypeItems(model)
  },
};

export default adminControllers;
