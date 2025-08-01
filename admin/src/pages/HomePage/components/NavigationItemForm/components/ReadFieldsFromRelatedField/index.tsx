import { useIntl } from 'react-intl';

import { Grid, Toggle } from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import { getTrad } from '../../../../../../translations';
import { FormChangeEvent } from '../../../../../../types';
import { useNavigationItemFormContext } from '../../context/NavigationItemFormContext';

export const ReadFieldsFromRelatedField = () => {
  const { formatMessage } = useIntl();

  const { values, onChange, handleChange, renderError, canUpdate } = useNavigationItemFormContext();

  return (
    <Grid.Item alignItems="flex-start" key="autoSync" col={4}>
      <Field
        name="autoSync"
        label={formatMessage(getTrad('popup.item.form.autoSync.label', 'Read fields from related'))}
        error={renderError('autoSync')}
      >
        <Toggle
          name="autoSync"
          checked={values.autoSync}
          onChange={(eventOrPath: FormChangeEvent) =>
            handleChange(eventOrPath, !values.autoSync, onChange)
          }
          disabled={!canUpdate}
          onLabel="Enabled"
          offLabel="Disabled"
        />
      </Field>
    </Grid.Item>
  );
};
