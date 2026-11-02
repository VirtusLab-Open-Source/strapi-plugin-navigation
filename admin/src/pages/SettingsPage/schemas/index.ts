import { z } from 'zod';

import { configSchema } from '../../../schemas';

export type UiFormSchema = z.infer<typeof uiFormSchema>;

export const uiFormSchema = configSchema.omit({ contentTypesNameFields: true }).extend({
  audienceFieldChecked: z.boolean(),
  contentTypesNameFields: z
    .object({
      key: z.string(),
      fields: z.string().array(),
    })
    .array(),
  contentTypesPopulate: z
    .object({
      key: z.string(),
      fields: z.string().array(),
    })
    .array(),
  pathDefaultFields: z
    .object({
      key: z.string(),
      fields: z.string().array(),
    })
    .array(),
});
