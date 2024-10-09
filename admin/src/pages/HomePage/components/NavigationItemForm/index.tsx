import { useNotification } from '@strapi/strapi/admin';
import { isEmpty, isNil, sortBy } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { AnyEntity, Field } from '@sensinum/strapi-utils';

import {
  Box,
  Button,
  Divider,
  Grid,
  Modal,
  MultiSelect,
  MultiSelectOption,
  SingleSelect,
  SingleSelectOption,
  TextInput,
  Toggle,
} from '@strapi/design-system';

import { NavigationSchema } from '../../../../api/validators';
import { NavigationItemAdditionalField } from '../../../../schemas';
import { getTrad } from '../../../../translations';
import { Effect, VoidEffect } from '../../../../types';
import { RELATED_ITEM_SEPARATOR } from '../../../../utils/constants';
import {
  useConfig,
  useContentTypeItems,
  useCopyNavigationItemI18n,
  useNavigations,
} from '../../hooks';
import { extractRelatedItemLabel } from '../../utils';
import { AdditionalFieldInput } from '../AdditionalFieldInput';
import { NavigationItemPopupFooter } from '../NavigationItemPopup/NavigationItemPopupFooter';
import { ContentTypeEntity } from './types';
import { NavigationItemFormSchema, useNavigationItemForm } from './utils/form';
import { useSlug } from './utils/hooks';
import { generatePreviewPath, generateUiRouterKey } from './utils/properties';

export { ContentTypeEntity, GetContentTypeEntitiesPayload } from './types';
export { NavigationItemFormSchema } from './utils/form';

export type SubmitEffect = Effect<NavigationItemFormSchema>;

type NavigationItemFormProps = {
  appendLabelPublicationStatus: (label: string, entity: ContentTypeEntity, _: boolean) => string;
  current: Partial<NavigationItemFormSchema>;
  isLoading: boolean;
  locale: string;
  onCancel: VoidEffect;
  onSubmit: SubmitEffect;
  availableLocale: string[];
  permissions?: Partial<{ canUpdate: boolean }>;
  currentNavigation: Pick<NavigationSchema, 'id' | 'documentId' | 'localeCode'>;
};

const FALLBACK_ADDITIONAL_FIELDS: Array<NavigationItemAdditionalField> = [];

