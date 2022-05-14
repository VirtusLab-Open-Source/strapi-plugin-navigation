import { StrapiRequestContext } from "strapi-typed";
import { Navigation } from "./contentTypes";
import { IAdminService, IClientService, NavigationService, NavigationServiceName } from "./services";
import { AuditLogContext, StrapiControllerContext, ToBeFixed } from "./utils";

type ControllerCommonContext = {
  auditLog: AuditLogContext;
};

export interface IAdminController {
  getService: <T extends NavigationService = IAdminService>(name?: NavigationServiceName) => T;

  config: () => ToBeFixed;
  get: () => ToBeFixed;
  getById: (ctx: StrapiControllerContext) => ToBeFixed;
  getContentTypeItems: (ctx: StrapiControllerContext) => ToBeFixed;
  post: (ctx: StrapiControllerContext) => ToBeFixed;
  put: (ctx: StrapiControllerContext) => ToBeFixed;
  restoreConfig: (ctx: StrapiControllerContext) => ToBeFixed;
  settingsConfig: () => ToBeFixed;
  settingsRestart: (ctx: StrapiControllerContext) => ToBeFixed;
  updateConfig: (ctx: StrapiControllerContext) => ToBeFixed;
  fillFromOtherLocale: (ctx: StrapiRequestContext<never, never, { source: string, target: string }> & ControllerCommonContext) => Promise<Navigation>;
  readNavigationItemFromLocale: (ctx: StrapiRequestContext<never, { path?: string }, { source: string, target: string }> & ControllerCommonContext) => Promise<ToBeFixed>;
};

export interface IClientController {
  getService: <T extends NavigationService = IClientService>(name?: NavigationServiceName) => T;

  render: (ctx: StrapiControllerContext) => ToBeFixed;
  renderChild: (ctx: StrapiControllerContext) => ToBeFixed;
};

export type NavigationController = {
  admin: IAdminController;
  client: IClientController;
};
