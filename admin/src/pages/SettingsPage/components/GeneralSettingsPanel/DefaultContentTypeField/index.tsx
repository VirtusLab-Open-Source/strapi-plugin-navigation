import { Grid, SingleSelect, SingleSelectOption } from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import { useIntl } from 'react-intl';

import { useSettingsContext } from '../../../context';
import { getTrad } from '../../../../../translations';
import { useEffect, useMemo } from 'react';
import { useContentTypes } from '../../../hooks';

export const DefaultContentTypeField = () => {
  const contentTypesQuery = useContentTypes();

  const { formatMessage } = useIntl();

  const { values, onChange, handleChange, restartStatus, renderError } = useSettingsContext();

  const availableContentTypes = useMemo(
    () =>
      values.contentTypes
        ?.map((contentType) => contentTypesQuery.data?.find(({ uid }) => uid === contentType))
        .filter((contentType) => contentType !== undefined) || [],
    [values.contentTypes, contentTypesQuery.data]
  );

  useEffect(() => {
    if (!values.defaultContentType) {
      return;
    }
    if (!values.contentTypes.includes(values.defaultContentType)) {
      handleChange('defaultContentType', undefined, onChange);
    }
  }, [values.contentTypes]);

  return (
    <Grid.Item col={4} s={12} xs={12}>
      <Field
        name="defaultContentType"
        label={formatMessage(getTrad('pages.settings.form.defaultContentType.label'))}
        hint={formatMessage(getTrad('pages.settings.form.defaultContentType.hint'))}
      >
        <SingleSelect
          name="defaultContentType"
          label={formatMessage(getTrad('pages.settings.form.defaultContentType.label'))}
          aria-label={formatMessage(getTrad('pages.settings.form.defaultContentType.label'))}
          placeholder={formatMessage(getTrad('pages.settings.form.defaultContentType.placeholder'))}
          value={values.defaultContentType}
          onChange={(value: string) => handleChange('defaultContentType', value, onChange)}
          onClear={() => handleChange('defaultContentType', undefined, onChange)}
          disabled={restartStatus.required}
          error={renderError('defaultContentType')}
          withTags
          width="100%"
        >
          {availableContentTypes.map((item) => (
            <SingleSelectOption key={item.uid} value={item.uid}>
              {item.info.displayName}
            </SingleSelectOption>
          ))}
        </SingleSelect>
      </Field>
    </Grid.Item>
  );
};
