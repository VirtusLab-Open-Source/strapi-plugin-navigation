import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { find, get, first, isEmpty, isEqual, isNil, isString, isObject, sortBy } from 'lodash';
import { prop } from 'lodash/fp';
import { useFormik, FormikProps } from 'formik';

//@ts-ignore
import { ModalBody } from '@strapi/design-system/ModalLayout';
//@ts-ignore
import { Select, Option } from '@strapi/design-system/Select';
//@ts-ignore
import { Grid, GridItem } from '@strapi/design-system/Grid';
import { GenericInput } from '@strapi/helper-plugin';
//@ts-ignore
import { Button } from '@strapi/design-system/Button';

import { NavigationItemPopupFooter } from '../NavigationItemPopup/NavigationItemPopupFooter';
import { getDefaultCustomFields, navigationItemType } from '../../../../utils';
import { extractRelatedItemLabel } from '../../utils/parsers';
import * as formDefinition from './utils/form';
import { checkFormValidity } from '../../utils/form';
import { getTrad, getTradId } from '../../../../translations';
import { assertString, Audience, Effect, NavigationItemAdditionalField, NavigationItemType, ToBeFixed } from '../../../../../../types';
import { ContentTypeSearchQuery, NavigationItemFormData, NavigationItemFormProps, RawFormPayload, SanitizedFormPayload, Slugify } from './types';
import AdditionalFieldInput from '../../../../components/AdditionalFieldInput';
import { getMessage, ResourceState } from '../../../../utils';
import { Id } from 'strapi-typed';
import { GenericInputOnChangeInput } from '../../utils/types';

