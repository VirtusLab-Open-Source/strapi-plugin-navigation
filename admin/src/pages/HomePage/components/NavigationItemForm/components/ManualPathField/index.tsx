import { useIntl } from 'react-intl';

import { Field } from '@sensinum/strapi-utils';
import { Grid, Toggle } from '@strapi/design-system';

import { getTrad } from '../../../../../../translations';
import { FormChangeEvent } from '../../../../../../types';
import { useNavigationItemFormContext } from '../../context/NavigationItemFormContext';

export const ManualPathField: React.FC = () => {
  const { formatMessage } = useIntl();

  const { values, onChange, handleChange, renderError } = useNavigationItemFormContext();

  return (
    <Grid.Item alignItems="flex-start" key="title" col={12}>
      <Field
        name="isManualPath"
        label={formatMessage(getTrad(`popup.item.form.isManualPath.label`, 'Manual Path'))}
        error={renderError('isManualPath')}
        hint={formatMessage(
          getTrad(`popup.item.form.isManualPath.placeholder`, 'Full path is handled by the user')
        )}
      >
        <Toggle
          name="menuAttached"
          checked={values.isManualPath}
          onChange={(eventOrPath: FormChangeEvent) =>
            handleChange(eventOrPath, !values.isManualPath, onChange)
          }
          value={values.isManualPath}
          onLabel={formatMessage(getTrad('popup.item.form.isManualPath.value.yes', 'yes'))}
          offLabel={formatMessage(getTrad('popup.item.form.isManualPath.value.no', 'no'))}
          width="100%"
        />
      </Field>
    </Grid.Item>
  );
};
