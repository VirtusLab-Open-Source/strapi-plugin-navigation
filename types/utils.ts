import { Audience, Id, Navigation, NavigationItem, NavigationItemType, RelationOneToMany } from "./contentTypes"

export type ToBeFixed = any;
export type StrapiMap<T> = {
	[uid: string]: T
}
export type NavigationActions = {
	create?: boolean,
	update?: boolean,
	remove?: boolean,
}

export type NavigationActionsCategories = 'toCreate' | 'toUpdate' | 'toRemove';

export type NavigationActionsPerItem = Record<NavigationActionsCategories, Array<NavigationItem>>;

export type AuditLogContext = any;
export type AuditLogParams = {
	actionType: string,
	oldEntity: Navigation,
	newEntity: Navigation,
};

export type ContentTypeEntity = {
	id: Id,
	[key: string]: any,
}

export type NestedPath = {
	id: Id,
	parent?: {
		id: Id,
		path: string,
	},
	path: string
}

export enum RenderType {
	FLAT = "flat",
	TREE = "tree",
	RFR = "rfr",
}

export type RFRNavItem = {
	label?: string;
	type: NavigationItemType;
	page?: string;
	url?: string;
	audience?: RelationOneToMany<Audience | string>;
}

export enum StrapiRoutesTypes {
    ADMIN = 'admin',
    CONTENT_API = 'content-api',
}

export type StrapiRoute = {
    method: string;
    path: string;
    handler: string;
    config?: ToBeFixed;
}

export type StrapiRoutes = {
    type: StrapiRoutesTypes;
    routes: Array<StrapiRoute>;
}

export type StrapiControllerContext = any;
export type StrapiControllerContextParams = any;