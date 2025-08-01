import { useIntl } from 'react-intl';
import { isEmpty, sortBy } from 'lodash';

import { Grid } from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import { useNavigationItemFormContext } from '../../context/NavigationItemFormContext';
import { ControllableCombobox } from '../../../ControllableCombobox';
import { getTrad } from '../../../../../../translations';
import { FormChangeEvent } from '../../../../../../types';
import { ContentTypeEntity } from '../../types';
import { extractRelatedItemLabel } from '../../../../utils';
import { useConfig } from '../../../../hooks';
import { StrapiContentTypeItemSchema } from '../../../../../../api/validators';
import { NavigationInternalItemFormSchema } from '../../utils/form';
import { useChangeFieldsFromRelated } from './hooks';

type RelatedEntityFieldProps = {
  appendLabelPublicationStatus: (label: string, entity: ContentTypeEntity, _: boolean) => string;
  contentTypeItems: StrapiContentTypeItemSchema[] | undefined;
  isSingleSelected: boolean;
  values: NavigationInternalItemFormSchema;
  setFormValuesItems: (values: any) => void;
};

export const RelatedEntityField: React.FC<RelatedEntityFieldProps> = ({
  appendLabelPublicationStatus,
  contentTypeItems,
  isSingleSelected,
  values,
  setFormValuesItems,
}) => {
  const { formatMessage } = useIntl();

  const configQuery = useConfig();

  const { canUpdate, isLoading, handleChange, onChange, renderError } =
    useNavigationItemFormContext();

  const relatedSelectOptions = sortBy(
    contentTypeItems?.map((item) => {
      const label = appendLabelPublicationStatus(
        extractRelatedItemLabel(
          {
            ...item,
            __collectionUid: values.relatedType,
          },
          configQuery.data
        ),
        item,
        false
      );
      const labelWithId = label + (item?.id ? ` (id: ${item.id})` : '');
      return {
        key: item?.documentId?.toString(),
        value: item?.documentId?.toString(),
        label: labelWithId,
      };
    }) ?? [],
    (item) => item.label
  );

  const thereAreNoMoreContentTypes = isEmpty(relatedSelectOptions);

  useChangeFieldsFromRelated(values, contentTypeItems, setFormValuesItems);

  if (!values.relatedType || isSingleSelected) {
    return null;
  }

  return (
    <Grid.Item alignItems="flex-start" col={6}>
      <Field
        name="related"
        label={formatMessage(getTrad('popup.item.form.related.label', 'Related'))}
        error={renderError('related')}
        hint={
          !isLoading && thereAreNoMoreContentTypes
            ? formatMessage(
                getTrad('popup.item.form.related.empty', 'There are no more entities'),
                { contentTypeName: values.relatedType }
              )
            : undefined
        }
      >
        <ControllableCombobox
          name="related"
          onClear={() => handleChange('related', undefined, onChange)}
          onChange={(eventOrPath: FormChangeEvent) =>
            handleChange('related', eventOrPath, onChange)
          }
          value={values.related}
          options={relatedSelectOptions}
          disabled={isLoading || thereAreNoMoreContentTypes || !canUpdate}
        />
      </Field>
    </Grid.Item>
  );
};
