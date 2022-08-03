import { Id, StrapiContentType, StrapiEvents, StrapiStore, StringMap } from "strapi-typed";
import { NavigationPluginConfig } from "./config";
import { Navigation, NavigationItem, NavigationItemCustomField, NavigationItemEntity, NavigationItemInput, NestedStructure, NotVoid, RelatedRef, RelatedRefBase } from "./contentTypes";
import { I18nQueryParams } from "./i18n";
import { AuditLogContext, ContentTypeEntity, NavigationActions, NavigationActionsPerItem, PopulateQueryParam, RenderType, RFRNavItem, ToBeFixed } from "./utils";

export type NavigationServiceName = "common" | "admin" | "client"
export type NavigationService = ICommonService | IAdminService | IClientService

export interface IAdminService {
  config: (viaSettingsPage?: boolean) => Promise<NavigationPluginConfig>,
  get: () => Promise<Navigation[]>,
  getById: (id: Id) => Promise<Navigation>,
  post: (payload: ToBeFixed, auditLog: AuditLogContext) => ToBeFixed,
  put: (id: Id, payload: ToBeFixed, auditLog: AuditLogContext) => ToBeFixed,
  delete: (id: Id, auditLog: AuditLogContext) => Promise<void>,
  restart: () => Promise<void>,
  restoreConfig: () => Promise<void>,
  updateConfig: (newConfig: NavigationPluginConfig) => Promise<void>,
  fillFromOtherLocale(payload: { source: number; target: number; auditLog: AuditLogContext }): Promise<Navigation>;
  readNavigationItemFromLocale(payload: { source: number; target: number; path: string; }): Promise<
    Partial<
      Pick<NotVoid<Navigation['items']>[number], 'path' | 'related' | 'type' | 'uiRouterKey' | 'title' | 'externalPath'>
    >
  >;
  getSlug(query: string): Promise<string>;
}

export interface ICommonService {
  analyzeBranch: (items: NestedStructure<NavigationItem>[], masterEntity: Navigation | null, parentItem?: ToBeFixed, prevOperations?: NavigationActions) => Promise<NavigationActionsPerItem[]>,
  configContentTypes: (viaSettingsPage?: boolean) => Promise<StrapiContentType<ToBeFixed>[]>,
  createBranch: (items: NestedStructure<NavigationItemInput | NavigationItem>[], masterEntity: Navigation | null, parentItem: NavigationItemEntity | null, operations: NavigationActions) => ToBeFixed,
  emitEvent: (uid: string, event: StrapiEvents, entity: ToBeFixed) => Promise<void>,
  getBranchName: (item: NavigationItem) => keyof NavigationActionsPerItem | void,
  getContentTypeItems: (uid: string, query: StringMap<string>) => Promise<ContentTypeEntity[]>,
  getIdsRelated: (relatedItems: RelatedRefBase[] | RelatedRef[] | null, master: number) => Promise<Id[] | void>,
  getPluginStore: () => Promise<StrapiStore>,
  getRelatedItems: (entityItems: NavigationItemEntity[], populate?: PopulateQueryParam) => Promise<NavigationItemEntity<ContentTypeEntity>[]>,
  pruneCustomFields: (removedFields: NavigationItemCustomField[]) => Promise<void>,
  removeBranch: (items: NestedStructure<NavigationItem>[], operations: NavigationActions) => ToBeFixed,
  removeRelated: (relatedItems: RelatedRef[], master: number) => ToBeFixed
  setDefaultConfig: () => Promise<NavigationPluginConfig>,
  updateBranch: (toUpdate: NestedStructure<NavigationItem>[], masterEntity: Navigation | null, parentItem: NavigationItemEntity | null, operations: NavigationActions) => ToBeFixed,
}

export interface IClientService {
  render: (input: { idOrSlug: Id, type?: RenderType, menuOnly?: boolean, rootPath?: string, wrapRelated?: boolean, populate?: PopulateQueryParam } & I18nQueryParams) => Promise<ToBeFixed>,
  renderChildren: (input: { idOrSlug: Id, childUIKey: string, type?: RenderType, menuOnly?: boolean, wrapRelated?: boolean } & I18nQueryParams) => Promise<ToBeFixed>,
  renderRFR: (input: { items: NestedStructure<NavigationItem>[], parent?: Id | null, parentNavItem?: RFRNavItem | null, contentTypes: string[], enabledCustomFieldsNames: string[] }) => ToBeFixed,
  renderRFRNav: (item: NavigationItem) => RFRNavItem,
  renderRFRPage: (item: NavigationItem & { related: ToBeFixed }, parent: Id | null, enabledCustomFieldsNames: string[]) => ToBeFixed,
  renderTree(items: NavigationItemEntity<ContentTypeEntity>[], id: Id | null, field: keyof NavigationItemEntity, path: string | undefined, itemParser: ToBeFixed): ToBeFixed,
  renderType: (input: { type: RenderType, criteria: ToBeFixed, itemCriteria: ToBeFixed, filter: ToBeFixed, rootPath: string | null, wrapRelated?: boolean, populate?: PopulateQueryParam } & I18nQueryParams) => ToBeFixed,
}
