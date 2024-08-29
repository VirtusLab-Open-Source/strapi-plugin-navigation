import * as z from 'zod';

const booleanStringSchema = z.enum(['true', 'false']);

export const idSchema = z.number().positive();

export const readAllQuerySchema = z.object({
  locale: z.string().optional(),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['DESC', 'ASC']).optional(),
});

export const renderTypeSchema = z.enum(['FLAT', 'TREE', 'RFR']);

export const populateSchema = z.union([z.boolean(), z.string(), z.string().array(), z.undefined()]);

export const renderQuerySchema = z.object({
  type: renderTypeSchema.optional(),
  menu: booleanStringSchema.optional(),
  path: z.string().optional(),
  locale: z.string().optional(),
  populate: populateSchema.optional(),
});

export const renderChildQueryParams = z.object({
  type: renderTypeSchema.optional(),
  menu: booleanStringSchema.optional(),
  locale: z.string().optional(),
});
