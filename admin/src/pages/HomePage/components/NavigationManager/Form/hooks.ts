import { z } from 'zod';

export const formSchema = ({ alreadyUsedNames }: { alreadyUsedNames: string[] }) =>
  z.object({
    name: z
      .string()
      .min(2) // TODO: add translation
      .and(z.string().refine((name) => !alreadyUsedNames.includes(name), 'Name already used')), // TODO: add translation
    visible: z.boolean(),
  });
