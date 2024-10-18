import * as z from 'zod';

export type AudienceDBSchema = z.infer<typeof audienceDBSchema>;
export const audienceDBSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string(),
  key: z.string(),
});

export type NavigationItemType = z.infer<typeof navigationItemType>;
export const navigationItemType = z.enum(['INTERNAL', 'EXTERNAL', 'WRAPPER']);

const navigationItemDBBaseSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  title: z.string(),
  type: navigationItemType,
  path: z.string().or(z.null()).optional(),
  slug: z.string().or(z.null()).optional(),
  externalPath: z.string().or(z.null()).optional(),
  uiRouterKey: z.string(),
  menuAttached: z.boolean(),
  order: z.number().int(),
  collapsed: z.boolean(),
  related: z.string().or(z.null()).optional(),
  additionalFields: z.record(z.string(), z.unknown()).or(z.null()).optional(),
  audience: z.array(audienceDBSchema).or(z.null()).optional(),
  autoSync: z.boolean().or(z.null()).optional(),
});

export type ReadNavigationItemFromLocaleSchema = z.infer<typeof readNavigationItemFromLocaleSchema>;
export const readNavigationItemFromLocaleSchema = navigationItemDBBaseSchema
  .omit({
    related: true,
  })
  .pick({
    path: true,
    type: true,
    uiRouterKey: true,
    title: true,
    externalPath: true,
  })
  .extend({ related: z.unknown() });

export type NavigationItemDBSchema = z.infer<typeof navigationItemDBBaseSchema> & {
  parent?: NavigationItemDBSchema | null;
  items?: NavigationItemsDBSchema;
  master?: NavigationDBSchema;
};

export const navigationItemDBSchema: z.ZodType<NavigationItemDBSchema> =
  navigationItemDBBaseSchema.extend({
    parent: z.lazy(() => navigationItemDBSchema.or(z.null())).optional(),
    items: z.lazy(() => navigationItemDBSchema.array()).optional(),
    master: z.lazy(() => navigationDBSchema(false)).optional(),
  });

export type NavigationItemsDBSchema = z.infer<typeof navigationItemsDBSchema>;
export const navigationItemsDBSchema = z.array(navigationItemDBSchema);

export type NavigationDBSchema = z.infer<ReturnType<typeof navigationDBSchema>>;
export const navigationDBSchema = (withItems: boolean) =>
  z.object({
    id: z.number(),
    documentId: z.string(),
    name: z.string(),
    slug: z.string(),
    locale: z.string(),
    visible: z.boolean(),
    items: withItems ? z.array(navigationItemDBSchema) : navigationItemDBSchema.array().optional(),
  });

export type CreateNavigationSchema = z.infer<typeof createNavigationSchema>;
export const createNavigationSchema = navigationDBSchema(false)
  .omit({
    items: true,
    id: true,
    documentId: true,
    slug: true,
    locale: true,
  })
  .extend({
    documentId: z.string().optional(),
    id: z.undefined().optional(),
  });

export type UpdateNavigationItemSchema = z.ZodType<
  Omit<z.infer<typeof navigationItemDBSchema>, 'id' | 'documentId' | 'parent' | 'items'>
> & {
  items?: UpdateNavigationItemsSchema | null;
  id?: number;
  documentId?: string;
  updated?: boolean;
  removed?: boolean;
};
export const updateNavigationItemSchema: UpdateNavigationItemSchema = navigationItemDBBaseSchema
  .omit({ id: true, documentId: true })
  .extend({
    id: z.number().optional(),
    documentId: z.string().optional(),
    items: z.lazy(() => updateNavigationItemsSchema).or(z.null()).optional(),
    updated: z.boolean().optional(),
    removed: z.boolean().optional(),
  });

export type UpdateNavigationItemsSchema = z.infer<typeof navigationItemsDBSchema>;
export const updateNavigationItemsSchema = z.array(updateNavigationItemSchema);

export type UpdateNavigationSchema = z.infer<typeof updateNavigationSchema>;
export const updateNavigationSchema = navigationDBSchema(false)
  .extend({
    items: updateNavigationItemsSchema,
  })
  .partial()
  .required({
    id: true,
    documentId: true,
  });
