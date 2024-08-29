import React from 'react';

import { Button, Field, Grid, Modal } from '@strapi/design-system';

import { SingleSelect, SingleSelectOption, TextInput, Toggle } from '@strapi/design-system';
import { Controller } from 'react-hook-form';
import { useIntl } from 'react-intl';
import TextArrayInput from '../../../../components/TextArrayInput';
import { NavigationItemCustomField } from '../../../../schemas';
import { getTrad } from '../../../../translations';
import { Effect, VoidEffect } from '../../../../types';
import { customFieldsTypes } from '../../common';
import { useCustomFieldForm } from './hooks';

const tradPrefix = 'pages.settings.form.customFields.popup.';

interface ICustomFieldFormProps {
  customField: Partial<NavigationItemCustomField>;
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

  const { control, handleSubmit, watch } = useCustomFieldForm(customField);
  const [type] = watch(['type']);

  const submit = handleSubmit(onSubmit as any);

  return (
    <>
      <Modal.Body>
        <Grid.Root gap={5}>
          <Grid.Item key="name" col={12}>
            <Controller
              control={control}
              name="name"
              render={({ field: { name, onChange, value }, fieldState }) => (
                <Field.Root error={fieldState.error?.message} width="100%">
                  <Field.Label>{formatMessage(getTrad(`${tradPrefix}name.label`))}</Field.Label>

                  <TextInput
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={formatMessage(getTrad(`${tradPrefix}name.placeholder`))}
                    type="string"
                    disabled={isEditForm}
                    width="100%"
                  />
                  <Field.Hint>{formatMessage(getTrad(`${tradPrefix}name.description`))}</Field.Hint>
                  <Field.Error />
                </Field.Root>
              )}
            />
          </Grid.Item>
          <Grid.Item key="label" col={12}>
            <Controller
              control={control}
              name="label"
              render={({ field: { name, onChange, value }, fieldState }) => (
                <Field.Root error={fieldState.error?.message} width="100%">
                  <Field.Label>{formatMessage(getTrad(`${tradPrefix}label.label`))}</Field.Label>

                  <TextInput
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={formatMessage(getTrad(`${tradPrefix}label.placeholder`))}
                    type="string"
                    width="100%"
                  />

                  <Field.Hint>
                    {formatMessage(getTrad(`${tradPrefix}label.description`))}
                  </Field.Hint>
                  <Field.Error />
                </Field.Root>
              )}
            />
          </Grid.Item>
          <Grid.Item key="type" col={12}>
            <Controller
              control={control}
              name="type"
              render={({ field: { name, onChange, value } }) => (
                <Field.Root width="100%">
                  <Field.Label>{formatMessage(getTrad(`${tradPrefix}type.label`))}</Field.Label>

                  <SingleSelect
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={isEditForm}
                    width="100%"
                  >
                    {typeSelectOptions.map(({ key, label, value }) => (
                      <SingleSelectOption key={key} value={value}>
                        {label}
                      </SingleSelectOption>
                    ))}
                  </SingleSelect>

                  <Field.Hint>{formatMessage(getTrad(`${tradPrefix}type.description`))}</Field.Hint>
                </Field.Root>
              )}
            />
          </Grid.Item>
          {type === 'select' && (
            <>
              <Grid.Item key="multi" col={12}>
                <Controller
                  control={control}
                  name="multi"
                  render={({ field: { name, onChange, value }, fieldState }) => (
                    <Field.Root error={fieldState.error?.message} width="100%">
                      <Field.Label>
                        {formatMessage(getTrad(`${tradPrefix}multi.label`))}
                      </Field.Label>

                      <Toggle
                        name={name}
                        checked={value}
                        onChange={({
                          currentTarget: { checked },
                        }: {
                          currentTarget: { checked: boolean };
                        }) => {
                          onChange(checked);
                        }}
                        onLabel="true"
                        offLabel="false"
                        width="100%"
                      />

                      <Field.Hint>
                        {formatMessage(getTrad(`${tradPrefix}multi.description`))}
                      </Field.Hint>
                      <Field.Error />
                    </Field.Root>
                  )}
                />
              </Grid.Item>
              <Grid.Item key="options" col={12}>
                <Controller
                  control={control}
                  name="options"
                  render={({ field: { name, onChange, value }, fieldState }) => (
                    <Field.Root error={fieldState.error?.message} width="100%">
                      <Field.Label>
                        {formatMessage(getTrad(`${tradPrefix}options.label`))}
                      </Field.Label>

                      <TextArrayInput name={name} onChange={onChange} initialValue={value} />

                      <Field.Hint>
                        {formatMessage(getTrad(`${tradPrefix}options.description`))}
                      </Field.Hint>
                      <Field.Error />
                    </Field.Root>
                  )}
                />
              </Grid.Item>
            </>
          )}
          <Grid.Item key="required" col={12}>
            <Controller
              control={control}
              name="required"
              render={({ field: { name, onChange, value }, fieldState }) => (
                <Field.Root error={fieldState.error?.message}>
                  <Field.Label>{formatMessage(getTrad(`${tradPrefix}required.label`))}</Field.Label>

                  <Toggle
                    name={name}
                    placeholder={formatMessage(getTrad(`${tradPrefix}required.placeholder`))}
                    checked={value}
                    onChange={({
                      currentTarget: { checked },
                    }: {
                      currentTarget: { checked: boolean };
                    }) => {
                      onChange(checked);
                    }}
                    onLabel="true"
                    offLabel="false"
                    width="100%"
                  />

                  <Field.Hint>
                    {formatMessage(getTrad(`${tradPrefix}required.description`))}
                  </Field.Hint>
                  <Field.Error />
                </Field.Root>
              )}
            />
          </Grid.Item>
        </Grid.Root>
      </Modal.Body>
      <Modal.Footer>
        <Modal.Close>
          <Button onClick={onClose} variant="tertiary">
            {formatMessage(getTrad('popup.item.form.button.cancel'))}
          </Button>
        </Modal.Close>
        <Button onClick={submit}>{formatMessage(getTrad(`popup.item.form.button.save`))}</Button>
      </Modal.Footer>
    </>
  );
};

export default CustomFieldForm;
