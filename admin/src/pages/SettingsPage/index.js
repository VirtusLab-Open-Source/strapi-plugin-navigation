import React, { useState } from 'react';
import { Formik } from 'formik';
import { isEmpty, capitalize, isEqual } from 'lodash';

import {
  CheckPermissions,
  LoadingIndicatorPage,
  Form,
  useOverlayBlocker,
  useAutoReloadOverlayBlocker,
} from '@strapi/helper-plugin';
import { Main } from '@strapi/design-system/Main';
import { ContentLayout, HeaderLayout } from '@strapi/design-system/Layout';
import { Button } from '@strapi/design-system/Button';
import { Box } from '@strapi/design-system/Box';
import { Stack } from '@strapi/design-system/Stack';
import { Typography } from '@strapi/design-system/Typography';
import { Grid, GridItem } from '@strapi/design-system/Grid';
import { ToggleInput } from '@strapi/design-system/ToggleInput';
import { NumberInput } from '@strapi/design-system/NumberInput';
import { Select, Option } from '@strapi/design-system/Select';
import { Check, Refresh, Play } from '@strapi/icons';
import { SettingsPageTitle } from '@strapi/helper-plugin';
import {
  Card,
  CardBody,
  CardContent,
} from '@strapi/design-system/Card';

import permissions from '../../permissions';
import useNavigationConfig from '../../hooks/useNavigationConfig';
import useAllContentTypes from '../../hooks/useAllContentTypes';
import { navigationItemAdditionalFields } from '../View/utils/enums';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import RestartAlert from '../../components/RestartAlert';
import { getMessage } from '../../utils';

