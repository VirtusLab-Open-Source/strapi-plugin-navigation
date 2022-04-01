import { IAdminService, IClientService } from "./services";
import { StrapiControllerContext, ToBeFixed } from "./utils";

export interface IAdminController {
  getService: <T = IAdminService>(name?: string) => T;

  config: () => ToBeFixed;
  get: () => ToBeFixed
  getById: (ctx: StrapiControllerContext) => ToBeFixed;
  getContentTypeItems: (ctx: StrapiControllerContext) => ToBeFixed;
  post: (ctx: StrapiControllerContext) => ToBeFixed;
  put: (ctx: StrapiControllerContext) => ToBeFixed;
  restoreConfig: (ctx: StrapiControllerContext) => ToBeFixed;
  settingsConfig: () => ToBeFixed;
  settingsRestart: (ctx: StrapiControllerContext) => ToBeFixed;
  updateConfig: (ctx: StrapiControllerContext) => ToBeFixed;
}

export interface IClientController {
  getService: <T = IClientService>(name?: string) => T;

  render: (ctx: StrapiControllerContext) => ToBeFixed;
  renderChild: (ctx: StrapiControllerContext) => ToBeFixed;
}

export type NavigationController = {
  admin: IAdminController;
  client: IClientController;
}
