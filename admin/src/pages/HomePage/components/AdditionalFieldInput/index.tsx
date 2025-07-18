import {
  MultiSelect,
  MultiSelectOption,
  SingleSelect,
  SingleSelectOption,
  TextInput,
} from '@strapi/design-system';
import { useNotification, useStrapiApp } from '@strapi/strapi/admin';
import { isNil, isNull } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';

import { Toggle } from '@strapi/design-system';
import { NavigationItemCustomField } from '../../../../schemas';
import { getTrad } from '../../../../translations';

export type AdditionalFieldInputProps = {
  name?: string;
  field: NavigationItemCustomField;
  isLoading: boolean;
  onChange: (eventOrPath: React.ChangeEvent<any> | string, value?: any) => void;
  onChangeEnhancer: (
    eventOrPath: React.ChangeEvent<any> | string,
    value?: any,
    nativeOnChange?: (eventOrPath: React.ChangeEvent<any> | string, value?: any) => void
  ) => void;
  value: string | boolean | string[] | object | null;
  disabled: boolean;
};

const DEFAULT_STRING_VALUE = '';

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
  name,
  field,
  isLoading,
  onChange,
  onChangeEnhancer,
  value,
  disabled,
}) => {
  const { toggleNotification } = useNotification();
  const { formatMessage } = useIntl();

  const fields = useStrapiApp('AdditionalFieldInput', (state) => state.fields);

  const MediaLibrary = fields.media as React.ComponentType<any>;

  const defaultInputProps = useMemo(
    () => ({
      id: field.name,
      name: name || field.name,
      disabled: isLoading || disabled,
      placeholder: field.placeholder,
    }),
    [field, isLoading]
  );

  useEffect(() => {
    if (field.type === 'media') {
      const newMediaValue = isNull(value) ? undefined : value;
      onChangeEnhancer(defaultInputProps.name, newMediaValue, onChange);
    }
  }, [value]);

  switch (field.type) {
    case 'boolean':
      return (
        <Toggle
          {...defaultInputProps}
          checked={!!value}
          onChange={(eventOrPath: React.ChangeEvent<any> | string) =>
            onChangeEnhancer(eventOrPath, !value, onChange)
          }
          onLabel="true"
          offLabel="false"
          type="checkbox"
        />
      );
    case 'string':
      return (
        <TextInput
          {...defaultInputProps}
          onChange={(eventOrPath: React.ChangeEvent<any> | string, value?: any) =>
            onChangeEnhancer(eventOrPath, value, onChange)
          }
          value={value || DEFAULT_STRING_VALUE}
        />
      );
    case 'select':
      return field.multi ? (
        <MultiSelect
          {...defaultInputProps}
          onChange={(eventOrPath: React.ChangeEvent<any> | string) =>
            onChangeEnhancer(defaultInputProps.name, eventOrPath, onChange)
          }
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
          onChange={(eventOrPath: React.ChangeEvent<any> | string) =>
            onChangeEnhancer(defaultInputProps.name, eventOrPath, onChange)
          }
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
      return <MediaLibrary {...defaultInputProps} {...mediaAttribute} value={value} />;
    default:
      toggleNotification({
        type: 'warning',
        message: formatMessage(getTrad('notification.error.customField.type')),
      });
      throw new Error(`Type of custom field is unsupported`);
  }
};
