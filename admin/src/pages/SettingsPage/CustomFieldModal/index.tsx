import React, { useState } from 'react';

//@ts-ignore
import { Typography } from '@strapi/design-system/Typography';
//@ts-ignore
import { ModalLayout, ModalHeader, ModalFooter } from '@strapi/design-system/ModalLayout';
//@ts-ignore
import { Button } from '@strapi/design-system/Button';

import CustomFieldForm from './CustomFieldForm';
import { NavigationItemCustomField } from '../../../../../types';
import { getMessage } from '../../../utils';
import { customFieldForm as formDefinition } from '../utils/form';

interface CustomFieldModalProps {
  data: NavigationItemCustomField | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: NavigationItemCustomField) => void;
  usedCustomFieldNames: string[];
}

const CustomFieldModal: React.FC<CustomFieldModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  data,
  usedCustomFieldNames,
}) => {
  const [form, setForm] = useState<NavigationItemCustomField>({
    name: data?.name || "",
    label: data?.label || "",
    type: data?.type || "string",
  });

  const handleSubmit = async () => {
    try {
      await formDefinition.schema(usedCustomFieldNames).validate(form, { abortEarly: false })
      onSubmit(form)
    } catch (err) {
      // TODO: Display errors on inputs they are related to
      console.log(err)
    }
  }

  const isEditMode = !!data;
  const submitDisabled = false; // TODO: Check for bugs in form input
  return (
    <ModalLayout onClose={onClose} isOpen={isOpen} labelledBy="custom-field-modal">
      <ModalHeader>
        <Typography variant="omega" fontWeight="bold" textColor="neutral800" as="h2" id="asset-dialog-title">
          {getMessage(`pages.settings.form.customFields.popup.header.${isEditMode ? 'edit' : 'new'}`)}
        </Typography>
      </ModalHeader>
      <CustomFieldForm
        isEditForm={isEditMode}
        values={form}
        setFieldValue={(name, value) => setForm({ ...form, [name]: value })}
      />
      <ModalFooter
        startActions={
          <Button onClick={onClose} variant="tertiary">
            {getMessage('popup.item.form.button.cancel')}
          </Button>
        }
        endActions={
          <Button onClick={handleSubmit} disabled={submitDisabled}>
            {getMessage(`popup.item.form.button.save`)}
          </Button>
        }
      />
    </ModalLayout>
  );
}

export default CustomFieldModal;
