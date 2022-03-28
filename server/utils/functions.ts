import { IStrapi } from "strapi-typed";
import { ToBeFixed } from "../../types";
import { NavigationError } from '../../utils/NavigationError';

declare var strapi: IStrapi;

export const getPluginService = <T>(name: string): T =>
	strapi.plugin("navigation").service(name);

export const errorHandler = (ctx: ToBeFixed) => (error: NavigationError | string) => {
	if (error instanceof NavigationError) {
		return ctx.badRequest(error.message, error.additionalInfo);
	}
	throw error;
};

export const parseParams = (params: ToBeFixed): any =>
	Object.keys(params).reduce((prev, curr) => {
		const value = params[curr];
		const parsedValue = isNaN(Number(value)) ? value : parseInt(value, 10);
		return {
			...prev,
			[curr]: parsedValue,
		};
	}, {});
