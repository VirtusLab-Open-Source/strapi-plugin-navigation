import { NavigationService } from "./services";
import { StrapiControllerContext, ToBeFixed } from "./utils";

export interface IAdminController {
	getService: (name?: string) => NavigationService;
	
	config: () => ToBeFixed;
	get: () => ToBeFixed
	getById: (ctx: StrapiControllerContext) => ToBeFixed;
	getContentTypeItems: (ctx: StrapiControllerContext) => ToBeFixed;
	post: (ctx: StrapiControllerContext) => ToBeFixed;
	put: (ctx: StrapiControllerContext) => ToBeFixed;
	restoreConfig: (ctx: StrapiControllerContext) => ToBeFixed;
	settingsConfig: () => ToBeFixed;
	settingsRestart: (ctx: StrapiControllerContext) => ToBeFixed;
	updateConfig: (ctx: StrapiControllerContext) => ToBeFixed;
}

export interface IClientController {
	getService: (name?: string) => NavigationService;

	render: (ctx: StrapiControllerContext) => ToBeFixed;
	renderChild: (ctx: StrapiControllerContext) => ToBeFixed;
}

export type NavigationController = {
	admin: IAdminController;
	client: IClientController;
}
