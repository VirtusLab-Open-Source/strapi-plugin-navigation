import {
  CreateNavigationSchema,
  NavigationDBSchema,
  NavigationPluginConfigDBSchema,
  UpdateNavigationSchema,
} from '../../schemas';
import { AuditLogContext } from './utils';

export interface ConfigInput {
  viaSettingsPage?: boolean;
}

export interface GetInput {
  ids?: string[];
  localeCode?: string;
}

export interface GetByIdInput {
  documentId: string;
}

export interface PostInput {
  payload: CreateNavigationSchema;
  auditLog: AuditLogContext;
}

export interface PutInput {
  payload: UpdateNavigationSchema;
  auditLog: AuditLogContext;
}

export interface DeleteInput {
  documentId: string;
  auditLog: AuditLogContext;
}

export interface UpdateConfigInput {
  config: NavigationPluginConfigDBSchema;
}

export interface FillFromOtherLocaleInput {
  source: string;
  target: string;
  auditLog: AuditLogContext;
}

export interface I18nNavigationContentsCopyInput {
  target: NavigationDBSchema;
  source: NavigationDBSchema;
}

export interface ReadNavigationItemFromLocaleInput {
  source: string;
  target: string;
  path: string;
}

export interface GetContentTypeItemsInput {
  uid: string;
  query: Record<string, unknown>;
}
