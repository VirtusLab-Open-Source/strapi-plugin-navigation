import { get, isEmpty, orderBy, isNil } from 'lodash';
import { v4 as uuid } from 'uuid';
import { useIntl } from 'react-intl';
import { ContentTypeEntity, NavigationConfig, NavigationItem, NavigationItemAdditionalField, NavigationItemAdditionalFieldValues, NestedStructure, ToBeFixed } from '../../../types';
import { defaultValues as navigationItemFormDefaults } from '../pages/View/components/NavigationItemForm/utils/form';
import pluginId from '../pluginId';
import { linkRelations } from '../pages/View/utils/parsers';

type MessageInput = {
  id: string;
  defaultMessage?: string;
  props?: Record<string, ToBeFixed>
} | string;

type PrepareNewValueForRecord = (
  uid: string,
  current: Record<string, string[] | undefined>,
  value: string[]
) => Record<string, string[] | undefined>;

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

export const prepareNewValueForRecord: PrepareNewValueForRecord = (uid, current, value) => ({
  ...current,
  [uid]: value && !isEmpty(value) ? [...value] : undefined,
});


const reOrderItems = (items: NestedStructure<NavigationItem>[] = []) =>
  orderBy(items, ['order'], ['asc'])
    .map((item, n) => {
      const order = n + 1;
      return {
        ...item,
        order,
        updated: item.updated || order !== item.order,
      };
    });


export const prepareItemToViewPayload = (payload: {
  items?: ToBeFixed[],
  viewParentId?: string | null,
  config: NavigationConfig ,
  structureIdPrefix?: string,
  contentTypeItems?: ContentTypeEntity[],
}): ToBeFixed[] => {

  const {
    items = [],
    viewParentId = null,
    config,
    structureIdPrefix = '',
    contentTypeItems,
  } = payload;

  return reOrderItems(items.map((item, n) => {
    const viewId = uuid();
    const structureId = structureIdPrefix ? `${structureIdPrefix}.${n}` : n.toString();

    return {
      ...linkRelations({
        viewId,
        ...item,
        viewParentId,
        order: item.order || (n + 1),
        structureId,
        updated: item.updated || isNil(item.order),
      }, config, contentTypeItems),
      items: prepareItemToViewPayload({
        config,
        items: item.items,
        structureIdPrefix: structureId,
        viewParentId: viewId,
        contentTypeItems
      }),
    };
  }));
}

export const isContentTypeEligible = (uid: string, config: NavigationConfig): boolean => {
  const { allowedContentTypes = [], restrictedContentTypes = [] } = config;
  const isOneOfAllowedType = allowedContentTypes.filter(_ => uid.includes(_) || (uid === _)).length > 0;
  const isNoneOfRestricted = restrictedContentTypes.filter(_ => uid.includes(_) || (uid === _)).length === 0;
  return !!uid && isOneOfAllowedType && isNoneOfRestricted;
}