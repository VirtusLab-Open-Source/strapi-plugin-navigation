import React from 'react';
// @ts-ignore
import { Stack } from '@strapi/design-system/Stack';
// @ts-ignore
import { Typography } from '@strapi/design-system/Typography';
// @ts-ignore
import { Grid, GridItem } from '@strapi/design-system/Grid';
// @ts-ignore
import { NumberInput } from '@strapi/design-system/NumberInput';
// @ts-ignore
import { ToggleInput } from '@strapi/design-system/ToggleInput';

import { getMessage } from '../../../../utils';
import { RestartStatus } from '../../types';
import { Effect, VoidEffect } from '../../../../../../types';

interface IProps {
  allowedLevels: number;
  audienceFieldChecked: boolean;
  restartStatus: RestartStatus;
  isI18NPluginEnabled?: boolean;
  defaultLocale?: string | null;
  i18nEnabled: boolean;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
  setI18nModalOnCancel: Effect<VoidEffect>;
  setDisableI18nModalOpened: Effect<boolean>;
  setPruneObsoleteI18nNavigations: Effect<boolean>;
}

const AdditionalConfigSettings: React.FC<IProps> = ({
  allowedLevels,
  restartStatus,
  setFieldValue,
  audienceFieldChecked,
  isI18NPluginEnabled,
  defaultLocale,
  i18nEnabled,
  setI18nModalOnCancel,
  setDisableI18nModalOpened,
  setPruneObsoleteI18nNavigations,
}) => (
  <Stack spacing={4}>
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
          value={allowedLevels}
          disabled={restartStatus.required}
        />
      </GridItem>
      <GridItem col={4} s={12} xs={12}>
        <ToggleInput
          name="audienceFieldChecked"
          label={getMessage('pages.settings.form.audience.label')}
          hint={getMessage('pages.settings.form.audience.hint')}
          checked={audienceFieldChecked}
          onChange={() => setFieldValue('audienceFieldChecked', !audienceFieldChecked, false)}
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
            checked={i18nEnabled}
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
);


export default AdditionalConfigSettings;