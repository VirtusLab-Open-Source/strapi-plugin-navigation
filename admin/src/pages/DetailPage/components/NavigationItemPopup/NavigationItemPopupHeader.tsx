import { Modal, Typography } from '@strapi/design-system';
import { useIntl } from 'react-intl';

import { getTrad } from '../../../../translations';

export const NavigationItemPopupHeader = ({
  isNewItem,
  canUpdate,
}: {
  isNewItem?: boolean;
  canUpdate?: boolean;
}) => {
  const { formatMessage } = useIntl();

  let modalType = 'view';

  if (canUpdate) {
    modalType = isNewItem ? 'new' : 'edit';
  }

  return (
    <Modal.Header>
      <Typography
        variant="omega"
        fontWeight="bold"
        textColor="neutral800"
        as="h2"
        id="asset-dialog-title"
      >
        {formatMessage(getTrad(`popup.item.header.${modalType}`))}
      </Typography>
    </Modal.Header>
  );
};
