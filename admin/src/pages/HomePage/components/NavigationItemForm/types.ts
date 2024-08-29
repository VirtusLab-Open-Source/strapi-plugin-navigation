import { NavigationItemTypeSchema } from '../../../../api/validators';
import { NavigationItemAdditionalField } from '../../../../schemas';

export type GetContentTypeEntitiesPayload = {
  modelUID: string;
  query: ContentTypeSearchQuery;
  locale: string;
};

export interface PluginPermissions {
  canUpdate?: boolean;
  canRead?: boolean;
}

export type ContentTypeSearchQuery = Record<string, unknown>;
export type RawFormPayload = {
  type: NavigationItemTypeSchema;
  autoSync?: boolean;
  related?: string;
  relatedType?: string;
  audience: number[];
  menuAttached: boolean;
  title: string;
  externalPath: string | null;
  path: string | null;
  additionalFields: NavigationItemAdditionalField;
  updated: boolean;
};

export type SanitizedFormPayload = {
  title: string;
  type: NavigationItemTypeSchema;
  menuAttached: boolean;
  path?: string | null;
  externalPath?: string | null;
  related: number | undefined;
  relatedType: string | undefined;
  isSingle: boolean;
  singleRelatedItem: ContentTypeEntity | undefined;
  uiRouterKey: string | undefined;
};

export interface ContentTypeEntity {
  id: number;
  uid?: string;
  __collectionUid?: string;
  label?: string;
}

export type PluginConfigNameFields = Record<string, string[]>;
