import { Id, TypeResult } from "strapi-typed";
import { DateString, ToBeFixed } from "./utils";

export type Navigation = {
  id: Id;
  name: string;
  slug: string;
  visible?: boolean;
  items?: NestedStructure<NavigationItemEntity<ToBeFixed>>[];
  createdAt: string;
  updatedAt: string;
  localeCode?: string | null;
  localizations?: Navigation[] | null
}

export type NavigationItem = NavigationItemPartial & {
  id?: number;
  master: number;
  parent: number | null;
  audience: string[];
  externalPath?: string;
  related: RelatedRef[];
  removed: boolean;
  updated: boolean;
  slug?: string
}
export type NavigationItemInput = NavigationItemPartial 
  & Omit<NavigationItem, "related"> 
  & {
    related: RelatedRefBase[]
  }

export type NavigationItemEntity<RelatedType = NavigationItemRelated> = TypeResult<NavigationItemPartial & EntityDatePartial & {
  id: number;
  parent: NavigationItemEntity | null;
  master: Navigation;
  audience: Audience[];
  externalPath: string | null;
  related: RelatedType | null;
}>

type NavigationItemPartial = {
  path: string | null;
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

export type RelatedRefBase = {
  refId: number;
  ref: string;
  field: string;
}
export type RelatedRef = RelatedRefBase & {
  id: Id;
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

export type NotVoid<T> = T extends undefined ? never : T;

export type NavigationItemCustomField = {
  name: string;
  label: string;
  type: 'string' | 'boolean';
}

export type NavigationItemAdditionalField = NavigationItemCustomField | 'audience';
