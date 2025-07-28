import { useIntl } from 'react-intl';
import { isEmpty, sortBy } from 'lodash';
import { useEffect, useMemo } from 'react';

import { Grid } from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import { useConfig } from '../../../../hooks';
import { getTrad } from '../../../../../../translations';
import { FormChangeEvent } from '../../../../../../types';
import { useNavigationItemFormContext } from '../../context/NavigationItemFormContext';
import { ControllableCombobox } from '../../../ControllableCombobox';
import { NavigationItemFormSchema } from '../../utils/form';
import { StrapiContentTypeItemSchema } from '../../../../../../api/validators';

type RelatedTypeFieldProps = {
  contentTypeItems: StrapiContentTypeItemSchema[] | undefined;
  current: Partial<NavigationItemFormSchema>;
  currentRelatedType: string;
  isSingleSelected: boolean;
  setFormValuesItems: (values: any) => void;
  setIsSingleSelected: (isSingle: boolean) => void;
};

export const RelatedTypeField: React.FC<RelatedTypeFieldProps> = ({
  contentTypeItems,
  current,
  currentRelatedType,
  isSingleSelected,
  setFormValuesItems,
  setIsSingleSelected,
}) => {
  const { formatMessage } = useIntl();

  const configQuery = useConfig();

  const {
    canUpdate,
    isLoading,
    renderError,
    setFormValueItem,
    values: formValues,
  } = useNavigationItemFormContext();

  const initialRelatedTypeSelected = current.type === 'INTERNAL' ? current.relatedType : undefined;

  const relatedTypeSelectOptions = useMemo(
    () =>
      sortBy(
        configQuery.data?.contentTypes
          ?.filter((contentType) => {
            if (contentType.isSingle) {
              return !!(
                currentRelatedType &&
                [currentRelatedType, initialRelatedTypeSelected].includes(contentType.uid)
              );
            }
            return true;
          })
          .map((item) => ({
            key: item.uid,
            value: item.uid,
            label: item.contentTypeName,
          })),
        (item) => item.label
      ),
    [configQuery.data, currentRelatedType]
  );

  useEffect(() => {
    if (!currentRelatedType) {
      return;
    }

    const relatedType = configQuery.data?.contentTypes.find(
      (contentType) => contentType.uid === currentRelatedType
    );

    if (!relatedType) {
      return;
    }

    setIsSingleSelected(relatedType.isSingle);

    if (relatedType.isSingle && contentTypeItems?.length) {
      const nextRelated = contentTypeItems[0];

      if (nextRelated) {
        setFormValueItem('related', nextRelated.documentId);
      }
    }
  }, [currentRelatedType, configQuery.data, contentTypeItems]);

  useEffect(() => {
    if (currentRelatedType === '') {
      setFormValueItem('relatedType', configQuery.data?.defaultContentType);
    }
  }, [configQuery.data?.defaultContentType, formValues.type, currentRelatedType]);

  return (
    <Grid.Item alignItems="flex-start" col={currentRelatedType && !isSingleSelected ? 6 : 12}>
      <Field
        name="relatedType"
        label={formatMessage(getTrad('popup.item.form.relatedType.label', 'Related Type'))}
        error={renderError('relatedType')}
        hint={
          !isLoading && isEmpty(relatedTypeSelectOptions)
            ? formatMessage(
                getTrad('popup.item.form.relatedType.empty', 'There are no more content types')
              )
            : undefined
        }
      >
        <ControllableCombobox
          name="relatedType"
          onClear={() =>
            setFormValuesItems({
              related: undefined,
              relatedType: undefined,
              title: formValues.autoSync ? '' : formValues.title,
              path: formValues.autoSync ? '' : formValues.path,
            })
          }
          onChange={(eventOrPath: FormChangeEvent) =>
            setFormValuesItems({
              related: undefined,
              relatedType: eventOrPath,
              title: formValues.autoSync ? '' : formValues.title,
              path: formValues.autoSync ? '' : formValues.path,
            })
          }
          value={currentRelatedType}
          options={relatedTypeSelectOptions}
          disabled={!configQuery.data?.contentTypes.length || !canUpdate}
        />
      </Field>
    </Grid.Item>
  );
};
