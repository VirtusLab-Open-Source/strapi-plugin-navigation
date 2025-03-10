import { ComboboxOption } from "@strapi/design-system"
import { Combobox } from "@strapi/design-system"
import { useEffect, useState } from "react";
import { FormChangeEvent } from "src/types";

type ControllableComboboxProps = {
  onClear: () => void;
  onChange: (eventOrPath: FormChangeEvent) => void;
  options: {
    key: string;
    value: string;
    label: string;
  }[];
  value: string | undefined;
  disabled: boolean;
};

export const ControllableCombobox: React.FC<ControllableComboboxProps> = ({
  onClear,
  onChange,
  options,
  value,
  disabled,
}) => {
  const [textValue, setTextValue] = useState('');

  const handleTextValueChange = (textValue: string) => {
    setTextValue(textValue);
  };

  useEffect(() => {
    if (!value) {
      handleTextValueChange('');
    }
  }, [value]);

  return (
    <Combobox
      name="related"
      autocomplete="list"
      onClear={onClear}
      onChange={onChange}
      onTextValueChange={handleTextValueChange}
      value={value}
      textValue={textValue}
      options={options}
      disabled={disabled}
      width="100%"
    >
      {options.map(({ key, label, value }) => (
        <ComboboxOption key={key} value={value}>
          {label}
        </ComboboxOption>
      ))}
    </Combobox>
  );
};