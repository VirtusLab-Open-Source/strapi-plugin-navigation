import { Modal, Typography } from '@strapi/design-system';
import React from 'react';

import { useIntl } from 'react-intl';
import { NavigationItemCustomField } from '../../../../../schemas';
import { getTrad } from '../../../../../translations';
import { Effect, VoidEffect } from '../../../../../types';
import CustomFieldForm from '../CustomFieldForm';

interface ICustomFieldModalProps {
  data: NavigationItemCustomField | null;
  isOpen: boolean;
  onClose: VoidEffect;
  onSubmit: Effect<NavigationItemCustomField>;
}

const CustomFieldModal: React.FC<ICustomFieldModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  data,
}) => {
  const isEditMode = !!data;

  const { formatMessage } = useIntl();

  return (
    <Modal.Root
      onOpenChange={(isOpen: false) => {
        if (!isOpen) {
          onClose();
        }
      }}
      open={isOpen}
      labelledBy="custom-field-modal"
    >
      <Modal.Content>
        <Modal.Header>
          <Typography
            variant="omega"
            fontWeight="bold"
            textColor="neutral800"
            as="h2"
            id="asset-dialog-title"
          >
            {formatMessage(
              getTrad(
                `pages.settings.form.customFields.popup.header.${isEditMode ? 'edit' : 'new'}`
              )
            )}
          </Typography>
        </Modal.Header>
        <CustomFieldForm
          isEditForm={isEditMode}
          customField={data}
          onSubmit={onSubmit}
          onClose={onClose}
        />
      </Modal.Content>
    </Modal.Root>
  );
};

export default CustomFieldModal;
