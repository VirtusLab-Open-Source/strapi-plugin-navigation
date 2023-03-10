import React, { useState } from 'react';

// @ts-ignore
import { CheckPermissions, useOverlayBlocker } from '@strapi/helper-plugin';
// @ts-ignore
import { Button } from '@strapi/design-system/Button';
// @ts-ignore
import { Grid, GridItem } from '@strapi/design-system/Grid';
// @ts-ignore
import { Stack } from '@strapi/design-system/Stack';
// @ts-ignore
import { Typography } from '@strapi/design-system/Typography';

import ConfirmationDialog from '../../../../components/ConfirmationDialog';
import { OnPopupClose, RestartStatus } from '../../types';
import { Effect, VoidEffect } from '../../../../../../types';
import { getMessage } from '../../../../utils';
import permissions from '../../../../permissions';
import { refreshIcon } from '../../../../components/icons';


interface IProps {
  setRestartStatus: Effect<RestartStatus>;
  restoreConfig: VoidEffect;
  disableI18nModal: JSX.Element | null;
}

const RestoreConfigSettings: React.FC<IProps> = ({
  setRestartStatus,
  restoreConfig,
  disableI18nModal,
}) => {
  const { lockApp, unlockApp } = useOverlayBlocker();
  const [isRestorePopupOpen, setIsRestorePopupOpen] = useState<boolean>(false);
  const onPopupClose: OnPopupClose = async (isConfirmed) => {
    setIsRestorePopupOpen(false);
    if (isConfirmed) {
      lockApp();
      await restoreConfig();
      unlockApp();
      setRestartStatus({ required: true, reasons: [] });
    }
  }
  
  return (
    <Stack spacing={4}>
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
            <Button variant="danger-light" startIcon={refreshIcon} onClick={() => setIsRestorePopupOpen(true)}>
              {getMessage('pages.settings.actions.restore')}
            </Button>
          </CheckPermissions>
          <ConfirmationDialog
            isVisible={isRestorePopupOpen}
            header={getMessage('pages.settings.actions.restore.confirmation.header')}
            labelConfirm={getMessage('pages.settings.actions.restore.confirmation.confirm')}
            iconConfirm={refreshIcon}
            onConfirm={() => onPopupClose(true)}
            onCancel={() => onPopupClose(false)}>
            {getMessage('pages.settings.actions.restore.confirmation.description')}
          </ConfirmationDialog>
          {disableI18nModal}
        </GridItem>
      </Grid>
    </Stack>
  );
}

export default RestoreConfigSettings;