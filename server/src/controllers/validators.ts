import * as z from 'zod';

const booleanStringSchema = z.enum(['true', 'false']);

export const idSchema = z.string();

export const readAllQuerySchema = z.object({
  locale: z.string().optional(),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['DESC', 'ASC']).optional(),
});

export const renderTypeSchema = z.enum(['FLAT', 'TREE', 'RFR']);

export const statusSchema = z
  .string()
  .transform((v) => v === 'published' ? 'published' : 'draft')
  .pipe(z.enum(['draft', 'published']));

// TODO in the zod v3 we can't use z.lazy and recursive types without creating a custom type. Let's align on this when Strapi will use zod v4
// in the zod v4 there's also z.stringbool that should simplify this logic
type PopulatePrimitive = boolean | string | string[] | undefined;

export interface PopulateObject {
  [key: string]: Populate;
}

type Populate = PopulatePrimitive | PopulateObject;

const sanitizePopulateField = (populate: unknown) => {
  if (typeof populate === 'string') {
    if (populate === 'true') {
      return true;
    }
    if (populate === 'false') {
      return false;
    }
  }
  return populate;
};

export const populateSchema: z.ZodType<Populate, z.ZodTypeDef, unknown> = z.lazy(() =>
  z.preprocess(
    sanitizePopulateField,
    z.union([
      z.boolean(),
      z.string(),
      z.string().array(),
      z.undefined(),
      z.record(populateSchema)
    ]),
  ),
);

export type PopulateQueryParam = z.infer<typeof populateSchema>;

export const renderQuerySchema = z.object({
  type: renderTypeSchema.optional(),
  menu: booleanStringSchema.optional(),
  path: z.string().optional(),
  locale: z.string().optional(),
  populate: populateSchema.optional(),
  status: statusSchema.optional(),
});

export const renderChildQueryParams = z.object({
  type: renderTypeSchema.optional(),
  menu: booleanStringSchema.optional(),
  locale: z.string().optional(),
  status: statusSchema.optional(),
});

export const fillFromOtherLocaleParams = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  documentId: z.string().min(1),
});
