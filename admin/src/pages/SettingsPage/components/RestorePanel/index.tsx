import { useIntl } from 'react-intl';
import React, { useState } from 'react';

import { Box, Button, Flex, Grid, Typography } from '@strapi/design-system';
import { Check, Typhoon } from '@strapi/icons';

import { ConfirmationDialog } from '../../../../components/ConfirmationDialog';
import { getTrad } from '../../../../translations';
import { BOX_DEFAULT_PROPS } from '../../common';
import { useRestoreConfig } from '../../hooks';
import { useSettingsContext } from '../../context';

type RestorePanelProps = {
  hasSettingsReadPermissions: boolean;
};

export const RestorePanel: React.FC<RestorePanelProps> = ({ hasSettingsReadPermissions }) => {
  const { formatMessage } = useIntl();
  const restoreMutation = useRestoreConfig();

  const { setRestartStatus } = useSettingsContext();

  const [isRestorePopupOpen, setIsRestorePopupOpen] = useState<boolean>(false);

  const onPopupClose = async (isConfirmed: boolean) => {
    setIsRestorePopupOpen(false);

    if (isConfirmed) {
      restoreMutation.mutate();

      setRestartStatus({ required: true });
    }
  };

  return (
    <Box {...BOX_DEFAULT_PROPS} width="100%">
      <Flex direction="column" alignItems="flex-start" gap={2}>
        <Typography variant="delta" as="h2">
          {formatMessage(getTrad('pages.settings.restoring.title'))}
        </Typography>
        <Grid.Root gap={4} width="100%">
          <Grid.Item col={12} s={12} xs={12}>
            <Typography>
              {formatMessage(getTrad('pages.settings.actions.restore.description'))}
            </Typography>
          </Grid.Item>
          <Grid.Item col={12} s={12} xs={12}>
            {hasSettingsReadPermissions && (
              <Button
                variant="danger-light"
                startIcon={<Check />}
                onClick={() => setIsRestorePopupOpen(true)}
              >
                {formatMessage(getTrad('pages.settings.actions.restore.label'))}
              </Button>
            )}
            <ConfirmationDialog
              isVisible={isRestorePopupOpen}
              header={formatMessage(getTrad('pages.settings.actions.restore.confirmation.header'))}
              labelConfirm={formatMessage(
                getTrad('pages.settings.actions.restore.confirmation.confirm')
              )}
              iconConfirm={<Typhoon />}
              onConfirm={() => onPopupClose(true)}
              onCancel={() => onPopupClose(false)}
            >
              {formatMessage(getTrad('pages.settings.actions.restore.confirmation.description'))}
            </ConfirmationDialog>
          </Grid.Item>
        </Grid.Root>
      </Flex>
    </Box>
  );
};
