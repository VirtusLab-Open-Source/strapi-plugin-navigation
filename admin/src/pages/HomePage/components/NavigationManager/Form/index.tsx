import { Grid, TextInput, Toggle } from '@strapi/design-system';
import { Form as StrapiForm } from '@strapi/strapi/admin';
import { get, isEmpty, isNil, isObject, isString, set } from 'lodash';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Field } from '@sensinum/strapi-utils';

import { getTrad } from '../../../../../translations';
import { Effect, FormChangeEvent, FormItemErrorSchema } from '../../../../../types';
import { Navigation } from '../types';
import { formSchema } from './hooks';

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
  const [formValue, setFormValue] = useState<T>({} as T);
  const [formError, setFormError] = useState<FormItemErrorSchema<T>>();

  const { formatMessage } = useIntl();

  const { name, visible } = formValue;

  const handleChange = (
    eventOrPath: FormChangeEvent,
    value?: any,
    nativeOnChange?: (eventOrPath: FormChangeEvent, value?: any) => void
  ) => {
    if (nativeOnChange) {
      let fieldName = eventOrPath;
      let fieldValue = value;

      if (isObject(eventOrPath)) {
        const { name: targetName, value: targetValue } = eventOrPath.target;
        fieldName = targetName;
        fieldValue = isNil(fieldValue) ? targetValue : fieldValue;
      }

      if (isString(fieldName)) {
        setFormValueItem(fieldName, fieldValue);
      }

      return nativeOnChange(eventOrPath as FormChangeEvent, fieldValue);
    }
  };

  const setFormValueItem = (path: string, value: any) => {
    setFormValue(
      set(
        {
          ...formValue,
        },
        path,
        value
      )
    );
  };

  const renderError = (error: string): string | undefined => {
    const errorOccurence = get(formError, error);
    if (errorOccurence) {
      return errorOccurence;
    }
    return undefined;
  };

  useEffect(() => {
    if (navigation) {
      if (navigation.name) {
        setFormValue({
          ...navigation,
        } as T);
      } else {
        setFormValue({
          name: 'New navigation',
          visible: true,
        } as T);

        onChange({
          name: 'New navigation',
          visible: true,
          disabled: true,
        } as unknown as T);
      }
    }
  }, []);

  useEffect(() => {
    if (`${name}-${visible}` !== `${navigation.name}-${navigation.visible}`) {
      const { error } = formSchema({ alreadyUsedNames }).safeParse(formValue);

      onChange({
        ...navigation,
        name,
        visible,
        disabled: !isEmpty(error?.issues),
      });
      if (error) {
        setFormError(
          error.issues.reduce((acc, err) => {
            return {
              ...acc,
              [err.path.join('.')]: err.message,
            };
          }, {} as FormItemErrorSchema<T>)
        );
      } else {
        setFormError(undefined);
      }
    }
  }, [name, visible]);

  return (
    <StrapiForm width="auto" height="auto" method="POST" initialValues={formValue}>
      {({ values, onChange }) => {
        return (
          <Grid.Root gap={5}>
            <Grid.Item m={6} xs={12}>
              <Field
                name="name"
                label={formatMessage(getTrad('popup.navigation.form.name.label', 'Name'))}
                error={renderError('name')}
              >
                <TextInput
                  name="name"
                  type="string"
                  placeholder={formatMessage(
                    getTrad('popup.navigation.form.name.placeholder', "Navigations's name")
                  )}
                  onChange={(eventOrPath: FormChangeEvent, value?: any) =>
                    handleChange(eventOrPath, value, onChange)
                  }
                  value={values.name}
                  disabled={isLoading}
                />
              </Field>
            </Grid.Item>
            <Grid.Item m={6} xs={12}>
              <Field
                name="visible"
                label={formatMessage(getTrad('popup.navigation.form.visible.label', 'Visibility'))}
                error={renderError('visible')}
              >
                <Toggle
                  name="visible"
                  checked={values.visible}
                  onChange={(eventOrPath: FormChangeEvent) =>
                    handleChange(eventOrPath, !values.visible, onChange)
                  }
                  onLabel={formatMessage(getTrad('popup.navigation.form.visible.toggle.visible'))}
                  offLabel={formatMessage(getTrad('popup.navigation.form.visible.toggle.hidden'))}
                  disabled={isLoading}
                  width="100%"
                />
              </Field>
            </Grid.Item>
          </Grid.Root>
        );
      }}
    </StrapiForm>
  );
};
