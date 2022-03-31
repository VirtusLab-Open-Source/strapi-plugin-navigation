export type PluginConfigNameFields = Record<string, string[]>;
export type PluginConfigPopulate = Record<string, string[]>;

export type PluginConfigGraphQL = {
    navigationItemRelated: Array<string>
}

export type NavigationPluginConfig = {
    additionalFields: Array<string>,
    contentTypes: Array<string>,
    contentTypesNameFields: PluginConfigNameFields,
    contentTypesPopulate: PluginConfigPopulate,
    allowedLevels: number,
    gql: PluginConfigGraphQL,
};

export type StrapiConfig<T> = {
    default: T
};
