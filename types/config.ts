export type PluginConfigKeys = 'additionalFields' | 'contentTypes' | 'contentTypesNameFields' | 'contentTypesPopulate' | 'allowedLevels';

export enum PluginConfigKeysEnum {
    ADDITIONAL_FIELDS = 'additionalFields',
    CONTENT_TYPES = 'contentTypes',
    CONTENT_TYPES_NAME_FIELDS = 'contentTypesNameFields',
    CONTENT_TYPES_POPULATE = 'contentTypesPopulate',
    ALLOWED_LEVELS = 'allowedLevels',
    GQL = 'gql',
}

export type PluginConfigNameFields = {
    [key: string]: Array<string>
};

export type PluginConfigPopulate = {
    [key: string]: string
};
export type PluginConfigGraphQL = {
    navigationItemRelated: Array<string>
}

export type PluginConfig<Type> = {
    [Property in keyof Type]: Type[Property];
};

export type NavigationPluginConfig = PluginConfig<{
    [PluginConfigKeysEnum.ADDITIONAL_FIELDS]: Array<string>,
    [PluginConfigKeysEnum.CONTENT_TYPES]: Array<string>,
    [PluginConfigKeysEnum.CONTENT_TYPES_NAME_FIELDS]: PluginConfigNameFields,
    [PluginConfigKeysEnum.CONTENT_TYPES_POPULATE]: PluginConfigPopulate,
    [PluginConfigKeysEnum.ALLOWED_LEVELS]: number,
    [PluginConfigKeysEnum.GQL]: PluginConfigGraphQL,
}>;

export type StrapiConfig = {
    default: NavigationPluginConfig
};

export type ConfigParamKeys = {
    [key: string]: PluginConfigKeys
}
