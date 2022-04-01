import { NavigationController } from '../../types';

import admin from './admin';
import client from './client';

const controllers: NavigationController = {
	admin,
	client,
}

export default controllers;
