import React, { BaseSyntheticEvent, useMemo } from 'react';
import { assertBoolean, assertString } from '../../../../types';
//@ts-ignore
import { ToggleInput } from '@strapi/design-system/ToggleInput';
//@ts-ignore
import { TextInput } from '@strapi/design-system/TextInput';
//@ts-ignore
import { Select, Option } from '@strapi/design-system/Select';
//@ts-ignore
import { useNotification } from '@strapi/helper-plugin';
import { getTrad } from '../../translations';
import { AdditionalFieldInputProps, Input } from './types';
import { isNil } from 'lodash';
import { useIntl } from 'react-intl';

const DEFAULT_STRING_VALUE = "";
const handlerFactory =
  ({ field, prop, onChange }: Input) =>
    ({ target }: BaseSyntheticEvent) => {
      onChange(field.name, target[prop]);
    };

const AdditionalFieldInput: React.FC<AdditionalFieldInputProps> = ({
  field,
  isLoading,
  onChange,
  value,
  disabled,
  error
}) => {
  const toggleNotification = useNotification();
  const { formatMessage } = useIntl();
  const defaultInputProps = useMemo(() => ({
    id: field.name,
    name: field.name,
    label: field.label,
    disabled: isLoading || disabled,
    error: error && formatMessage(error),
  }), [field, isLoading, error]);
  const handleBoolean = useMemo(() => handlerFactory({ field, onChange, prop: "checked" }), [onChange, field]);
  const handleString = useMemo(() => handlerFactory({ field, onChange, prop: "value" }), [onChange, field]);

  switch (field.type) {
    case 'boolean':
      if (!isNil(value))
        assertBoolean(value);
      return (
        <ToggleInput
          {...defaultInputProps}
          checked={!!value}
          onChange={handleBoolean}
          onLabel="true"
          offLabel="false"
        />
      );
    case 'string':
      if (!isNil(value))
        assertString(value);
      return (
        <TextInput
          {...defaultInputProps}
          onChange={handleString}
          value={value || DEFAULT_STRING_VALUE}
        />
      );
    case 'select':
      return (
        <Select
          {...defaultInputProps}
          onChange={(v: string) => onChange(field.name, v)}
          value={isNil(value) ? field.multi ? [] : null : value}
          multi={field.multi}
          withTags={field.multi}
        >
          {field.options.map((option, index) => (
            <Option key={`${field.name}-option-${index}`} value={option}>
              {option}
            </Option>
          ))}
        </Select>
      );
    default:
      toggleNotification({
        type: 'warning',
        message: getTrad('notification.error.customField.type'),
      });
      throw new Error(`Type of custom field is unsupported`);
  }
}

export default AdditionalFieldInput;