import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { Form } from '@strapi/strapi/admin';
import {
  Button,
  Grid,
  Modal,
  SingleSelect,
  SingleSelectOption,
  TextInput,
  Toggle,
} from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import TextArrayInput from '../../../../../components/TextArrayInput';
import { navigationItemCustomField, NavigationItemCustomField } from '../../../../../schemas';
import { getTrad } from '../../../../../translations';
import {
  Effect,
  FormChangeEvent,
  FormItemErrorSchema,
  ToBeFixed,
  VoidEffect,
} from '../../../../../types';
import { customFieldsTypes } from '../../../common';
import { get, isNil, isObject, isString, set } from 'lodash';

const tradPrefix = 'pages.settings.form.customFields.popup.';

interface ICustomFieldFormProps {
  customField: NavigationItemCustomField | null;
  isEditForm: boolean;
  onSubmit: Effect<NavigationItemCustomField>;
  onClose: VoidEffect;
}

const prepareSelectOptions = (options: ReadonlyArray<string>) =>
  options.map((option, index) => ({
    key: `${option}-${index}`,
    metadatas: {
      intlLabel: {
        id: option,
        defaultMessage: option,
      },
      hidden: false,
      disabled: false,
    },
    value: option,
    label: option,
  }));

const CustomFieldForm: React.FC<ICustomFieldFormProps> = ({
  isEditForm,
  customField,
  onSubmit,
  onClose,
}) => {
  const typeSelectOptions = prepareSelectOptions(customFieldsTypes);

  const { formatMessage } = useIntl();

  const [formValue, setFormValue] = useState<NavigationItemCustomField>({
    name: '',
    label: '',
    type: 'string',
    required: false,
    multi: false,
    enabled: true,
  });
  const [formError, setFormError] = useState<FormItemErrorSchema<NavigationItemCustomField>>();

  const { type } = formValue;

  useEffect(() => {
    if (customField) {
      setFormValue({
        ...customField,
      });
    }
  }, [customField]);

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

      return nativeOnChange(eventOrPath, fieldValue);
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
      return formatMessage(getTrad(`${tradPrefix}${error}.${errorOccurence}`));
    }
    return undefined;
  };

  const submit = (e: React.MouseEvent, values: NavigationItemCustomField) => {
    const { success, data, error } = navigationItemCustomField.safeParse(values);
    if (success) {
      onSubmit(data);
    } else if (error) {
      setFormError(
        error.issues.reduce((acc, err) => {
          return {
            ...acc,
            [err.path.join('.')]: err.message,
          };
        }, {} as FormItemErrorSchema<NavigationItemCustomField>)
      );
    }
  };

  return (
    <>
      <Modal.Body>
        <Form method="POST" width="auto" height="auto" initialValues={formValue}>
          {({ values, onChange }) => {
            return (
              <Grid.Root gap={5}>
                <Grid.Item key="name" col={12}>
                  <Field
                    name="name"
                    label={formatMessage(getTrad(`${tradPrefix}name.label`))}
                    hint={formatMessage(getTrad(`${tradPrefix}name.description`))}
                    error={renderError('name')}
                    required
                  >
                    <TextInput
                      name="name"
                      value={values.name}
                      onChange={(eventOrPath: FormChangeEvent, value?: any) =>
                        handleChange(eventOrPath, value, onChange)
                      }
                      placeholder={formatMessage(getTrad(`${tradPrefix}name.placeholder`))}
                      type="string"
                      disabled={isEditForm}
                      width="100%"
                    />
                  </Field>
                </Grid.Item>
                <Grid.Item key="label" col={12}>
                  <Field
                    name="label"
                    label={formatMessage(getTrad(`${tradPrefix}label.label`))}
                    hint={formatMessage(getTrad(`${tradPrefix}label.description`))}
                    error={renderError('label')}
                    required
                  >
                    <TextInput
                      name="label"
                      value={values.label}
                      onChange={(eventOrPath: FormChangeEvent, value?: any) =>
                        handleChange(eventOrPath, value, onChange)
                      }
                      placeholder={formatMessage(getTrad(`${tradPrefix}label.placeholder`))}
                      type="string"
                      width="100%"
                    />
                  </Field>
                </Grid.Item>
                <Grid.Item key="description" col={12}>
                  <Field
                    name="description"
                    label={formatMessage(getTrad(`${tradPrefix}description.label`))}
                    hint={formatMessage(getTrad(`${tradPrefix}description.description`))}
                    error={renderError('description')}
                  >
                    <TextInput
                      name="description"
                      value={values.description}
                      onChange={(eventOrPath: FormChangeEvent, value?: any) =>
                        handleChange(eventOrPath, value, onChange)
                      }
                      placeholder={formatMessage(getTrad(`${tradPrefix}description.placeholder`))}
                      type="string"
                      width="100%"
                    />
                  </Field>
                </Grid.Item>
                <Grid.Item key="placeholder" col={12}>
                  <Field
                    name="placeholder"
                    label={formatMessage(getTrad(`${tradPrefix}placeholder.label`))}
                    hint={formatMessage(getTrad(`${tradPrefix}placeholder.description`))}
                    error={renderError('placeholder')}
                  >
                    <TextInput
                      name="placeholder"
                      value={values.placeholder}
                      onChange={(eventOrPath: FormChangeEvent, value?: any) =>
                        handleChange(eventOrPath, value, onChange)
                      }
                      placeholder={formatMessage(getTrad(`${tradPrefix}placeholder.placeholder`))}
                      type="string"
                      width="100%"
                    />
                  </Field>
                </Grid.Item>
                <Grid.Item key="type" col={12}>
                  <Field
                    name="type"
                    label={formatMessage(getTrad(`${tradPrefix}type.label`))}
                    hint={formatMessage(getTrad(`${tradPrefix}type.description`))}
                    required
                  >
                    <SingleSelect
                      name="type"
                      value={values.type}
                      onChange={(eventOrPath: FormChangeEvent) =>
                        handleChange('type', eventOrPath, onChange)
                      }
                      disabled={isEditForm}
                      width="100%"
                    >
                      {typeSelectOptions.map(({ key, label, value }) => (
                        <SingleSelectOption key={key} value={value}>
                          {label}
                        </SingleSelectOption>
                      ))}
                    </SingleSelect>
                  </Field>
                </Grid.Item>
                {(type as ToBeFixed) === 'select' && (
                  <>
                    <Grid.Item key="multi" col={12}>
                      <Field
                        name="multi"
                        label={formatMessage(getTrad(`${tradPrefix}multi.label`))}
                        hint={formatMessage(getTrad(`${tradPrefix}multi.description`))}
                        error={renderError('multi')}
                      >
                        <Toggle
                          name="multi"
                          checked={values.multi}
                          onChange={(eventOrPath: FormChangeEvent) =>
                            handleChange(eventOrPath, !values.multi, onChange)
                          }
                          onLabel="true"
                          offLabel="false"
                          width="100%"
                        />
                      </Field>
                    </Grid.Item>
                    <Grid.Item key="options" col={12}>
                      <Field
                        name="options"
                        label={formatMessage(getTrad(`${tradPrefix}options.label`))}
                        hint={formatMessage(getTrad(`${tradPrefix}options.description`))}
                        error={renderError('options')}
                      >
                        <TextArrayInput
                          name="options"
                          onChange={(value: string[]) => handleChange('options', value, onChange)}
                          initialValue={values.options}
                        />
                      </Field>
                    </Grid.Item>
                  </>
                )}
                <Grid.Item key="required" col={12}>
                  <Field
                    name="required"
                    label={formatMessage(getTrad(`${tradPrefix}required.label`))}
                    hint={formatMessage(getTrad(`${tradPrefix}required.description`))}
                    error={renderError('required')}
                  >
                    <Toggle
                      name="required"
                      placeholder={formatMessage(getTrad(`${tradPrefix}required.placeholder`))}
                      checked={values.required}
                      onChange={(eventOrPath: FormChangeEvent) =>
                        handleChange(eventOrPath, !values.required, onChange)
                      }
                      onLabel="true"
                      offLabel="false"
                      width="100%"
                    />
                  </Field>
                </Grid.Item>
              </Grid.Root>
            );
          }}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Modal.Close>
          <Button onClick={onClose} variant="tertiary">
            {formatMessage(getTrad('popup.item.form.button.cancel'))}
          </Button>
        </Modal.Close>
        <Button onClick={(e: React.MouseEvent) => submit(e, formValue)}>
          {formatMessage(getTrad(`popup.item.form.button.save`))}
        </Button>
      </Modal.Footer>
    </>
  );
};

export default CustomFieldForm;
