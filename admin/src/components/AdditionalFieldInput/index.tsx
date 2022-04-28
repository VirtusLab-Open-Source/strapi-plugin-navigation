import React, { BaseSyntheticEvent } from 'react';
import { assertBoolean, assertString, NavigationItemCustomField } from '../../../../types';
//@ts-ignore
import { Select, Option } from '@strapi/design-system/Select';
//@ts-ignore
import { Checkbox } from '@strapi/design-system/Checkbox';
//@ts-ignore
import { ToggleInput } from '@strapi/design-system/ToggleInput';
//@ts-ignore
import { TextInput } from '@strapi/design-system/TextInput';

type AdditionalFieldInputProps = {
  field: NavigationItemCustomField;
  inputsPrefix: string;
  isLoading: boolean;
  onChange: (name: string, value: string) => void;
  value: string | boolean | string[] | null;
}

const AdditionalFieldInput: React.FC<AdditionalFieldInputProps> = ({
  field,
  inputsPrefix,
  isLoading,
  onChange,
  value,
}) => {
  switch (field.type) {
    case 'boolean':
      if (value !== null)
        assertBoolean(value);
      return (
        <ToggleInput
          id={`${inputsPrefix}${field.name}`}
          name={field.name}
          label={field.label}
          checked={value || false}
          onChange={({target: {checked}}: BaseSyntheticEvent) => onChange(field.name, checked)}
          disabled={isLoading}
          onLabel="true"
          offLabel="false"
        />
      )
    case 'string':
      if (value !== null)
        assertString(value);
      return (
        <TextInput
          id={`${inputsPrefix}${field.name}`}
          name={field.name}
          label={field.label}
          onChange={({target: {value}}: BaseSyntheticEvent) => onChange(field.name, value)}
          value={value || ""}
          disabled={isLoading}
        />
      )
    default:
      return null;
  }
}


export default AdditionalFieldInput;