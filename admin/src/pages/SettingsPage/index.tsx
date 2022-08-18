import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { isEmpty, capitalize, isEqual, orderBy, get } from 'lodash';
import { Formik, Form } from 'formik';
import {
  CheckPermissions,
  LoadingIndicatorPage,
  useOverlayBlocker,
  useAutoReloadOverlayBlocker,
  SettingsPageTitle,
  //@ts-ignore
} from '@strapi/helper-plugin';
//@ts-ignore
import { Main } from '@strapi/design-system/Main';
//@ts-ignore
import { ContentLayout, HeaderLayout } from '@strapi/design-system/Layout';
//@ts-ignore
import { Accordion, AccordionToggle, AccordionContent, AccordionGroup } from '@strapi/design-system/Accordion';
//@ts-ignore
import { Button } from '@strapi/design-system/Button';
//@ts-ignore
import { Box } from '@strapi/design-system/Box';
//@ts-ignore
import { Divider } from '@strapi/design-system/Divider';
//@ts-ignore
import { Stack } from '@strapi/design-system/Stack';
//@ts-ignore
import { Typography } from '@strapi/design-system/Typography';
//@ts-ignore
import { Grid, GridItem } from '@strapi/design-system/Grid';
//@ts-ignore
import { ToggleInput } from '@strapi/design-system/ToggleInput';
//@ts-ignore
import { NumberInput } from '@strapi/design-system/NumberInput';
//@ts-ignore
import { Select, Option } from '@strapi/design-system/Select';
//@ts-ignore
import { Tooltip } from '@strapi/design-system/Tooltip';
//@ts-ignore
import { Check, Refresh, Play, Information, ExclamationMarkCircle } from '@strapi/icons';

import permissions from '../../permissions';
import useNavigationConfig from '../../hooks/useNavigationConfig';
import useAllContentTypes from '../../hooks/useAllContentTypes';
import { navigationItemAdditionalFields, prepareNewValueForRecord } from '../../utils';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import RestartAlert from '../../components/RestartAlert';
import { getMessage } from '../../utils';
import { isContentTypeEligible, resolveGlobalLikeId } from './utils/functions';
import { PermanentAlert } from '../../components/Alert/styles';
import { useDisableI18nModal } from './components/DisableI18nModal';

import { NavigationItemAdditionalField, NavigationItemCustomField } from '../../../../types';
import CustomFieldModal from './components/CustomFieldModal';
import CustomFieldTable from './components/CustomFieldTable';
import { HandleSetContentTypeExpanded, OnPopupClose, OnSave, PreparePayload, RawPayload, RestartReasons, RestartStatus, StrapiContentTypeSchema } from './types';

const RESTART_NOT_REQUIRED: RestartStatus = { required: false }
const RESTART_REQUIRED: RestartStatus = { required: true, reasons: [] }
const RELATION_ATTRIBUTE_TYPES = ['relation', 'media', 'component'];
const STRING_ATTRIBUTE_TYPES = ['string', 'uid'];
const BOX_DEFAULT_PROPS = {
  background: "neutral0",
  hasRadius: true,
  shadow: "filterShadow",
  padding: 6,
};