export const NavigationItemForm: React.FC<NavigationItemFormProps> = ({
  availableLocale,
  isLoading: isPreloading,
  current,
  onSubmit,
  onCancel,
  appendLabelPublicationStatus = appendLabelPublicationStatusFallback,
  locale,
  permissions = {},
  currentNavigation,
}) => {
  const { formatMessage } = useIntl();

  const [isLoading, setIsLoading] = useState(isPreloading);

  const { canUpdate } = permissions;

  const [isSingleSelected, setIsSingleSelected] = useState(false);

  const [itemLocaleCopyValue, setItemLocaleCopyValue] = useState<string>();

  const configQuery = useConfig();

  const availableAudiences = configQuery.data?.availableAudience ?? [];

  const contentTypes = configQuery.data?.contentTypes ?? [];

  const { control, watch, handleSubmit, setValue } = useNavigationItemForm({
    input: {
      isSingleSelected,
      additionalFields: configQuery.data?.additionalFields ?? FALLBACK_ADDITIONAL_FIELDS,
    },
    current: current as NavigationItemFormSchema,
  });

  const { toggleNotification } = useNotification();

  const copyItemFromLocaleMutation = useCopyNavigationItemI18n();

  const navigationsQuery = useNavigations();

  const submit = handleSubmit(async (payload): Promise<void> => {
    const title = !!payload.title.trim()
      ? payload.title
      : getDefaultTitle(payload?.related?.toString(), payload.relatedType, isSingleSelected);

    setIsLoading(true);

    const uiRouterKey = await generateUiRouterKey({
      slugify: slugifyMutation.mutateAsync,
      title,
      related: payload.related,
      relatedType: payload.relatedType,
    });

    slugifyMutation.reset();

    setIsLoading(false);

    if (!uiRouterKey) {
      toggleNotification({
        type: 'warning',
        message: formatMessage(getTrad('popup.item.form.uiRouter.unableToRender')),
      });
      return;
    }

    onSubmit(
      payload.type === 'INTERNAL'
        ? {
          ...payload,
          title,
          uiRouterKey,
        }
        : {
          ...payload,
          title,
          uiRouterKey,
        }
    );
  });

  const initialRelatedTypeSelected = current.relatedType;
  const [
    currentRelatedType,
    currentRelated,
    currentPath,
    currentType,
    currentTitle,
    autoSyncEnabled,
    currentAdditionalFields,
  ] = watch(['relatedType', 'related', 'path', 'type', 'title', 'autoSync', 'additionalFields']);

  const isExternal = currentType === 'EXTERNAL';

  const pathSourceName = isExternal ? 'externalPath' : 'path';

  const submitDisabled = (!isExternal && !isSingleSelected && isNil(currentRelated)) || isLoading;

  const contentTypeItemsQuery = useContentTypeItems({
    uid: currentRelatedType ?? '',
    locale,
  });

  const slugifyMutation = useSlug();

  const availableLocaleOptions = useMemo(
    () =>
      availableLocale.map((locale, index) => ({
        key: `${locale}-${index}`,
        value: locale,
        label: locale,
      })),
    [availableLocale]
  );

  const audienceOptions = useMemo(
    () =>
      availableAudiences.map((item) => ({
        value: item.documentId ?? 0,
        label: item.name ?? ' ',
      })),
    [availableAudiences]
  );

  const getDefaultTitle = useCallback(
    (related: string | undefined, relatedType: string | undefined, isSingleSelected: boolean) => {
      let selectedEntity;

      if (isSingleSelected) {
        selectedEntity = contentTypeItemsQuery.data?.find(
          (_) => _.uid === relatedType || _.__collectionUid === relatedType
        );

        if (!selectedEntity) {
          return contentTypes.find((_) => _.uid === relatedType)?.contentTypeName;
        }
      } else {
        const entity = contentTypeItemsQuery.data?.find(({ documentId }) => documentId === related);

        selectedEntity = {
          ...(entity || {
            documentId: null,
          }),
          __collectionUid: relatedType,
        };
      }
      return extractRelatedItemLabel(selectedEntity as AnyEntity, configQuery.data);
    },
    [contentTypeItemsQuery.data, configQuery.data, contentTypes]
  );

  const navigationItemTypeOptions = (['INTERNAL', 'EXTERNAL'] as const).map((key) => {
    return {
      key,
      value: key,
      label: formatMessage(getTrad(`popup.item.form.type.${key.toLowerCase()}.label`)),
    };
  });

  const relatedSelectOptions = sortBy(
    contentTypeItemsQuery.data?.map((item) => {
      const label = appendLabelPublicationStatus(
        extractRelatedItemLabel(
          {
            ...item,
            __collectionUid: currentRelatedType,
          },
          configQuery.data
        ),
        item,
        false
      );

      return {
        key: item?.documentId?.toString(),
        value: item?.documentId?.toString(),
        label: label,
      };
    }) ?? [],
    (item) => item.key
  );

  const relatedTypeSelectOptions = useMemo(
    () =>
      sortBy(
        configQuery.data?.contentTypes
          ?.filter((contentType) => {
            if (contentType.isSingle) {
              return !!(
                currentRelatedType &&
                [currentRelatedType, initialRelatedTypeSelected].includes(contentType.uid)
              );
            }

            return true;
          })
          .map((item) => {
            return {
              key: item.uid,
              value: item.uid,
              label: item.contentTypeName,
            };
          }),
        (item) => item.key
      ),
    [configQuery.data, currentRelatedType]
  );

  const thereAreNoMoreContentTypes = isEmpty(relatedSelectOptions);

  const onCopyFromLocale = useCallback(
    async (event: React.BaseSyntheticEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const source = navigationsQuery.data?.find(
        ({ localeCode }) => localeCode === itemLocaleCopyValue
      );

      if (source) {
        setIsLoading(true);

        copyItemFromLocaleMutation.mutate(
          {
            target: currentNavigation.documentId,
            structureId: current.structureId,
            source: source.documentId,
          },
          {
            onSuccess(data) {
              copyItemFromLocaleMutation.reset();

              const { type, externalPath, path, related, title, uiRouterKey } = data;
              const [contentType, documentId] = related?.split(RELATED_ITEM_SEPARATOR) ?? [];

              setValue('type', type);
              setValue('externalPath', externalPath ?? undefined);
              setValue('path', path ?? undefined);
              setValue('title', title);
              setValue('uiRouterKey', uiRouterKey);

              if (contentType && documentId) {
                setValue('related', documentId);
                setValue('relatedType', contentType);
              }
            },
            onSettled() {
              setIsLoading(false);
            },
          }
        );
      }
    },
    [setIsLoading, copyItemFromLocaleMutation, navigationsQuery]
  );

  useEffect(() => {
    if (currentRelatedType) {
      const relatedType = configQuery.data?.contentTypes.find(
        (contentType) => contentType.uid === currentRelatedType
      );

      if (relatedType) {
        setIsSingleSelected(relatedType.isSingle);

        if (relatedType.isSingle && contentTypeItemsQuery.data?.length) {
          const nextRelated = contentTypeItemsQuery.data[0];

          if (nextRelated) {
            setValue('related', nextRelated.documentId);
          }
        }
      }
    }
  }, [currentRelatedType, configQuery.data, contentTypeItemsQuery.data, setValue]);

  useEffect(() => {
    if (
      autoSyncEnabled &&
      currentType === 'INTERNAL' &&
      currentRelated &&
      currentRelatedType &&
      configQuery.data
    ) {
      const relatedItem = contentTypeItemsQuery.data?.find((item) => {
        return item.documentId === currentRelated;
      });

      if (relatedItem) {
        const { contentTypesNameFields, pathDefaultFields } = configQuery.data;

        const nextPath = pathDefaultFields[currentRelatedType]?.reduce<string | undefined>(
          (acc, field) => {
            return acc ? acc : relatedItem?.[field];
          },
          undefined
        );

        const nextTitle = (contentTypesNameFields[currentRelatedType] ?? [])
          .concat(contentTypesNameFields.default ?? [])
          .reduce<undefined | string>((acc, field) => {
            return acc ? acc : relatedItem?.[field];
          }, undefined);

        const batch: Array<{ name: keyof NavigationItemFormSchema; value: string }> = [];

        if (nextPath && nextPath !== currentPath) {
          batch.push({ name: 'path', value: nextPath });
        }

        if (nextTitle && nextTitle !== currentTitle) {
          batch.push({ name: 'title', value: nextTitle });
        }

        setTimeout(() => {
          batch.forEach((next) => {
            setValue(next.name as any, next.value);
          });
        }, 100);
      }
    }
  }, [
    currentTitle,
    currentPath,
    autoSyncEnabled,
    currentType,
    currentRelated,
    currentRelatedType,
    configQuery.data,
    contentTypeItemsQuery.data,
  ]);

  return (
    <>
      <Modal.Body>
        <Grid.Root gap={5}>
          <Grid.Item alignItems="flex-start" key="title" col={12}>
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange, name }, fieldState }) => (
                <Field
                  name={name}
                  label={formatMessage(getTrad('popup.item.form.title.label', 'Title'))}
                  error={fieldState.error?.message}
                  hint={formatMessage(getTrad('popup.item.form.title.placeholder', 'e.g. Blog'))}
                >
                  <TextInput
                    type="string"
                    disabled={!canUpdate || (autoSyncEnabled && currentType === 'INTERNAL')}
                    name={name}
                    onChange={onChange}
                    value={value}
                  />
                </Field>
              )}
            />
          </Grid.Item>

          <Grid.Item alignItems="flex-start" key="type" col={currentType === 'INTERNAL' ? 4 : 7} lg={12}>
            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange, name }, fieldState }) => (
                <Field
                  name={name}
                  label={formatMessage(getTrad('popup.item.form.type.label', 'Internal link'))}
                  error={fieldState.error?.message}
                  hint={formatMessage(getTrad('popup.item.form.title.placeholder', 'e.g. Blog'))}>
                  <SingleSelect
                    onChange={onChange}
                    value={value}
                    name={name}
                    disabled={!configQuery.data?.contentTypes.length || !canUpdate}
                    width="100%"
                  >
                    {navigationItemTypeOptions.map(({ key, label, value }) => (
                      <SingleSelectOption key={key} value={value}>
                        {label}
                      </SingleSelectOption>
                    ))}
                  </SingleSelect>
                </Field>
              )}
            />
          </Grid.Item>

          <Grid.Item alignItems="flex-start" key="menuAttached" col={currentType === 'INTERNAL' ? 4 : 5} lg={12}>
            <Controller
              control={control}
              name="menuAttached"
              render={({ field: { value, onChange, name }, fieldState }) => (
                <Field
                  name={name}
                  label={formatMessage(getTrad('popup.item.form.menuAttached.label', 'MenuAttached'))}
                  error={fieldState.error?.message}
                  hint={formatMessage(
                    getTrad(
                      'popup.item.form.menuAttached.placeholder',
                      'is menu item attached to menu'
                    )
                  )}>
                  <Toggle
                    name={name}
                    checked={value}
                    onChange={({
                      currentTarget: { checked },
                    }: {
                      currentTarget: { checked: boolean };
                    }) => {
                      onChange(checked);
                    }}
                    value={value}
                    onLabel="true"
                    offLabel="false"
                    disabled={
                      !canUpdate ||
                      (configQuery.data?.cascadeMenuAttached
                        ? !(current.isMenuAllowedLevel && current.parentAttachedToMenu)
                        : false)
                    }
                    width="100%"
                  />
                </Field>
              )}
            />
          </Grid.Item>

          {currentType === 'INTERNAL' && (
            <Grid.Item alignItems="flex-start" key="autoSync" col={4} lg={12}>
              <Controller
                control={control}
                name="autoSync"
                render={({ field: { value, onChange, name }, fieldState }) => (
                  <Field
                    name={name}
                    label={formatMessage(
                      getTrad('popup.item.form.autoSync.label', 'Read fields from related')
                    )}
                    error={fieldState.error?.message}>
                    <Toggle
                      name={name}
                      checked={value}
                      onChange={({
                        currentTarget: { checked },
                      }: {
                        currentTarget: { checked: boolean };
                      }) => {
                        onChange(checked);
                      }}
                      onLabel="Enabled"
                      offLabel="Disabled"
                    />
                  </Field>
                )}
              />
            </Grid.Item>

          )}

          <Grid.Item alignItems="flex-start" key={pathSourceName} col={12}>
            <Controller
              control={control}
              name={pathSourceName}
              render={({ field: { value, onChange, name }, fieldState }) => {
                const pathDefault = generatePreviewPath({
                  currentPath,
                  isExternal,
                  current,
                  currentType,
                  config: configQuery.data,
                  contentTypeItems: contentTypeItemsQuery.data,
                  currentRelated,
                  currentRelatedType,
                  isSingleSelected,
                });

                return (
                  <Field
                    name={name}
                    label={formatMessage(getTrad(`popup.item.form.${pathSourceName}.label`, 'Path'))}
                    error={fieldState.error?.message}
                    hint={[
                      formatMessage(
                        getTrad(`popup.item.form.${pathSourceName}.placeholder`, 'e.g. Blog')
                      ),
                      pathDefault
                        ? formatMessage(getTrad('popup.item.form.type.external.description'), {
                          value: pathDefault,
                        })
                        : '',
                    ].join(' ')}>
                    <TextInput
                      disabled={!canUpdate}
                      name={name}
                      onChange={onChange}
                      value={value}
                      width="100%"
                    />
                  </Field>
                );
              }}
            />
          </Grid.Item>

          {currentType === 'INTERNAL' && (
            <>
              <Grid.Item alignItems="flex-start" col={6} lg={12}>
                <Controller
                  control={control}
                  name="relatedType"
                  render={({ field: { value, onChange, name }, fieldState }) => (
                    <Field
                      name={name}
                      label={formatMessage(getTrad('popup.item.form.relatedType.label', 'Related Type'))}
                      error={fieldState.error?.message}
                      hint={
                        !isLoading && isEmpty(relatedTypeSelectOptions)
                          ? formatMessage(
                            getTrad(
                              'popup.item.form.relatedType.empty',
                              'There are no more content types'
                            )
                          )
                          : undefined
                      }>
                      <SingleSelect
                        name={name}
                        onChange={(nextType: string) => {
                          onChange(nextType);

                          setValue('related', undefined);
                        }}
                        value={value}
                        disabled={!configQuery.data?.contentTypes.length || !canUpdate}
                        width="100%"
                      >
                        {configQuery.data?.contentTypes.map((contentType) => (
                          <SingleSelectOption key={contentType.uid} value={contentType.uid}>
                            {contentType.contentTypeName}
                          </SingleSelectOption>
                        ))}
                      </SingleSelect>
                    </Field>
                  )}
                />
              </Grid.Item>

              {currentRelatedType && !isSingleSelected && (
                <Grid.Item alignItems="flex-start" col={6} lg={12}>
                  <Controller
                    control={control}
                    name="related"
                    render={({ field: { value, onChange, name }, fieldState }) => (
                      <Field
                        name={name}
                        label={formatMessage(getTrad('popup.item.form.related.label', 'Related'))}
                        error={fieldState.error?.message}
                        hint={
                          !isLoading && thereAreNoMoreContentTypes
                            ? formatMessage(
                              getTrad(
                                'popup.item.form.related.empty',
                                'There are no more entities'
                              ),
                              { contentTypeName: currentRelatedType }
                            )
                            : undefined
                        }>
                        <SingleSelect
                          name={name}
                          onChange={onChange}
                          value={value}
                          options={relatedSelectOptions}
                          disabled={isLoading || thereAreNoMoreContentTypes || !canUpdate}
                          width="100%"
                        >
                          {relatedSelectOptions.map(({ key, label, value }) => (
                            <SingleSelectOption key={key} value={value}>
                              {label}
                            </SingleSelectOption>
                          ))}
                        </SingleSelect>
                      </Field>
                    )}
                  />
                </Grid.Item>
              )}
            </>
          )}

          {!isEmpty(configQuery.data?.additionalFields) && (<Grid.Item col={12} lg={12}>
            <Divider width="100%" />
          </Grid.Item>)}

          {configQuery.data?.additionalFields.map(
            (additionalField: NavigationItemAdditionalField, index: number) => {
              if (additionalField === 'audience') {
                return (
                  <Grid.Item alignItems="flex-start" key="audience" col={6} lg={12}>
                    <Controller
                      control={control}
                      name="audience"
                      render={({ field: { value, onChange, name }, fieldState }) => (
                        <Field
                          name={name}
                          label={formatMessage(getTrad('popup.item.form.audience.label'))}
                          error={fieldState.error?.message}
                          hint={
                            !isLoading && isEmpty(audienceOptions)
                              ? formatMessage(
                                getTrad('popup.item.form.title.placeholder', 'e.g. Blog')
                              )
                              : undefined
                          }>
                          <MultiSelect
                            name={name}
                            value={value}
                            onChange={onChange}
                            width="100%"
                          >
                            {audienceOptions.map(({ value, label }) => (
                              <MultiSelectOption key={value} value={value}>
                                {label}
                              </MultiSelectOption>
                            ))}
                          </MultiSelect>
                        </Field>
                      )}
                    />
                  </Grid.Item>
                );
              } else {
                return (
                  <Grid.Item alignItems="flex-start" key={additionalField.name} col={6} lg={12}>
                    <Controller
                      control={control}
                      name={`additionalFields.${additionalField.name}`}
                      render={({ field: { value, onChange, name }, fieldState }) => (
                          <Field
                            name={name}
                            label={additionalField.label}
                            error={fieldState.error?.message}>
                            <AdditionalFieldInput
                              name={name}
                              field={additionalField}
                              isLoading={isLoading}
                              onChange={onChange}
                              value={value}
                              disabled={!canUpdate}
                            />
                          </Field>
                        )
                      }
                    />
                  </Grid.Item>
                );
              }
            }
          )}
        </Grid.Root>

        {availableLocaleOptions && (availableLocaleOptions.length > 1) && (
          <>
            <Divider marginTop={5} marginBottom={5} />

            <Grid.Root gap={5}>
              <Grid.Item alignItems="flex-start" col={6} lg={12}>
                <Field 
                    name="i18n.locale"
                    label={formatMessage(getTrad('popup.item.form.i18n.locale.label', 'Copy details from'))}>
                  <SingleSelect
                    name="i18n.locale"
                    onChange={setItemLocaleCopyValue}
                    value={itemLocaleCopyValue}
                    disabled={isLoading || !canUpdate}
                    placeholder={formatMessage(
                      getTrad('popup.item.form.i18n.locale.placeholder', 'locale')
                    )}
                  >
                    {availableLocaleOptions.map(({ key, label, value }) => (
                      <SingleSelectOption key={key} value={value}>
                        {label}
                      </SingleSelectOption>
                    ))}
                  </SingleSelect>
                </Field>
              </Grid.Item>

              {canUpdate && (
                <Grid.Item alignItems="flex-start" col={6} lg={12} paddingTop={6}>
                  <Box>
                    <Button
                      variant="tertiary"
                      onClick={onCopyFromLocale}
                      disabled={isLoading || !itemLocaleCopyValue}
                    >
                      {formatMessage(getTrad('popup.item.form.i18n.locale.button'))}
                    </Button>
                  </Box>
                </Grid.Item>
              )}
            </Grid.Root>
          </>
        )}

      </Modal.Body>

      <NavigationItemPopupFooter
        handleSubmit={submit}
        handleCancel={onCancel}
        submitDisabled={submitDisabled}
        canUpdate={canUpdate}
      />
    </>
  );
};

const appendLabelPublicationStatusFallback = () => '';
