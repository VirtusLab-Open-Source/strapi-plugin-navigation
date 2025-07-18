import * as z from 'zod';

export type NavigationPluginConfigSchema = z.infer<typeof configSchema>;

export type AudienceDBSchema = z.infer<typeof audienceDBSchema>;
export const audienceDBSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string(),
  key: z.string(),
});

export type NavigationItemTypeSchema = z.infer<typeof navigationItemTypeSchema>;
export const navigationItemTypeSchema = z.enum(['INTERNAL', 'EXTERNAL', 'WRAPPER']);

const navigationItemBaseSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  title: z.string(),
  type: navigationItemTypeSchema,
  path: z.string(),
  externalPath: z.string().or(z.null()).optional(),
  uiRouterKey: z.string(),
  menuAttached: z.boolean(),
  order: z.number().int(),
  collapsed: z.boolean(),
  autoSync: z.boolean().or(z.null()).optional(),
  related: z
    .object({ documentId: z.string().optional(), __type: z.string() })
    .catchall(z.unknown())
    .nullish(),
  additionalFields: z.record(z.string(), z.unknown()).or(z.null()).optional(),
  audience: z.array(audienceDBSchema).or(z.null()).optional(),
  viewId: z.number().optional(),
  viewParentId: z.number().optional(),
  structureId: z.string().optional(),
  removed: z.boolean().optional(),
  isSearchActive: z.boolean().optional(),
  updated: z.boolean().optional(),
});

export type NavigationItemSchema = z.infer<typeof navigationItemBaseSchema> & {
  items?: NavigationItemSchema[] | null;
};
export const navigationItemSchema: z.ZodType<NavigationItemSchema> =
  navigationItemBaseSchema.extend({
    items: z.lazy(() => navigationItemSchema.array().or(z.null())).optional(),
  });

export type NavigationSchema = z.infer<typeof navigationSchema>;
export const navigationSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string(),
  slug: z.string(),
  locale: z.string(),
  visible: z.boolean(),
  items: z.array(navigationItemSchema),
});

const navigationCustomFieldBase = z.object({
  name: z
    .string({ required_error: 'requiredError' })
    .nonempty('requiredError')
    .refine((current) => !current.includes(' '), { message: 'noSpaceError' }),
  label: z.string({ required_error: 'requiredError' }).nonempty('requiredError'),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  enabled: z.boolean().optional(),
});

export type NavigationItemCustomFieldSelect = z.infer<typeof navigationItemCustomFieldSelect>;
const navigationItemCustomFieldSelect = navigationCustomFieldBase.extend({
  type: z.literal('select'),
  multi: z.boolean(),
  options: z
    .array(z.string(), { required_error: 'requiredError' })
    .min(1, { message: 'requiredError' }),
});

export type NavigationItemCustomFieldPrimitive = z.infer<typeof navigationItemCustomFieldPrimitive>;
const navigationItemCustomFieldPrimitive = navigationCustomFieldBase.extend({
  type: z.enum(['boolean', 'string']),
  multi: z.literal(false).optional(),
  options: z.array(z.string()).max(0).optional(),
});

export type NavigationItemCustomFieldMedia = z.infer<typeof navigationItemCustomFieldMedia>;
const navigationItemCustomFieldMedia = navigationCustomFieldBase.extend({
  type: z.literal('media'),
  multi: z.literal(false).optional(),
  options: z.array(z.string()).max(0).optional(),
});

export type NavigationItemCustomField = z.infer<typeof navigationItemCustomField>;
export const navigationItemCustomField = z.discriminatedUnion('type', [
  navigationItemCustomFieldPrimitive,
  navigationItemCustomFieldMedia,
  navigationItemCustomFieldSelect,
]);

export type NavigationItemAdditionalField = z.infer<typeof navigationItemAdditionalField>;
export const navigationItemAdditionalField = z.union([
  z.literal('audience'),
  navigationItemCustomField,
]);

export const configContentTypeSchema = z.object({
  uid: z.string(),
  name: z.string(),
  draftAndPublish: z.boolean(),
  isSingle: z.boolean(),
  description: z.string(),
  collectionName: z.string(),
  contentTypeName: z.string(),
  label: z.string(),
  labelSingular: z.string(),
  endpoint: z.string(),
  available: z.boolean(),
  visible: z.boolean(),
});

export const configSchema = z.object({
  additionalFields: z.array(navigationItemAdditionalField),
  allowedLevels: z.number(),
  availableAudience: z
    .object({
      id: z.number(),
      documentId: z.string(),
      name: z.string(),
      key: z.string(),
    })
    .array(),
  contentTypes: z.array(z.string()),
  defaultContentType: z.string().optional(),
  contentTypesNameFields: z.record(z.string(), z.array(z.string())),
  contentTypesPopulate: z.record(z.string(), z.array(z.string())),
  gql: z.object({
    navigationItemRelated: z.array(z.string()),
  }),
  pathDefaultFields: z.record(z.string(), z.string().array()),
  cascadeMenuAttached: z.boolean(),
  preferCustomContentTypes: z.boolean(),
  allowedContentTypes: z.string().array(),
  restrictedContentTypes: z.string().array(),
  isCacheEnabled: z.boolean().optional(),
  isCachePluginEnabled: z.boolean().optional(),
});

export type ConfigFromServerSchema = z.infer<typeof configFromServerSchema>;
export const configFromServerSchema = configSchema
  .omit({
    contentTypes: true,
  })
  .extend({
    contentTypes: configContentTypeSchema.array(),
  });

