import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Navigation } from '../types';

const formSchema = ({ alreadyUsedNames }: { alreadyUsedNames: string[] }) =>
  z.object({
    name: z
      .string()
      .min(2)
      .and(z.string().refine((name) => !alreadyUsedNames.includes(name), 'name already used')),
    visible: z.boolean(),
  });

export const useNavigationForm = <T extends Partial<Navigation>>({
  alreadyUsedNames,
  navigation: { name, visible },
}: {
  alreadyUsedNames: string[];
  navigation: T;
}) => {
  return useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema({ alreadyUsedNames })),
    defaultValues: {
      name: name ?? '',
      visible: visible ?? false,
    },
  });
};
