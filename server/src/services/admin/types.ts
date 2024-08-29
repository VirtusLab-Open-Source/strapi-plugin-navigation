import { NavigationDTO } from '../../dtos';
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
  ids?: number[];
  localeCode?: string;
}

export interface GetByIdInput {
  id: number;
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
  id: number;
  auditLog: AuditLogContext;
}

export interface UpdateConfigInput {
  config: NavigationPluginConfigDBSchema;
}

export interface FillFromOtherLocaleInput {
  source: number;
  target: number;
  auditLog: AuditLogContext;
}

export interface I18nNavigationContentsCopyInput {
  target: NavigationDBSchema;
  source: NavigationDBSchema;
}

export interface ReadNavigationItemFromLocaleInput {
  source: number;
  target: number;
  path: string;
}

export interface GetContentTypeItemsInput {
  uid: string;
  query: Record<string, unknown>;
}
