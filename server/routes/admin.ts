import { StrapiRoutes } from "../../types";

const routes: StrapiRoutes = {
	type: 'admin',
	routes: [
		{
			method: 'GET',
			path: '/',
			handler: 'admin.get',
		},
		{
			method: 'POST',
			path: '/',
			handler: 'admin.post',
		},
		{
			method: 'GET',
			path: '/config',
			handler: 'admin.config',
		},
		{
			method: 'PUT',
			path: '/config',
			handler: 'admin.updateConfig',
		},
		{
			method: 'DELETE',
			path: '/config',
			handler: 'admin.restoreConfig',
		},
		{
			method: 'GET',
			path: '/:id',
			handler: 'admin.getById',
		},
		{
			method: 'PUT',
			path: '/:id',
			handler: 'admin.put',
		},
		{
			method: 'GET',
			path: '/content-type-items/:model',
			handler: 'admin.getContentTypeItems',
			config: {
				policies: [
					'admin::isAuthenticatedAdmin'
				]
			}
		},
		{
			method: 'GET',
			path: '/settings/config',
			handler: 'admin.settingsConfig',
		},
		{
			method: 'GET',
			path: '/settings/restart',
			handler: 'admin.settingsRestart',
			config: {
				policies: [],
			},
		},
	]
}

export default routes;
