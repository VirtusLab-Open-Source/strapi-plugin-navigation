import React, { useState } from 'react';
import { Formik } from 'formik';

import {
  CheckPermissions,
  LoadingIndicatorPage,
  Form,
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
import { Check, Refresh } from '@strapi/icons';
import { SettingsPageTitle } from '@strapi/helper-plugin';

import permissions from '../../permissions';
import useNavigationConfig from '../../hooks/useNavigationConfig';
import useAllContentTypes from '../../hooks/useAllContentTypes';
import { navigationItemAdditionalFields } from '../View/utils/enums';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { getMessage } from '../../utils';

const SettingsPage = () => {
  const { lockAppWithAutoreload, unlockAppWithAutoreload } = useAutoReloadOverlayBlocker();
  const [isRestorePopupOpen, setIsRestorePopupOpen] = useState(false);
  const { data: navigationConfigData, isLoading: isConfigLoading, err: configErr, submitMutation, restoreMutation } = useNavigationConfig();
  const { data: allContentTypesData, isLoading: isContentTypesLoading, err: contentTypesErr } = useAllContentTypes();
  const isLoading = isConfigLoading || isContentTypesLoading;
  const isError = configErr || contentTypesErr;

  const onSave = async (form) => {
    lockAppWithAutoreload();
    await submitMutation({
      body: {
        contentTypes: form.selectedContentTypes,
        additionalFields: form.audienceFieldChecked ? [navigationItemAdditionalFields.AUDIENCE] : [],
        allowedLevels: form.allowedLevels,
        gql: {
          navigationItemRelated: form.selectedContentTypes.map(uid => allContentTypes.find(ct => ct.uid === uid).info.displayName)
        }
      }
    })
    unlockAppWithAutoreload();
  }

  const onPopupClose = async (isConfirmed) => {
    setIsRestorePopupOpen(false);
    if (isConfirmed) {
      lockAppWithAutoreload();
      await restoreMutation();
      unlockAppWithAutoreload();
    }
  }

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
                    <Button type="submit" startIcon={<Check />} >
                      {getMessage('pages.settings.actions.submit')}
                    </Button>
                  </CheckPermissions>
                }
              />
              <ContentLayout>
                <Stack size={7}>
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
                        <GridItem col={12}>
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
                          >
                            {allContentTypes.map((item) => <Option key={item.uid} value={item.uid}>{item.info.displayName}</Option>)}
                          </Select>
                        </GridItem>
                        <GridItem col={3}>
                          <NumberInput
                            name="allowedLevels"
                            label={getMessage('pages.settings.form.allowedLevels.label')}
                            placeholder={getMessage('pages.settings.form.allowedLevels.placeholder')}
                            hint={getMessage('pages.settings.form.allowedLevels.hint')}
                            onValueChange={(value) => setFieldValue('allowedLevels', value, false)}
                            value={values.allowedLevels}
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
                        <GridItem col={6}>
                          <ToggleInput
                            name="audienceFieldChecked"
                            label={getMessage('pages.settings.form.audience.label')}
                            hint={getMessage('pages.settings.form.audience.hint')}
                            checked={values.audienceFieldChecked}
                            onChange={({ target: { checked } }) => setFieldValue('audienceFieldChecked', checked, false)}
                            onLabel="Enabled"
                            offLabel="Disabled"
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
                        {getMessage('pages.settings.restoring.title')}
                      </Typography>
                      <Grid gap={4}>
                        <GridItem col={12}>
                          <Typography>
                            {getMessage('pages.settings.action.restore.description')}
                          </Typography>
                        </GridItem>
                        <GridItem col={6}>
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