export const localeSchema = z.object({
  defaultLocale: z.string(),
  restLocale: z.string().array(),
});

export type ContentType = z.infer<typeof contentType>;
export const contentType = z.enum(['collectionType', 'singleType']);

export type ContentTypeInfo = z.infer<typeof contentTypeInfo>;
export const contentTypeInfo = z.object({
  singularName: z.string(),
  pluralName: z.string(),
  displayName: z.string(),
  description: z.string().optional(),
  name: z.string().optional(),
});

export type ContentTypeAttributeValidator = z.infer<typeof contentTypeAttributeValidator>;
export const contentTypeAttributeValidator = z.object({
  required: z.boolean().optional(),
  max: z.number().optional(),
  min: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  private: z.boolean().optional(),
  configurable: z.boolean().optional(),
  default: z.any().optional(),
});

export type contentTypeFieldTypeSchema = z.infer<typeof contentTypeFieldTypeSchema>;
export const contentTypeFieldTypeSchema = z.enum([
  'string',
  'text',
  'richtext',
  'blocks',
  'email',
  'password',
  'date',
  'time',
  'datetime',
  'timestamp',
  'boolean',
  'integer',
  'biginteger',
  'float',
  'decimal',
  'json',
  'relation',
  'media',
]);

export type SimpleContentTypeAttribute = z.infer<typeof simpleContentTypeAttribute>;
export const simpleContentTypeAttribute = contentTypeAttributeValidator.extend({
  type: contentTypeFieldTypeSchema,
});

export type ContentTypeEnumerationAttribute = z.infer<typeof contentTypeEnumerationAttribute>;
export const contentTypeEnumerationAttribute = contentTypeAttributeValidator.extend({
  type: z.literal('enumeration'),
  enum: z.string().array(),
});

export type ContentTypeComponentAttribute = z.infer<typeof contentTypeComponentAttribute>;
export const contentTypeComponentAttribute = z.object({
  type: z.literal('component'),
  component: z.string(),
  repeatable: z.boolean().optional(),
});

export type ContentTypeDynamicZoneAttribute = z.infer<typeof contentTypeDynamicZoneAttribute>;
export const contentTypeDynamicZoneAttribute = z.object({
  type: z.literal('dynamiczone'),
  components: z.string().array(),
});

export type ContentTypeMediaAttribute = z.infer<typeof contentTypeMediaAttribute>;
export const contentTypeMediaAttribute = z.object({
  media: z.literal('media'),
  allowedTypes: z.enum(['images', 'videos', 'audios', 'files']).array(),
  required: z.boolean().optional(),
});

export type ContentTypeRelationType = z.infer<typeof contentTypeRelationType>;
export const contentTypeRelationType = z.enum([
  'oneToOne',
  'oneToMany',
  'manyToOne',
  'manyToMany',
  'morphToMany',
  'manyToMorph',
]);

export type ContentTypeRelationAttribute = z.infer<typeof contentTypeRelationAttribute>;
export const contentTypeRelationAttribute = z.object({
  type: z.literal('relation'),
  relation: contentTypeRelationType,
  target: z.string(),
  mappedBy: z.string().optional(),
  inversedBy: z.string().optional(),
});

export type ContentTypeAttributes = z.infer<typeof contentTypeAttributes>;
export const contentTypeAttributes = z.record(
  z.string(),
  z.union([
    simpleContentTypeAttribute,
    contentTypeEnumerationAttribute,
    contentTypeComponentAttribute,
    contentTypeDynamicZoneAttribute,
    contentTypeRelationAttribute,
    contentTypeMediaAttribute,
  ])
);

export type ContentTypeFullSchema = z.infer<typeof contentTypeFullSchema>;
export const contentTypeFullSchema = z.object({
  kind: contentType,
  collectionName: z.string(),
  info: contentTypeInfo,
  options: z
    .object({
      draftAndPublish: z.boolean().optional(),
      hidden: z.boolean().optional(),
      templateName: z.string().optional(),
    })
    .optional(),
  attributes: contentTypeAttributes,
  actions: z.record(z.string(), z.any()).optional(),
  lifecycles: z.record(z.string(), z.any()).optional(),
  uid: z.string(),
  apiName: z.string().optional(),

  // TODO?: remove
  associations: z
    .object({
      model: z.string(),
      alias: z.string(),
    })
    .array()
    .optional(),
  modelName: z.string().optional(),
  plugin: z.string().optional(),
  pluginOptions: z.record(z.string(), z.any()).optional(),
  isSingle: z.boolean().optional(),
});

export type ContentTypeSchema = z.infer<typeof contentTypeFullSchema>;
export const contentTypeSchema = contentTypeFullSchema.pick({
  info: true,
  kind: true,
  attributes: true,
  options: true,
});

export type StrapiContentTypeItemSchema = z.infer<typeof strapiContentTypeItemSchema>;
export const strapiContentTypeItemSchema = z
  .object({
    id: z.number(),
    documentId: z.string(),
    locale: z.string().or(z.null()).optional(),
  })
  .and(z.record(z.string(), z.any()));

export const slugifyResult = z.object({ slug: z.string() });

export const i18nCopyItemDetails = z.object({
  externalPath: z.string().or(z.null()).optional(),
  path: z.string().or(z.null()).optional(),
  related: z
    .object({ documentId: z.string().optional(), __type: z.string() })
    .catchall(z.unknown())
    .nullish(),
  title: z.string(),
  type: navigationItemTypeSchema,
  uiRouterKey: z.string(),
});
