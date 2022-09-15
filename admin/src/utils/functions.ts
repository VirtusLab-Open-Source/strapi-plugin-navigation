import { find, get, isArray, isEmpty, isNumber, isObject, isString, last, omit, orderBy, isNil } from 'lodash';
import { v4 as uuid, validate as isUuid } from 'uuid';
import { useIntl } from 'react-intl';
import { NavigationConfig, NavigationItemAdditionalField, NavigationItemAdditionalFieldValues, NavigationItemEntity, NestedStructure, ToBeFixed } from '../../../types';
import { defaultValues as navigationItemFormDefaults } from '../pages/View/components/NavigationItemForm/utils/form';
import pluginId from '../pluginId';
import { navigationItemType } from './enums';

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


// TODO: [@ltsNotMike] Remove ts ignore and type these lines 
const reOrderItems = (items = []) =>
  orderBy(items, ['order'], ['asc'])
    .map((item, n) => {
      const order = n + 1;
      return {
        // @ts-ignore
        ...item,
        order,
        // @ts-ignore
        updated: item.updated || order !== item.order,
      };
    });


// @ts-ignore
export const prepareItemToViewPayload = (payload: {
  items?: NestedStructure<NavigationItemEntity<ToBeFixed>>[],
  viewParentId?: string | null,
  config: NavigationConfig,
  structureIdPrefix?: string,
}) => {

  const {
    items = [],
    viewParentId = null,
    config,
    structureIdPrefix = '',
  } = payload;

  // @ts-ignore
  return reOrderItems(items.map((item, n) => {
    const viewId = uuid();
    const structureId = structureIdPrefix ? `${structureIdPrefix}.${n}` : n.toString();

    return {
      ...linkRelations({
        viewId,
        viewParentId,
        // @ts-ignore
        ...item,
        // @ts-ignore
        order: item.order || (n + 1),
        structureId,
        // @ts-ignore
        updated: item.updated || isNil(item.order),
      }, config),
      items: prepareItemToViewPayload({
        config,
        // @ts-ignore
        items: item.items,
        structureIdPrefix: structureId,
        // @ts-ignore
        viewId,
      }),
    };
  }));
}


// TODO: [@ltsnotmike remove ts-ignore from this file completly and type necessery elements
// @ts-ignore
const linkRelations = (item, config) => {
  const { contentTypeItems = [], contentTypes = [] } = config;
  const { type, related, relatedType, relatedRef, isSingle } = item;
  let relation = {
    related: undefined,
    relatedRef: undefined,
    relatedType: undefined,
  };

  if (isSingle && relatedType) {
    // @ts-ignore
    const relatedContentType = contentTypes.find(_ => relatedType === _.uid) || {};
    const { singleRelatedItem = {} } = item;
    return {
      ...item,
      relatedType,
      relatedRef: {
        ...singleRelatedItem,
        ...omit(relatedContentType, 'collectionName'),
        isSingle,
        __collectionUid: relatedContentType.uid,
      },
    };
  }

  // we got empty array after remove object in relation
  // from API we got related as array but on edit it is primitive type
  if ((type !== navigationItemType.INTERNAL) || !related || (isObject(related) && isEmpty(related))) {
    return {
      ...item,
      ...relation,
    };
  }

  const relatedItem = isArray(related) ? last(related) : related;

  const parsedRelated = Number(related);
  const relatedId = isNaN(parsedRelated) ? related : parsedRelated;

  const relationNotChanged = relatedRef && relatedItem ? relatedRef.id === relatedItem : false;

  if (relationNotChanged) {
    return item;
  }

  const shouldFindRelated = (isNumber(related) || isUuid(related) || isString(related)) && !relatedRef;
  const shouldBuildRelated = !relatedRef || (relatedRef && (relatedRef.id !== relatedId));

  if (shouldBuildRelated && !shouldFindRelated) {
    const relatedContentType = find(contentTypes,
      // @ts-ignore
      ct => ct.uid === relatedItem.__contentType, {});
    // @ts-ignore
    const { uid, labelSingular, isSingle } = relatedContentType;
    relation = {
      related: relatedItem.id,
      relatedRef: {
        ...relatedItem,
        __collectionUid: uid,
        isSingle,
        labelSingular,
      },
      relatedType: uid,
    };
  } else if (shouldFindRelated) {
    const relatedRef = find(contentTypeItems, cti => cti.id === relatedId);
    const relatedContentType = find(contentTypes, ct => ct.uid === relatedType);
    const { uid, contentTypeName, labelSingular, isSingle } = relatedContentType;

    // @ts-ignore
    relation = {
      relatedRef: {
        ...relatedRef,
        __collectionUid: uid,
        __contentType: contentTypeName,
        isSingle,
        labelSingular,
      },
    };
  } else {
    return {
      ...item,
    };
  }

  return {
    ...item,
    ...relation,
  };
};