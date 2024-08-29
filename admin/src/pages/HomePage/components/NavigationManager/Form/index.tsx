import { Field } from '@strapi/design-system';
import { InputRenderer } from '@strapi/strapi/admin';
import { debounce } from 'lodash';
import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { Checkbox, Grid } from '@strapi/design-system';
import { getTrad } from '../../../../../translations';
import { Effect } from '../../../../../types';
import { Navigation } from '../types';
import { useNavigationForm } from './hooks';
import { TextInput } from '@strapi/design-system';

interface Props<T extends Partial<Navigation>> {
  navigation: T;
  onChange: Effect<T>;
  isLoading?: boolean;
  alreadyUsedNames?: Array<string>;
}

export const Form = <T extends Partial<Navigation>>({
  navigation,
  onChange,
  alreadyUsedNames = [],
  isLoading,
}: Props<T>) => {
  const { control, watch } = useNavigationForm({ alreadyUsedNames, navigation });
  const [name, visible] = watch(['name', 'visible']);

  const onChangeLimited = debounce(onChange, 300);

  const { formatMessage } = useIntl();

  useEffect(() => {
    if (`${name}-${visible}` !== `${navigation.name}-${navigation.visible}`) {
      onChangeLimited({
        ...navigation,
        name,
        visible,
      });
    }
  }, [name, visible, navigation]);

  return (
    <Grid.Root gap={5}>
      <Grid.Item col={6}>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange }, fieldState }) => (
            <Field.Root error={fieldState.error?.message}>
              <Field.Label>
                {formatMessage(getTrad('popup.navigation.form.name.label', 'Name'))}
              </Field.Label>

              <TextInput
                name="name"
                type="string"
                placeholder={formatMessage(
                  getTrad('popup.navigation.form.name.placeholder', "Navigations's name")
                )}
                onChange={onChange}
                value={value}
                disabled={isLoading}
              />

              <Field.Error />
            </Field.Root>
          )}
        />
      </Grid.Item>
      <Grid.Item col={6}>
        <Controller
          control={control}
          name="visible"
          render={({ field: { onChange, value }, fieldState }) => (
            <Field.Root error={fieldState.error?.message}>
              <Field.Label>
                {formatMessage(getTrad('popup.navigation.form.visible.label', 'Visibility'))}
              </Field.Label>

              <Checkbox
                name="visible"
                checked={value}
                onCheckedChange={onChange}
                disabled={isLoading}
              />

              <Field.Hint>{formatMessage(getTrad('popup.item.form.visible.label'))}</Field.Hint>
              <Field.Error />
            </Field.Root>
          )}
        />
      </Grid.Item>
    </Grid.Root>
  );
};
