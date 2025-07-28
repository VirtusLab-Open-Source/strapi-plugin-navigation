import { useState } from 'react';
import { useIntl } from 'react-intl';
import { get, isBoolean, isNil, isObject, isString, set } from 'lodash';

import { getFetchClient } from '@strapi/strapi/admin';
import { useMutation } from '@tanstack/react-query';

import { getApiClient } from '../../../../../api';
import { NavigationItemFormSchema } from './form';
import { NavigationItemAdditionalField } from '../../../../../schemas';
import { FormChangeEvent, FormItemErrorSchema, ToBeFixed } from '../../../../../types';
import { useConfig } from '../../../hooks';
import { getTrad } from '../../../../../translations';

export const useSlug = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useMutation({
    mutationFn(query: string) {
      return apiClient.slugify(query);
    },
  });
};

export const usePayload = () => {
  const configQuery = useConfig();

  const encodePayload = (values: NavigationItemFormSchema): NavigationItemFormSchema => {
    return {
      ...values,
      additionalFields:
        configQuery.data?.additionalFields.reduce((acc, field: NavigationItemAdditionalField) => {
          const { name, type } = field as ToBeFixed;

          if (name in (values.additionalFields ?? {})) {
            let val = values.additionalFields[name];

            switch (type) {
              case 'boolean':
                val = isBoolean(val) ? `${val}` : val;
                break;
              case 'media':
                val = val ? JSON.stringify(val) : val;
                break;
              default:
                break;
            }
            return {
              ...acc,
              [name]: val,
            };
          }
          return acc;
        }, {}) || {},
    };
  };

  const decodePayload = (values: NavigationItemFormSchema): NavigationItemFormSchema => {
    return {
      ...values,
      additionalFields:
        configQuery.data?.additionalFields.reduce((acc, field: NavigationItemAdditionalField) => {
          const { name, type } = field as ToBeFixed;

          if (name in (values.additionalFields ?? {})) {
            let val = values.additionalFields[name];

            switch (type) {
              case 'boolean':
                val = val === 'true' ? true : false;
                break;
              case 'media':
                val = val ? JSON.parse(val) : val;
                break;
              default:
                break;
            }
            return {
              ...acc,
              [name]: val,
            };
          }
          return acc;
        }, {}) || {},
    };
  };

  return { encodePayload, decodePayload };
};

export const useFormValues = () => {
  const { formatMessage } = useIntl();

  const [formValue, setFormValue] = useState<NavigationItemFormSchema>(
    {} as NavigationItemFormSchema
  );

  const [formError, setFormError] = useState<FormItemErrorSchema<NavigationItemFormSchema>>();

  const handleChange = (
    eventOrPath: FormChangeEvent,
    value?: any,
    nativeOnChange?: (eventOrPath: FormChangeEvent, value?: any) => void
  ) => {
    if (nativeOnChange) {
      let fieldName = eventOrPath;
      let fieldValue = value;
      if (isObject(eventOrPath)) {
        const { name: targetName, value: targetValue } = eventOrPath.target;
        fieldName = targetName;
        fieldValue = isNil(fieldValue) ? targetValue : fieldValue;
      }
      if (isString(fieldName)) {
        setFormValueItem(fieldName, fieldValue);
      }

      return nativeOnChange(eventOrPath, fieldValue);
    }
  };

  const setFormValueItem = (path: string, value: any) => {
    setFormValue(
      set(
        {
          ...formValue,
          additionalFields: {
            ...formValue.additionalFields,
          },
          updated: true,
        },
        path,
        value
      )
    );
  };

  const setFormValuesItems = (values: any) =>
    setFormValue({
      ...formValue,
      ...values,
      updated: true,
    });

  const renderError = (field: string, messageKey?: string): string | undefined => {
    return get(formError, field) ? formatMessage(getTrad(messageKey ?? field)) : undefined;
  };

  return {
    formValue,
    renderError,
    setFormError,
    handleChange,
    setFormValue,
    setFormValueItem,
    setFormValuesItems,
  };
};
