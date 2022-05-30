import { sortBy } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
//@ts-ignore
import { useNotification } from "@strapi/helper-plugin";
//@ts-ignore
import { VisuallyHidden } from '@strapi/design-system/VisuallyHidden';
//@ts-ignore
import { Table, Thead, Tr, Th, Tbody, Td, TFooter } from '@strapi/design-system/Table';
//@ts-ignore
import { Plus, Trash, Pencil, Refresh, Check, Minus, EyeStriked, Eye } from '@strapi/icons';
//@ts-ignore
import { Typography } from '@strapi/design-system/Typography';
//@ts-ignore
import { Tooltip } from '@strapi/design-system/Tooltip';
//@ts-ignore
import { Stack } from '@strapi/design-system/Stack';
//@ts-ignore
import { IconButton } from '@strapi/design-system/IconButton';

import { getMessage } from '../../../../utils';
import { ChangeEffect, NavigationItemCustomField } from '../../../../../../types';
import ConfirmationDialog from '../../../../components/ConfirmationDialog';
import { getTradId } from '../../../../translations';

interface ICustomFieldTableProps {
  data: NavigationItemCustomField[];
  onOpenModal: (field: NavigationItemCustomField | null) => void;
  onRemoveCustomField: ChangeEffect<NavigationItemCustomField>;
  onToggleCustomField: ChangeEffect<NavigationItemCustomField>;
}

const refreshIcon = <Refresh />;
const plusIcon = <Plus />;
const tradPrefix = "pages.settings.form.customFields.table.";

const CustomFieldTable: React.FC<ICustomFieldTableProps> = ({
  data,
  onOpenModal,
  onRemoveCustomField,
  onToggleCustomField,
}) => {
  const [confirmationVisible, setIsConfirmationVisible] = useState<boolean>(false);
  const [fieldToRemove, setFieldToRemove] = useState<NavigationItemCustomField | null>(null);
  const toggleNotification = useNotification();
  const customFields = useMemo(() => sortBy(data, "name"), [data]);

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

    cleanup();
  }

  const cleanup = useCallback(() => {
    setFieldToRemove(null);
    setIsConfirmationVisible(false);
  }, [setFieldToRemove, setIsConfirmationVisible]);

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
        onCancel={cleanup}
      />
      <Table
        colCount={4}
        rowCount={data.length + 1}
        footer={
          <TFooter
            onClick={(e: React.FormEvent) => { e.preventDefault(); onOpenModal(null); }}
            icon={plusIcon}
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
            <Th width="15%">
              <Typography variant="sigma" textColor="neutral600">
                {getMessage(`${tradPrefix}header.type`)}
              </Typography>
            </Th>
            <Th width="5%">
              <Typography variant="sigma" textColor="neutral600">
                {getMessage(`${tradPrefix}header.required`)}
              </Typography>
            </Th>
            <Th>
              <VisuallyHidden />
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {customFields.map(customField => (
            <Tr key={customField.name}>
              <Td width='20%'>
                <Typography fontWeight="semiBold" textColor="neutral800">
                  {customField.name}
                </Typography>
              </Td>
              <Td width="60%">
                <Typography textColor="neutral800">
                  {customField.label}
                </Typography>
              </Td>
              <Td width="15%">
                <Typography textColor="neutral800">
                  {customField.type}
                </Typography>
              </Td>
              <Td width="5%">
                <Tooltip description={getMessage(`${tradPrefix}${customField.required ? "required" : "notRequired"}`)}>
                  <Typography textColor="neutral800">
                    {customField.required ? <Check /> : <Minus />}
                  </Typography>
                </Tooltip>
              </Td>
              <Td>
                <Stack horizontal size={1}>
                  <IconButton
                    onClick={() => onOpenModal(customField)}
                    label={getMessage(`${tradPrefix}edit`)}
                    icon={<Pencil />}
                    noBorder
                  />
                  <IconButton
                    onClick={() => onToggleCustomField(customField)}
                    label={getMessage(`${tradPrefix}${customField.enabled ? 'disable' : 'enable'}`)}
                    icon={customField.enabled ? <Eye /> : <EyeStriked />}
                    noBorder
                  />
                  <IconButton
                    onClick={() => handleRemove(customField)}
                    label={getMessage(`${tradPrefix}remove`)}
                    icon={<Trash />}
                    noBorder
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
