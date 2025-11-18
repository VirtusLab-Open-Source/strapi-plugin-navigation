import { useEffect } from 'react';
import { NavigationInternalItemFormSchema, NavigationItemFormSchema } from '../../utils/form';
import { StrapiContentTypeItemSchema } from 'src/api/validators';
import { useConfig } from '../../../../hooks';

export const useChangeFieldsFromRelated = (
  values: NavigationInternalItemFormSchema,
  contentTypeItems: StrapiContentTypeItemSchema[] | undefined,
  setFormValuesItems: (values: any) => void
) => {
  const configQuery = useConfig();

  useEffect(() => {
    if (!values.autoSync || !values.related || !values.relatedType || !configQuery.data) {
      return;
    }

    const relatedItem = contentTypeItems?.find((item) => {
      return item.documentId === values.related;
    });

    if (!relatedItem) {
      return;
    } 
    
    const { contentTypesNameFields, pathDefaultFields } = configQuery.data;

    const nextPath = (pathDefaultFields[values.relatedType]?.reduce<string | undefined>(
      (acc, field) => {
        return acc ? acc : relatedItem?.[field];
      },
      undefined 
   ) || relatedItem.id).toString();

    const nextTitle = (contentTypesNameFields[values.relatedType] ?? [])
      .concat(contentTypesNameFields.default ?? [])
      .reduce<undefined | string>((acc, field) => {
        return acc ? acc.toString() : relatedItem?.[field];
      }, undefined);

    const batch: Array<{ name: keyof NavigationItemFormSchema; value: string }> = [];

    if (nextPath && nextPath !== values.path) {
      batch.push({ name: 'path', value: nextPath });
    }

    if (nextTitle && nextTitle !== values.title) {
      batch.push({ name: 'title', value: nextTitle });
    }

    setFormValuesItems({
      path: nextPath,
      title: nextTitle,
    });
  }, [values.autoSync, values.related, values.relatedType, contentTypeItems, configQuery.data]);
};
