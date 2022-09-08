import React, { useEffect, useMemo, useState } from 'react';
import { get, isEqual, pick } from 'lodash';
import { Formik, Form } from 'formik';
import {
  CheckPermissions,
  useOverlayBlocker,
  useAutoReloadOverlayBlocker,
// @ts-ignore
} from '@strapi/helper-plugin';
// @ts-ignore
import { Main } from '@strapi/design-system/Main';
// @ts-ignore
import { ContentLayout, HeaderLayout } from '@strapi/design-system/Layout';
// @ts-ignore
import { Accordion, AccordionToggle, AccordionContent, AccordionGroup } from '@strapi/design-system/Accordion';
// @ts-ignore
import { Button } from '@strapi/design-system/Button';
// @ts-ignore
import { Box } from '@strapi/design-system/Box';
// @ts-ignore
import { Stack } from '@strapi/design-system/Stack';
// @ts-ignore
import { Typography } from '@strapi/design-system/Typography';
// @ts-ignore
import { Grid, GridItem } from '@strapi/design-system/Grid';
// @ts-ignore
import { ToggleInput } from '@strapi/design-system/ToggleInput';
// @ts-ignore
import { NumberInput } from '@strapi/design-system/NumberInput';
// @ts-ignore
import { Select, Option } from '@strapi/design-system/Select';
// @ts-ignore
import { Tooltip } from '@strapi/design-system/Tooltip';

import RestartAlert from '../../../../components/RestartAlert';
import CustomFieldTable from '../../components/CustomFieldTable';
import CustomFieldModal from '../../components/CustomFieldModal';
import { getMessage } from '../../../../utils';
import permissions from '../../../../permissions';
import { Effect, NavigationItemAdditionalField, NavigationItemCustomField, NavigationSettingsConfig, VoidEffect, NavigationRawConfig } from '../../../../../../types';
import { OnSave, PreparePayload, RawPayload, RestartReasons, RestartStatus } from '../../types';
import { useDisableI18nModal } from '../DisableI18nModal';
import { isContentTypeEligible, resolveGlobalLikeId } from '../../utils/functions';
import { StrapiContentTypeFullSchema } from 'strapi-typed';
import ContentTypesSettings from '../ContentTypesSettings';
import RestoreConfigSettings from '../RestoreConfigSettings';
import AdditionalConfigSettings from '../AdditionalConfigSettings';
import { checkIcon, playIcon } from '../../../../components/icons';

const RESTART_NOT_REQUIRED: RestartStatus = { required: false }
const RESTART_REQUIRED: RestartStatus = { required: true, reasons: [] }
const BOX_DEFAULT_PROPS = {
  background: "neutral0",
  hasRadius: true,
  shadow: "filterShadow",
  padding: 6,
};

const preparePayload: PreparePayload = ({
  form: {
    allowedLevels,
    audienceFieldChecked,
    i18nEnabled,
    nameFields,
    pathDefaultFields,
    populate,
    selectedContentTypes,
  },
  pruneObsoleteI18nNavigations,
  customFields
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
});

interface IProps {
  allContentTypes: StrapiContentTypeFullSchema[];
  config: NavigationSettingsConfig;
  submitConfig: Effect<NavigationRawConfig>;
  restoreConfig: VoidEffect;
  restartStrapi: VoidEffect;
}

