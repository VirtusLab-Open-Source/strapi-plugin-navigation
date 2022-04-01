import { Id } from "strapi-typed";
import { Navigation, NavigationItem, NavigationItemType, NestedStructure } from "./contentTypes"

export type NavigationActionsCategories = 'toCreate' | 'toUpdate' | 'toRemove';
export type RenderType = "flat" | "tree" | "rfr";
export type StrapiRoutesTypes = 'admin' | 'content-api';
export type ToBeFixed = any;
export type DateString = string;

export type NavigationActions = {
  create?: boolean,
  update?: boolean,
  remove?: boolean,
}

export type NavigationActionsPerItem = Record<NavigationActionsCategories, NestedStructure<NavigationItem>[]>;

export type AuditLogContext = any;
export type AuditLogParams = {
  actionType: string,
  oldEntity: Navigation,
  newEntity: Navigation,
};

export type ContentTypeEntity = {
  id: Id,
} & Record<string, unknown>;

export type NestedPath = {
  id: Id,
  parent?: {
    id: Id,
    path: string,
  },
  path: string
}


export type RFRNavItem = {
  label?: string;
  type: NavigationItemType;
  page?: string;
  url?: string;
  audience?: string[];
}

export type StrapiRoute = {
  method: string;
  path: string;
  handler: string;
  config?: ToBeFixed;
}

export type StrapiRoutes = {
  type: StrapiRoutesTypes;
  routes: StrapiRoute[];
}

export type StrapiControllerContext = any;
export type StrapiControllerContextParams = any;
