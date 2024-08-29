import { z } from 'zod';

export type StrapiContentTypeSchema = z.infer<typeof strapiContentTypeSchema>;
export const strapiContentTypeSchema = z.object({
  uid: z.string(),
  isDisplayed: z.boolean(),
  apiID: z.string(),
  kind: z.enum(['collectionType', 'singleType']),
  info: z.object({
    singularName: z.string(),
    pluralName: z.string(),
    displayName: z.string(),
    description: z.string().optional(),
  }),
  attributes: z.record(z.string(), z.unknown()),
});
