import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { isEmpty } from 'lodash';

import { Grid, MultiSelect, MultiSelectOption } from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import { getTrad } from '../../../../../../../translations';
import { FormChangeEvent } from '../../../../../../../types';
import { useNavigationItemFormContext } from '../../../context/NavigationItemFormContext';
import { useConfig } from '../../../../../hooks';

export const AudienceField = () => {
  const { formatMessage } = useIntl();

  const configQuery = useConfig();

  const availableAudiences = configQuery.data?.availableAudience ?? [];

  const audienceOptions = useMemo(
    () =>
      availableAudiences.map((item) => ({
        value: item.documentId ?? 0,
        label: item.name ?? ' ',
      })),
    [availableAudiences]
  );

  const { isLoading, renderError, onChange, handleChange, values } = useNavigationItemFormContext();

  return (
    <Grid.Item alignItems="flex-start" key="audience" col={12}>
      <Field
        name="audience"
        label={formatMessage(getTrad('popup.item.form.audience.label'))}
        error={renderError('audience')}
        hint={
          !isLoading && isEmpty(audienceOptions)
            ? formatMessage(getTrad('popup.item.form.title.placeholder', 'e.g. Blog'))
            : undefined
        }
      >
        <MultiSelect
          name="audience"
          value={values.audience}
          onChange={(eventOrPath: FormChangeEvent) =>
            handleChange('audience', eventOrPath, onChange)
          }
          width="100%"
        >
          {audienceOptions.map(({ value, label }) => (
            <MultiSelectOption key={value} value={value}>
              {label}
            </MultiSelectOption>
          ))}
        </MultiSelect>
      </Field>
    </Grid.Item>
  );
};
