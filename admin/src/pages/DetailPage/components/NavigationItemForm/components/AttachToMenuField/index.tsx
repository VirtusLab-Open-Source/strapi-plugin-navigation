import { useIntl } from 'react-intl';

import { Grid } from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import { useConfig } from '../../../../hooks';
import { getTrad } from '../../../../../../translations';
import { FormChangeEvent } from '../../../../../../types';
import { useNavigationItemFormContext } from '../../context/NavigationItemFormContext';
import { Toggle } from '@strapi/design-system';
import { type NavigationItemFormSchema } from '../../utils/form';

type AttachToMenuFieldProps = {
  current: Partial<NavigationItemFormSchema>;
};

export const AttachToMenuField: React.FC<AttachToMenuFieldProps> = ({ current }) => {
  const { formatMessage } = useIntl();

  const configQuery = useConfig();

  const { values, onChange, handleChange, renderError, canUpdate } = useNavigationItemFormContext();

  return (
    <Grid.Item alignItems="flex-start" key="menuAttached" m={4} xs={12}>
      <Field
        name="menuAttached"
        label={formatMessage(getTrad('popup.item.form.menuAttached.label', 'MenuAttached'))}
        error={renderError('menuAttached')}
        hint={formatMessage(
          getTrad('popup.item.form.menuAttached.placeholder', 'is menu item attached to menu')
        )}
      >
        <Toggle
          name="menuAttached"
          checked={values.menuAttached}
          onChange={(eventOrPath: FormChangeEvent) =>
            handleChange(eventOrPath, !values.menuAttached, onChange)
          }
          value={values.menuAttached}
          onLabel={formatMessage(getTrad('popup.item.form.menuAttached.value.yes', 'yes'))}
          offLabel={formatMessage(getTrad('popup.item.form.menuAttached.value.no', 'no'))}
          disabled={
            !canUpdate ||
            (configQuery.data?.cascadeMenuAttached
              ? !(current.isMenuAllowedLevel && current.parentAttachedToMenu)
              : false)
          }
          width="100%"
        />
      </Field>
    </Grid.Item>
  );
};
