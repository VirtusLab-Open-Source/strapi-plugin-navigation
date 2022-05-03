import React, { useMemo, useState } from 'react';
import { Formik } from 'formik';
import { isEmpty, capitalize, isEqual, orderBy } from 'lodash';

import {
  CheckPermissions,
  LoadingIndicatorPage,
  Form,
  useOverlayBlocker,
  useAutoReloadOverlayBlocker,
  SettingsPageTitle,
} from '@strapi/helper-plugin';
import { Main } from '@strapi/design-system/Main';
import { ContentLayout, HeaderLayout } from '@strapi/design-system/Layout';
import { Accordion, AccordionToggle, AccordionContent, AccordionGroup } from '@strapi/design-system/Accordion';
import { Button } from '@strapi/design-system/Button';
import { Box } from '@strapi/design-system/Box';
import { Divider } from '@strapi/design-system/Divider';
import { Stack } from '@strapi/design-system/Stack';
import { Typography } from '@strapi/design-system/Typography';
import { Grid, GridItem } from '@strapi/design-system/Grid';
import { ToggleInput } from '@strapi/design-system/ToggleInput';
import { NumberInput } from '@strapi/design-system/NumberInput';
import { Select, Option } from '@strapi/design-system/Select';
import { Tooltip } from '@strapi/design-system/Tooltip';
import { Check, Refresh, Play, Information, ExclamationMarkCircle } from '@strapi/icons';

import permissions from '../../permissions';
import useNavigationConfig from '../../hooks/useNavigationConfig';
import useAllContentTypes from '../../hooks/useAllContentTypes';
import { navigationItemAdditionalFields } from '../View/utils/enums';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import RestartAlert from '../../components/RestartAlert';
import { getMessage } from '../../utils';
import { isContentTypeEligible, resolveGlobalLikeId } from './utils/functions';
import { PermanentAlert } from '../../components/Alert/styles';
import { useDisableI18nModal } from './components/DisableI18nModal';

const RESTART_NOT_REQUIRED = { required: false }
const RESTART_REQUIRED = { required: true, reasons: [] }

