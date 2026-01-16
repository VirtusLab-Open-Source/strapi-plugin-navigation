import { useIntl } from 'react-intl';

import { Grid, TextInput } from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import { getTrad } from '../../../../../../translations';
import { FormChangeEvent } from '../../../../../../types';
import { useNavigationItemFormContext } from '../../context/NavigationItemFormContext';

export const TitleField = () => {
  const { formatMessage } = useIntl();

  const { values, onChange, handleChange, renderError, canUpdate } = useNavigationItemFormContext();

  return (
    <Grid.Item
      alignItems="flex-start"
      key="title"
      m={values.type === 'INTERNAL' ? 8 : 12}
      xs={12}
      order={{ initial: 1, medium: 2 }}
    >
      <Field
        name="title"
        label={formatMessage(getTrad('popup.item.form.title.label', 'Title'))}
        error={renderError('title')}
        hint={formatMessage(getTrad('popup.item.form.title.placeholder', 'e.g. Blog'))}
      >
        <TextInput
          type="string"
          disabled={!canUpdate || (values.autoSync && values.type === 'INTERNAL')}
          name="title"
          onChange={(eventOrPath: FormChangeEvent, value?: any) =>
            handleChange(eventOrPath, value, onChange)
          }
          value={values.title || ''}
        />
      </Field>
    </Grid.Item>
  );
};
