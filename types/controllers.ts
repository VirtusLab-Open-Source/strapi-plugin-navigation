import { StrapiController } from "strapi-typed";
import { Navigation, NotVoid } from "./contentTypes";
import { IAdminService, IClientService, ICommonService } from "./services";
import { AuditLogContext, StrapiControllerContext, ToBeFixed } from "./utils";

type ControllerCommonContext = {
  auditLog: AuditLogContext;
};

export interface IAdminController {
  getAdminService(): IAdminService;
  getCommonService(): ICommonService;
  config: () => ToBeFixed;
  get: StrapiController<Promise<Array<Navigation>>>;
  getById: StrapiController<Promise<Navigation>, never, never, { id: string }>;
  getContentTypeItems: (ctx: StrapiControllerContext) => ToBeFixed;
  post: StrapiController<Promise<Navigation>, Navigation, never, never, ControllerCommonContext>;
  put: StrapiController<Promise<Navigation>, Navigation, never, { id: string }, ControllerCommonContext>;
  delete: StrapiController<Promise<Navigation>, never, never, { id: string }, ControllerCommonContext>;
  restoreConfig: (ctx: StrapiControllerContext) => ToBeFixed;
  settingsConfig: () => ToBeFixed;
  settingsRestart: (ctx: StrapiControllerContext) => ToBeFixed;
  updateConfig: (ctx: StrapiControllerContext) => ToBeFixed;
  fillFromOtherLocale: StrapiController<Promise<Navigation>, never, never, { source: string, target: string }, ControllerCommonContext>,
  readNavigationItemFromLocale: StrapiController<Promise<
    Partial<
      Pick<NotVoid<Navigation['items']>[number], 'path' | 'related' | 'type' | 'uiRouterKey' | 'title' | 'externalPath'>
    >
  >, never, { path?: string }, { source: string, target: string }, ControllerCommonContext>;
  getSlug: StrapiController<Promise<{ slug: string }>, never, { q: string }>;
  purgeNavigationsCache: StrapiController<Promise<{ success: boolean }>>;
  purgeNavigationCache: StrapiController<Promise<{ success: boolean }>, never, { clearLocalisations?: 'true' | 'false' }, { id: string }>;
};

export interface IClientController {
  getService: () => IClientService;

  render: (ctx: StrapiControllerContext) => ToBeFixed;
  renderChild: (ctx: StrapiControllerContext) => ToBeFixed;
  readAll: (ctx: StrapiControllerContext) => ToBeFixed;
};

export type NavigationController = {
  admin: IAdminController;
  client: IClientController;
};
