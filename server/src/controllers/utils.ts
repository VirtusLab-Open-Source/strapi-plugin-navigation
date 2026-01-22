import { z } from 'zod';
import { idSchema } from './validators';

export const parseId = (id: string) => {
  return Number.isNaN(parseInt(id)) ? z.string().parse(id) : idSchema.parse(parseInt(id));
};
