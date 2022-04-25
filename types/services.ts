import { Id, StrapiContentType, StrapiEvents, StrapiStore, StringMap } from "strapi-typed";
import { NavigationPluginConfig } from "./config";
import { Navigation, NavigationItem, NavigationItemEntity, NestedStructure, RelatedRef } from "./contentTypes";
import { I18nQueryParams } from "./i18n";
import { AuditLogContext, ContentTypeEntity, NavigationActions, NavigationActionsPerItem, RenderType, RFRNavItem, ToBeFixed } from "./utils";

export type NavigationServiceName = "admin" | "client" | "common";
export type NavigationService = {
  common: ICommonService;
  admin: IAdminService;
  client: IClientService;
}

export interface IAdminService {
  config: (viaSettingsPage?: boolean) => Promise<NavigationPluginConfig>,
  get: () => Promise<Navigation[]>,
  getById: (id: Id) => Promise<Navigation>,
  post: (payload: ToBeFixed, auditLog: AuditLogContext) => ToBeFixed,
  put: (id: Id, payload: ToBeFixed, auditLog: AuditLogContext) => ToBeFixed,
  restart: () => Promise<void>,
  restoreConfig: () => Promise<void>,
  updateConfig: (newConfig: NavigationPluginConfig) => Promise<void>,
}

export interface ICommonService {
  analyzeBranch: (items: NestedStructure<NavigationItem>[], masterEntity: Navigation | null, parentItem?: ToBeFixed, prevOperations?: NavigationActions) => Promise<NavigationActionsPerItem[]>,
  configContentTypes: (viaSettingsPage?: boolean) => Promise<StrapiContentType<ToBeFixed>[]>,
  createBranch: (items: NestedStructure<NavigationItem>[], masterEntity: Navigation | null, parentItem: NavigationItemEntity | null, operations: NavigationActions) => ToBeFixed,
  emitEvent: (uid: string, event: StrapiEvents, entity: ToBeFixed) => Promise<void>,
  getBranchName: (item: NavigationItem) => keyof NavigationActionsPerItem | void,
  getContentTypeItems: (uid: string, query: StringMap<string>) => Promise<ContentTypeEntity[]>,
  getIdsRelated: (relatedItems: RelatedRef[] | null, master: number) => Promise<(Id | undefined)[]> | void,
  getPluginStore: () => Promise<StrapiStore>,
  getRelatedItems: (entityItems: NavigationItemEntity[]) => Promise<NavigationItemEntity<ContentTypeEntity>[]>,
  removeBranch: (items: NestedStructure<NavigationItem>[], operations: NavigationActions) => ToBeFixed,
  removeRelated: (relatedItems: RelatedRef[], master: number) => ToBeFixed
  setDefaultConfig: () => Promise<NavigationPluginConfig>,
  updateBranch: (toUpdate: NestedStructure<NavigationItem>[], masterEntity: Navigation | null, parentItem: NavigationItemEntity | null, operations: NavigationActions) => ToBeFixed,
}

export interface IClientService {
  render: (input: { idOrSlug: Id, type?: RenderType, menuOnly?: boolean, rootPath?: string } & I18nQueryParams) => Promise<ToBeFixed>,
  renderChildren: (input: { idOrSlug: Id, childUIKey: string, type?: RenderType, menuOnly?: boolean } & I18nQueryParams) => Promise<ToBeFixed>,
  renderRFR: (items: NestedStructure<NavigationItem>[], parent: Id | null, parentNavItem: RFRNavItem | null, contentTypes: string[]) => ToBeFixed,
  renderRFRNav: (item: NavigationItem) => RFRNavItem,
  renderRFRPage: (item: NavigationItem & { related: ToBeFixed }, parent: Id | null) => ToBeFixed,
  renderTree(items: NavigationItemEntity<ContentTypeEntity>[], id: Id | null, field: keyof NavigationItemEntity, path: string | undefined, itemParser: ToBeFixed): ToBeFixed,
  renderType: (input: { type: RenderType, criteria: ToBeFixed, itemCriteria: ToBeFixed, filter: ToBeFixed, rootPath: string | null } & I18nQueryParams) => ToBeFixed,
}
