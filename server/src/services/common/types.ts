import { UID } from '@strapi/strapi';
import { CreateBranchNavigationItemDTO, NavigationDTO, NavigationItemDTO } from '../../dtos';
import { NavigationDBSchema, NavigationItemDBSchema, NavigationItemsDBSchema } from '../../schemas';
import {
  ContentType,
  Effect,
  LifeCycleEvent,
  LifeCycleHookName,
  NavigationAction,
} from '../../types';

export type LifecycleHookRecord = Partial<Record<LifeCycleHookName, Array<Effect<LifeCycleEvent>>>>;

export interface RegisterLifeCycleHookInput {
  hookName: LifeCycleHookName;
  callback: Effect<LifeCycleEvent>;
  contentTypeName: ContentType;
}

export interface RunLifeCycleHookInput {
  contentTypeName: ContentType;
  event: LifeCycleEvent;
  hookName: LifeCycleHookName;
}

export interface MapToNavigationItemDTOInput {
  navigationItems: NavigationItemDBSchema[];
  populate: unknown;
  master?: Omit<NavigationDTO, 'items'>;
  parent?: NavigationItemDTO;
}

export interface CreateBranchInput {
  navigationItems: CreateBranchNavigationItemDTO[];
  masterEntity: NavigationDBSchema | undefined;
  parentItem: NavigationItemDBSchema | undefined;
  action: NavigationAction;
}

export interface RemoveBranchInput {
  navigationItems?: NavigationItemsDBSchema;
  action?: NavigationAction;
}

export interface UpdateBranchInput {
  navigationItems: NavigationItemsDBSchema &
    {
      updated?: boolean;
    }[];
  masterEntity: NavigationDBSchema | undefined;
  parentItem: NavigationItemDBSchema | undefined;
  action: NavigationAction;
}

export interface AnalyzeBranchInput {
  navigationItems: (Omit<NavigationItemDBSchema, 'id' | 'documentId'> & {
    removed?: boolean;
    id?: number;
    documentId?: string;
  })[];
  masterEntity?: NavigationDBSchema;
  parentItem?: NavigationItemDBSchema;
  prevAction: NavigationAction;
}

export interface EmitEventInput<TEvent, TEntity> {
  uid: UID.Schema;
  event: TEvent;
  entity: TEntity;
}

export interface GetBranchNameInput {
  item: Omit<NavigationItemDBSchema, 'id' | 'documentId'> & {
    removed?: boolean;
    documentId?: string;
    id?: number;
  };
}

export interface BuildNestedStructureInput {
  navigationItems?: NavigationItemDBSchema[];
  id?: number;
}

export interface GetSlugInput {
  query: string;
}
