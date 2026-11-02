import * as z from 'zod';

export const idSchema = z.string();

export const readAllQuerySchema = z.object({
  locale: z.string().optional(),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['DESC', 'ASC']).optional(),
});

export const renderTypeSchema = z.enum(['FLAT', 'TREE', 'RFR']);

export const statusSchema = z
  .string()
  .transform((v) => (v === 'published' ? 'published' : 'draft'))
  .pipe(z.enum(['draft', 'published']));

type PopulatePrimitive = boolean | string | string[] | undefined;

export interface PopulateObject {
  [key: string]: Populate;
}

type Populate = PopulatePrimitive | PopulateObject;

export const populateSchema: z.ZodType<Populate, unknown> = z.lazy(() =>
  z.union([
    z.boolean(),
    z.stringbool(),
    z.string(),
    z.string().array(),
    z.undefined(),
    z.record(z.string(), populateSchema),
  ])
);

export type PopulateQueryParam = z.infer<typeof populateSchema>;

export const renderQuerySchema = z.object({
  type: renderTypeSchema.optional(),
  menu: z.enum(['true', 'false']).optional(),
  path: z.string().optional(),
  locale: z.string().optional(),
  populate: populateSchema.optional(),
  status: statusSchema.optional(),
});

export const renderChildQueryParams = z.object({
  type: renderTypeSchema.optional(),
  menu: z.enum(['true', 'false']).optional(),
  locale: z.string().optional(),
  status: statusSchema.optional(),
});

export const fillFromOtherLocaleParams = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  documentId: z.string().min(1),
});
