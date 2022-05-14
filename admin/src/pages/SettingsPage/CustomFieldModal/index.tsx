import React from 'react';
//@ts-ignore
import { Typography } from '@strapi/design-system/Typography';
//@ts-ignore
import { ModalLayout, ModalHeader } from '@strapi/design-system/ModalLayout';

import CustomFieldForm from './CustomFieldForm';
import { ChangeEffect, NavigationItemCustomField, VoidEffect } from '../../../../../types';
import { getMessage } from '../../../utils';
import { pick } from 'lodash';

interface ICustomFieldModalProps {
  data: NavigationItemCustomField | null;
  isOpen: boolean;
  onClose: VoidEffect;
  onSubmit: ChangeEffect<NavigationItemCustomField>;
  usedCustomFieldNames: string[];
}

const CustomFieldModal: React.FC<ICustomFieldModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  data,
  usedCustomFieldNames,
}) => {
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
        customField={pick(data, "name", "label", "type")}
        onSubmit={onSubmit}
        onClose={onClose}
        usedCustomFieldNames={usedCustomFieldNames}
      />
    </ModalLayout>
  );
}

export default CustomFieldModal;
