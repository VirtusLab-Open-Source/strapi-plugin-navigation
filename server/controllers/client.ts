import { IClientController, IClientService } from '../../types';
import { getPluginService, parseParams } from '../utils';

const clientControllers: IClientController = {
	getService<T = IClientService>(name = "client"): T {
		return getPluginService<T>(name);
	},

	async render(ctx) {
		const { params, query = {} } = ctx;
		const { type, menu: menuOnly, path: rootPath } = query;
		const { idOrSlug } = parseParams(params);
		return this.getService().render(
			idOrSlug,
			type,
			menuOnly,
			rootPath
		);
	},
	async renderChild(ctx) {
		const { params, query = {} } = ctx;
		const { type, menu: menuOnly } = query;
		const { idOrSlug, childUIKey } = parseParams(params);
		return this.getService().renderChildren(
			idOrSlug,
			childUIKey,
			type,
			menuOnly
		);
	},
};

export default clientControllers;