const SettingsPage = () => {
  const { lockApp, unlockApp } = useOverlayBlocker();
  const { lockAppWithAutoreload, unlockAppWithAutoreload } = useAutoReloadOverlayBlocker();
  const [isRestorePopupOpen, setIsRestorePopupOpen] = useState(false);
  const [restartStatus, setRestartStatus] = useState(RESTART_NOT_REQUIRED);
  const [contentTypeExpanded, setContentTypeExpanded] = useState(undefined);
  const [ pruneObsoleteI18nNavigations, setPruneObsoleteI18nNavigations ] = useState(false);
  const {
    disableI18nModal,
    setDisableI18nModalOpened,
    setI18nModalOnCancel,
  } = useDisableI18nModal(({ pruneNavigations })=> {
    setPruneObsoleteI18nNavigations(pruneNavigations)
  });
  const { data: navigationConfigData, isLoading: isConfigLoading, err: configErr, submitMutation, restoreMutation, restartMutation } = useNavigationConfig();
  const { data: allContentTypesData, isLoading: isContentTypesLoading, err: contentTypesErr } = useAllContentTypes();
  const isLoading = isConfigLoading || isContentTypesLoading;
  const isError = configErr || contentTypesErr;
  const boxDefaultProps = {
		background: "neutral0",
		hasRadius: true,
		shadow: "filterShadow",
		padding: 6,
	};
  
  const preparePayload = ({
    form: {
      selectedContentTypes, 
      nameFields,
      audienceFieldChecked,
      allowedLevels,
      i18nEnabled
    },
    pruneObsoleteI18nNavigations
  }) => ({
    i18nEnabled,
    allowedLevels,
    pruneObsoleteI18nNavigations,
    contentTypes: selectedContentTypes,
    contentTypesNameFields: nameFields,
    contentTypesPopulate: populate,
    additionalFields: audienceFieldChecked ? [navigationItemAdditionalFields.AUDIENCE] : [],
    gql: {
      navigationItemRelated: selectedContentTypes.map(uid => resolveGlobalLikeId(uid)),
    }
  });

  const onSave = async (form) => {
    lockApp();
    const payload = preparePayload({ form, pruneObsoleteI18nNavigations });
    await submitMutation({ body: payload });
    const isContentTypesChanged = !isEqual(payload.contentTypes, navigationConfigData.contentTypes);
    const isI18nChanged = !isEqual(payload.i18nEnabled, navigationConfigData.i18nEnabled);
    const restartReasons = []
    if (isI18nChanged) {
      restartReasons.push('I18N');
    }
    if (isContentTypesChanged && navigationConfigData.isGQLPluginEnabled) {
      restartReasons.push('GRAPH_QL');
    }
    if (pruneObsoleteI18nNavigations) {
      restartReasons.push('I18N_NAVIGATIONS_PRUNE')
    }
    if (restartReasons.length) {
      setRestartStatus({
        ...RESTART_REQUIRED,
        reasons: restartReasons,
      });
    }
    setDisableI18nModalOpened(false);
    setPruneObsoleteI18nNavigations(false);
    unlockApp();
  }

  const onPopupClose = async (isConfirmed) => {
    setIsRestorePopupOpen(false);
    if (isConfirmed) {
      lockApp();
      await restoreMutation();
      unlockApp();
      setRestartStatus(RESTART_REQUIRED);
    }
  }

  const handleRestart = async () => {
    lockAppWithAutoreload();
    await restartMutation();
    setRestartStatus(RESTART_NOT_REQUIRED);
    unlockAppWithAutoreload();
  };
  const handleRestartDiscard = () => setRestartStatus(RESTART_NOT_REQUIRED);
	const handleSetContentTypeExpanded = key => setContentTypeExpanded(key === contentTypeExpanded ? undefined : key);

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
          {/* TODO: use translation */}
          Fetching plugin config...
        </LoadingIndicatorPage>
      </>
    )
  }

  const configContentTypes = navigationConfigData?.contentTypes || [];

  const allContentTypes = !isLoading && Object.values(allContentTypesData).filter(({ uid }) => isContentTypeEligible(uid, {
    allowedContentTypes: navigationConfigData?.allowedContentTypes,
    restrictedContentTypes: navigationConfigData?.restrictedContentTypes,
  })).map(ct => {
    const type = configContentTypes.find(_ => _.uid === ct.uid);
    if (type) {
      const { available, isSingle } = type;
      return {
        ...ct,
        available,
        isSingle,
      };
    }
    return ct;
  });
  const selectedContentTypes = configContentTypes.map(item => item.uid);
  const audienceFieldChecked = navigationConfigData?.additionalFields.includes(navigationItemAdditionalFields.AUDIENCE);
  const allowedLevels = navigationConfigData?.allowedLevels || 2;
  const nameFields = navigationConfigData?.contentTypesNameFields || {}
  const populate = navigationConfigData?.contentTypesPopulate || {}
  const i18nEnabled = navigationConfigData?.i18nEnabled ?? false
  const isI18NPluginEnabled = navigationConfigData?.isI18NPluginEnabled;
  const defaultLocale = navigationConfigData?.defaultLocale;

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
            populate,
            i18nEnabled,
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
                    <Button type="submit" startIcon={<Check />} disabled={restartStatus.required}>
                      {getMessage('pages.settings.actions.submit')}
                    </Button>
                  </CheckPermissions>
                }
              />
              <ContentLayout>
                <Stack spacing={7}>
                  {restartStatus.required && (
                    <RestartAlert
                      closeLabel={getMessage('pages.settings.actions.restart.alert.cancel')}
                      title={getMessage('pages.settings.actions.restart.alert.title')}
                      action={<Box><Button onClick={handleRestart} startIcon={<Play />}>{getMessage('pages.settings.actions.restart')}</Button></Box>}
                      onClose={handleRestartDiscard}>
                        <>
                          <Box paddingBottom={1}>
                            {getMessage('pages.settings.actions.restart.alert.description')}
                          </Box>
                          {
                            restartStatus.reasons.map((reason, i) => <Box 
                              paddingBottom={1}
                              key={i}
                              children={getMessage(`pages.settings.actions.restart.alert.reason.${reason}`)}
                            />)
                          }
                        </>
                    </RestartAlert>)}
                  <Box {...boxDefaultProps} >
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
                            disabled={restartStatus.required}
                          >
                            {allContentTypes.map((item) => <Option key={item.uid} value={item.uid}>{item.info.displayName}</Option>)}
                          </Select>
                        </GridItem>
                        {!isEmpty(values.selectedContentTypes) && (
                          <GridItem col={12}>
                            <AccordionGroup
                              label={getMessage('pages.settings.form.contentTypesSettings.label')}
                              labelAction={<Tooltip description={getMessage('pages.settings.form.contentTypesSettings.tooltip')}>
                                <Information aria-hidden={true} />
                              </Tooltip>}>
                              {orderBy(values.selectedContentTypes).map(uid => {
                                const { attributes, info: { displayName }, available, isSingle } = allContentTypes.find(item => item.uid == uid);
                                const stringAttributes = Object.keys(attributes).filter(_ => attributes[_].type === 'string');
                                const relationAttributes = Object.keys(attributes).filter(_ => attributes[_].type === 'relation');
                                const key = `collectionSettings-${uid}`;
                                return (<Accordion
                                  expanded={contentTypeExpanded === key}
                                  toggle={() => handleSetContentTypeExpanded(key)}
                                  key={key}
                                  id={key}
                                  size="S">
                                  <AccordionToggle title={displayName} togglePosition="left" startIcon={(isSingle && !available) && (<ExclamationMarkCircle aria-hidden={true} />)} />
                                  <AccordionContent>
                                    <Box padding={6}>
                                      <Stack size={4}>
                                        { (isSingle && !available) && (
                                          <PermanentAlert title={getMessage('pages.settings.form.contentTypesSettings.initializationWarning.title')} variant="danger" onClose={(e) => e.preventDefault()}>
                                            { getMessage('pages.settings.form.contentTypesSettings.initializationWarning.content') }
                                          </PermanentAlert>)}
                                        <Select
                                          name={`collectionSettings-${uid}-entryLabel`}
                                          label={getMessage('pages.settings.form.nameField.label')}
                                          hint={getMessage(`pages.settings.form.populate.${isEmpty(stringAttributes) ? 'empty' : 'hint'}`)}
                                          placeholder={getMessage('pages.settings.form.nameField.placeholder')}
                                          onClear={() => null}
                                          value={values.nameFields[uid] || []}
                                          onChange={(value) => setFieldValue('nameFields', prepareNameFieldFor(uid, values.nameFields, value))}
                                          multi
                                          withTags
                                          disabled={restartStatus.required || isEmpty(stringAttributes)}
                                        >
                                          {stringAttributes.map(key =>
                                            (<Option key={uid + key} value={key}>{capitalize(key.split('_').join(' '))}</Option>))}
                                        </Select>                                    
                                        <Select
                                          name={`collectionSettings-${uid}-populate`}
                                          label={getMessage('pages.settings.form.populate.label')}
                                          hint={getMessage(`pages.settings.form.populate.${isEmpty(relationAttributes) ? 'empty' : 'hint'}`)}
                                          placeholder={getMessage('pages.settings.form.populate.placeholder')}
                                          onClear={() => null}
                                          value={values.populate[uid] || []}
                                          onChange={(value) => setFieldValue('populate', prepareNameFieldFor(uid, values.populate, value))}
                                          multi
                                          withTags
                                          disabled={restartStatus.required || isEmpty(relationAttributes)}
                                        >
                                          {relationAttributes.map(key =>
                                            (<Option key={uid + key} value={key}>{capitalize(key.split('_').join(' '))}</Option>))}
                                        </Select>
                                      </Stack>
                                    </Box>

                                  </AccordionContent>
                                </Accordion>);
                              })}
                            </AccordionGroup>
                          </GridItem>)}
                      </Grid>
                    </Stack>
                  </Box>
                  <Box {...boxDefaultProps} >
                    <Stack size={4}>
                      <Typography variant="delta" as="h2">
                        {getMessage('pages.settings.additional.title')}
                      </Typography>
                      <Grid gap={4}>
                        <GridItem col={3} s={6} xs={12}>
                          <NumberInput
                            name="allowedLevels"
                            label={getMessage('pages.settings.form.allowedLevels.label')}
                            placeholder={getMessage('pages.settings.form.allowedLevels.placeholder')}
                            hint={getMessage('pages.settings.form.allowedLevels.hint')}
                            onValueChange={(value) => setFieldValue('allowedLevels', value, false)}
                            value={values.allowedLevels}
                            disabled={restartStatus.required}
                          />
                        </GridItem>
                        <GridItem col={4} s={12} xs={12}>
                          <ToggleInput
                            name="audienceFieldChecked"
                            label={getMessage('pages.settings.form.audience.label')}
                            hint={getMessage('pages.settings.form.audience.hint')}
                            checked={values.audienceFieldChecked}
                            onChange={({ target: { checked } }) => setFieldValue('audienceFieldChecked', checked, false)}
                            onLabel="Enabled"
                            offLabel="Disabled"
                            disabled={restartStatus.required}
                          />
                        </GridItem>
                        {isI18NPluginEnabled && (
                          <GridItem col={4} s={12} xs={12}>
                            <ToggleInput
                              name="i18nEnabled"
                              label={getMessage('pages.settings.form.i18n.label')}
                              hint={defaultLocale
                                ? getMessage('pages.settings.form.i18n.hint')
                                : getMessage('pages.settings.form.i18n.hint.missingDefaultLocale')
                              }
                              checked={values.i18nEnabled}
                              onChange={({ target: { checked } }) => {
                                setFieldValue('i18nEnabled', checked, false);
                                if (checked) {
                                  setPruneObsoleteI18nNavigations(false);
                                } else {
                                  setDisableI18nModalOpened(true);
                                  setI18nModalOnCancel(() => () => {
                                    setFieldValue('i18nEnabled', true);
                                  });
                                }
                              }}
                              onLabel="Enabled"
                              offLabel="Disabled"
                              disabled={restartStatus.required || !defaultLocale}
                            />
                          </GridItem>
                        )}
                      </Grid>
                    </Stack>
                  </Box>
                  <Box {...boxDefaultProps} >
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
                          {disableI18nModal}
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
