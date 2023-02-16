import React from 'react';
import { pick } from 'lodash';
//@ts-ignore
import { Typography } from '@strapi/design-system/Typography';
//@ts-ignore
import { ModalLayout, ModalHeader } from '@strapi/design-system/ModalLayout';

import CustomFieldForm from '../CustomFieldForm';
import { Effect, NavigationItemCustomField, VoidEffect } from '../../../../../../types';
import { getMessage } from '../../../../utils';

interface ICustomFieldModalProps {
  data: NavigationItemCustomField | null;
  isOpen: boolean;
  onClose: VoidEffect;
  onSubmit: Effect<NavigationItemCustomField>;
  usedCustomFieldNames: string[];
}

const CustomFieldModal: React.FC<ICustomFieldModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  data,
  usedCustomFieldNames,
}) => {
  if (!isOpen) return null;

  const isEditMode = !!data;
  return (
    <ModalLayout onClose={onClose} isOpen={isOpen} labelledBy="custom-field-modal">
      <ModalHeader>
        <Typography variant="omega" fontWeight="bold" textColor="neutral800" as="h2" id="asset-dialog-title">
          {getMessage(`pages.settings.form.customFields.popup.header.${isEditMode ? 'edit' : 'new'}`)}
        </Typography>
      </ModalHeader>
      <CustomFieldForm
        isEditForm={isEditMode}
        customField={pick(data, "name", "label", "type", "required", "options", "multi")}
        onSubmit={onSubmit}
        onClose={onClose}
        usedCustomFieldNames={usedCustomFieldNames}
      />
    </ModalLayout>
  );
}

export default CustomFieldModal;
