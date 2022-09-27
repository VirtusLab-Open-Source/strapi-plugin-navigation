import {
  Audience,
  Effect,
  ContentTypeEntity,
  NavigationItemAdditionalField,
  NavigationItemAdditionalFieldValues,
  NavigationItemType,
  NavigationConfig,
  PluginConfigNameFields,
  ToBeFixed,
  VoidEffect
} from '../../../../../../types';
import { Id } from 'strapi-typed';
import { StrapiContentTypeSchema } from '../../../SettingsPage/types';

export type FormEventTarget<TValue = unknown> = {
  name: string,
  value: TValue
}

type GetContentTypeEntitiesPayload = {
  modelUID: string;
  query: ContentTypeSearchQuery;
  locale: ToBeFixed;
}

export type NavigationItemFormData = {
  isMenuAllowedLevel: boolean;
  levelPath: string;
  parentAttachedToMenu: boolean;
  audience?: Audience[];
  collapsed?: boolean;
  externalPath?: string | null;
  id?: Id;
  isParentAttachedToMenu?: boolean;
  items?: ToBeFixed[];
  menuAttached?: boolean;
  order?: number;
  parent?: ToBeFixed;
  path?: string | null;
  title?: string;
  type?: NavigationItemType;
  uiRouterKey?: string;
  updated?: boolean;
  viewId?: string;
  viewParentId: string | null;
  related?: {
    value: string;
    label: string;
  };
  relatedType?: {
    value: string;
    label: string;
  };
  relatedRef?: ToBeFixed;
  structureId: ToBeFixed;
}

export type NavigationItemFormProps = {
  additionalFields: NavigationItemAdditionalField[];
  appendLabelPublicationStatus: (label: string, entity: ContentTypeEntity) => string;
  availableAudience: string[];
  contentTypeEntities: ContentTypeEntity[];
  contentTypes: StrapiContentTypeSchema[];
  contentTypesNameFields: PluginConfigNameFields;
  data: NavigationItemFormData;
  getContentTypeEntities: (value: GetContentTypeEntitiesPayload, plugin: string) => ContentTypeEntity;
  isLoading: boolean;
  locale: string;
  onCancel: VoidEffect;
  onSubmit: Effect<SanitizedFormPayload>;
  usedContentTypeEntities: ToBeFixed[];
  usedContentTypesData: ToBeFixed;
  config: NavigationConfig;
  availableLocale: string[];
  readNavigationItemFromLocale: ToBeFixed;
  inputsPrefix: string;
  slugify: (q: string) => Promise<{slug: string}>
}

export type ContentTypeSearchQuery = ToBeFixed;
export type RawFormPayload = {
  type: NavigationItemType;
  related?: string | number | { key: number, label: string, value: number};
  relatedType?: string;
  audience: Id[];
  menuAttached: boolean;
  title: string;
  externalPath: string | null;
  path: string | null;
  additionalFields: NavigationItemAdditionalFieldValues; // { cf_name: cf_value }
  updated: boolean;
}

export type SanitizedFormPayload = {
  title: string;
  type: NavigationItemType;
  menuAttached: boolean;
  path?: string | null;
  externalPath?: string | null;
  related: Id | undefined;
  relatedType: string | undefined;
  isSingle: boolean;
  singleRelatedItem: ContentTypeEntity | undefined;
  uiRouterKey: string | undefined;
}

export type Slugify = (q: string) => Promise<{
  slug: string;
}>;
