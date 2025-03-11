
import { Field, usePluginTheme } from "@sensinum/strapi-utils";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { get, isEmpty, isNaN, isNil, isObject, isString, set, sortBy } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import {
  Accordion,
  Box,
  Button,
  DesignSystemProvider,
  Flex,
  Grid,
  MultiSelect,
  MultiSelectOption,
  NumberInput,
  Toggle,
  Typography,
} from '@strapi/design-system';

import { Check, Play, Typhoon } from '@strapi/icons';
import { Form, Layouts, Page, useAuth } from '@strapi/strapi/admin';

import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { RestartAlert } from '../../components/RestartAlert';
import { NavigationItemCustomField } from '../../schemas';
import { FormChangeEvent, FormItemErrorSchema } from '../../types';
import { getTrad } from '../../utils/getTranslation';
import pluginPermissions from '../../utils/permissions';
import CustomFieldModal from './components/CustomFieldModal';
import CustomFieldTable from './components/CustomFieldTable';
import {
  UiFormSchema,
  uiFormSchema,
  useConfig,
  useContentTypes,
  useRestart,
  useRestoreConfig,
  useSaveConfig,
} from './hooks';
import { RestartStatus } from './types';
import { isContentTypeEligible, waitForServerRestart } from './utils';

const BOX_DEFAULT_PROPS = {
  background: 'neutral0',
  hasRadius: true,
  shadow: 'filterShadow',
  padding: 6,
};

const queryClient = new QueryClient();

