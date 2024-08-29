import {
  MultiSelect,
  MultiSelectOption,
  SingleSelect,
  SingleSelectOption,
  TextInput,
} from '@strapi/design-system';
import { useNotification, useStrapiApp } from '@strapi/strapi/admin';
import { isNil } from 'lodash';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { Toggle } from '@strapi/design-system';
import { NavigationItemCustomField } from '../../../../schemas';
import { getTrad } from '../../../../translations';

export type AdditionalFieldInputProps = {
  field: NavigationItemCustomField;
  isLoading: boolean;
  onChange: (name: string, value: unknown, fieldType: string) => void;
  value: string | boolean | string[] | null;
  disabled: boolean;
};

const DEFAULT_STRING_VALUE = '';
const handlerFactory =
  ({
    field,
    prop,
    onChange,
  }: {
    field: { name: string; type: string };
    prop: string;
    onChange: (name: string, value: unknown, fieldType: string) => void;
  }) =>
  ({ target }: { target: Record<string, unknown> }) => {
    onChange(field.name, target[prop], field.type);
  };

const mediaAttribute = {
  type: 'media',
  multiple: false,
  required: false,
  allowedTypes: ['images'],
  pluginOptions: {
    i18n: {
      localized: false,
    },
  },
};

export const AdditionalFieldInput: React.FC<AdditionalFieldInputProps> = ({
  field,
  isLoading,
  onChange,
  value: baseValue,
  disabled,
}) => {
  const { toggleNotification } = useNotification();
  const { formatMessage } = useIntl();

  const fields = useStrapiApp('AdditionalFieldInput', (state) => state.fields);
  // TODO?: typing
  const MediaLibrary = fields.media as React.ComponentType<any>;

  const value = useMemo(
    () => (field.type === 'media' && baseValue ? JSON.parse(baseValue as string) : baseValue),
    [baseValue, field.type]
  );
  const defaultInputProps = useMemo(
    () => ({
      id: field.name,
      name: field.name,
      label: field.label,
      disabled: isLoading || disabled,
    }),
    [field, isLoading]
  );
  const handleBoolean = useMemo(
    () => handlerFactory({ field, onChange, prop: 'checked' }),
    [onChange, field]
  );
  const handleString = useMemo(
    () => handlerFactory({ field, onChange, prop: 'value' }),
    [onChange, field]
  );
  const handleMedia = useMemo(
    () => handlerFactory({ field, onChange, prop: 'value' }),
    [onChange, field]
  );

  switch (field.type) {
    case 'boolean':
      return (
        <Toggle
          {...defaultInputProps}
          checked={!!value}
          onChange={({ currentTarget: { checked } }: { currentTarget: { checked: boolean } }) => {
            onChange(field.name, checked, field.type);
          }}
          onLabel="true"
          offLabel="false"
          type="checkbox"
        />
      );
    case 'string':
      return (
        <TextInput
          {...defaultInputProps}
          onChange={handleString}
          value={value || DEFAULT_STRING_VALUE}
        />
      );
    case 'select':
      return field.multi ? (
        <MultiSelect
          {...defaultInputProps}
          onChange={(v: string) => onChange(field.name, v, 'select')}
          value={isNil(value) ? (field.multi ? [] : null) : value}
          multi={field.multi}
          withTags={field.multi}
        >
          {field.options.map((option, index) => (
            <MultiSelectOption key={`${field.name}-option-${index}`} value={option}>
              {option}
            </MultiSelectOption>
          ))}
        </MultiSelect>
      ) : (
        <SingleSelect
          {...defaultInputProps}
          onChange={(v: string) => onChange(field.name, v, 'select')}
          value={isNil(value) ? (field.multi ? [] : null) : value}
          multi={field.multi}
          withTags={field.multi}
        >
          {field.options.map((option, index) => (
            <SingleSelectOption key={`${field.name}-option-${index}`} value={option}>
              {option}
            </SingleSelectOption>
          ))}
        </SingleSelect>
      );
    case 'media':
      return (
        <MediaLibrary
          {...defaultInputProps}
          onChange={handleMedia}
          value={value || []}
          intlLabel={defaultInputProps.label}
          attribute={mediaAttribute}
        />
      );
    default:
      toggleNotification({
        type: 'warning',
        message: formatMessage(getTrad('notification.error.customField.type')),
      });
      throw new Error(`Type of custom field is unsupported`);
  }
};
