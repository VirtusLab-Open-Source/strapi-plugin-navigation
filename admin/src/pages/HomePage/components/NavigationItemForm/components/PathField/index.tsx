import { useIntl } from 'react-intl';

import { Grid, TextInput } from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import { getTrad } from '../../../../../../translations';
import { FormChangeEvent } from '../../../../../../types';
import { useNavigationItemFormContext } from '../../context/NavigationItemFormContext';
import { generatePreviewPath } from '../../utils/properties';
import { useConfig } from '../../../../hooks';
import { type NavigationItemFormSchema } from '../../utils/form';
import { StrapiContentTypeItemSchema } from 'src/api/validators';

type PathFieldProps = {
  contentTypeItems: StrapiContentTypeItemSchema[] | undefined;
  current: Partial<NavigationItemFormSchema>;
  isSingleSelected: boolean;
};

export const PathField: React.FC<PathFieldProps> = ({
  contentTypeItems,
  current,
  isSingleSelected,
}) => {
  const { formatMessage } = useIntl();

  const configQuery = useConfig();

  const { values, onChange, handleChange, renderError, canUpdate } = useNavigationItemFormContext();

  const pathSourceName = values.type === 'EXTERNAL' ? 'externalPath' : 'path';

  const internalValues =
    values.type === 'INTERNAL'
      ? values
      : {
        related: undefined,
        relatedType: undefined,
      };

  const pathDefault = generatePreviewPath({
    currentPath: values.path,
    isExternal: values.type === 'EXTERNAL',
    current,
    currentType: values.type,
    config: configQuery.data,
    contentTypeItems,
    currentRelated: internalValues.related,
    currentRelatedType: internalValues.relatedType,
    isSingleSelected,
  });

  const disabled = !canUpdate || (values.autoSync && values.type === 'INTERNAL');

  const pathDefaultFieldsValue = internalValues.relatedType
    ? (configQuery.data?.pathDefaultFields?.[internalValues.relatedType] ?? [])
    : [];

  const selectedEntity = contentTypeItems?.find(
    ({ documentId }) => documentId === internalValues.related
  );

  const validPathFieldName = pathDefaultFieldsValue.find((field) => selectedEntity?.[field]);

  return (
    <Grid.Item alignItems="flex-start" key="title" col={12}>
      <Field
        name={pathSourceName}
        label={formatMessage(getTrad(`popup.item.form.${pathSourceName}.label`, 'Path'))}
        error={renderError(pathSourceName, `popup.item.form.${pathSourceName}.validation.type`)}
        hint={[
          formatMessage(getTrad(`popup.item.form.${pathSourceName}.placeholder`, 'e.g. Blog')),
          pathDefault
            ? formatMessage(getTrad('popup.item.form.type.external.description'), {
              value: pathDefault,
            })
            : '',
          disabled
            ? formatMessage(getTrad('popup.item.form.type.internal.source'), {
              value: validPathFieldName || 'id',
            })
            : '',
        ].join(' ')}
      >
        <TextInput
          disabled={disabled}
          name={pathSourceName}
          onChange={(eventOrPath: FormChangeEvent, value?: any) =>
            handleChange(eventOrPath, value, onChange)
          }
          value={(values.type === 'EXTERNAL' ? values.externalPath : values.path) || ''}
          width="100%"
        />
      </Field>
    </Grid.Item>
  );
};