const NavigationItemForm: React.FC<NavigationItemFormProps> = ({
  config,
  availableLocale,
  isLoading: isPreloading,
  inputsPrefix,
  data,
  contentTypes = [],
  contentTypeEntities = [],
  usedContentTypeEntities = [],
  availableAudience = [],
  additionalFields = [],
  contentTypesNameFields = {},
  onSubmit,
  onCancel,
  getContentTypeEntities,
  usedContentTypesData,
  appendLabelPublicationStatus = appendLabelPublicationStatusFallback,
  locale,
  readNavigationItemFromLocale,
  slugify,
  permissions = {},
}) => {
  const [isLoading, setIsLoading] = useState(isPreloading);
  const [hasBeenInitialized, setInitializedState] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [hasChanged, setChangedState] = useState(false);
  const [contentTypeSearchQuery, setContentTypeSearchQuery] = useState<ContentTypeSearchQuery>(undefined);
  const { canUpdate } = permissions;
  const formik: FormikProps<RawFormPayload> = useFormik<RawFormPayload>({
    initialValues: formDefinition.defaultValues,
    onSubmit: loadingAware(
      async (payload) => onSubmit(
        await sanitizePayload(slugify, payload, data)
      ),
      setIsLoading
    ),
    validate: loadingAware(
      async (values) => checkFormValidity(
        await sanitizePayload(slugify, values, {}),
        formDefinition.schemaFactory(isSingleSelected, additionalFields)
      ),
      setIsLoading
    ),
    validateOnChange: false,
  });
  const initialRelatedTypeSelected = get(data, 'relatedType.value');
  const relatedTypeSelectValue = formik.values.relatedType;
  const relatedSelectValue = formik.values.related;
  const isI18nBootstrapAvailable = !!(config.i18nEnabled && availableLocale && availableLocale.length);
  const availableLocaleOptions = useMemo(() => availableLocale.map((locale, index) => ({
    key: `${locale}-${index}`,
    value: locale,
    label: locale,
    metadatas: {
      intlLabel: {
        id: `i18n.locale.${locale}`,
        defaultMessage: locale,
      },
      hidden: false,
      disabled: false,
    },
  })), [availableLocale]);

  const relatedFieldName = `${inputsPrefix}related`;

  if (!hasBeenInitialized && !isEmpty(data)) {
    setInitializedState(true);
    formik.setValues({
      type: get(data, "type", formDefinition.defaultValues.type),
      related: get(data, "related.value", formDefinition.defaultValues.related),
      relatedType: get(data, "relatedType.value", formDefinition.defaultValues.relatedType),
      audience: get(data, "audience", formDefinition.defaultValues.audience).map((item: Audience | Id) => isObject(item) ? item.id.toString() : item.toString()),
      additionalFields: getDefaultCustomFields({
        additionalFields,
        customFieldsValues: get(data, "additionalFields", [] as ToBeFixed),
        defaultCustomFieldsValues: formDefinition.defaultValues.additionalFields
      }),
      menuAttached: get(data, "menuAttached", formDefinition.defaultValues.menuAttached),
      path: get(data, "path", formDefinition.defaultValues.path),
      externalPath: get(data, "externalPath", formDefinition.defaultValues.externalPath),
      title: get(data, "title", formDefinition.defaultValues.title),
      updated: formDefinition.defaultValues.updated,
    });
  }

  const audienceOptions = useMemo(() => availableAudience.map((item) => ({
    value: get(item, 'id', " "),
    label: get(item, 'name', " "),
  })), [availableAudience]);

  const generatePreviewPath = () => {
    if (!isExternal) {
      const itemPath = isEmpty(formik.values.path) || formik.values.path === '/'
        ? getDefaultPath()
        : formik.values.path || "";
      
      const value = `${data.levelPath !== '/' ? `${data.levelPath}` : ''}/${itemPath}`;

      return {
        id: getTradId('popup.item.form.type.external.description'),
        defaultMessage: '',
        values: { value }
      }
    }

    return undefined;
  };

  const getDefaultTitle =
    useCallback((related: string | undefined, relatedType: string | undefined, isSingleSelected: boolean) => {
      let selectedEntity;
      if (isSingleSelected) {
        selectedEntity = contentTypeEntities.find(_ => (_.uid === relatedType) || (_.__collectionUid === relatedType));
        if (!selectedEntity) {
          return contentTypes.find(_ => _.uid === relatedType)?.label
        }
      } else {
        selectedEntity = {
          ...contentTypeEntities.find(_ => _.id === related),
          __collectionUid: relatedType
        };
      }
      return extractRelatedItemLabel(selectedEntity, contentTypesNameFields, { contentTypes });
    }, [contentTypeEntities, contentTypesNameFields, contentTypes]);

  const sanitizePayload = async (slugify: Slugify, payload: RawFormPayload, data: Partial<NavigationItemFormData>): Promise<SanitizedFormPayload> => {
    const { related, relatedType, menuAttached, type, ...purePayload } = payload;
    const relatedId = related;
    const singleRelatedItem = isSingleSelected ? first(contentTypeEntities) : undefined;
    const relatedCollectionType = relatedType;
    const title = !!payload.title?.trim()
      ? payload.title
      : getDefaultTitle(related, relatedType, isSingleSelected)
    const uiRouterKey = await generateUiRouterKey(slugify, title, relatedId, relatedCollectionType);

    return {
      ...data,
      ...purePayload,
      title,
      type,
      menuAttached: isNil(menuAttached) ? false : menuAttached,
      path: type !== navigationItemType.EXTERNAL ? purePayload.path || getDefaultPath() : undefined,
      externalPath: type === navigationItemType.EXTERNAL ? purePayload.externalPath : undefined,
      related: type === navigationItemType.INTERNAL ? relatedId : undefined,
      relatedType: type === navigationItemType.INTERNAL ? relatedCollectionType : undefined,
      isSingle: isSingleSelected,
      singleRelatedItem,
      uiRouterKey,
    };
  };

  const onChange = ({ name, value }: { name: string, value: unknown }) => {
    formik.setValues(prevState => ({
      ...prevState,
      updated: true,
      [name]: value,
    }));

    if (name === "related" && relatedTypeSelectValue && autoSync) {
      const { contentTypesNameFields, pathDefaultFields } = config;
      const selectedRelated =  contentTypeEntities.find(({ id, __collectionUid }) =>
        `${id}` === `${value}` && __collectionUid === relatedTypeSelectValue
      );
      const newPath = pathDefaultFields[relatedTypeSelectValue]?.reduce<null | string>((acc, field) => {
        return acc ? acc : selectedRelated?.[field] as string | null;
      }, null);
      const newTitle = (contentTypesNameFields[relatedTypeSelectValue] ?? []).concat(contentTypesNameFields.default || []).reduce<null | string>((acc, field) => {
        return acc ? acc : selectedRelated?.[field] as string | null;
      }, null);
      const batch = [];

      if (newPath) {
        batch.push({ name: "path", value: newPath });
      }

      if (newTitle) {
        batch.push({ name: "title", value: newTitle });
      }

      batch.forEach((next, i) => {
        setTimeout(() => {
          onChange(next);
        }, i * 100);
      });
    }
    
    if (name === "type") {
      formik.setErrors({});
    }
    if (!hasChanged) {
      setChangedState(true);
    }
  };

  const getDefaultPath: () => string = useCallback(() => {
    if (formik.values.type !== "INTERNAL") return "";
    assertString(relatedTypeSelectValue);

    const pathDefaultFields = get(config, ["pathDefaultFields", relatedTypeSelectValue], []);
    if (isEmpty(formik.values.path) && !isEmpty(pathDefaultFields)) {
      const selectedEntity = isSingleSelected
        ? first(contentTypeEntities)
        : contentTypeEntities.find(i => String(i.id) === relatedSelectValue);
      const pathDefaultValues = pathDefaultFields
        .map((field) => get(selectedEntity, field, ""))
        .filter(value => !isNil(value) && String(value).match(/^\S+$/));
      return String(first(pathDefaultValues) || "");
    }
    return "";
  }, [relatedTypeSelectValue, formik, config]);

  const onAudienceChange = useCallback((value: string) => {
    onChange({ name: "audience", value });
  }, [onChange]);

  const onAdditionalFieldChange = (name: string, newValue: string | boolean | string[], fieldType: string) => {
    const fieldsValue = formik.values.additionalFields;
    const value = {
      ...fieldsValue,
      [name]: fieldType === "media" && newValue ? JSON.stringify(newValue) : newValue 
    }
    onChange({
      name: "additionalFields",
      value,
    });
  }

  const generateUiRouterKey = async (slugify: Slugify, title: string, related?: string, relatedType?: string): Promise<string | undefined> => {
    if (title) {
      return isString(title) && !isEmpty(title) ? await slugify(title).then(prop("slug")) : undefined;
    } else if (related) {
      const relationTitle = extractRelatedItemLabel({
        ...contentTypeEntities.find(_ => String(_.id) === String(related)),
        __collectionUid: relatedType
      }, contentTypesNameFields, { contentTypes });
      return isString(relationTitle) && !isEmpty(relationTitle) ? await slugify(relationTitle).then(prop("slug")) : undefined;
    }
    return undefined;
  };

  const isSingleSelected = useMemo(
    () => relatedTypeSelectValue ? contentTypes.find(_ => _.uid === relatedTypeSelectValue)?.isSingle || false : false,
    [relatedTypeSelectValue, contentTypes],
  );

  const navigationItemTypeOptions = (Object.keys(navigationItemType) as NavigationItemType[]).map((key) => {
    const value = navigationItemType[key].toLowerCase();
    return {
      key,
      value: navigationItemType[key],
      metadatas: {
        intlLabel: {
          id: getTradId(`popup.item.form.type.${value}.label`),
          defaultMessage: getTradId(`popup.item.form.type.${value}.label`),
        },
        hidden: false,
        disabled: false,
      }
    }
  });

  // TODO?: useMemo
  const relatedSelectOptions = sortBy(contentTypeEntities
    .filter((item) => {
      const usedContentTypeEntitiesOfSameType = usedContentTypeEntities
        .filter(uctItem => relatedTypeSelectValue === uctItem.__collectionUid);
      return !find(usedContentTypeEntitiesOfSameType, uctItem => (item.id === uctItem.id && uctItem.id !== formik.values.related));
    })
    .map((item) => {
      const label = appendLabelPublicationStatus(
        extractRelatedItemLabel({
          ...item,
          __collectionUid: get(relatedTypeSelectValue, 'value', relatedTypeSelectValue),
        }, contentTypesNameFields, { contentTypes }),
        item
      );
      return ({
        key: get(item, 'id').toString(),
        metadatas: {
          intlLabel: {
            id: label || `${item.__collectionUid} ${item.id}`,
            defaultMessage: label || `${item.__collectionUid} ${item.id}`,
          },
          hidden: false, 
          disabled: false,
        },
        value: item.id.toString(),
        label: label,
      })
    }), item => item.metadatas.intlLabel.id);

  const isExternal = formik.values.type === navigationItemType.EXTERNAL;
  const pathSourceName = isExternal ? 'externalPath' : 'path';

  const submitDisabled =
    (formik.values.type === navigationItemType.INTERNAL && !isSingleSelected && isNil(formik.values.related)) || isLoading;

  const onChangeRelatedType = ({ target: { name, value } }: { target: { name: string, value: unknown } }) => {
    const relatedTypeBeingReverted = data.relatedType && (data.relatedType.value === get(value, 'value', value));
    setContentTypeSearchQuery(undefined);
    formik.setValues(prevState => ({
      ...prevState,
      updated: true,
      related: relatedTypeBeingReverted ? data.related?.value : undefined,
      [name]: value,
    }));

    if (!hasChanged) {
      setChangedState(true);
    }
  };

  const relatedTypeSelectOptions = useMemo(
    () => sortBy(contentTypes
      .filter((contentType) => {
        if (contentType.isSingle) {
          if (relatedTypeSelectValue && [relatedTypeSelectValue, initialRelatedTypeSelected].includes(contentType.uid)) {
            return true;
          }
          return !usedContentTypesData.some((_: ToBeFixed) => _.__collectionUid === contentType.uid && _.__collectionUid !== formik.values.relatedType);
        }
        return true;
      })
      .map((item) => ({
        key: get(item, 'uid'),
        metadatas: {
          intlLabel: {
            id: get(item, 'label', get(item, 'name')),
            defaultMessage: get(item, 'label', get(item, 'name')),
          },
          disabled: false,
          hidden: false,
        },
        value: get(item, 'uid'),
        label: get(item, 'label', get(item, 'name')),
      })), item => item.metadatas.intlLabel.id),
    [contentTypes, usedContentTypesData, relatedTypeSelectValue],
  );

  const thereAreNoMoreContentTypes = isEmpty(relatedSelectOptions) && !contentTypeSearchQuery;

  useEffect(
    () => {
      const value = get(relatedSelectOptions, '0');
      if (isSingleSelected && relatedSelectOptions.length === 1 && !isEqual(value, relatedSelectValue)) {
        onChange({ name: "related", value });
      }
    },
    [isSingleSelected, relatedSelectOptions],
  );

  useEffect(() => {
    const value = formik.values.relatedType;
    if (value) {
      const item = find(
        contentTypes,
        (_) => _.uid === value,
      );
      if (item) {
        getContentTypeEntities({
          modelUID: item.uid,
          query: contentTypeSearchQuery,
          locale,
        }, item.plugin);
      }
    }
  }, [formik.values.relatedType, contentTypeSearchQuery]);

  const resetCopyItemFormErrors = () => {
    formik.setErrors({
      ...formik.errors,
      [itemLocaleCopyField]: null,
    });
  }
  const itemLocaleCopyField = `${inputsPrefix}i18n.locale`;
  const itemLocaleCopyValue = get(formik.values, itemLocaleCopyField);
  const onCopyFromLocale = useCallback(async (event: React.BaseSyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setIsLoading(true);
    resetCopyItemFormErrors();

    try {
      const result = await readNavigationItemFromLocale({
        locale: itemLocaleCopyValue,
        structureId: data.structureId
      });

      if (result.type === ResourceState.RESOLVED) {
        const { value: { related, ...rest } } = result;

        formik.setValues((prevState) => ({
          ...prevState,
          ...rest,
        }));

        if (related) {
          const relatedType = relatedTypeSelectOptions
            .find(({ value }) => value === related.__contentType)?.value;

          formik.setValues((prevState) => ({
            ...prevState,
            relatedType,
            [relatedFieldName]: related.id,
          }));
        }
      }

      if (result.type === ResourceState.ERROR) {
        formik.setErrors({
          ...formik.errors,
          [itemLocaleCopyField]: getMessage(result.errors[0]),
        });
      }
    } catch (error) {
      formik.setErrors({
        ...formik.errors,
        [itemLocaleCopyField]: getMessage('popup.item.form.i18n.locale.error.generic'),
      });
    }

    setIsLoading(false);
  }, [setIsLoading, formik.setValues, formik.setErrors]);

  const onChangeLocaleCopy = useCallback(({ target: { value } }: GenericInputOnChangeInput) => {
    resetCopyItemFormErrors();
    onChange({ name: itemLocaleCopyField, value })
  }, [onChange, itemLocaleCopyField]);

  const itemCopyProps = useMemo(() => ({
    intlLabel: {
      id: getTradId('popup.item.form.i18n.locale.label'),
      defaultMessage: 'Copy details from'
    },
    placeholder: {
      id: getTradId('popup.item.form.i18n.locale.placeholder'),
      defaultMessage: 'locale'
    },
  }), [getTradId]);

  useEffect(() => {
    const value = formik.values.relatedType;
    const fetchContentTypeEntities = async () => {
      if (value) {
        const item = find(
          contentTypes,
          (_) => _.uid === value,
        );
        if (item) {
          await getContentTypeEntities({
            modelUID: item.uid,
            query: contentTypeSearchQuery,
            locale,
          }, item.plugin);
        }
      }
    };
    fetchContentTypeEntities();
  }, [formik.values.relatedType, contentTypeSearchQuery]);

  return (
    <>
      <form>
        <ModalBody>
          <Grid gap={5} >
            <GridItem key="title" col={12}>
              <GenericInput
                intlLabel={getTrad('popup.item.form.title.label', 'Title')}
                name="title"
                placeholder={getTrad("e.g. Blog", 'e.g. Blog')}
                description={getTrad('popup.item.form.title.placeholder', 'e.g. Blog')}
                type="text"
                disabled={!canUpdate}
                error={formik.errors.title}
                onChange={({ target: { name, value } }: GenericInputOnChangeInput) => onChange({ name, value })}
                value={formik.values.title}
              />
            </GridItem>
            <GridItem key="type" col={4} lg={12}>
              <GenericInput
                intlLabel={getTrad('popup.item.form.type.label', 'Internal link')}
                name="type"
                options={navigationItemTypeOptions}
                type="select"
                disabled={!canUpdate}
                error={formik.errors.type}
                onChange={({ target: { name, value } }: GenericInputOnChangeInput) => onChange({ name, value })}
                value={formik.values.type}
              />
            </GridItem>
            <GridItem key="menuAttached" col={4} lg={12}>
              <GenericInput
                intlLabel={getTrad('popup.item.form.menuAttached.label', 'MenuAttached')}
                name="menuAttached"
                type="bool"
                error={formik.errors.menuAttached}
                onChange={({ target: { name, value } }: GenericInputOnChangeInput) => onChange({ name, value })}
                value={formik.values.menuAttached}
                disabled={!canUpdate || (config.cascadeMenuAttached ? !(data.isMenuAllowedLevel && data.parentAttachedToMenu) : false)}
              />
            </GridItem>
            <GridItem key="path" col={12}>
              <GenericInput
                intlLabel={getTrad(`popup.item.form.${pathSourceName}.label`, 'Path')}
                name={pathSourceName}
                placeholder={getTrad(`popup.item.form.${pathSourceName}.placeholder`, 'e.g. Blog')}
                type="text"
                disabled={!canUpdate}
                error={formik.errors[pathSourceName]}
                onChange={({ target: { name, value } }: GenericInputOnChangeInput) => onChange({ name, value })}
                value={formik.values[pathSourceName]}
                description={generatePreviewPath()}
              />
            </GridItem>
            {formik.values.type === navigationItemType.INTERNAL && (
              <>
                <GridItem key="menuAttached" col={12}>
                  <GenericInput
                    intlLabel={getTrad('popup.item.form.autoSync.label', 'Read fields from related')}
                    name="autoSync"
                    type="bool"
                    onChange={({ target: { value } }: GenericInputOnChangeInput) => setAutoSync(value)}
                    value={autoSync}
                  />
                </GridItem>
                <GridItem col={6} lg={12}>
                  <GenericInput
                    type="select"
                    intlLabel={getTrad('popup.item.form.relatedType.label', 'Related Type')}
                    placeholder={getTrad('popup.item.form.relatedType.placeholder', 'Related Type')}
                    name="relatedType"
                    error={formik.errors.relatedType}
                    onChange={onChangeRelatedType}
                    options={relatedTypeSelectOptions}
                    value={formik.values.relatedType}
                    disabled={isLoading || isEmpty(relatedTypeSelectOptions) || !canUpdate}
                    description={
                      !isLoading && isEmpty(relatedTypeSelectOptions)
                        ? getTrad('popup.item.form.relatedType.empty', 'There are no more content types')
                        : undefined
                    }
                  />
                </GridItem>
                {formik.values.relatedType && !isSingleSelected && (
                  <GridItem col={6} lg={12}>
                    <GenericInput
                      type="select"
                      intlLabel={getTrad('popup.item.form.related.label', 'Related')}
                      placeholder={getTrad('popup.item.form.related.label', 'Related')}
                      name="related"
                      error={formik.errors.related}
                      onChange={({ target: { name, value } }: GenericInputOnChangeInput) => onChange({ name, value })}
                      options={relatedSelectOptions}
                      value={formik.values.related}
                      disabled={isLoading || thereAreNoMoreContentTypes || !canUpdate}
                      description={
                        !isLoading && thereAreNoMoreContentTypes
                          ? {
                            id: getTradId('popup.item.form.related.empty'),
                            defaultMessage: 'There are no more entities',
                            values: { contentTypeName: relatedTypeSelectValue },
                          }
                          : undefined
                      }
                    />
                  </GridItem>
                )}
              </>
            )}
            {additionalFields.map((additionalField: NavigationItemAdditionalField) => {
              if (additionalField === 'audience') {
                return (
                  <GridItem key="audience" col={6} lg={12}>
                    <Select
                      id="audience"
                      placeholder={getMessage('popup.item.form.audience.placeholder')}
                      label={getMessage('popup.item.form.audience.label')}
                      onChange={onAudienceChange}
                      value={formik.values.audience}
                      hint={
                        !isLoading && isEmpty(audienceOptions)
                          ? getMessage('popup.item.form.audience.empty', 'There are no more audiences')
                          : undefined
                      }
                      multi
                      withTags
                      disabled={isEmpty(audienceOptions) || !canUpdate}
                    >
                      {audienceOptions.map(({ value, label }) => <Option key={value} value={value}>{label}</Option>)}
                    </Select>
                  </GridItem>
                )
              } else {
                return (
                  <GridItem key={additionalField.name} col={6} lg={12}>
                    <AdditionalFieldInput
                      field={additionalField}
                      isLoading={isLoading}
                      onChange={onAdditionalFieldChange}
                      value={get(formik.values, `additionalFields.${additionalField.name}`, null)}
                      disabled={!canUpdate}
                      error={get(formik.errors, `additionalFields.${additionalField.name}`, null) as ToBeFixed}
                    />
                  </GridItem>
                );
              }
            })}
          </Grid>
          {
            isI18nBootstrapAvailable ? (
              <Grid gap={5} paddingTop={5} >
                <GridItem col={6} lg={12}>
                  <GenericInput
                    {...itemCopyProps}
                    type="select"
                    name={itemLocaleCopyField}
                    error={get(formik.errors, itemLocaleCopyField)}
                    onChange={onChangeLocaleCopy}
                    options={availableLocaleOptions}
                    value={itemLocaleCopyValue}
                    disabled={isLoading || !canUpdate}
                  />
                </GridItem>
                {canUpdate && (<GridItem col={6} lg={12} paddingTop={6}>
                  <Button
                    variant="tertiary"
                    onClick={onCopyFromLocale}
                    disabled={isLoading || !itemLocaleCopyValue}
                  >
                    {getMessage('popup.item.form.i18n.locale.button')}
                  </Button>
                </GridItem>)}
              </Grid>
            ) : null
          }
        </ModalBody >
      </form>
      <NavigationItemPopupFooter handleSubmit={formik.handleSubmit} handleCancel={onCancel} submitDisabled={submitDisabled} canUpdate={canUpdate} />
    </>
  );
};

const appendLabelPublicationStatusFallback = () => "";

const loadingAware =
  <T, U>(action: (i: T) => U, isLoading: Effect<boolean>) =>
  async (input: T) => {
    try {
      isLoading(true);

      return await action(input);
    } catch (_) {
    } finally {
      isLoading(false);
    }
  };

export default NavigationItemForm;
