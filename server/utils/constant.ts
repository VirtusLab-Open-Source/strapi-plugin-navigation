import { I18N_DEFAULT_POPULATE } from "../i18n";

export const TEMPLATE_DEFAULT = 'Generic' as const;
export const MODEL_TYPES = { CONTENT_TYPE: 'contentType' } as const;
export const KIND_TYPES = { SINGLE: 'singleType', COLLECTION: 'collectionType' } as const;
export const ALLOWED_CONTENT_TYPES = ['api::', 'plugin::'] as const;
export const RESTRICTED_CONTENT_TYPES = ['plugin::users-permissions', 'plugin::i18n.locale', 'plugin::navigation'] as const;
export const EXCLUDED_CONTENT_TYPES = ['strapi::'];
export const CONTENT_TYPES_NAME_FIELDS_DEFAULTS = ['title', 'subject', 'name'];
export const ADDITIONAL_FIELDS = { AUDIENCE: 'audience' };
export const DEFAULT_POPULATE = [...I18N_DEFAULT_POPULATE]
