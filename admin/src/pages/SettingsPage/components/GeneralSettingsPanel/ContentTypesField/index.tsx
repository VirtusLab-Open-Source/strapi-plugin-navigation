import { Grid, MultiSelect, MultiSelectOption } from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import { useIntl } from 'react-intl';
import { sortBy } from 'lodash';

import { getTrad } from '../../../../../translations';
import { useConfig, useContentTypes } from '../../../hooks';
import { isContentTypeEligible } from '../../../utils';
import { useSettingsContext } from '../../../context';

export const ContentTypesField = () => {
  const configQuery = useConfig();
  const contentTypesQuery = useContentTypes();

  const { formatMessage } = useIntl();

  const { values, onChange, handleChange, restartStatus, setFormValueItem, renderError } =
    useSettingsContext();

  const { contentTypes: contentTypesCurrent, preferCustomContentTypes } = values;

  const allContentTypes = sortBy(
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
  );

  return (
    <Grid.Item col={4} s={12} xs={12}>
      <Field
        name="contentTypes"
        label={formatMessage(getTrad('pages.settings.form.contentTypes.label'))}
        hint={formatMessage(getTrad('pages.settings.form.contentTypes.hint'))}
      >
        <MultiSelect
          name="contentTypes"
          label={formatMessage(getTrad('pages.settings.form.contentTypes.label'))}
          aria-label={formatMessage(getTrad('pages.settings.form.contentTypes.label'))}
          placeholder={formatMessage(getTrad('pages.settings.form.contentTypes.placeholder'))}
          value={values.contentTypes}
          onChange={(value: Array<string>) => {
            handleChange('contentTypes', value, onChange);

            const {
              contentTypesNameFields = [],
              contentTypesPopulate = [],
              pathDefaultFields = [],
            } = values;

            const missingKeys =
              value.filter(
                (key) => !contentTypesNameFields.find((nameFields) => nameFields.key === key)
              ) ?? [];
            const redundantKeys =
              contentTypesNameFields
                .filter(
                  (nameFields) => !value.includes(nameFields.key) || nameFields.key === 'default'
                )
                .map(({ key }) => key) ?? [];

            setFormValueItem('contentTypesNameFields', [
              ...(contentTypesNameFields.filter(
                ({ key }) => !redundantKeys.includes(key) || key === 'default'
              ) ?? []),
              ...missingKeys.map((key) => ({ key, fields: [] })),
            ]);

            setFormValueItem('contentTypesPopulate', [
              ...(contentTypesPopulate.filter(
                ({ key }) => !redundantKeys.includes(key) || key === 'default'
              ) ?? []),
              ...missingKeys.map((key) => ({ key, fields: [] })),
            ]);

            setFormValueItem('pathDefaultFields', [
              ...(pathDefaultFields.filter(
                ({ key }) => !redundantKeys.includes(key) || key === 'default'
              ) ?? []),
              ...missingKeys.map((key) => ({ key, fields: [] })),
            ]);
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
  );
};
