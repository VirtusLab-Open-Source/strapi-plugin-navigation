import admin from './admin';
import client from './client';
import common from './common';

export type { AdminService } from './admin';
export type { ClientService } from './client';
export type { CommonService } from './common';

export default {
  admin,
  common,
  client,
};
