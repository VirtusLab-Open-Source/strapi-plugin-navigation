import { NavigationItemDTO, RFRNavigationItemDTO } from '../../dtos';

export type RenderType = 'FLAT' | 'TREE' | 'RFR';

export type PopulateQueryParam = string | boolean | string[];

export type NestedPath = {
  id?: number;
  parent?: {
    id: number;
    path: string;
  };
  path: string;
};

export interface ReadAllInput {
  orderBy?: string;
  orderDirection?: 'DESC' | 'ASC';
  locale?: string;
}

export interface RenderRFRInput {
  items: NavigationItemDTO[];
  parent?: string;
  parentNavItem?: RFRNavigationItemDTO;
  contentTypes: string[];
  enabledCustomFieldsNames: string[];
}

export interface RenderRFRNavInput {
  item: Pick<NavigationItemDTO, 'uiRouterKey' | 'title' | 'path' | 'type' | 'audience'>;
}

export interface RenderRFRPageInput {
  item: Omit<NavigationItemDTO, 'items' | 'parent' | 'master'>;
  parent?: string;
  enabledCustomFieldsNames: string[];
}

export interface RenderTreeInput {
  items?: NavigationItemDTO[];
  id?: number;
  path: string | undefined;
  itemParser: (_: NavigationItemDTO, path: string) => Promise<NavigationItemDTO>;
}

export interface RenderTypeInput {
  type?: RenderType;
  criteria?: Record<string, unknown>;
  itemCriteria?: Record<string, unknown>;
  filter?: string;
  rootPath?: string;
  wrapRelated?: boolean;
  populate?: PopulateQueryParam;
  locale?: string;
}

export interface RenderChildrenInput {
  idOrSlug: number | string;
  childUIKey: string;
  type?: RenderType;
  menuOnly?: boolean;
  wrapRelated?: boolean;
  locale?: string;
}

export interface RenderInput {
  idOrSlug: string | number;
  type?: RenderType;
  menuOnly?: boolean;
  rootPath?: string;
  wrapRelated?: boolean;
  populate?: PopulateQueryParam;
  locale?: string;
}