const Inner = () => {
  const configQuery = useConfig();
  const contentTypesQuery = useContentTypes();
  const configSaveMutation = useSaveConfig();
  const restoreMutation = useRestoreConfig();
  const restartMutation = useRestart();

  const { formatMessage } = useIntl();

  const [restartStatus, setRestartStatus] = useState<RestartStatus>({ required: false });
  const [isReloading, setIsReloading] = useState(false);

  const readPermissions = useAuth('SettingsPage', (state) => state.permissions);
  const hasSettingsPermissions = useMemo(() => {
    return !!readPermissions.find(({ action }) => action === pluginPermissions.settings[0].action);
  }, [readPermissions]);
  const hasSettingsReadPermissions = useMemo(() => {
    return !!readPermissions.find(({ action }) => action === pluginPermissions.access[0].action);
  }, [readPermissions]);

  const isLoading =
    configQuery.isPending ||
    contentTypesQuery.isPending ||
    configSaveMutation.isPending ||
    restartMutation.isPending ||
    restoreMutation.isPending;

  const [formValue, setFormValue] = useState<UiFormSchema>({} as UiFormSchema);
  const [formError, setFormError] = useState<FormItemErrorSchema<UiFormSchema>>();
  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState<boolean>(false);
  const [isRestorePopupOpen, setIsRestorePopupOpen] = useState<boolean>(false);
  const [customFieldSelected, setCustomFieldSelected] = useState<NavigationItemCustomField | null>(
    null
  );

  const {
    contentTypesNameFields: contentTypeNameFieldsCurrent,
    contentTypes: contentTypesCurrent,
    additionalFields,
    preferCustomContentTypes,
  } = formValue;

  const handleChange = (eventOrPath: FormChangeEvent, value?: any, nativeOnChange?: (eventOrPath: FormChangeEvent, value?: any) => void) => {
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

      return nativeOnChange(eventOrPath as FormChangeEvent, fieldValue);
    }
  };

  const setFormValueItem = (path: string, value: any) => {
    setFormValue((current) =>
      set(
        {
          ...current,
        },
        path,
        value
      )
    );
  };

  const renderError = (error: string): string | undefined => {
    const errorOccurence = get(formError, error);
    if (errorOccurence) {
      return formatMessage(getTrad(error));
    }
    return undefined;
  };

  const handleOpenCustomFieldModal = (field: NavigationItemCustomField | null) => {
    setCustomFieldSelected(field);
    setIsCustomFieldModalOpen(true);
  };

  const handleRemoveCustomField = (field: NavigationItemCustomField) => {
    const filteredFields = additionalFields.filter((f) =>
      typeof f !== 'string' ? f.name !== field.name : true
    );

    setFormValueItem('additionalFields', filteredFields);

    setCustomFieldSelected(null);
    setIsCustomFieldModalOpen(false);
  };

  const handleToggleCustomField = (current: NavigationItemCustomField) => {
    const next = { ...current, enabled: !current.enabled };

    const nextAdditionalFields = additionalFields.map((field) =>
      typeof field !== 'string' && current.name === field.name ? next : field
    );

    setFormValueItem('additionalFields', nextAdditionalFields);
  };

  const handleSubmitCustomField = (next: NavigationItemCustomField) => {
    const hasFieldAlready = !!additionalFields.find((field) =>
      typeof field !== 'string' ? field.name === next.name : false
    );
    const nextAdditionalFields = hasFieldAlready
      ? additionalFields.map((field) =>
        typeof field !== 'string' && next.name === field.name ? next : field
      )
      : [...additionalFields, next];

    setFormValueItem('additionalFields', nextAdditionalFields);

    setCustomFieldSelected(null);
    setIsCustomFieldModalOpen(false);
  };

  const allContentTypes = !isLoading
    ? sortBy(
      Object.values(contentTypesQuery.data ?? [])
        .filter(({ uid }) =>
          isContentTypeEligible(uid, {
            allowedContentTypes: configQuery.data?.allowedContentTypes,
            restrictedContentTypes: configQuery.data?.restrictedContentTypes,
            preferCustomContentTypes,
            contentTypes: contentTypesCurrent,
          })
        )
        .map((ct) => {
          const type = contentTypesQuery.data?.find((_) => _.uid === ct.uid);

          if (type) {
            const { isDisplayed: available, kind } = type;
            const isSingle = kind === 'singleType';

            return {
              ...ct,
              available,
              isSingle,
            };
          }
          return ct;
        }),
      (ct) => ct.info.displayName
    )
    : [];

  const submit = (e: React.MouseEvent, rawData: unknown) => {
    const { success, data, error } = uiFormSchema.safeParse(rawData);

    if (success) {
      configSaveMutation.mutate(data, {
        onSuccess() {
          setRestartStatus({ required: true });

          configSaveMutation.reset();
        },
      });
    } else if (error) {
      setFormError(error.issues.reduce((acc, err) => {
        return {
          ...acc,
          [err.path.join('.')]: err.message
        }
      }, {} as FormItemErrorSchema<UiFormSchema>));
      console.warn('Invalid form data', error);
    }
  };

  const onPopupClose = async (isConfirmed: boolean) => {
    setIsRestorePopupOpen(false);

    if (isConfirmed) {
      restoreMutation.mutate();

      setRestartStatus({ required: true });
    }
  };

  const handleRestart = async () => {
    restartMutation.mutate(undefined, {
      onSuccess() {
        setIsReloading(true);

        waitForServerRestart(true).then((isReady) => {
          if (isReady) {
            window.location.reload();
          }
        });
      },
      onError() {
        setRestartStatus({ required: false });
      },
    });

  };

  const handleRestartDiscard = () => setRestartStatus({ required: false });

  const mapConfigDataToArray = (properties: Record<string, string[]>, contentTypes: string[]) => {
    const contentTypeProperties = contentTypes.map(key => ({
      key,
      fields: properties[key] ?? []
    }))

    const restProperties = Object.entries(properties)
      .filter(([key, _]) => !contentTypes.includes(key))
      .map(([key, fields]) => ({
        key,
        fields
      }))

    return restProperties.concat(contentTypeProperties)
  }

  useEffect(() => {
    if (configQuery.data) {
      const { additionalFields, contentTypes, contentTypesNameFields, contentTypesPopulate, pathDefaultFields } = configQuery.data;
      setFormValue({
        ...configQuery.data,
        additionalFields: additionalFields.filter((field) => typeof field !== 'string'),
        audienceFieldChecked: additionalFields.includes('audience'),
        contentTypesNameFields: mapConfigDataToArray(contentTypesNameFields, contentTypes),
        contentTypesPopulate: mapConfigDataToArray(contentTypesPopulate, contentTypes),
        pathDefaultFields: mapConfigDataToArray(pathDefaultFields, contentTypes),
      } as UiFormSchema);
    }
  }, [configQuery.data]);

  if (!hasSettingsPermissions) {
    return <Page.NoPermissions />;
  }

  if (isLoading || isReloading) {
    return <Page.Loading />;
  }

  return (
    <Layouts.Root>
      <Page.Main>
        <Page.Title children={formatMessage(getTrad('pages.settings.header.title'))} />
        <Layouts.Header
          title={formatMessage(getTrad('pages.settings.header.title'))}
          subtitle={formatMessage(getTrad('pages.settings.header.description'))}
          primaryAction={
            hasSettingsReadPermissions ? (
              <Button
                startIcon={<Check />}
                disabled={restartStatus.required}
                onClick={(e: React.MouseEvent) => submit(e, formValue)}
              >
                {formatMessage(getTrad('pages.settings.actions.submit'))}
              </Button>
            ) : null
          }
        />

        <Layouts.Content>

          <Form
            method="POST"
            width="auto"
            height="auto"
            initialValues={formValue}
          >
            {({ values, onChange }) => {
              return (<Flex direction="column" gap={4}>
                {restartStatus.required && (
                  <Box {...BOX_DEFAULT_PROPS} width="100%">
                    <RestartAlert
                      closeLabel={formatMessage(getTrad('pages.settings.actions.restart.alert.cancel'))}
                      title={formatMessage(getTrad('pages.settings.actions.restart.alert.title'))}
                      action={
                        <Box>
                          <Button onClick={handleRestart} startIcon={<Play />}>
                            {formatMessage(getTrad('pages.settings.actions.restart.label'))}
                          </Button>
                        </Box>
                      }
                      onClose={handleRestartDiscard}
                    >
                      <>
                        <Box paddingBottom={1}>
                          {formatMessage(getTrad('pages.settings.actions.restart.alert.description'))}
                        </Box>
                        {restartStatus.reasons?.map((reason, i) => (
                          <Box
                            paddingBottom={1}
                            key={i}
                            children={formatMessage(
                              getTrad(`pages.settings.actions.restart.alert.reason.${reason}`)
                            )}
                          />
                        ))}
                      </>
                    </RestartAlert>
                  </Box>
                )}
                <Box {...BOX_DEFAULT_PROPS} width="100%">
                  <Flex direction="column" alignItems="flex-start" gap={2}>
                    <Typography variant="delta" as="h2">
                      {formatMessage(getTrad('pages.settings.general.title'))}
                    </Typography>

                    <Grid.Root gap={4} width="100%">
                      <Grid.Item col={12} s={12} xs={12}>
                        <Grid.Root gap={4} width="100%">
                          <Grid.Item col={4} s={12} xs={12}>
                            <Field
                              name="preferCustomContentTypes"
                              label={formatMessage(
                                getTrad('pages.settings.form.preferCustomContentTypes.label')
                              )}
                              hint={formatMessage(
                                getTrad('pages.settings.form.preferCustomContentTypes.hint')
                              )}>
                              <Toggle
                                name="preferCustomContentTypes"
                                checked={values.preferCustomContentTypes}
                                onChange={(eventOrPath: FormChangeEvent) => handleChange(eventOrPath, !values.preferCustomContentTypes, onChange)}
                                onLabel={formatMessage(getTrad('components.toggle.enabled'))}
                                offLabel={formatMessage(getTrad('components.toggle.disabled'))}
                                disabled={restartStatus.required}
                                width="100%"
                              />
                            </Field>
                          </Grid.Item>

                          <Grid.Item col={8} s={12} xs={12}>
                            <Field
                              name="contentTypes"
                              label={formatMessage(getTrad('pages.settings.form.contentTypes.label'))}
                              hint={formatMessage(
                                getTrad('pages.settings.form.contentTypes.hint')
                              )}>
                              <MultiSelect
                                name="contentTypes"
                                label={formatMessage(
                                  getTrad('pages.settings.form.contentTypes.label')
                                )}
                                aria-label={formatMessage(
                                  getTrad('pages.settings.form.contentTypes.label')
                                )}
                                placeholder={formatMessage(
                                  getTrad('pages.settings.form.contentTypes.placeholder')
                                )}
                                value={values.contentTypes}
                                onChange={(value: Array<string>) => {
                                  handleChange('contentTypes', value, onChange)

                                  const {
                                    contentTypesNameFields = [],
                                    contentTypesPopulate = [],
                                    pathDefaultFields = [],
                                  } = values;

                                  const missingKeys =
                                    value.filter(
                                      (key) =>
                                        !contentTypesNameFields.find(
                                          (nameFields) => nameFields.key === key
                                        )
                                    ) ?? [];
                                  const redundantKeys =
                                    contentTypesNameFields
                                      .filter(
                                        (nameFields) =>
                                          !value.includes(nameFields.key) ||
                                          nameFields.key === 'default'
                                      )
                                      .map(({ key }) => key) ?? [];

                                  setFormValueItem(
                                    'contentTypesNameFields',
                                    [
                                      ...(contentTypesNameFields.filter(
                                        ({ key }) =>
                                          !redundantKeys.includes(key) || key === 'default'
                                      ) ?? []),
                                      ...missingKeys.map((key) => ({ key, fields: [] })),
                                    ]
                                  );

                                  setFormValueItem(
                                    'contentTypesPopulate',
                                    [
                                      ...(contentTypesPopulate.filter(
                                        ({ key }) =>
                                          !redundantKeys.includes(key) || key === 'default'
                                      ) ?? []),
                                      ...missingKeys.map((key) => ({ key, fields: [] })),
                                    ]
                                  );

                                  setFormValueItem(
                                    'pathDefaultFields',
                                    [
                                      ...(pathDefaultFields.filter(
                                        ({ key }) =>
                                          !redundantKeys.includes(key) || key === 'default'
                                      ) ?? []),
                                      ...missingKeys.map((key) => ({ key, fields: [] })),
                                    ]
                                  );
                                }}
                                disabled={restartStatus.required}
                                error={renderError('contentTypes')}
                                withTags
                                width="100%"
                              >
                                {allContentTypes.map((item) => (
                                  <MultiSelectOption key={item.uid} value={item.uid}>
                                    {item.info.displayName}
                                  </MultiSelectOption>
                                ))}
                              </MultiSelect>
                            </Field>
                          </Grid.Item>

                          <Grid.Item col={12} s={12} xs={12}>
                            {contentTypesCurrent?.length ? (
                              <Accordion.Root style={{ width: '100%' }}>
                                {contentTypeNameFieldsCurrent.map((nameFields, index) => {
                                  const current = contentTypesQuery.data?.find(
                                    ({ uid }) => uid === nameFields.key
                                  );
                                  const attributeKeys = Object.keys(current?.attributes ?? {}).sort();

                                  return current ? (
                                    <Accordion.Item key={nameFields.key} value={nameFields.key}>
                                      <Accordion.Header>
                                        <Accordion.Trigger>
                                          {current?.info.displayName ??
                                            formatMessage(
                                              getTrad('pages.settings.form.nameField.default')
                                            )}
                                        </Accordion.Trigger>
                                      </Accordion.Header>
                                      <Accordion.Content>
                                        <Grid.Root gap={4} padding={2}>
                                          <Grid.Item col={12} s={12} xs={12}>
                                            <Field
                                              name={`contentTypesNameFields[${index}]`}
                                              label={formatMessage(
                                                getTrad('pages.settings.form.nameField.label')
                                              )}
                                              hint={formatMessage(
                                                getTrad(
                                                  `pages.settings.form.nameField.${isEmpty(get(values, `contentTypesNameFields[${index}].fields`, [])) ? 'empty' : 'hint'}`
                                                )
                                              )}>
                                              <MultiSelect
                                                name={`contentTypesNameFields[${index}]`}
                                                placeholder={formatMessage(
                                                  getTrad(
                                                    'pages.settings.form.nameField.placeholder'
                                                  )
                                                )}
                                                value={get(values, `contentTypesNameFields[${index}].fields`)}
                                                onChange={(value: Array<string>) => {
                                                  const updated = get(values, 'contentTypesNameFields', []).map((item, i) => {
                                                    if (i === index) {
                                                      return {
                                                        ...item,
                                                        fields: value,
                                                      }
                                                    }
                                                    return item;
                                                  });

                                                  return handleChange('contentTypesNameFields', updated, onChange);
                                                }}
                                                disabled={restartStatus.required}
                                                error={renderError(`contentTypesNameFields[${index}]`)}
                                                withTags
                                              >
                                                {attributeKeys.map((attribute) => (
                                                  <MultiSelectOption
                                                    key={attribute}
                                                    value={attribute}
                                                  >
                                                    {attribute}
                                                  </MultiSelectOption>
                                                ))}
                                              </MultiSelect>
                                            </Field>
                                          </Grid.Item>
                                          <Grid.Item col={12} s={12} xs={12}>
                                            <Field
                                              name={`contentTypesPopulate[${index - 1}]`}
                                              label={formatMessage(
                                                getTrad('pages.settings.form.populate.label')
                                              )}
                                              hint={formatMessage(
                                                getTrad(
                                                  `pages.settings.form.populate.${isEmpty(get(values, `contentTypesPopulate[${index - 1}]fields`, [])) ? 'empty' : 'hint'}`
                                                )
                                              )}>
                                              <MultiSelect
                                                width="100%"
                                                name={`contentTypesPopulate[${index - 1}]`}
                                                placeholder={formatMessage(
                                                  getTrad(
                                                    'pages.settings.form.populate.placeholder'
                                                  )
                                                )}
                                                value={get(values, `contentTypesPopulate[${index - 1}].fields`, [])}
                                                onChange={(value: Array<string>) => {
                                                  const updated = get(values, 'contentTypesPopulate', []).map((item, i) => {
                                                    if (i === (index - 1)) {
                                                      return {
                                                        ...item,
                                                        fields: value,
                                                      }
                                                    }
                                                    return item;
                                                  });

                                                  return handleChange('contentTypesPopulate', updated, onChange);
                                                }}
                                                disabled={restartStatus.required}
                                                error={renderError(`contentTypesPopulate[${index - 1}]`)}
                                                withTags
                                              >
                                                {attributeKeys.map((attribute) => (
                                                  <MultiSelectOption
                                                    key={attribute}
                                                    value={attribute}
                                                  >
                                                    {attribute}
                                                  </MultiSelectOption>
                                                ))}
                                              </MultiSelect>
                                            </Field>
                                          </Grid.Item>
                                          <Grid.Item col={12} s={12} xs={12}>
                                            <Field
                                              name={`pathDefaultFields[${index - 1}]`}
                                              label={formatMessage(
                                                getTrad(
                                                  'pages.settings.form.pathDefaultFields.label'
                                                )
                                              )}
                                              hint={formatMessage(
                                                getTrad(
                                                  `pages.settings.form.pathDefaultFields.${isEmpty(get(values, `pathDefaultFields[${index - 1}].fields`, [])) ? 'empty' : 'hint'}`
                                                )
                                              )}>
                                              <MultiSelect
                                                name={`pathDefaultFields[${index - 1}]`}
                                                width="100%"
                                                placeholder={formatMessage(
                                                  getTrad(
                                                    'pages.settings.form.pathDefaultFields.placeholder'
                                                  )
                                                )}
                                                value={get(values, `pathDefaultFields[${index - 1}].fields`, [])}
                                                onChange={(value: Array<string>) => {
                                                  const updated = get(values, 'pathDefaultFields', []).map((item, i) => {
                                                    if (i === (index - 1)) {
                                                      return {
                                                        ...item,
                                                        fields: value,
                                                      }
                                                    }
                                                    return item;
                                                  });

                                                  return handleChange('pathDefaultFields', updated, onChange);
                                                }}
                                                disabled={restartStatus.required}
                                                error={renderError(`pathDefaultFields[${index - 1}]`)}
                                                withTags
                                              >
                                                {attributeKeys.map((attribute) => (
                                                  <MultiSelectOption
                                                    key={attribute}
                                                    value={attribute}
                                                  >
                                                    {attribute}
                                                  </MultiSelectOption>
                                                ))}
                                              </MultiSelect>
                                            </Field>
                                          </Grid.Item>
                                        </Grid.Root>
                                      </Accordion.Content>
                                    </Accordion.Item>
                                  ) : null;
                                })}
                              </Accordion.Root>
                            ) : null}
                          </Grid.Item>
                        </Grid.Root>
                      </Grid.Item>
                    </Grid.Root>
                  </Flex>
                </Box>

                <Box {...BOX_DEFAULT_PROPS} width="100%">
                  <Flex direction="column" alignItems="flex-start" gap={2}>
                    <Typography variant="delta" as="h2">
                      {formatMessage(getTrad('pages.settings.additional.title'))}
                    </Typography>

                    <Grid.Root gap={4} width="100%">
                      <Grid.Item col={4} s={12} xs={12}>
                        <Box width="100%">
                          <Field
                            name="allowedLevels"
                            label={formatMessage(getTrad('pages.settings.form.allowedLevels.label'))}
                            hint={formatMessage(getTrad('pages.settings.form.allowedLevels.hint'))}>
                            <NumberInput
                              width="100%"
                              name="allowedLevels"
                              type="number"
                              placeholder={formatMessage(
                                getTrad('pages.settings.form.allowedLevels.placeholder')
                              )}
                              onChange={(eventOrPath: FormChangeEvent, value?: any) => {
                                if (isObject(eventOrPath)) {
                                  const parsedVal = parseInt(eventOrPath.target.value);
                                  return handleChange(eventOrPath.target.name, isNaN(parsedVal) ? 0 : parsedVal, onChange);
                                }
                                return handleChange(eventOrPath, value, onChange);
                              }}
                              value={values.allowedLevels}
                              disabled={restartStatus.required}
                            />
                          </Field>
                        </Box>
                      </Grid.Item>
                      <Grid.Item col={4} s={12} xs={12}>
                        <Field
                          name="cascadeMenuAttached"
                          label={formatMessage(
                            getTrad('pages.settings.form.cascadeMenuAttached.label')
                          )}
                          hint={formatMessage(getTrad('pages.settings.form.cascadeMenuAttached.hint'))}>
                          <Toggle
                            width="100%"
                            name="cascadeMenuAttached"
                            checked={values.cascadeMenuAttached}
                            onChange={(eventOrPath: FormChangeEvent) => handleChange(eventOrPath, !values.cascadeMenuAttached, onChange)}
                            onLabel={formatMessage(getTrad('components.toggle.enabled'))}
                            offLabel={formatMessage(getTrad('components.toggle.disabled'))}
                            disabled={restartStatus.required}
                          />
                        </Field>
                      </Grid.Item>
                      <Grid.Item col={4} s={12} xs={12}>
                        <Field
                          name="audienceFieldChecked"
                          label={formatMessage(getTrad('pages.settings.form.audience.label'))}
                          hint={formatMessage(getTrad('pages.settings.form.audience.hint'))}>
                          <Toggle
                            name="audienceFieldChecked"
                            checked={values.audienceFieldChecked}
                            onChange={(eventOrPath: FormChangeEvent) => handleChange(eventOrPath, !values.audienceFieldChecked, onChange)}
                            onLabel={formatMessage(getTrad('components.toggle.enabled'))}
                            offLabel={formatMessage(getTrad('components.toggle.disabled'))}
                            disabled={restartStatus.required}
                            width="100%"
                          />
                        </Field>
                      </Grid.Item>
                      {configQuery.data?.isCachePluginEnabled && (
                        <Grid.Item col={12} s={12} xs={12}>
                          <Field
                            name="isCacheEnabled"
                            label={formatMessage(getTrad('pages.settings.form.cache.label'))}
                            hint={formatMessage(getTrad('pages.settings.form.cache.hint'))}>
                            <Toggle
                              name="isCacheEnabled"
                              checked={values.isCacheEnabled}
                              onChange={(eventOrPath: FormChangeEvent) => handleChange(eventOrPath, !values.isCacheEnabled, onChange)}
                              onLabel={formatMessage(getTrad('components.toggle.enabled'))}
                              offLabel={formatMessage(getTrad('components.toggle.disabled'))}
                              disabled={restartStatus.required}
                              width="100%"
                            />
                          </Field>
                        </Grid.Item>
                      )}
                    </Grid.Root>
                  </Flex>
                </Box>

                <Box {...BOX_DEFAULT_PROPS} width="100%">
                  <Typography variant="delta" as="h2">
                    {formatMessage(getTrad('pages.settings.customFields.title'))}
                  </Typography>
                  <Box padding={1} />
                  <CustomFieldTable
                    data={additionalFields}
                    onOpenModal={handleOpenCustomFieldModal}
                    onRemoveCustomField={handleRemoveCustomField}
                    onToggleCustomField={handleToggleCustomField}
                  />
                </Box>

                <Box {...BOX_DEFAULT_PROPS} width="100%">
                  <Flex direction="column" alignItems="flex-start" gap={2}>
                    <Typography variant="delta" as="h2">
                      {formatMessage(getTrad('pages.settings.restoring.title'))}
                    </Typography>
                    <Grid.Root gap={4} width="100%">
                      <Grid.Item col={12} s={12} xs={12}>
                        <Typography>
                          {formatMessage(getTrad('pages.settings.actions.restore.description'))}
                        </Typography>
                      </Grid.Item>
                      <Grid.Item col={12} s={12} xs={12}>
                        {hasSettingsReadPermissions ? (
                          <Button
                            variant="danger-light"
                            startIcon={<Check />}
                            onClick={() => setIsRestorePopupOpen(true)}
                          >
                            {formatMessage(getTrad('pages.settings.actions.restore.label'))}
                          </Button>
                        ) : null}
                        <ConfirmationDialog
                          isVisible={isRestorePopupOpen}
                          header={formatMessage(
                            getTrad('pages.settings.actions.restore.confirmation.header')
                          )}
                          labelConfirm={formatMessage(
                            getTrad('pages.settings.actions.restore.confirmation.confirm')
                          )}
                          iconConfirm={<Typhoon />}
                          onConfirm={() => onPopupClose(true)}
                          onCancel={() => onPopupClose(false)}
                        >
                          {formatMessage(
                            getTrad('pages.settings.actions.restore.confirmation.description')
                          )}
                        </ConfirmationDialog>
                      </Grid.Item>
                    </Grid.Root>
                  </Flex>
                </Box>
              </Flex>)
            }}
          </Form>
        </Layouts.Content>
      </Page.Main>
      {isCustomFieldModalOpen && (
        <CustomFieldModal
          onClose={() => setIsCustomFieldModalOpen(false)}
          onSubmit={handleSubmitCustomField}
          isOpen={isCustomFieldModalOpen}
          data={customFieldSelected}
        />
      )}
    </Layouts.Root>
  );
};

export default function SettingsPage() {
  queryClient.invalidateQueries();
  const theme = usePluginTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <DesignSystemProvider theme={theme}>
        <Inner />
      </DesignSystemProvider>
    </QueryClientProvider>
  );
}
