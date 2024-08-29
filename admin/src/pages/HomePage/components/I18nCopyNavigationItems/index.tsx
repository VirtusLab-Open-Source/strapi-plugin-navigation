import { FC } from 'react';
import { useIntl } from 'react-intl';

import { ConfirmationDialog } from '../../../../components/ConfirmationDialog';
import { getTrad } from '../../../../translations';

export interface ConfirmEffect {
  (source: string): void;
}

export interface CancelEffect {
  (): void;
}

interface Props {
  onConfirm: ConfirmEffect;
  onCancel: CancelEffect;
}

const refreshIcon = <></>;

export const I18nCopyNavigationItemsModal: FC<Props> = ({ onConfirm, onCancel }) => {
  const { formatMessage } = useIntl();

  return (
    <ConfirmationDialog
      isVisible
      header={formatMessage(getTrad('pages.view.actions.i18nCopyItems.confirmation.header'))}
      labelConfirm={formatMessage(getTrad('pages.view.actions.i18nCopyItems.confirmation.confirm'))}
      iconConfirm={refreshIcon}
      mainIcon={refreshIcon}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      {formatMessage(getTrad('pages.view.actions.i18nCopyItems.confirmation.content'))}
    </ConfirmationDialog>
  );
};
