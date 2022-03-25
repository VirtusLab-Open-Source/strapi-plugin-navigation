import admin from './admin';
import client from './client';

const routes = {
	admin,
	'content-api': client,
};

export default routes;