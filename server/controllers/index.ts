import { NavigationController } from '../../types';

import adminControllers from './admin';
import clientControllers from './client';

const controllers: NavigationController = {
  admin: adminControllers,
  client: clientControllers,
}

export default controllers;
