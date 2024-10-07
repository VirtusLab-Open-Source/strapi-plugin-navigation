import { z } from 'zod';

export type NavigationItemCustomFieldBase = z.infer<typeof navigationCustomFieldBase>;
const navigationCustomFieldBase = z.object({
  name: z.string(),
  label: z.string(),
  required: z.boolean().optional(),
  enabled: z.boolean().optional(),
});

export type NavigationItemCustomFieldSelect = z.infer<typeof navigationItemCustomFieldSelect>;
const navigationItemCustomFieldSelect = navigationCustomFieldBase.extend({
  type: z.literal('select'),
  multi: z.boolean(),
  options: z.array(z.string()),
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
export const navigationItemCustomField = z.union([
  navigationItemCustomFieldPrimitive,
  navigationItemCustomFieldMedia,
  navigationItemCustomFieldSelect,
]);

export type NavigationItemAdditionalField = z.infer<typeof navigationItemAdditionalField>;
export const navigationItemAdditionalField = z.union([
  z.literal('audience'),
  navigationItemCustomField,
]);

export type ConfigSchema = z.infer<typeof configSchema>;
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
  contentTypesNameFields: z.record(z.string(), z.array(z.string())),
  contentTypesPopulate: z.record(z.string(), z.array(z.string())),
  gql: z.object({
    navigationItemRelated: z.array(z.string()),
  }),
  pathDefaultFields: z.record(z.string(), z.any()),
  cascadeMenuAttached: z.boolean(),
  preferCustomContentTypes: z.boolean(),
  isCacheEnabled: z.boolean().optional(),
  isCachePluginEnabled: z.boolean().optional(),
});
