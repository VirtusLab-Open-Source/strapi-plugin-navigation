import { Accordion, Grid, MultiSelect, MultiSelectOption } from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import { useIntl } from 'react-intl';
import { get, isEmpty } from 'lodash';

import { getTrad } from '../../../../../translations';
import { useContentTypes } from '../../../hooks';
import { useSettingsContext } from '../../../context';

const ALLOWED_POPULATE_TYPES = ['relation', 'media', 'component', 'dynamiczone'];

export const ContentTypesSettings = () => {
  const contentTypesQuery = useContentTypes();

  const { formatMessage } = useIntl();

  const { values, onChange, handleChange, restartStatus, renderError } = useSettingsContext();

  const {
    contentTypes: contentTypesCurrent,
    contentTypesNameFields: contentTypeNameFieldsCurrent,
  } = values;

  return (
    <Grid.Item col={12} s={12} xs={12}>
      {contentTypesCurrent?.length ? (
        <Accordion.Root style={{ width: '100%' }}>
          {contentTypeNameFieldsCurrent.map((nameFields, index) => {
            const current = contentTypesQuery.data?.find(({ uid }) => uid === nameFields.key);
            const attributes = current?.attributes ?? ({} as Record<string, any>);
            const attributeKeys = Object.keys(attributes).sort();
            const allowedFieldsToPopulate = attributeKeys.filter((key) =>
              ALLOWED_POPULATE_TYPES.includes(attributes[key]?.type)
            );
            return current ? (
              <Accordion.Item key={nameFields.key} value={nameFields.key}>
                <Accordion.Header>
                  <Accordion.Trigger>
                    {current?.info.displayName ??
                      formatMessage(getTrad('pages.settings.form.nameField.default'))}
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content>
                  <Grid.Root gap={4} padding={2}>
                    <Grid.Item col={12} s={12} xs={12}>
                      <Field
                        name={`contentTypesNameFields[${index}]`}
                        label={formatMessage(getTrad('pages.settings.form.nameField.label'))}
                        hint={formatMessage(
                          getTrad(
                            `pages.settings.form.nameField.${isEmpty(get(values, `contentTypesNameFields[${index}].fields`, [])) ? 'empty' : 'hint'}`
                          )
                        )}
                      >
                        <MultiSelect
                          name={`contentTypesNameFields[${index}]`}
                          placeholder={formatMessage(
                            getTrad('pages.settings.form.nameField.placeholder')
                          )}
                          value={get(values, `contentTypesNameFields[${index}].fields`)}
                          onChange={(value: Array<string>) => {
                            const updated = get(values, 'contentTypesNameFields', []).map(
                              (item, i) => {
                                if (i === index) {
                                  return {
                                    ...item,
                                    fields: value,
                                  };
                                }
                                return item;
                              }
                            );

                            return handleChange('contentTypesNameFields', updated, onChange);
                          }}
                          disabled={restartStatus.required}
                          error={renderError(`contentTypesNameFields[${index}]`)}
                          withTags
                        >
                          {attributeKeys.map((attribute) => (
                            <MultiSelectOption key={attribute} value={attribute}>
                              {attribute}
                            </MultiSelectOption>
                          ))}
                        </MultiSelect>
                      </Field>
                    </Grid.Item>
                    <Grid.Item col={12} s={12} xs={12}>
                      <Field
                        name={`contentTypesPopulate[${index - 1}]`}
                        label={formatMessage(getTrad('pages.settings.form.populate.label'))}
                        hint={formatMessage(
                          getTrad(
                            `pages.settings.form.populate.${isEmpty(get(values, `contentTypesPopulate[${index - 1}]fields`, [])) ? 'empty' : 'hint'}`
                          )
                        )}
                      >
                        <MultiSelect
                          width="100%"
                          name={`contentTypesPopulate[${index - 1}]`}
                          placeholder={formatMessage(
                            getTrad('pages.settings.form.populate.placeholder')
                          )}
                          value={get(values, `contentTypesPopulate[${index - 1}].fields`, [])}
                          onChange={(value: Array<string>) => {
                            const updated = get(values, 'contentTypesPopulate', []).map(
                              (item, i) => {
                                if (i === index - 1) {
                                  return {
                                    ...item,
                                    fields: value,
                                  };
                                }
                                return item;
                              }
                            );

                            return handleChange('contentTypesPopulate', updated, onChange);
                          }}
                          disabled={restartStatus.required}
                          error={renderError(`contentTypesPopulate[${index - 1}]`)}
                          withTags
                        >
                          {allowedFieldsToPopulate.map((attribute) => (
                            <MultiSelectOption key={attribute} value={attribute}>
                              {attribute}
                            </MultiSelectOption>
                          ))}
                        </MultiSelect>
                      </Field>
                    </Grid.Item>
                    <Grid.Item col={12} s={12} xs={12}>
                      <Field
                        name={`pathDefaultFields[${index - 1}]`}
                        label={formatMessage(
                          getTrad('pages.settings.form.pathDefaultFields.label')
                        )}
                        hint={formatMessage(
                          getTrad(
                            `pages.settings.form.pathDefaultFields.${isEmpty(get(values, `pathDefaultFields[${index - 1}].fields`, [])) ? 'empty' : 'hint'}`
                          )
                        )}
                      >
                        <MultiSelect
                          name={`pathDefaultFields[${index - 1}]`}
                          width="100%"
                          placeholder={formatMessage(
                            getTrad('pages.settings.form.pathDefaultFields.placeholder')
                          )}
                          value={get(values, `pathDefaultFields[${index - 1}].fields`, [])}
                          onChange={(value: Array<string>) => {
                            const updated = get(values, 'pathDefaultFields', []).map((item, i) => {
                              if (i === index - 1) {
                                return {
                                  ...item,
                                  fields: value,
                                };
                              }
                              return item;
                            });

                            return handleChange('pathDefaultFields', updated, onChange);
                          }}
                          disabled={restartStatus.required}
                          error={renderError(`pathDefaultFields[${index - 1}]`)}
                          withTags
                        >
                          {attributeKeys.map((attribute) => (
                            <MultiSelectOption key={attribute} value={attribute}>
                              {attribute}
                            </MultiSelectOption>
                          ))}
                        </MultiSelect>
                      </Field>
                    </Grid.Item>
                  </Grid.Root>
                </Accordion.Content>
              </Accordion.Item>
            ) : null;
          })}
        </Accordion.Root>
      ) : null}
    </Grid.Item>
  );
};
