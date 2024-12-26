import { NavigationItemDBSchema, NavigationItemType } from '../schemas';
import { NavigationDTO } from './navigation';

export type NavigationItemDTO = Omit<
  NavigationItemDBSchema,
  'related' | 'items' | 'master' | 'parent'
> & {
  related?: NavigationItemRelatedDTO | null;
  items?: NavigationItemDTO[];
  master?: NavigationDTO;
  parent?: NavigationItemDTO | null;
  order?: number;
};

export type NavigationItemRelatedDTO = {
  __type: string;
  documentId: string;
}

export type CreateBranchNavigationItemDTO = Omit<NavigationItemDBSchema, 'id' | 'documentId' | 'items'> & {
  id?: number;
  documentId?: string;
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
  documentId: string;
  templateName?: string;
  related?: {
    contentType: string;
    documentId?: string;
  };
  parent?: string;
} & Record<string, unknown>;

export type RFRRenderDTO = {
  nav: {
    root: RFRNavigationItemDTO[];
  } & Record<string, RFRNavigationItemDTO[]>;
  pages: Record<string, RFRPageDTO>;
};
