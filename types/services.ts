import { StrapiContentType, StrapiStore } from "strapi-typed";
import { NavigationPluginConfig } from "./config";
import { Id, Navigation, NavigationItem, NavigationItemRelated } from "./contentTypes";
import { AuditLogContext, ContentTypeEntity, NavigationActions, NavigationActionsPerItem, RenderType, RFRNavItem, ToBeFixed } from "./utils";

type ItemParserType = (item: NavigationItem, path: string, field: keyof NavigationItem) => NavigationItem;

export type NavigationService = {
	common: ICommonService;
	admin: IAdminService;
	client: IClientService;
}


export interface IAdminService {
	config: (viaSettingsPage?: boolean) => Promise<NavigationPluginConfig>,
	get: () => Promise < Navigation[] >,
	getById: (id: Id) => Promise<Navigation>,
	post: (payload: ToBeFixed, auditLog: AuditLogContext) => ToBeFixed,
	put: (id: Id, payload: ToBeFixed, auditLog: AuditLogContext) => ToBeFixed,
	restart: () => Promise<void>,
	restoreConfig: () => Promise<void>,
	updateConfig: (newConfig: NavigationPluginConfig) => Promise<void>,
}

export interface ICommonService {
	analyzeBranch: (items: Array<NavigationItem>, masterEntity: Navigation | null, parentItem: NavigationItem | null, prevOperations: NavigationActions) => Promise<Array<NavigationActionsPerItem>>,
	configContentTypes: (viaSettingsPage?: boolean) => Promise<StrapiContentType<any>[]>,
	createBranch: (items: Array<NavigationItem>, masterEntity: Navigation | null, parentItem: NavigationItem | null, operations: NavigationActions) => ToBeFixed,
	getBranchName: (item: NavigationItem) => keyof NavigationActionsPerItem | void,
	getContentTypeItems: (uid: string) => Promise<ContentTypeEntity[]>,
	getIdsRelated: (relatedItems: Array<NavigationItemRelated> | null, master: Navigation) => Promise<Array<Id | undefined>> | void,
	getPluginStore: () => Promise<StrapiStore>,
	getRelatedItems: (entityItems: NavigationItem[]) => Promise<NavigationItem[]>,
	removeBranch: (items: NavigationItem[], operations: NavigationActions) => ToBeFixed,
	removeRelated: (relatedItems: Array<NavigationItemRelated>,	master: Navigation) => ToBeFixed
	setDefaultConfig: () => Promise<NavigationPluginConfig>, 
	updateBranch: (toUpdate: NavigationItem[], masterEntity: Navigation | null, parentItem: NavigationItem | null, operations: NavigationActions) => ToBeFixed,
}

export interface IClientService {
	render: (idOrSlug: Id | string, type: RenderType, menuOnly: boolean, rootPath: string | null) => Promise<Array<NavigationItem>>,
	renderChildren: (idOrSlug: Id | string, childUIKey: string, type: RenderType, menuOnly: boolean) => Promise < NavigationItem[] >,
	renderRFR: (items: Array<NavigationItem>, parent: Id | null, parentNavItem: RFRNavItem | null, contentTypes: string[]) => ToBeFixed,
	renderRFRNav: (item: NavigationItem) => RFRNavItem,
	renderRFRPage: (item: NavigationItem, parent: Id | null) => ToBeFixed,
	renderTree(items: Array<NavigationItem>, id: Id | null, field: keyof NavigationItem, path: string | undefined, itemParser: ItemParserType): Array<NavigationItem>,
	renderType: (type: RenderType, criteria: ToBeFixed, itemCriteria: ToBeFixed, filter: ToBeFixed, rootPath: string | null) => Promise<Array<NavigationItem>>,
}