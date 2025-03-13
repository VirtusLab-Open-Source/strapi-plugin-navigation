import { ComboboxOption } from "@strapi/design-system"
import { Combobox } from "@strapi/design-system"
import { useEffect, useState } from "react";
import { FormChangeEvent } from "src/types";

type ControllableComboboxProps = {
  name: string;
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

function findTextValue(options: ControllableComboboxProps['options'], value: ControllableComboboxProps['value']): string {
  if (!value) {
    return '';
  }

  return options.find(o => o.value === value)?.label ?? '';
}

export const ControllableCombobox: React.FC<ControllableComboboxProps> = ({
  name,
  onClear,
  onChange,
  options,
  value,
  disabled,
}) => {
  const [textValue, setTextValue] = useState(findTextValue(options, value));

  useEffect(() => {
    setTextValue(findTextValue(options, value))
  }, [value, options]);

  return (
    <Combobox
      name={name}
      autocomplete="list"
      onClear={onClear}
      onChange={onChange}
      onTextValueChange={setTextValue}
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
