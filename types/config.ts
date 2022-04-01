export type PluginConfigNameFields = Record<string, string[]>;
export type PluginConfigPopulate = Record<string, string[]>;

export type PluginConfigGraphQL = {
	navigationItemRelated: string[]
}

export type NavigationPluginConfig = {
	additionalFields: string[],
	contentTypes: string[],
	contentTypesNameFields: PluginConfigNameFields,
	contentTypesPopulate: PluginConfigPopulate,
	allowedLevels: number,
	gql: PluginConfigGraphQL,
};

export type StrapiConfig<T> = {
	default: T
};
