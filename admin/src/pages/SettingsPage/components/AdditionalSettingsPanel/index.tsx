import { useIntl } from 'react-intl';
import { isObject } from 'lodash';

import { Box, Flex, Grid, NumberInput, Toggle, Typography } from '@strapi/design-system';
import { Field } from '@sensinum/strapi-utils';

import { BOX_DEFAULT_PROPS } from '../../common';
import { getTrad } from '../../../../translations';
import { FormChangeEvent } from '../../../../types';
import { useConfig } from '../../hooks';
import { useSettingsContext } from '../../context';

export const AdditionalSettingsPanel = () => {
  const configQuery = useConfig();
  const { formatMessage } = useIntl();

  const { values, onChange, handleChange, restartStatus } = useSettingsContext();

  return (
    <Box {...BOX_DEFAULT_PROPS} width="100%">
      <Flex direction="column" alignItems="flex-start" gap={2}>
        <Typography variant="delta" as="h2">
          {formatMessage(getTrad('pages.settings.additional.title'))}
        </Typography>

        <Grid.Root gap={4} width="100%">
          <Grid.Item col={4} s={12} xs={12}>
            <Box width="100%">
              <Field
                name="allowedLevels"
                label={formatMessage(getTrad('pages.settings.form.allowedLevels.label'))}
                hint={formatMessage(getTrad('pages.settings.form.allowedLevels.hint'))}
              >
                <NumberInput
                  width="100%"
                  name="allowedLevels"
                  type="number"
                  placeholder={formatMessage(
                    getTrad('pages.settings.form.allowedLevels.placeholder')
                  )}
                  onChange={(eventOrPath: FormChangeEvent, value?: any) => {
                    if (isObject(eventOrPath)) {
                      const parsedVal = parseInt(eventOrPath.target.value);
                      return handleChange(
                        eventOrPath.target.name,
                        isNaN(parsedVal) ? 0 : parsedVal,
                        onChange
                      );
                    }
                    return handleChange(eventOrPath, value, onChange);
                  }}
                  value={values.allowedLevels}
                  disabled={restartStatus.required}
                />
              </Field>
            </Box>
          </Grid.Item>
          <Grid.Item col={4} s={12} xs={12}>
            <Field
              name="cascadeMenuAttached"
              label={formatMessage(getTrad('pages.settings.form.cascadeMenuAttached.label'))}
              hint={formatMessage(getTrad('pages.settings.form.cascadeMenuAttached.hint'))}
            >
              <Toggle
                width="100%"
                name="cascadeMenuAttached"
                checked={values.cascadeMenuAttached}
                onChange={(eventOrPath: FormChangeEvent) =>
                  handleChange(eventOrPath, !values.cascadeMenuAttached, onChange)
                }
                onLabel={formatMessage(getTrad('components.toggle.enabled'))}
                offLabel={formatMessage(getTrad('components.toggle.disabled'))}
                disabled={restartStatus.required}
              />
            </Field>
          </Grid.Item>
          <Grid.Item col={4} s={12} xs={12}>
            <Field
              name="audienceFieldChecked"
              label={formatMessage(getTrad('pages.settings.form.audience.label'))}
              hint={formatMessage(getTrad('pages.settings.form.audience.hint'))}
            >
              <Toggle
                name="audienceFieldChecked"
                checked={values.audienceFieldChecked}
                onChange={(eventOrPath: FormChangeEvent) =>
                  handleChange(eventOrPath, !values.audienceFieldChecked, onChange)
                }
                onLabel={formatMessage(getTrad('components.toggle.enabled'))}
                offLabel={formatMessage(getTrad('components.toggle.disabled'))}
                disabled={restartStatus.required}
                width="100%"
              />
            </Field>
          </Grid.Item>
          {configQuery.data?.isCachePluginEnabled && (
            <Grid.Item col={12} s={12} xs={12}>
              <Field
                name="isCacheEnabled"
                label={formatMessage(getTrad('pages.settings.form.cache.label'))}
                hint={formatMessage(getTrad('pages.settings.form.cache.hint'))}
              >
                <Toggle
                  name="isCacheEnabled"
                  checked={values.isCacheEnabled}
                  onChange={(eventOrPath: FormChangeEvent) =>
                    handleChange(eventOrPath, !values.isCacheEnabled, onChange)
                  }
                  onLabel={formatMessage(getTrad('components.toggle.enabled'))}
                  offLabel={formatMessage(getTrad('components.toggle.disabled'))}
                  disabled={restartStatus.required}
                  width="100%"
                />
              </Field>
            </Grid.Item>
          )}
        </Grid.Root>
      </Flex>
    </Box>
  );
};
