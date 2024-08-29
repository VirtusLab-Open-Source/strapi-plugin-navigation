import { TextInput } from '@strapi/design-system';
import { isArray } from 'lodash';
import React, { useState } from 'react';

import { Effect } from '../../types';

interface IProps {
  onChange: Effect<string[]>;
  initialValue?: string[];
  id?: string;
  name?: string;
  label?: string;
  disabled?: boolean;
}

const TextArrayInput: React.FC<IProps> = ({ onChange, initialValue, ...props }) => {
  const [value, setValue] = useState(
    isArray(initialValue) ? initialValue.reduce((acc, cur) => `${acc}${cur}; `, '') : ''
  );
  const handleOnChange = ({ target: { value } }: React.BaseSyntheticEvent) => {
    const newValue: string = value;
    const valuesArray = newValue
      .split(';')
      .map((v) => v.trim())
      .filter((v) => !!v.length);
    setValue(value);
    onChange(valuesArray);
  };
  return <TextInput {...props} onChange={handleOnChange} value={value} />;
};

export default TextArrayInput;
