import { Id, StrapiContentType, StrapiStore } from "strapi-typed";
import { NavigationPluginConfig } from "./config";
import { Navigation, NavigationItem, NavigationItemEntity, NestedStructure, RelatedRef } from "./contentTypes";
import { AuditLogContext, ContentTypeEntity, NavigationActions, NavigationActionsPerItem, RenderType, RFRNavItem, ToBeFixed } from "./utils";

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
	analyzeBranch: (items: NestedStructure<NavigationItem>[], masterEntity: Navigation | null, parentItem?: ToBeFixed, prevOperations?: NavigationActions) => Promise<Array<NavigationActionsPerItem>>,
	configContentTypes: (viaSettingsPage?: boolean) => Promise<StrapiContentType<any>[]>,
	createBranch: (items: NestedStructure<NavigationItem>[], masterEntity: Navigation | null, parentItem: NavigationItemEntity | null, operations: NavigationActions) => ToBeFixed,
	getBranchName: (item: NavigationItem) => keyof NavigationActionsPerItem | void,
	getContentTypeItems: (uid: string) => Promise<ContentTypeEntity[]>,
	getIdsRelated: (relatedItems: Array<RelatedRef> | null, master: number) => Promise<Array<Id | undefined>> | void,
	getPluginStore: () => Promise<StrapiStore>,
	getRelatedItems: (entityItems: NavigationItemEntity[]) => Promise<NavigationItemEntity<ContentTypeEntity>[]>,
	removeBranch: (items: NestedStructure<NavigationItem>[], operations: NavigationActions) => ToBeFixed,
	removeRelated: (relatedItems: Array<RelatedRef>, master: number) => ToBeFixed
	setDefaultConfig: () => Promise<NavigationPluginConfig>,
	updateBranch: (toUpdate: NestedStructure<NavigationItem>[], masterEntity: Navigation | null, parentItem: NavigationItemEntity | null, operations: NavigationActions) => ToBeFixed,
}

export interface IClientService {
	render: (idOrSlug: Id, type?: RenderType, menuOnly?: boolean, rootPath?: string) => Promise<ToBeFixed>,
	renderChildren: (idOrSlug: Id | string, childUIKey: string, type?: RenderType, menuOnly?: boolean) => Promise<ToBeFixed>,
	renderRFR: (items: NestedStructure<NavigationItem>[], parent: Id | null, parentNavItem: RFRNavItem | null, contentTypes: string[]) => ToBeFixed,
	renderRFRNav: (item: NavigationItem) => RFRNavItem,
	renderRFRPage: (item: NavigationItem & { related: ToBeFixed }, parent: Id | null) => ToBeFixed,
	renderTree(items: Array<NavigationItemEntity<ContentTypeEntity>>, id: Id | null, field: keyof NavigationItemEntity, path: string | undefined, itemParser: ToBeFixed): ToBeFixed,
	renderType: (type: RenderType, criteria: ToBeFixed, itemCriteria: ToBeFixed, filter: ToBeFixed, rootPath: string | null) => ToBeFixed,
}
