import React, { useCallback, useState } from 'react';
import { capitalize, isEmpty, orderBy } from 'lodash';

// @ts-ignore
import { Stack } from '@strapi/design-system/Stack';
// @ts-ignore
import { Typography } from '@strapi/design-system/Typography';
// @ts-ignore
import { Grid, GridItem } from '@strapi/design-system/Grid';
// @ts-ignore
import { Select, Option } from '@strapi/design-system/Select';
// @ts-ignore
import { Accordion, AccordionToggle, AccordionContent, AccordionGroup } from '@strapi/design-system/Accordion';
// @ts-ignore
import { Box } from '@strapi/design-system/Box';
// @ts-ignore
import { Tooltip } from '@strapi/design-system/Tooltip';

import { getMessage, prepareNewValueForRecord } from '../../../../utils';
import { HandleSetContentTypeExpanded, RestartStatus, StrapiContentTypeSchema } from '../../types';
import { PermanentAlert } from '../../../../components/Alert/styles';
import { exclamationMarkCircleIcon, informationIcon } from '../../../../components/icons/';

interface IProps {
  allEligibleContentTypes: StrapiContentTypeSchema[];
  setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
  selectedContentTypes: string[];
  restartStatus: RestartStatus;
  nameFields: Record<string, string[]>;
  populate: Record<string, string[]>;
  pathDefaultFields: Record<string, string[]>;
}

const RELATION_ATTRIBUTE_TYPES = ['relation', 'media', 'component'];
const STRING_ATTRIBUTE_TYPES = ['string', 'uid'];

const defaultPerContentTypeSelectProps = (uid: string, name: string, isEmpty: boolean) => ({
  name: `collectionSettings-${uid}-${name}`,
  label: getMessage(`pages.settings.form.${name}.label`),
  hint: getMessage(`pages.settings.form.${name}.${isEmpty ? 'empty' : 'hint'}`),
  placeholder: getMessage(`pages.settings.form.${name}.placeholder`),
  multi: true,
  withTags: true,
});

const ContentTypesSettings: React.FC<IProps> = ({
  allEligibleContentTypes,
  setFieldValue,
  selectedContentTypes,
  restartStatus,
  nameFields,
  populate,
  pathDefaultFields,
}) => {
  const [contentTypeExpanded, setContentTypeExpanded] = useState<string | undefined>(undefined);
  const handleSetContentTypeExpanded: HandleSetContentTypeExpanded = useCallback(
    key => setContentTypeExpanded(key === contentTypeExpanded ? undefined : key),
    [setContentTypeExpanded, contentTypeExpanded]
  );

  return (
    <Stack spacing={4}>
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
            value={selectedContentTypes}
            onChange={(value: string[]) => setFieldValue('selectedContentTypes', value, false)}
            multi
            withTags
            disabled={restartStatus.required}
          >
            {allEligibleContentTypes.map((item) => <Option key={item.uid} value={item.uid}>{item.info.displayName}</Option>)}
          </Select>
        </GridItem>
        {!isEmpty(selectedContentTypes) && (
          <GridItem col={12}>
            <AccordionGroup
              label={getMessage('pages.settings.form.contentTypesSettings.label')}
              labelAction={<Tooltip description={getMessage('pages.settings.form.contentTypesSettings.tooltip')}>
                {informationIcon}
              </Tooltip>}>
              {orderBy(selectedContentTypes).map(uid => {
                const contentType = allEligibleContentTypes.find(item => item.uid == uid);
                if (!contentType) return;
                const { attributes, info: { displayName }, available, isSingle } = contentType;
                const stringAttributes = Object.keys(attributes).filter(attr => STRING_ATTRIBUTE_TYPES.includes(attributes[attr].type));
                const relationAttributes = Object.keys(attributes).filter(attr => RELATION_ATTRIBUTE_TYPES.includes(attributes[attr].type));
                const key = `collectionSettings-${uid}`;
                return (<Accordion
                  expanded={contentTypeExpanded === key}
                  toggle={() => handleSetContentTypeExpanded(key)}
                  key={key}
                  id={key}
                  size="S">
                  <AccordionToggle title={displayName} togglePosition="left" startIcon={(isSingle && !available) ? (exclamationMarkCircleIcon) : null} />
                  <AccordionContent>
                    <Box padding={6}>
                      <Stack spacing={4}>
                        {(isSingle && !available) && (
                          <PermanentAlert title={getMessage('pages.settings.form.contentTypesSettings.initializationWarning.title')} variant="danger" onClose={(e: React.FormEvent) => e.preventDefault()}>
                            {getMessage('pages.settings.form.contentTypesSettings.initializationWarning.content')}
                          </PermanentAlert>)}
                        <Select
                          {...defaultPerContentTypeSelectProps(uid, "nameField", isEmpty(stringAttributes))}
                          onClear={() => setFieldValue('nameFields', prepareNewValueForRecord(uid, nameFields, []))}
                          value={nameFields[uid] || []}
                          onChange={(value: string[]) => setFieldValue('nameFields', prepareNewValueForRecord(uid, nameFields, value))}
                          disabled={restartStatus.required || isEmpty(stringAttributes)}
                        >
                          {stringAttributes.map(key =>
                            (<Option key={uid + key} value={key}>{capitalize(key.split('_').join(' '))}</Option>))}
                        </Select>
                        <Select
                          {...defaultPerContentTypeSelectProps(uid, "populate", isEmpty(relationAttributes))}
                          onClear={() => setFieldValue('populate', prepareNewValueForRecord(uid, populate, []))}
                          value={populate[uid] || []}
                          onChange={(value: string[]) => setFieldValue('populate', prepareNewValueForRecord(uid, populate, value))}
                          disabled={restartStatus.required || isEmpty(relationAttributes)}
                        >
                          {relationAttributes.map(key =>
                            (<Option key={uid + key} value={key}>{capitalize(key.split('_').join(' '))}</Option>))}
                        </Select>
                        <Select
                          {...defaultPerContentTypeSelectProps(uid, "pathDefaultFields", isEmpty(stringAttributes))}
                          onClear={() => setFieldValue('pathDefaultFields', prepareNewValueForRecord(uid, pathDefaultFields, []))}
                          value={pathDefaultFields[uid] || []}
                          onChange={(value: string[]) => setFieldValue('pathDefaultFields', prepareNewValueForRecord(uid, pathDefaultFields, value))}
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
  );
}

export default ContentTypesSettings;