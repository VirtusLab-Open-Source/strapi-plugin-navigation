import { Id } from "strapi-typed";
import { DateString, ToBeFixed } from "./utils";

export type Navigation = {
	id: Id;
	name: string;
	slug: string;
	visible?: boolean;
	items?: NavigationItemEntity<ToBeFixed>[];
	createdAt: string;
	updatedAt: string;
}

export type NavigationItem = NavigationItemPartial & {
	id?: number;
	master: number;
	parent: number | null;
	audience: string[];
	externalPath?: string;
	path?: string;
	related: RelatedRef[];
	removed: boolean;
	updated: boolean;
	slug?: string
}

export type NavigationItemEntity<RelatedType = NavigationItemRelated> = NavigationItemPartial & EntityDatePartial & {
	id: number;
	parent: NavigationItemEntity | null;
	master: Navigation;
	audience: Audience[];
	path: string | null;
	externalPath: string | null;
	related: RelatedType | null;
}

type NavigationItemPartial = {
	title: string;
	type: NavigationItemType;
	collapsed: boolean;
	menuAttached: boolean;
	order: number;
	uiRouterKey: string;
}

export type NestedStructure<T> = T & {
	items: NestedStructure<T>[]
}

export type RelatedRef = {
	id: number;
	refId: number;
	ref: string;
	field: string;
	__templateName?: string;
	__contentType?: string;
}

export type Audience = {
	id: Id;
	name: string;
	key: string;
};

export type NavigationItemRelated = {
	id: Id;
	related_id: string;
	related_type: string;
	relatedType: string;
	field: string;
	order: number;
	master: string;
	__contentType?: string;
	__templateName?: string;
	navigationItemId?: Id;
	localizations?: ToBeFixed;
	refId?: Id;
	ref?: string;
};

export type NavigationItemType = "INTERNAL" | "EXTERNAL" | "WRAPPER";

type EntityDatePartial = {
	createdAt: DateString;
	updatedAt: DateString;
}
