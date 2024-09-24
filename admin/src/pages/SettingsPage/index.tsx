import { DesignSystemProvider, lightTheme } from '@strapi/design-system';
import { Check, Play, Typhoon } from '@strapi/icons';
import { Layouts, Page, useAuth } from '@strapi/strapi/admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import {
  Accordion,
  Box,
  Button,
  Field,
  Flex,
  Grid,
  MultiSelect,
  MultiSelectOption,
  NumberInput,
  Toggle,
  Typography,
} from '@strapi/design-system';
import { isEmpty, sortBy } from 'lodash';
import { Controller } from 'react-hook-form';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { RestartAlert } from '../../components/RestartAlert';
import { NavigationItemCustomField } from '../../schemas';
import { getTrad } from '../../utils/getTranslation';
import pluginPermissions from '../../utils/permissions';
import CustomFieldModal from './components/CustomFieldModal';
import CustomFieldTable from './components/CustomFieldTable';
import {
  uiFormSchema,
  useConfig,
  useContentTypes,
  useRestart,
  useRestoreConfig,
  useSaveConfig,
  useSettingsForm,
} from './hooks';
import { RestartStatus } from './types';
import { isContentTypeEligible } from './utils';

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

  const {
    form: { control, watch, setValue, getValues, handleSubmit },
  } = useSettingsForm(configQuery.data);
  const [
    contentTypeNameFieldsCurrent,
    contentTypesCurrent,
    additionalFields,
    preferCustomContentTypes,
  ] = watch([
    'contentTypesNameFields',
    'contentTypes',
    'additionalFields',
    'preferCustomContentTypes',
  ]);

  const [restartStatus, setRestartStatus] = useState<RestartStatus>({ required: false });

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

  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState<boolean>(false);
  const [isRestorePopupOpen, setIsRestorePopupOpen] = useState<boolean>(false);
  const [customFieldSelected, setCustomFieldSelected] = useState<NavigationItemCustomField | null>(
    null
  );

  const handleOpenCustomFieldModal = (field: NavigationItemCustomField | null) => {
    setCustomFieldSelected(field);
    setIsCustomFieldModalOpen(true);
  };

  const handleRemoveCustomField = (field: NavigationItemCustomField) => {
    const filteredFields = additionalFields.filter((f) =>
      typeof f !== 'string' ? f.name !== field.name : true
    );

    setValue('additionalFields', filteredFields);

    setCustomFieldSelected(null);
    setIsCustomFieldModalOpen(false);
  };

  const handleToggleCustomField = (current: NavigationItemCustomField) => {
    const next = { ...current, enabled: !current.enabled };

    const nextAdditionalFields = additionalFields.map((field) =>
      typeof field !== 'string' && current.name === field.name ? next : field
    );

    setValue('additionalFields', nextAdditionalFields);
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

    setValue('additionalFields', nextAdditionalFields);

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

  const onSubmit = (rawData: unknown) => {
    const parsed = uiFormSchema.safeParse(rawData);

    if (parsed.success) {
      configSaveMutation.mutate(parsed.data, {
        onSuccess() {
          setRestartStatus({ required: true });

          configSaveMutation.reset();
        },
      });
    } else {
      console.warn('Invalid form data', parsed.error);
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
        setRestartStatus({ required: false });
      },
      onError() {
        setRestartStatus({ required: false });
      },
    });
    // TODO: Reload
    window.location.reload();
  };
  const handleRestartDiscard = () => setRestartStatus({ required: false });

  if (!hasSettingsPermissions) {
    return <Page.NoPermissions />;
  }

  if (isLoading) {
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
                onClick={handleSubmit(onSubmit)}
              >
                {formatMessage(getTrad('pages.settings.actions.submit'))}
              </Button>
            ) : null
          }
        />

        <Layouts.Content>
          <Flex direction="column" gap={4}>
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
                        <Controller
                          control={control}
                          name="preferCustomContentTypes"
                          render={({ field: { name, value, onChange } }) => (
                            <Field.Root width="100%">
                              <Field.Label>
                                {formatMessage(
                                  getTrad('pages.settings.form.preferCustomContentTypes.label')
                                )}
                              </Field.Label>

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
                                disabled={restartStatus.required}
                                width="100%"
                              />

                              <Field.Hint>
                                {formatMessage(
                                  getTrad('pages.settings.form.preferCustomContentTypes.hint')
                                )}
                              </Field.Hint>
                            </Field.Root>
                          )}
                        />
                      </Grid.Item>

                      <Grid.Item col={8} s={12} xs={12}>
                        <Controller
                          control={control}
                          name="contentTypes"
                          render={({ field: { name, value, onChange }, fieldState: { error } }) => (
                            <Field.Root width="100%">
                              <Field.Label>
                                {formatMessage(getTrad('pages.settings.form.contentTypes.label'))}
                              </Field.Label>
                              <MultiSelect
                                name={name}
                                label={formatMessage(
                                  getTrad('pages.settings.form.contentTypes.label')
                                )}
                                aria-label={formatMessage(
                                  getTrad('pages.settings.form.contentTypes.label')
                                )}
                                placeholder={formatMessage(
                                  getTrad('pages.settings.form.contentTypes.placeholder')
                                )}
                                hint={formatMessage(
                                  getTrad('pages.settings.form.contentTypes.hint')
                                )}
                                value={value}
                                onChange={(value: string[]) => {
                                  onChange(value);

                                  const {
                                    contentTypesNameFields = [],
                                    contentTypesPopulate = [],
                                    pathDefaultFields,
                                  } = getValues();

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

                                  setValue(
                                    'contentTypesNameFields',
                                    [
                                      ...(contentTypesNameFields.filter(
                                        ({ key }) =>
                                          !redundantKeys.includes(key) || key === 'default'
                                      ) ?? []),
                                      ...missingKeys.map((key) => ({ key, fields: [] })),
                                    ],
                                    { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                                  );

                                  setValue(
                                    'contentTypesPopulate',
                                    [
                                      ...(contentTypesPopulate.filter(
                                        ({ key }) =>
                                          !redundantKeys.includes(key) || key === 'default'
                                      ) ?? []),
                                      ...missingKeys.map((key) => ({ key, fields: [] })),
                                    ],
                                    { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                                  );

                                  setValue(
                                    'pathDefaultFields',
                                    [
                                      ...(pathDefaultFields.filter(
                                        ({ key }) =>
                                          !redundantKeys.includes(key) || key === 'default'
                                      ) ?? []),
                                      ...missingKeys.map((key) => ({ key, fields: [] })),
                                    ],
                                    { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                                  );
                                }}
                                disabled={restartStatus.required}
                                error={!!error}
                                withTags
                                width="100%"
                              >
                                {allContentTypes.map((item) => (
                                  <MultiSelectOption key={item.uid} value={item.uid}>
                                    {item.info.displayName}
                                  </MultiSelectOption>
                                ))}
                              </MultiSelect>
                            </Field.Root>
                          )}
                        />
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
                                        <Controller
                                          control={control}
                                          name={`contentTypesNameFields.${index}`}
                                          render={({
                                            field: { name, value, onChange },
                                            fieldState: { error },
                                          }) => (
                                            <Field.Root width="100%">
                                              <Field.Label>
                                                {formatMessage(
                                                  getTrad('pages.settings.form.nameField.label')
                                                )}
                                              </Field.Label>
                                              <MultiSelect
                                                name={name}
                                                placeholder={formatMessage(
                                                  getTrad(
                                                    'pages.settings.form.nameField.placeholder'
                                                  )
                                                )}
                                                value={value.fields}
                                                onChange={(fields: string[]) =>
                                                  onChange({
                                                    ...value,
                                                    fields,
                                                  })
                                                }
                                                disabled={restartStatus.required}
                                                error={!!error}
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
                                              <Field.Hint>
                                                {formatMessage(
                                                  getTrad(
                                                    `pages.settings.form.nameField.${isEmpty(value?.fields) ? 'empty' : 'hint'}`
                                                  )
                                                )}
                                              </Field.Hint>
                                            </Field.Root>
                                          )}
                                        />
                                      </Grid.Item>
                                      <Grid.Item col={12} s={12} xs={12}>
                                        <Controller
                                          control={control}
                                          name={`contentTypesPopulate.${index - 1}`}
                                          render={({
                                            field: { name, value, onChange },
                                            fieldState: { error },
                                          }) => (
                                            <Field.Root width="100%">
                                              <Field.Label>
                                                {formatMessage(
                                                  getTrad('pages.settings.form.populate.label')
                                                )}
                                              </Field.Label>
                                              <MultiSelect
                                                width="100%"
                                                name={name}
                                                placeholder={formatMessage(
                                                  getTrad(
                                                    'pages.settings.form.populate.placeholder'
                                                  )
                                                )}
                                                value={value?.fields ?? []}
                                                onChange={(fields: string[]) =>
                                                  onChange({
                                                    ...value,
                                                    fields,
                                                  })
                                                }
                                                disabled={restartStatus.required}
                                                error={!!error}
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
                                              <Field.Hint>
                                                {formatMessage(
                                                  getTrad(
                                                    `pages.settings.form.populate.${isEmpty(value?.fields) ? 'empty' : 'hint'}`
                                                  )
                                                )}
                                              </Field.Hint>
                                            </Field.Root>
                                          )}
                                        />
                                      </Grid.Item>
                                      <Grid.Item col={12} s={12} xs={12}>
                                        <Controller
                                          control={control}
                                          name={`pathDefaultFields.${index - 1}`}
                                          render={({
                                            field: { name, value, onChange },
                                            fieldState: { error },
                                          }) => (
                                            <Field.Root width="100%">
                                              <Field.Label>
                                                {formatMessage(
                                                  getTrad(
                                                    'pages.settings.form.pathDefaultFields.label'
                                                  )
                                                )}
                                              </Field.Label>
                                              <MultiSelect
                                                name={name}
                                                width="100%"
                                                placeholder={formatMessage(
                                                  getTrad(
                                                    'pages.settings.form.pathDefaultFields.placeholder'
                                                  )
                                                )}
                                                value={value?.fields ?? []}
                                                onChange={(fields: string[]) =>
                                                  onChange({
                                                    ...value,
                                                    fields,
                                                  })
                                                }
                                                disabled={restartStatus.required}
                                                error={!!error}
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
                                              <Field.Hint>
                                                {formatMessage(
                                                  getTrad(
                                                    `pages.settings.form.pathDefaultFields.${isEmpty(value?.fields) ? 'empty' : 'hint'}`
                                                  )
                                                )}
                                              </Field.Hint>
                                            </Field.Root>
                                          )}
                                        />
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
                      <Controller
                        control={control}
                        name="allowedLevels"
                        render={({ field: { onChange, value, name } }) => (
                          <Field.Root width="100%">
                            <Field.Label>
                              {formatMessage(getTrad('pages.settings.form.allowedLevels.label'))}
                            </Field.Label>

                            <NumberInput
                              width="100%"
                              name={name}
                              placeholder={formatMessage(
                                getTrad('pages.settings.form.allowedLevels.placeholder')
                              )}
                              onValueChange={(nextValue: number) => onChange(nextValue)}
                              value={value}
                              disabled={restartStatus.required}
                            />

                            <Field.Hint>
                              {formatMessage(getTrad('pages.settings.form.allowedLevels.hint'))}
                            </Field.Hint>
                          </Field.Root>
                        )}
                      />
                    </Box>
                  </Grid.Item>
                  <Grid.Item col={4} s={12} xs={12}>
                    <Controller
                      control={control}
                      name="cascadeMenuAttached"
                      render={({ field: { name, value, onChange } }) => (
                        <Field.Root width="100%">
                          <Field.Label>
                            {formatMessage(
                              getTrad('pages.settings.form.cascadeMenuAttached.label')
                            )}
                          </Field.Label>

                          <Toggle
                            width="100%"
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
                            disabled={restartStatus.required}
                          />

                          <Field.Hint>
                            {formatMessage(getTrad('pages.settings.form.cascadeMenuAttached.hint'))}
                          </Field.Hint>
                        </Field.Root>
                      )}
                    />
                  </Grid.Item>
                  <Grid.Item col={4} s={12} xs={12}>
                    <Controller
                      control={control}
                      name="audienceFieldChecked"
                      render={({ field: { name, value, onChange } }) => (
                        <Field.Root width="100%">
                          <Field.Label>
                            {formatMessage(getTrad('pages.settings.form.audience.label'))}
                          </Field.Label>

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
                            disabled={restartStatus.required}
                            width="100%"
                          />

                          <Field.Hint>
                            {formatMessage(getTrad('pages.settings.form.audience.hint'))}
                          </Field.Hint>
                        </Field.Root>
                      )}
                    />
                  </Grid.Item>
                  {configQuery.data?.isCachePluginEnabled && (
                    <Grid.Item col={12} s={12} xs={12}>
                      <Controller
                        control={control}
                        name="isCacheEnabled"
                        render={({ field: { name, value, onChange } }) => (
                          <Field.Root width="100%">
                            <Field.Label>
                              {formatMessage(getTrad('pages.settings.form.cache.label'))}
                            </Field.Label>

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
                              disabled={restartStatus.required}
                              width="100%"
                            />

                            <Field.Hint>
                              {formatMessage(getTrad('pages.settings.form.cache.hint'))}
                            </Field.Hint>
                          </Field.Root>
                        )}
                      />
                    </Grid.Item>
                  )}
                </Grid.Root>
              </Flex>
            </Box>

            <Box {...BOX_DEFAULT_PROPS} width="100%" gap={2} direction="column" alignItems="flex-start">
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
          </Flex>
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

  return (
    <QueryClientProvider client={queryClient}>
      <DesignSystemProvider locale="en-GB" theme={lightTheme}>
        <Inner />
      </DesignSystemProvider>
    </QueryClientProvider>
  );
}
