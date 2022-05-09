import { Id } from "strapi-typed";
import { Navigation, NavigationItem, NavigationItemType, NestedStructure } from "./contentTypes"

export type NavigationActionsCategories = 'toCreate' | 'toUpdate' | 'toRemove';
export type RenderTypeOptions = Readonly<{
  FLAT: 'FLAT'
  TREE: 'TREE'
  RFR: 'RFR'
}>;
export type RenderType = keyof RenderTypeOptions;
export type StrapiRoutesTypes = 'admin' | 'content-api';
export type ToBeFixed = any;
export type DateString = string;

export type NavigationActions = {
  create?: boolean;
  update?: boolean;
  remove?: boolean;
};

export type NavigationActionsPerItem = Record<
  NavigationActionsCategories,
  NestedStructure<NavigationItem>[]
>;

export type AuditLogContext = any;
export type AuditLogParams = {
  actionType: string;
  oldEntity: Navigation;
  newEntity: Navigation;
};

export type ContentTypeEntity = {
  id: Id;
} & Record<string, unknown>;

export type NestedPath = {
  id: Id;
  parent?: {
    id: Id;
    path: string;
  };
  path: string;
};

export type RFRNavItem = {
  label?: string;
  type: NavigationItemType;
  page?: string;
  url?: string;
  audience?: string[];
};

export type StrapiRoute = {
  method: string;
  path: string;
  handler: string;
  config?: ToBeFixed;
};

export type StrapiRoutes = {
  type: StrapiRoutesTypes;
  routes: StrapiRoute[];
};

export type StrapiControllerContext = any;
export type StrapiControllerContextParams = any;

export const assertNotEmpty: <T>(
  value: T | null | undefined,
  customError?: Error
) => asserts value is T = (value, customError) => {
  if (value !== undefined && value !== null) {
    return;
  }

  throw customError ?? new Error("Non-empty value expected, empty given");
};

export const isNumber = (x: unknown) =>
  typeof x === "number" && !Number.isNaN(x);

export const assertIsNumber: (
  n: unknown,
  customError?: Error
) => asserts n is number = (n: unknown, customError?: Error) => {
  if (isNumber(n)) {
    return;
  }

  throw customError ?? new Error(`Number is expected. "${typeof n}" given`);
};

export const assertEntity = <T>(entity: unknown, name = "Entity"): T => {
  if (entity instanceof Object && entity.hasOwnProperty("id")) {
    return entity as T;
  }

  throw new Error(`${name} instance expected. ${typeof entity} given.`);
};
