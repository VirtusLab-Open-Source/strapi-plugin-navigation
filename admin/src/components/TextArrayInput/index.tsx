import React, { useState } from 'react';
import { ChangeEffect, ToBeFixed } from '../../../../types';
// @ts-ignore
import { TextInput } from '@strapi/design-system/TextInput';

interface IProps {
  onChange: ChangeEffect<string[]>;
  initialValue?: string[];
  id?: string;
  name?: string;
  label?: string;
  disabled?: boolean;
  // TODO: [ @ltsNotMike ] Fix this before commit 
  error?: ToBeFixed;
}

const TextArrayInput: React.FC<IProps> = ({ onChange, initialValue, ...props}) => {
  const [value, setValue] = useState(!!initialValue ? initialValue.reduce((acc, cur) => acc+cur+"; ", "") : "");
  const handleOnChange = (e: React.BaseSyntheticEvent) => {
    const newValue: string = e.target.value;
    const valuesArray = newValue
      .split(';')
      .map(v => v.trim())
      .filter(v => !!v.length);
    setValue(e.target.value)
    onChange(valuesArray);
  }
  return (
    <TextInput
      {...props}
      onChange={handleOnChange}
      value={value}
    />
  )
}

export default TextArrayInput;