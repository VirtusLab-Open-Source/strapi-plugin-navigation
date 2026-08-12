import { FC } from 'react';

import { Button, Modal } from '@strapi/design-system';
import { useIntl } from 'react-intl';

import { getTrad } from '../../../../translations';
import { Effect } from '../../../../types';

interface Props {
  handleCancel: Effect<any>;
  handleSubmit?: Effect<any>;
  submitDisabled?: boolean;
  canUpdate?: boolean;
}

export const NavigationItemPopupFooter: FC<Props> = ({
  handleCancel,
  handleSubmit,
  submitDisabled,
  canUpdate,
}) => {
  const { formatMessage } = useIntl();

  if (!canUpdate) {
    return null;
  }

  return (
    <Modal.Footer>
      <Modal.Close>
        <Button onClick={handleCancel} variant="tertiary">
          {formatMessage(getTrad('popup.item.form.button.cancel'))}
        </Button>
      </Modal.Close>

      <Button onClick={handleSubmit} disabled={submitDisabled}>
        {formatMessage(getTrad('popup.item.form.button.save'))}
      </Button>
    </Modal.Footer>
  );
};
