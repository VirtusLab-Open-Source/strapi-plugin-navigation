import { NavigationPluginConfigDBSchema } from '../schemas';
import { CONTENT_TYPES_NAME_FIELDS_DEFAULTS } from '../utils';

export type ConfigContentTypeDTO = {
  uid: string;
  name: string;
  draftAndPublish: boolean | undefined;
  isSingle: boolean;
  description: string;
  collectionName: string;
  contentTypeName: string;
  label: string;
  relatedField: string | undefined;
  templateName: string | undefined;
  available: boolean | undefined;
  endpoint: string;
  plugin: string | undefined;
  visible: boolean;
  gqlTypeName: string;
};

export type NavigationPluginConfigDTO = Pick<
  NavigationPluginConfigDBSchema,
  | 'additionalFields'
  | 'allowedLevels'
  | 'cascadeMenuAttached'
  | 'preferCustomContentTypes'
  | 'contentTypesNameFields'
  | 'contentTypesPopulate'
  | 'gql'
  | 'pathDefaultFields'
> & {
  contentTypes: ConfigContentTypeDTO[];
  contentTypesNameFields: {
    default: typeof CONTENT_TYPES_NAME_FIELDS_DEFAULTS;
  } & Record<string, string[]>;
  isGQLPluginEnabled: boolean | undefined;
  isCachePluginEnabled: boolean | undefined;
  isCacheEnabled: boolean | undefined;
};
