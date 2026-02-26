import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { get, isNil, isObject, isString, set } from 'lodash';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { Button, Flex } from '@strapi/design-system';

import { Check } from '@strapi/icons';
import { Form, Layouts, Page, useAuth } from '@strapi/strapi/admin';

import { FormChangeEvent, FormItemErrorSchema } from '../../types';
import { getTrad } from '../../utils/getTranslation';
import pluginPermissions from '../../utils/permissions';
import {
  useConfig,
  useContentTypes,
  useRestart,
  useRestoreConfig,
  useSaveConfig,
  useInitialConfig,
} from './hooks';
import { RestartStatus } from './types';
import { RestorePanel } from './components/RestorePanel';
import { RestartPanel } from './components/RestartPanel';
import { AdditionalSettingsPanel } from './components/AdditionalSettingsPanel';
import { GeneralSettingsPanel } from './components/GeneralSettingsPanel';
import { CustomFieldsPanel } from './components/CustomFieldsPanel';
import { SettingsContext } from './context';
import { uiFormSchema, UiFormSchema } from './schemas';

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
      setFormError(
        error.issues.reduce((acc, err) => {
          return {
            ...acc,
            [err.path.join('.')]: err.message,
          };
        }, {} as FormItemErrorSchema<UiFormSchema>)
      );
      console.warn('Invalid form data', error);
    }
  };

  useInitialConfig({ config: configQuery.data, setFormValue });

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
          <Form method="POST" width="auto" height="auto" initialValues={formValue}>
            {({ values, onChange }) => {
              return (
                <SettingsContext.Provider
                  value={{
                    values,
                    onChange,
                    handleChange,
                    restartStatus,
                    setRestartStatus,
                    renderError,
                    setFormValueItem,
                  }}
                >
                  <Flex direction="column" gap={4}>
                    <RestartPanel setIsReloading={setIsReloading} />
                    <GeneralSettingsPanel />
                    <AdditionalSettingsPanel />
                    <CustomFieldsPanel />
                    <RestorePanel hasSettingsReadPermissions={hasSettingsReadPermissions} />
                  </Flex>
                </SettingsContext.Provider>
              );
            }}
          </Form>
        </Layouts.Content>
      </Page.Main>
    </Layouts.Root>
  );
};

export default function SettingsPage() {
  queryClient.invalidateQueries();

  return (
    <QueryClientProvider client={queryClient}>
      <Inner />
    </QueryClientProvider>
  );
}
