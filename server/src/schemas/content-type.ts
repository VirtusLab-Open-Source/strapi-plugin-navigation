import * as z from 'zod';

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

export type ContentTypeUidAttribute = z.infer<typeof contentTypeDynamicZoneAttribute>;
export const contentTypeUidAttribute = z.object({
  type: z.literal('uid'),
});


export type ContentTypeMediaAttribute = z.infer<typeof contentTypeMediaAttribute>;
export const contentTypeMediaAttribute = z.object({
  type: z.literal('media'),
  allowedTypes: z.enum(['images', 'videos', 'audios', 'files']).array(),
  required: z.boolean().optional(),
});

export type ContentTypeRelationType = z.infer<typeof contentTypeRelationType>;
export const contentTypeRelationType = z.enum(['oneToOne', 'oneToMany', 'manyToOne', 'manyToMany', 'morphToMany', 'manyToMorph']);

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
    contentTypeUidAttribute,
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
