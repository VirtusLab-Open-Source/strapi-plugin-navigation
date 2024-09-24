import { NavigationItemDBSchema, NavigationItemType } from '../schemas';
import { NavigationDTO } from './navigation';

export type NavigationItemDTO = Omit<
  NavigationItemDBSchema,
  'related' | 'items' | 'master' | 'parent'
> & {
  related?: { id: number; uid: string; documentId: string, locale?: string } | null;
  items?: NavigationItemDTO[];
  master?: NavigationDTO;
  parent?: NavigationItemDTO | null;
  order?: number;
};

export type CreateBranchNavigationItemDTO = Omit<NavigationItemDBSchema, 'id' | 'items'> & {
  id?: number;
  items?: CreateBranchNavigationItemDTO[];
  removed?: boolean;
  updated?: boolean;
};

export type RFRNavigationItemDTO =
  | {
      label: string;
      type: NavigationItemType;
      audience?: string[];
    }
  | {
      label: string;
      type: NavigationItemType;
      audience?: string[];
      url: string;
    }
  | {
      label: string;
      type: NavigationItemType;
      audience?: string[];
      page: string;
    };

export type RFRPageDTO = Pick<
  NavigationItemDTO,
  'title' | 'path' | 'audience' | 'menuAttached'
> & {
  id: NavigationItemDTO['uiRouterKey'];
  templateName?: string;
  related?: {
    contentType: string;
    id?: number;
  };
  parent?: string;
} & Record<string, unknown>;

export type RFRRenderDTO = {
  nav: {
    root: RFRNavigationItemDTO[];
  } & Record<string, RFRNavigationItemDTO[]>;
  pages: Record<string, RFRPageDTO>;
};