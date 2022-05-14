import React, { BaseSyntheticEvent, useMemo } from 'react';
import { assertBoolean, assertString } from '../../../../types';
//@ts-ignore
import { ToggleInput } from '@strapi/design-system/ToggleInput';
//@ts-ignore
import { TextInput } from '@strapi/design-system/TextInput';
//@ts-ignore
import { useNotification } from '@strapi/helper-plugin';
import { getTrad } from '../../translations';
import { AdditionalFieldInputProps, Input } from './types';
import { isNil } from 'lodash';

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
}) => {
  const toggleNotification = useNotification();
  const defaultInputProps = useMemo(() => ({
    id: field.name,
    name: field.name,
    label: field.label,
    disabled: isLoading,
  }), [field, isLoading]);
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
      )
    case 'string':
      if (!isNil(value))
        assertString(value);
      return (
        <TextInput
          {...defaultInputProps}
          onChange={handleString}
          value={value || DEFAULT_STRING_VALUE}
        />
      )
    default:
      toggleNotification({
        type: 'warning',
        message: getTrad('notification.error.customField.type'),
      });
      throw new Error(`Type "${field.type}" is unsupported by custom fields`);
  }
}

export default AdditionalFieldInput;