const SettingsPage = () => {
  const { lockApp, unlockApp } = useOverlayBlocker();
  const { lockAppWithAutoreload, unlockAppWithAutoreload } = useAutoReloadOverlayBlocker();
  const [restartStatus, setRestartStatus] = useState<RestartStatus>(RESTART_NOT_REQUIRED);
  const [pruneObsoleteI18nNavigations, setPruneObsoleteI18nNavigations] = useState<boolean>(false);
  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState<boolean>(false);
  const [customFieldSelected, setCustomFieldSelected] = useState<NavigationItemCustomField | null>(null);
  const [customFields, setCustomFields] = useState<NavigationItemCustomField[]>([]);
  const [isRestorePopupOpen, setIsRestorePopupOpen] = useState<boolean>(false);
  const [contentTypeExpanded, setContentTypeExpanded] = useState<string | undefined>(undefined);
  const { navigationConfig, isLoading: isConfigLoading, error: configErr, submitConfig, restoreConfig, restartStrapi } = useNavigationConfig();
  const { data: allContentTypesData, isLoading: isContentTypesLoading, error: contentTypesErr } = useAllContentTypes();
  
  const isLoading = isConfigLoading || isContentTypesLoading;
  const isError = configErr || contentTypesErr;

  // TODO: [@ltsNotMike] Remove ts-ignore
  // @ts-ignore
  const configContentTypes: StrapiContentTypeSchema[] = navigationConfig?.contentTypes || [];

  const formikInitialValues = useMemo<RawPayload>(() => ({
    allowedLevels: get(navigationConfig, "allowedLevels", 2),
    audienceFieldChecked: get(navigationConfig, "additionalFields", [] as NavigationItemAdditionalField[]).includes('audience'),
    i18nEnabled: get(navigationConfig, "i18nEnabled", false),
    nameFields: get(navigationConfig, "contentTypesNameFields", {}),
    pathDefaultFields: get(navigationConfig, "pathDefaultFields", {}),
    populate: get(navigationConfig, "contentTypesPopulate", {}),
    selectedContentTypes: configContentTypes.map(item => item.uid),
  }), [configContentTypes, navigationConfig, navigationItemAdditionalFields]);

  const {
    disableI18nModal,
    setDisableI18nModalOpened,
    setI18nModalOnCancel,
  } = useDisableI18nModal(({ pruneNavigations }) => {
    setPruneObsoleteI18nNavigations(pruneNavigations)
  });

  useEffect(() => {
    const customFields = navigationConfig?.additionalFields
      ?.filter((field: NavigationItemAdditionalField) => field !== navigationItemAdditionalFields.AUDIENCE) as NavigationItemCustomField[];
    setCustomFields(customFields || []);
  }, [navigationConfig]);

  const preparePayload = useCallback<PreparePayload>(({
    form: {
      allowedLevels,
      audienceFieldChecked,
      i18nEnabled,
      nameFields,
      pathDefaultFields,
      populate,
      selectedContentTypes,
    },
    pruneObsoleteI18nNavigations
  }) => ({
    additionalFields: audienceFieldChecked ? ['audience', ...customFields] : [...customFields],
    allowedLevels,
    contentTypes: selectedContentTypes,
    contentTypesNameFields: nameFields,
    contentTypesPopulate: populate,
    i18nEnabled,
    pathDefaultFields,
    pruneObsoleteI18nNavigations,
    gql: {
      navigationItemRelated: selectedContentTypes.map((uid: string) => resolveGlobalLikeId(uid)),
    }
  }), [customFields]);

  const onSave: OnSave = async (form) => {
    lockApp();
    const payload = preparePayload({ form, pruneObsoleteI18nNavigations });
    await submitConfig({ ...payload, slugify: navigationConfig.slugify });
    const isContentTypesChanged = !isEqual(payload.contentTypes, navigationConfig.contentTypes);
    const isI18nChanged = !isEqual(payload.i18nEnabled, navigationConfig.i18nEnabled);
    const restartReasons: RestartReasons[] = []
    if (isI18nChanged) {
      restartReasons.push('I18N');
    }
    if (isContentTypesChanged && navigationConfig.isGQLPluginEnabled) {
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

  const onPopupClose: OnPopupClose = async (isConfirmed) => {
    setIsRestorePopupOpen(false);
    if (isConfirmed) {
      lockApp();
      await restoreConfig();
      unlockApp();
      setRestartStatus(RESTART_REQUIRED);
    }
  }

  const handleRestart = async () => {
    lockAppWithAutoreload();
    await restartStrapi();
    unlockAppWithAutoreload();
    setRestartStatus(RESTART_NOT_REQUIRED);
  };
  const handleRestartDiscard = () => setRestartStatus(RESTART_NOT_REQUIRED);
  const handleSetContentTypeExpanded: HandleSetContentTypeExpanded = key => setContentTypeExpanded(key === contentTypeExpanded ? undefined : key);

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

  const allContentTypes: StrapiContentTypeSchema[] = !isLoading ? Object.values<StrapiContentTypeSchema>(allContentTypesData).filter(({ uid }) => isContentTypeEligible(uid, {
    allowedContentTypes: navigationConfig?.contentTypes,
// TODO: [@ltsNotMike] Remove ts-ignore
// @ts-ignore
    restrictedContentTypes: navigationConfig?.restrictedContentTypes,
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
  }) : [];

  const isI18NPluginEnabled = navigationConfig?.isI18NPluginEnabled;
  const defaultLocale = navigationConfig?.defaultLocale;

  const handleSubmitCustomField = (field: NavigationItemCustomField) => {
    const filteredFields = customFields.filter(f => f.name !== field.name);
    setCustomFields([...filteredFields, field]);
    setCustomFieldSelected(null);
    setIsCustomFieldModalOpen(false);
  }

  const handleOpenCustomFieldModal = (field: NavigationItemCustomField | null) => {
    setCustomFieldSelected(field);
    setIsCustomFieldModalOpen(true);
  }

  const handleRemoveCustomField = (field: NavigationItemCustomField) => {
    const filteredFields = customFields.filter(f => f.name !== field.name);
    setCustomFields(filteredFields);
    setCustomFieldSelected(null);
    setIsCustomFieldModalOpen(false);
  }

  const handleToggleCustomField = (field: NavigationItemCustomField) => {
    const updatedField = { ...field, enabled: !get(field, 'enabled', false) }
    const filteredFields = customFields.filter(f => f.name !== field.name);
    setCustomFields([...filteredFields, updatedField]);
  }

  return (
    <>
      <SettingsPageTitle
        name={getMessage('Settings.email.plugin.title', 'Configuration')}
      />
      <Main labelledBy="title">
        <Formik
          initialValues={formikInitialValues}
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
                          restartStatus.reasons?.map((reason, i) => <Box
                            paddingBottom={1}
                            key={i}
                            children={getMessage(`pages.settings.actions.restart.alert.reason.${reason}`)}
                          />)
                        }
                      </>
                    </RestartAlert>)}
                  <Box {...BOX_DEFAULT_PROPS} >
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
                            onChange={(value: string[]) => setFieldValue('selectedContentTypes', value, false)}
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
                                const contentType = allContentTypes.find(item => item.uid == uid);
                                if (!contentType) return;
                                const { attributes, info: { displayName }, available, isSingle } = contentType;
                                const stringAttributes = Object.keys(attributes).filter(_ => STRING_ATTRIBUTE_TYPES.includes(attributes[_].type));
                                const relationAttributes = Object.keys(attributes).filter(_ => RELATION_ATTRIBUTE_TYPES.includes(attributes[_].type));
                                const key = `collectionSettings-${uid}`;
                                return (<Accordion
                                  expanded={contentTypeExpanded === key}
                                  toggle={() => handleSetContentTypeExpanded(key)}
                                  key={key}
                                  id={key}
                                  size="S">
                                  <AccordionToggle title={displayName} togglePosition="left" startIcon={(isSingle && !available) ? (<ExclamationMarkCircle aria-hidden={true} />) : null} />
                                  <AccordionContent>
                                    <Box padding={6}>
                                      <Stack size={4}>
                                        {(isSingle && !available) && (
                                          <PermanentAlert title={getMessage('pages.settings.form.contentTypesSettings.initializationWarning.title')} variant="danger" onClose={(e: React.FormEvent) => e.preventDefault()}>
                                            {getMessage('pages.settings.form.contentTypesSettings.initializationWarning.content')}
                                          </PermanentAlert>)}
                                        <Select
                                          name={`collectionSettings-${uid}-entryLabel`}
                                          label={getMessage('pages.settings.form.nameField.label')}
                                          hint={getMessage(`pages.settings.form.nameField.${isEmpty(stringAttributes) ? 'empty' : 'hint'}`)}
                                          placeholder={getMessage('pages.settings.form.nameField.placeholder')}
                                          onClear={() => setFieldValue('nameFields', prepareNewValueForRecord(uid, values.nameFields, []))}
                                          value={values.nameFields[uid] || []}
                                          onChange={(value: string[]) => setFieldValue('nameFields', prepareNewValueForRecord(uid, values.nameFields, value))}
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
                                          onClear={() => setFieldValue('populate', prepareNewValueForRecord(uid, values.populate, []))}
                                          value={values.populate[uid] || []}
                                          onChange={(value: string[]) => setFieldValue('populate', prepareNewValueForRecord(uid, values.populate, value))}
                                          multi
                                          withTags
                                          disabled={restartStatus.required || isEmpty(relationAttributes)}
                                        >
                                          {relationAttributes.map(key =>
                                            (<Option key={uid + key} value={key}>{capitalize(key.split('_').join(' '))}</Option>))}
                                        </Select>
                                        <Select
                                          name={`collectionSettings-${uid}-pathDefaultFields`}
                                          label={getMessage('pages.settings.form.pathDefaultFields.label')}
                                          hint={getMessage(`pages.settings.form.pathDefaultFields.${isEmpty(stringAttributes) ? 'empty' : 'hint'}`)}
                                          placeholder={getMessage('pages.settings.form.pathDefaultFields.placeholder')}
                                          onClear={() => setFieldValue('pathDefaultFields', prepareNewValueForRecord(uid, values.pathDefaultFields, []))}
                                          value={values.pathDefaultFields[uid] || []}
                                          onChange={(value: string[]) => setFieldValue('pathDefaultFields', prepareNewValueForRecord(uid, values.pathDefaultFields, value))}
                                          multi
                                          withTags
                                          disabled={restartStatus.required || isEmpty(stringAttributes)}
                                        >
                                          {stringAttributes.map(key =>
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
                  <Box {...BOX_DEFAULT_PROPS} >
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
                            onValueChange={(value: number) => setFieldValue('allowedLevels', value, false)}
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
                            onChange={() => setFieldValue('audienceFieldChecked', !values.audienceFieldChecked, false)}
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
                              onChange={({ target: { checked } }: { target: { checked: boolean } }) => {
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
                  <Box {...BOX_DEFAULT_PROPS} >
                    <Stack size={4}>
                      <Typography variant="delta" as="h2">
                        {getMessage('pages.settings.customFields.title')}
                      </Typography>
                      <CustomFieldTable
                        data={customFields}
                        onOpenModal={handleOpenCustomFieldModal}
                        onRemoveCustomField={handleRemoveCustomField}
                        onToggleCustomField={handleToggleCustomField}
                      />
                    </Stack>
                  </Box>
                  <Box {...BOX_DEFAULT_PROPS} >
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
      {isCustomFieldModalOpen &&
        <CustomFieldModal
          onClose={() => setIsCustomFieldModalOpen(false)}
          onSubmit={handleSubmitCustomField}
          isOpen={isCustomFieldModalOpen}
          data={customFieldSelected}
          usedCustomFieldNames={customFields.filter(f => f.name !== customFieldSelected?.name).map(f => f.name)}
        />
      }
    </>
  );
}


export default SettingsPage;
