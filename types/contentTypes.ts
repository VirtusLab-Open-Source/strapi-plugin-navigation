import { Id, StringMap, TypeResult } from "strapi-typed";
import { DateString, ToBeFixed } from "./utils";

type NavigationBase = {
  id: Id,
  name: string;
  slug: string;
  visible?: boolean;
  localeCode?: string | null;
  localizations?: Navigation[] | null;
}

export type NavigationEntity = EntityDatePartial & NavigationBase;

export type Navigation = NavigationBase &  {
  items?: NestedStructure<NavigationItemEntity<ToBeFixed>>[];
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
  additionalFields: StringMap<string | boolean>;
  collapsed: boolean;
  externalPath: string | null;
  id: Id;
  menuAttached: boolean;
  order: number;
  path: string | null;
  title: string;
  type: NavigationItemType;
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

export type NavigationItemViewPartial = {
  viewId?: string;
  viewParentId: string | null;
  related: number | null;
  structureId: string;
  updated: boolean;
  relatedType: string;
  isMenuAllowedLevel: boolean;
}

export type NavigationItemType = "INTERNAL" | "EXTERNAL" | "WRAPPER";

type EntityDatePartial = {
  createdAt: DateString;
  updatedAt: DateString;
}

export type NotVoid<T> = T extends undefined ? never : T;

export type NavigationItemCustomFieldType = 'boolean' | 'string' | 'select';
type NavigationItemCustomFieldBase = {
  name: string;
  label: string;
  required: boolean;
  enabled?: boolean;
}
type NavigationItemCustomFieldSelect = NavigationItemCustomFieldBase & {
  type: 'select';
  multi: boolean;
  options: string[];
}

type NavigationItemCustomFieldPrimitive = NavigationItemCustomFieldBase & {
  type: 'boolean' | 'string';
  multi: false;
  options: [];
}
export type NavigationItemCustomField = NavigationItemCustomFieldPrimitive | NavigationItemCustomFieldSelect;

export type NavigationItemAdditionalField = NavigationItemCustomField | 'audience';
export type NavigationItemAdditionalFieldValues = Record<string, string | boolean | string[]>;
