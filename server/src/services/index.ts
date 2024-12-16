import admin from './admin';
import client from './client';
import common from './common';
import migrate from './migration';

export type { AdminService } from './admin';
export type { ClientService } from './client';
export type { CommonService } from './common';
export type { MigrationService } from './migration';

export default {
  admin,
  common,
  client,
  migrate,
};
