import { useIntl } from 'react-intl';

import { Grid, SingleSelect, SingleSelectOption } from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import { useConfig } from '../../../../hooks';
import { getTrad } from '../../../../../../translations';
import { FormChangeEvent } from '../../../../../../types';
import { useNavigationItemFormContext } from '../../context/NavigationItemFormContext';

export const NavigationItemTypeField = () => {
  const { formatMessage } = useIntl();

  const configQuery = useConfig();

  const { values, onChange, handleChange, renderError, canUpdate } = useNavigationItemFormContext();

  const availableNavigationItemTypeOptions = !configQuery.data?.contentTypes.length
    ? (['EXTERNAL', 'WRAPPER'] as const)
    : (['INTERNAL', 'EXTERNAL', 'WRAPPER'] as const);
  const navigationItemTypeOptions = availableNavigationItemTypeOptions.map((key) => {
    return {
      key,
      value: key,
      label: formatMessage(getTrad(`popup.item.form.type.${key.toLowerCase()}.label`)),
    };
  });

  return (
    <Grid.Item alignItems="flex-start" key="title" col={8}>
      <Field
        name="type"
        label={formatMessage(getTrad('popup.item.form.type.label', 'Internal link'))}
        error={renderError('type')}
        hint={formatMessage(getTrad('popup.item.form.title.placeholder', 'e.g. Blog'))}
      >
        <SingleSelect
          onChange={(eventOrPath: FormChangeEvent) => handleChange('type', eventOrPath, onChange)}
          value={values.type}
          name="type"
          disabled={!canUpdate}
          width="100%"
        >
          {navigationItemTypeOptions.map(({ key, label, value }) => (
            <SingleSelectOption key={key} value={value}>
              {label}
            </SingleSelectOption>
          ))}
        </SingleSelect>
      </Field>
    </Grid.Item>
  );
};
