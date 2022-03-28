'use strict';

import commonService from './common';
import adminService from './admin';
import clientService from './client';

const navigationService = {
  common: commonService,
  admin: adminService,
  client: clientService,
};

export default navigationService;