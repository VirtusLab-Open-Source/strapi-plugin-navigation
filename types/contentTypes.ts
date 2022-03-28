import { ToBeFixed } from "./utils";

export type RelationOneToOne<ContentType> = ContentType | number | null;
export type RelationManyToOne<ContentType> = Array<ContentType | number> | ContentType | number | null;
export type RelationOneToMany<ContentType> = Array<ContentType | number> | null;

export type Id = number | string;

export type Navigation = {
    id: Id;
    name: string;
    slug: string;
    visible?: boolean;
    items?: RelationOneToMany<NavigationItem>;
}
export type NavigationItem = {
    id: Id;
    title?: string;
    type: NavigationItemType;
    path?: string;
    externalPath?: string;
    uiRouterKey?: string;
    menuAttached?: boolean;
    order?: number;
    related?: RelationManyToOne<NavigationItemRelated>;
    parent?: RelationManyToOne<NavigationItem>;
    master?: RelationManyToOne<Navigation>;
    audience?: RelationOneToMany<Audience | string>;
    items?: Array<NavigationItem> | null;
    slug?: string;
    removed?: boolean;
    updated?: boolean;
    external?: boolean;
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

export enum NavigationItemType {
    INTERNAL = "INTERNAL",
    EXTERNAL = "EXTERNAL",
    WRAPPER = "WRAPPER",
}
