import { Grid, Toggle } from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import { useIntl } from 'react-intl';
import { getTrad } from '../../../../../translations';
import { FormChangeEvent } from '../../../../../types';
import { useSettingsContext } from '../../../context';

export const PreferCustomContentTypesField = () => {
  const { formatMessage } = useIntl();

  const { values, onChange, handleChange, restartStatus } = useSettingsContext();

  return (
    <Grid.Item col={4} s={12} xs={12}>
      <Field
        name="preferCustomContentTypes"
        label={formatMessage(getTrad('pages.settings.form.preferCustomContentTypes.label'))}
        hint={formatMessage(getTrad('pages.settings.form.preferCustomContentTypes.hint'))}
      >
        <Toggle
          name="preferCustomContentTypes"
          checked={values.preferCustomContentTypes}
          onChange={(eventOrPath: FormChangeEvent) =>
            handleChange(eventOrPath, !values.preferCustomContentTypes, onChange)
          }
          onLabel={formatMessage(getTrad('components.toggle.enabled'))}
          offLabel={formatMessage(getTrad('components.toggle.disabled'))}
          disabled={restartStatus.required}
          width="100%"
        />
      </Field>
    </Grid.Item>
  );
};
