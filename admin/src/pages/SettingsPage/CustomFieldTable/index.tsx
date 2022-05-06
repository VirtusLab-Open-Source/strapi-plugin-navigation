import React, { useState } from 'react';
//@ts-ignore
import { useNotification } from "@strapi/helper-plugin";
//@ts-ignore
import { VisuallyHidden } from '@strapi/design-system/VisuallyHidden';
//@ts-ignore
import { Table, Thead, Tr, Th, Tbody, Td, TFooter } from '@strapi/design-system/Table';
//@ts-ignore
import { Plus, Trash, Pencil, Refresh } from '@strapi/icons';
//@ts-ignore
import { Typography } from '@strapi/design-system/Typography';
//@ts-ignore
import { Stack } from '@strapi/design-system/Stack';
//@ts-ignore
import { IconButton } from '@strapi/design-system/IconButton';

import { getMessage } from '../../../utils';
import { NavigationItemCustomField } from '../../../../../types';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import { getTradId } from '../../../translations';

interface CustomFieldTableProps {
  data: NavigationItemCustomField[];
  onOpenModal: (field: NavigationItemCustomField | null) => void;
  onRemoveCustomField: (field: NavigationItemCustomField) => void;
}

const refreshIcon = <Refresh />;
const tradPrefix = "pages.settings.form.customFields.table.";
const CustomFieldTable: React.FC<CustomFieldTableProps> = ({
  data,
  onOpenModal,
  onRemoveCustomField,
}) => {
  const [confirmationVisible, setIsConfirmationVisible] = useState<boolean>(false);
  const [fieldToRemove, setFieldToRemove] = useState<NavigationItemCustomField | null>(null);
  const toggleNotification = useNotification();

  const handleRemove = (field: NavigationItemCustomField) => {
    setFieldToRemove(field);
    setIsConfirmationVisible(true);
  }

  const handleConfirm = () => {
    if (fieldToRemove === null) {
      toggleNotification({
        type: 'warning',
        message: {
          id: getTradId(`${tradPrefix}confirmation.error`),
          default: 'Something went wrong',
        }
      });
    } else {
      onRemoveCustomField(fieldToRemove);
    }

    setFieldToRemove(null);
    setIsConfirmationVisible(false);
  }

  const handleCancel = () => {
    setFieldToRemove(null);
    setIsConfirmationVisible(false);
  }

  return (
    <>
      <ConfirmationDialog
        isVisible={confirmationVisible}
        header={getMessage(`${tradPrefix}confirmation.header`)}
        children={getMessage(`${tradPrefix}confirmation.message`)}
        labelConfirm={getMessage(`${tradPrefix}confirmation.confirm`)}
        iconConfirm={refreshIcon}
        mainIcon={refreshIcon}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <Table
        colCount={4}
        rowCount={data.length + 1}
        footer={
          <TFooter
            onClick={(e: React.FormEvent) => { e.preventDefault(); onOpenModal(null); }}
            icon={<Plus />}
          >
            {getMessage(`${tradPrefix}footer`)}
          </TFooter>
        }
      >
        <Thead>
          <Tr>
            <Th width="20%">
              <Typography variant="sigma" textColor="neutral600">
                {getMessage(`${tradPrefix}header.name`)}
              </Typography>
            </Th>
            <Th width="60%">
              <Typography variant="sigma" textColor="neutral600">
                {getMessage(`${tradPrefix}header.label`)}
              </Typography>
            </Th>
            <Th width="20%">
              <Typography variant="sigma" textColor="neutral600">
                {getMessage(`${tradPrefix}header.type`)}
              </Typography>
            </Th>
            <Th>
              <VisuallyHidden>
                {getMessage(`${tradPrefix}header.type`)}
              </VisuallyHidden>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map(customField => (
            <Tr key={customField.name}>
              <Td>
                <Typography fontWeight="semiBold" textColor="neutral800">
                  {customField.name}
                </Typography>
              </Td>
              <Td>
                <Typography textColor="neutral800">
                  {customField.label}
                </Typography>
              </Td>
              <Td>
                <Typography textColor="neutral800">
                  {customField.type}
                </Typography>
              </Td>
              <Td>
                <Stack horizontal size={1}>
                  <IconButton
                    onClick={() => handleRemove(customField)}
                    label={getMessage(`${tradPrefix}edit`)}
                    icon={<Pencil />}
                    noBorder
                  />
                  <IconButton
                    onClick={() => handleRemove(customField)}
                    label={getMessage(`${tradPrefix}remove`)}
                    icon={<Trash />}
                    noBorder
                    id={`delete-${customField.name}`}
                  />
                </Stack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
}

export default CustomFieldTable;
