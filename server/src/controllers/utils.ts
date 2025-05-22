import { z } from 'zod';
import { idSchema } from './validators';

type Populate = string | boolean | string[] | undefined;

export const sanitizePopulateField = (populate: Populate): Populate => {
  if (!populate || populate === true || populate === '*') {
    return undefined;
  }

  if ('object' === typeof populate) {
    return undefined;
  }

  if (Array.isArray(populate)) {
    return populate;
  }

  return populate;
};

export const parseId = (id: string) => {
  return Number.isNaN(parseInt(id)) ? z.string().parse(id) : idSchema.parse(parseInt(id));
};
