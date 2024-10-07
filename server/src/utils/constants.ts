import { LifeCycleHookName } from '../types';

export const UID_REGEX =
  /^(?<type>[a-z0-9-]+)\:{2}(?<api>[a-z0-9-]+)\.{1}(?<contentType>[a-z0-9-]+)$/i;

export const allLifecycleHooks: ReadonlyArray<LifeCycleHookName> = [
  'beforeCreate',
  'beforeCreateMany',
  'afterCreate',
  'afterCreateMany',
  'beforeUpdate',
  'beforeUpdateMany',
  'afterUpdate',
  'afterUpdateMany',
  'beforeDelete',
  'beforeDeleteMany',
  'afterDelete',
  'afterDeleteMany',
  'beforeCount',
  'afterCount',
  'beforeFindOne',
  'afterFindOne',
  'beforeFindMany',
  'afterFindMany',
] as const;

export const RELATED_ITEM_SEPARATOR = '$';

export const ALLOWED_CONTENT_TYPES = ['api::', 'plugin::'] as const;
export const RESTRICTED_CONTENT_TYPES = [
  'admin::',
  'plugin::review-workflows',
  'plugin::content-releases',
  'plugin::users-permissions',
  'plugin::i18n.locale',
  'plugin::navigation',
] as const;
export const CONTENT_TYPES_NAME_FIELDS_DEFAULTS = ['title', 'subject', 'name'];

export const KIND_TYPES = { SINGLE: 'singleType', COLLECTION: 'collectionType' } as const;

export const DEFAULT_POPULATE = [];

export const FORBIDDEN_CUSTOM_FIELD_NAMES = [
  'title',
  'type',
  'path',
  'externalPath',
  'uiRouterKey',
  'menuAttached',
  'order',
  'collapsed',
  'related',
  'parent',
  'master',
  'audience',
  'additionalFields',
];