const SettingsPage = () => {
  const { lockApp, unlockApp } = useOverlayBlocker();
  const { lockAppWithAutoreload, unlockAppWithAutoreload } = useAutoReloadOverlayBlocker();
  const [isRestorePopupOpen, setIsRestorePopupOpen] = useState(false);
  const [isRestartRequired, setIsRestartRequired] = useState(false);
  const { data: navigationConfigData, isLoading: isConfigLoading, err: configErr, submitMutation, restoreMutation, restartMutation } = useNavigationConfig();
  const { data: allContentTypesData, isLoading: isContentTypesLoading, err: contentTypesErr } = useAllContentTypes();
  const isLoading = isConfigLoading || isContentTypesLoading;
  const isError = configErr || contentTypesErr;

  const preparePayload = ({ selectedContentTypes, nameFields, audienceFieldChecked, allowedLevels }) => ({
    contentTypes: selectedContentTypes,
    contentTypesNameFields: nameFields,
    additionalFields: audienceFieldChecked ? [navigationItemAdditionalFields.AUDIENCE] : [],
    allowedLevels: allowedLevels,
    gql: {
      navigationItemRelated: selectedContentTypes.map(uid => allContentTypes.find(ct => ct.uid === uid).info.displayName)
    }
  })
  const onSave = async (form) => {
    lockApp();
    const payload = preparePayload(form);
    await submitMutation({ body: payload });
    const isContentTypesChanged = !isEqual(payload.contentTypes, navigationConfigData.contentTypes);
    if (isContentTypesChanged && navigationConfigData.isGQLPluginEnabled) {
      setIsRestartRequired(true);
    }
    unlockApp();
  }

  const onPopupClose = async (isConfirmed) => {
    setIsRestorePopupOpen(false);
    if (isConfirmed) {
      lockApp();
      await restoreMutation();
      unlockApp();
      setIsRestartRequired(true);
    }
  }

  const handleRestart = async () => {
    lockAppWithAutoreload();
    await restartMutation();
    setIsRestartRequired(false);
    unlockAppWithAutoreload();
  };
  const handleRestartDiscard = () => setIsRestartRequired(false);

  const prepareNameFieldFor = (uid, current, value) => ({
    ...current,
    [uid]: value && !isEmpty(value) ? [...value] : undefined,
  });

  if (isLoading || isError) {
    return (
      <>
        <SettingsPageTitle
          name={getMessage('Settings.email.plugin.title', 'Configuration')}
        />
        <LoadingIndicatorPage>
          Fetching plugin config...
        </LoadingIndicatorPage>
      </>
    )
  }

  const allContentTypes = !isLoading && Object.values(allContentTypesData).filter(item => item.uid.includes('api::'));
  const selectedContentTypes = navigationConfigData?.contentTypes.map(item => item.uid);
  const audienceFieldChecked = navigationConfigData?.additionalFields.includes(navigationItemAdditionalFields.AUDIENCE);
  const allowedLevels = navigationConfigData?.allowedLevels;
  const nameFields = navigationConfigData?.contentTypesNameFields

  return (
    <>
      <SettingsPageTitle
        name={getMessage('Settings.email.plugin.title', 'Configuration')}
      />
      <Main labelledBy="title">
        <Formik
          initialValues={{
            selectedContentTypes,
            audienceFieldChecked,
            allowedLevels,
            nameFields,
          }}
          onSubmit={onSave}
        >
          {({ handleSubmit, setFieldValue, values }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <HeaderLayout
                title={getMessage('pages.settings.header.title')}
                subtitle={getMessage('pages.settings.header.description')}
                primaryAction={
                  <CheckPermissions permissions={permissions.access}>
                    <Button type="submit" startIcon={<Check />} disabled={isRestartRequired}>
                      {getMessage('pages.settings.actions.submit')}
                    </Button>
                  </CheckPermissions>
                }
              />
              <ContentLayout>
                <Stack size={7}>
                  {isRestartRequired && (
                    <RestartAlert
                      closeLabel={getMessage('pages.settings.actions.restart.alert.cancel')}
                      title={getMessage('pages.settings.actions.restart.alert.title')}
                      action={<Box><Button onClick={handleRestart} startIcon={<Play />}>{getMessage('pages.settings.actions.restart')}</Button></Box>}
                      onClose={handleRestartDiscard}>
                      {getMessage('pages.settings.actions.restart.alert.description')}
                    </RestartAlert>)}
                  <Box
                    background="neutral0"
                    hasRadius
                    shadow="filterShadow"
                    padding={6}
                  >
                    <Stack size={4}>
                      <Typography variant="delta" as="h2">
                        {getMessage('pages.settings.general.title')}
                      </Typography>
                      <Grid gap={4}>
                        <GridItem col={12} s={12} xs={12}>
                          <Select
                            name="selectedContentTypes"
                            label={getMessage('pages.settings.form.contentTypes.label')}
                            placeholder={getMessage('pages.settings.form.contentTypes.placeholder')}
                            hint={getMessage('pages.settings.form.contentTypes.hint')}
                            onClear={() => setFieldValue('selectedContentTypes', [], false)}
                            value={values.selectedContentTypes}
                            onChange={(value) => setFieldValue('selectedContentTypes', value, false)}
                            multi
                            withTags
                            disabled={isRestartRequired}
                          >
                            {allContentTypes.map((item) => <Option key={item.uid} value={item.uid}>{item.info.displayName}</Option>)}
                          </Select>
                        </GridItem>
                        <GridItem col={3} s={6} xs={12}>
                          <NumberInput
                            name="allowedLevels"
                            label={getMessage('pages.settings.form.allowedLevels.label')}
                            placeholder={getMessage('pages.settings.form.allowedLevels.placeholder')}
                            hint={getMessage('pages.settings.form.allowedLevels.hint')}
                            onValueChange={(value) => setFieldValue('allowedLevels', value, false)}
                            value={values.allowedLevels}
                            disabled={isRestartRequired}
                          />
                        </GridItem>
                      </Grid>
                    </Stack>
                  </Box>
                  <Box
                    background="neutral0"
                    hasRadius
                    shadow="filterShadow"
                    padding={6}
                  >
                    <Stack size={4}>
                      <Typography variant="delta" as="h2">
                        {getMessage('pages.settings.additional.title')}
                      </Typography>
                      <Grid gap={4}>
                        <GridItem col={6} s={12} xs={12}>
                          <ToggleInput
                            name="audienceFieldChecked"
                            label={getMessage('pages.settings.form.audience.label')}
                            hint={getMessage('pages.settings.form.audience.hint')}
                            checked={values.audienceFieldChecked}
                            onChange={({ target: { checked } }) => setFieldValue('audienceFieldChecked', checked, false)}
                            onLabel="Enabled"
                            offLabel="Disabled"
                            disabled={isRestartRequired}
                          />
                        </GridItem>
                      </Grid>
                    </Stack>
                  </Box>
                  {!isEmpty(values.selectedContentTypes) && (
                    <Box
                      background="neutral0"
                      hasRadius
                      shadow="filterShadow"
                      padding={6}
                    >
                      <Stack size={4}>
                        <Typography variant="delta" as="h2">
                          {getMessage('pages.settings.nameField.title')}
                        </Typography>
                        <Grid gap={4}>
                          {values.selectedContentTypes.map(uid => {
                            const { attributes, info: { displayName } } = allContentTypes.find(item => item.uid == uid);
                            const stringAttributes = Object.keys(attributes).filter(_ => attributes[_].type === 'string');

                            return !isEmpty(stringAttributes) && (
                              <GridItem key={`collectionSettings-${uid}`} col={6} s={12} xs={12}>
                                <Card background="primary100" borderColor="primary200">
                                  <CardBody>
                                    <CardContent style={{ width: '100%' }}>
                                      <Stack size={4}>
                                        <Typography variant="epsilon" fontWeight="semibold" as="h3">{displayName}</Typography>
                                        <Select
                                          name={`collectionSettings-${uid}-entryLabel`}
                                          label={getMessage('pages.settings.form.nameField.label')}
                                          hint={getMessage('pages.settings.form.nameField.hint')}
                                          placeholder={getMessage('pages.settings.form.nameField.placeholder')}
                                          onClear={() => null}
                                          value={values.nameFields[uid] || []}
                                          onChange={(value) => setFieldValue('nameFields', prepareNameFieldFor(uid, values.nameFields, value))}
                                          multi
                                          withTags
                                          disabled={isRestartRequired}
                                        >
                                          {stringAttributes.map(key =>
                                            (<Option key={uid + key} value={key}>{capitalize(key.split('_').join(' '))}</Option>))}
                                        </Select>
                                      </Stack>
                                    </CardContent>
                                  </CardBody>
                                </Card>
                              </GridItem>
                            );
                          })
                          }
                        </Grid>
                      </Stack>
                    </Box>
                  )}
                  <Box
                    background="neutral0"
                    hasRadius
                    shadow="filterShadow"
                    padding={6}
                  >
                    <Stack size={4}>
                      <Typography variant="delta" as="h2">
                        {getMessage('pages.settings.restoring.title')}
                      </Typography>
                      <Grid gap={4}>
                        <GridItem col={12} s={12} xs={12}>
                          <Typography>
                            {getMessage('pages.settings.actions.restore.description')}
                          </Typography>
                        </GridItem>
                        <GridItem col={6} s={12} xs={12}>
                          <CheckPermissions permissions={permissions.access}>
                            <Button variant="danger-light" startIcon={<Refresh />} onClick={() => setIsRestorePopupOpen(true)}>
                              {getMessage('pages.settings.actions.restore')}
                            </Button>
                          </CheckPermissions>
                          <ConfirmationDialog
                            isVisible={isRestorePopupOpen}
                            header={getMessage('pages.settings.actions.restore.confirmation.header')}
                            labelConfirm={getMessage('pages.settings.actions.restore.confirmation.confirm')}
                            iconConfirm={<Refresh />}
                            onConfirm={() => onPopupClose(true)}
                            onCancel={() => onPopupClose(false)}>
                            {getMessage('pages.settings.actions.restore.confirmation.description')}
                          </ConfirmationDialog>
                        </GridItem>
                      </Grid>
                    </Stack>
                  </Box>
                </Stack>
              </ContentLayout>
            </Form>
          )}
        </Formik>
      </Main>
    </>
  );
}


export default SettingsPage;