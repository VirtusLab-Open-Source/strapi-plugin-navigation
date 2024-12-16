/**
 *
 * Entity Details
 *
 */

import { Button, Dialog, Flex, Typography } from '@strapi/design-system';
import { Check, WarningCircle } from '@strapi/icons';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { getTrad } from '../../translations';
import { Effect } from '../../types';

const DEFAULT_ICON = <WarningCircle />;

interface Props {
  isVisible?: boolean;
  isActionAsync?: boolean;
  onConfirm: Effect<any>;
  onCancel: Effect<any>;
  header?: ReactNode;
  labelCancel?: ReactNode;
  labelConfirm?: ReactNode;
  iconConfirm?: ReactNode;
  mainIcon?: ReactNode;
}

export const ConfirmationDialog: FC<PropsWithChildren<Props>> = ({
  isVisible = false,
  isActionAsync = false,
  children,
  onConfirm,
  onCancel,
  header,
  labelCancel,
  labelConfirm,
  iconConfirm,
  mainIcon = DEFAULT_ICON,
}) => {
  const { formatMessage } = useIntl();

  return isVisible ? (
    <Dialog.Root
      open={isVisible}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen && isVisible) {
          onCancel?.(undefined);
        }
      }}
      title={
        header || formatMessage(getTrad('components.confirmation.dialog.header', 'Confirmation'))
      }
    >
      <Dialog.Content>
        <Dialog.Body icon={mainIcon}>
          <Flex justifyContent="center">
            <Typography id="dialog-confirm-description">
              {children || formatMessage(getTrad('components.confirmation.dialog.description'))}
            </Typography>
          </Flex>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Cancel>
            <Button fullWidth onClick={onCancel} variant="tertiary" disabled={isActionAsync}>
              {labelCancel ||
                formatMessage(getTrad('components.confirmation.dialog.button.cancel', 'Cancel'))}
            </Button>
          </Dialog.Cancel>

          <Button
            fullWidth
            onClick={onConfirm}
            variant="danger-light"
            startIcon={iconConfirm || <Check />}
            disabled={isActionAsync}
          >
            {labelConfirm ||
              formatMessage(getTrad('components.confirmation.dialog.button.confirm', 'Confirm'))}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  ) : null;
};
