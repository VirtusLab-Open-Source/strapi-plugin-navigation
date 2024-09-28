import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { NavigationItemCustomField, navigationItemCustomField } from '../../../../../schemas';

export const useCustomFieldForm = (customField: Partial<NavigationItemCustomField>) => {
  const form = useForm({
    resolver: zodResolver(navigationItemCustomField),
    // TODO: Update on proper fix
    // @ts-expect-error
    defaultValues: customField,
  });

  return form;
};
