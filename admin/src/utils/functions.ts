import { get } from 'lodash';
import { useIntl } from 'react-intl';
import { NavigationItemAdditionalField, NavigationItemAdditionalFieldValues, ToBeFixed } from '../../../types';
import { defaultValues as navigationItemFormDefaults } from '../pages/View/components/NavigationItemForm/utils/form';
import pluginId from '../pluginId';

type MessageInput = {
  id: string;
  defaultMessage?: string;
  props?: Record<string, ToBeFixed>
} | string

export const getMessage = (input: MessageInput, defaultMessage: string = '', inPluginScope: boolean = true): string => {
  const { formatMessage } = useIntl();
  let formattedId = '';
  if (typeof input === 'string') {
    formattedId = input;
  } else {
    formattedId = input.id.toString() || formattedId;
  }
  return formatMessage({
    id: `${inPluginScope ? pluginId : 'app.components'}.${formattedId}`,
    defaultMessage,
  }, typeof input === 'string' ? undefined : input?.props)
};

export const getDefaultCustomFields = (args: {
  additionalFields: NavigationItemAdditionalField[],
  customFieldsValues: NavigationItemAdditionalFieldValues,
  defaultCustomFieldsValues: NavigationItemAdditionalFieldValues
}): NavigationItemAdditionalFieldValues => {
  return args.additionalFields.reduce((acc, additionalField) => {
    if (typeof additionalField === 'string') {
      return acc;
    } else {
      const value = navigationItemFormDefaults.additionalFields[additionalField.type];
      return {
        ...acc,
        [additionalField.name]: get(args.customFieldsValues, additionalField.name, value),
      };
    }
  }, {});
}