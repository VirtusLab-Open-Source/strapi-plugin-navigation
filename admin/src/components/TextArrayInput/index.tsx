import { TextInput } from '@strapi/design-system';
import { isArray } from 'lodash';
import React, { useEffect, useState } from 'react';

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
    isArray(initialValue) ? initialValue.join(';') : ''
  );

  const handleOnChange = (event: { target: { value?: string } }) => {
    const newValue: string = event?.target.value ?? '';
    const valuesArray = newValue
      .split(';')
      .map((value) => value.trim())
      .filter((value) => !!value.length);

    setValue(newValue ?? '');
    onChange(valuesArray);
  };

  return <TextInput {...props} onChange={handleOnChange} value={value} />;
};

export default TextArrayInput;