const MainSettingsView: React.FC<IProps> = ({
  allContentTypes,
  config,
  submitConfig,
  restoreConfig,
  restartStrapi,
}) => {
  const [pruneObsoleteI18nNavigations, setPruneObsoleteI18nNavigations] = useState<boolean>(false);
  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState<boolean>(false);
  const [customFieldSelected, setCustomFieldSelected] = useState<NavigationItemCustomField | null>(null);
  const [customFields, setCustomFields] = useState<NavigationItemCustomField[]>([]);
  const [restartStatus, setRestartStatus] = useState<RestartStatus>(RESTART_NOT_REQUIRED);
  const { lockApp, unlockApp } = useOverlayBlocker();
  const { lockAppWithAutoreload, unlockAppWithAutoreload } = useAutoReloadOverlayBlocker();
  const {
    disableI18nModal,
    setDisableI18nModalOpened,
    setI18nModalOnCancel,
  } = useDisableI18nModal(({ pruneNavigations }) => {
    setPruneObsoleteI18nNavigations(pruneNavigations)
  });

  useEffect(() => {
    const customFields = config.additionalFields
      ?.filter((field: NavigationItemAdditionalField) => field !== 'audience') as NavigationItemCustomField[];
    setCustomFields(customFields);
  }, [config]);

  const formikInitialValues = useMemo<RawPayload>(() => ({
    allowedLevels: get(config, "allowedLevels", 2),
    audienceFieldChecked: get(config, "additionalFields", [] as NavigationItemAdditionalField[]).includes('audience'),
    i18nEnabled: get(config, "i18nEnabled", false),
    nameFields: get(config, "contentTypesNameFields", {}),
    pathDefaultFields: get(config, "pathDefaultFields", {}),
    populate: get(config, "contentTypesPopulate", {}),
    selectedContentTypes: config.contentTypes.map(item => item.uid),
  }), [config]);
  // TODO: [@ltsNotMike] f1 This place needs some more complicated fix
  // 1. There shouldn't be isContentTypeEligable function since its already done on server side
  // 2. Why do we only add available and isSingle to the types found in config?
  // 3. Couldn't we just use allContentTypes since we pass all of them?
  // 4. This questions might be wrongly asked here but that's why this place needs more thought put into it.
  // @ts-ignore
  const allEligibleContentTypes: StrapiContentTypeSchema[] = Object
    .values<StrapiContentTypeFullSchema>(allContentTypes)
    .filter(({ uid }) => isContentTypeEligible(uid, config))
    .map(ct => {
      const type = config.contentTypes.find(_ => _.uid === ct.uid);
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

  const handleRestart = async () => {
    lockAppWithAutoreload();
    await restartStrapi();
    unlockAppWithAutoreload();
    setRestartStatus(RESTART_NOT_REQUIRED);
  };

  const handleSubmitCustomField = (field: NavigationItemCustomField) => {
    const filteredFields = customFields.filter(f => f.name !== field.name);
    setCustomFields([...filteredFields, field]);
    setCustomFieldSelected(null);
    setIsCustomFieldModalOpen(false);
  }

  const handleRestartDiscard = () => setRestartStatus(RESTART_NOT_REQUIRED);

  const onSave: OnSave = async (form) => {
    lockApp();
    const payload = preparePayload({ form, pruneObsoleteI18nNavigations, customFields });
    await submitConfig(payload);
    const isContentTypesChanged = !isEqual(payload.contentTypes, config.contentTypes);
    const isI18nChanged = !isEqual(payload.i18nEnabled, config.i18nEnabled);
    const restartReasons: RestartReasons[] = []
    if (isI18nChanged) {
      restartReasons.push('I18N');
    }
    if (isContentTypesChanged && config.isGQLPluginEnabled) {
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

  return (
    <>
      <Main labelledBy="title">
        <Formik
          initialValues={formikInitialValues as RawPayload}
          onSubmit={onSave}
        >
          {({ handleSubmit, setFieldValue, values }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <HeaderLayout
                title={getMessage('pages.settings.header.title')}
                subtitle={getMessage('pages.settings.header.description')}
                primaryAction={
                  <CheckPermissions permissions={permissions.access}>
                    <Button type="submit" startIcon={checkIcon} disabled={restartStatus.required}>
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
                      action={<Box><Button onClick={handleRestart} startIcon={playIcon}>{getMessage('pages.settings.actions.restart')}</Button></Box>}
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
                    <ContentTypesSettings
                      allEligibleContentTypes={allEligibleContentTypes}
                      setFieldValue={setFieldValue}
                      restartStatus={restartStatus}
                      {...pick(values, "selectedContentTypes", "nameFields", "populate", "pathDefaultFields")}
                    />
                  </Box>
                  <Box {...BOX_DEFAULT_PROPS} >
                    <AdditionalConfigSettings
                      allowedLevels={values.allowedLevels}
                      audienceFieldChecked={values.audienceFieldChecked}
                      restartStatus={restartStatus}
                      isI18NPluginEnabled={config.isI18NPluginEnabled}
                      defaultLocale={config.defaultLocale}
                      i18nEnabled={values.i18nEnabled}
                      setFieldValue={setFieldValue}
                      setI18nModalOnCancel={setI18nModalOnCancel}
                      setDisableI18nModalOpened={setDisableI18nModalOpened}
                      setPruneObsoleteI18nNavigations={setPruneObsoleteI18nNavigations}
                    />
                  </Box>
                  <Box {...BOX_DEFAULT_PROPS} >
                    <CustomFieldTable
                      data={customFields}
                      onOpenModal={handleOpenCustomFieldModal}
                      onRemoveCustomField={handleRemoveCustomField}
                      onToggleCustomField={handleToggleCustomField}
                    />
                  </Box>
                  <Box {...BOX_DEFAULT_PROPS} >
                    <RestoreConfigSettings
                      setRestartStatus={setRestartStatus}
                      restoreConfig={restoreConfig}
                      disableI18nModal={disableI18nModal}
                    />
                  </Box>
                </Stack>
              </ContentLayout>
            </Form>
          )}
        </Formik>
      </Main>
      <CustomFieldModal
        onClose={() => setIsCustomFieldModalOpen(false)}
        onSubmit={handleSubmitCustomField}
        isOpen={isCustomFieldModalOpen}
        data={customFieldSelected}
        usedCustomFieldNames={customFields.filter(f => f.name !== customFieldSelected?.name).map(f => f.name)}
      />
    </>
  )
}

export default MainSettingsView;