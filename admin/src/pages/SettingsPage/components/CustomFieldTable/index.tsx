import { VisuallyHidden } from '@strapi/design-system';
import { Check, Eye, EyeStriked, Minus, Pencil, Plus, PriceTag, Trash } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';
import { sortBy } from 'lodash';
import { useCallback, useMemo, useState } from 'react';

import {
  Flex,
  IconButton,
  IconButtonGroup,
  TFooter,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  Typography,
} from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { ConfirmationDialog } from '../../../../components/ConfirmationDialog';
import { NavigationItemCustomField } from '../../../../schemas';
import { getTrad, getTradId } from '../../../../translations';
import { Effect } from '../../../../types';

interface ICustomFieldTableProps {
  data: (NavigationItemCustomField | string)[];
  onOpenModal: (field: NavigationItemCustomField | null) => void;
  onRemoveCustomField: Effect<NavigationItemCustomField>;
  onToggleCustomField: Effect<NavigationItemCustomField>;
}

const refreshIcon = <PriceTag />;
const plusIcon = <Plus />;
const tradPrefix = 'pages.settings.form.customFields.table.';

const CustomFieldTable: React.FC<ICustomFieldTableProps> = ({
  data = [],
  onOpenModal,
  onRemoveCustomField,
  onToggleCustomField,
}) => {
  const [confirmationVisible, setIsConfirmationVisible] = useState<boolean>(false);
  const [fieldToRemove, setFieldToRemove] = useState<NavigationItemCustomField | null>(null);
  const { toggleNotification } = useNotification();
  const customFields = useMemo(() => sortBy(data, 'name'), [data]);

  const { formatMessage } = useIntl();

  const handleRemove = useCallback(
    (field: NavigationItemCustomField) => {
      setFieldToRemove(field);
      setIsConfirmationVisible(true);
    },
    [setFieldToRemove, setIsConfirmationVisible]
  );

  const cleanup = useCallback(() => {
    setFieldToRemove(null);
    setIsConfirmationVisible(false);
  }, [setFieldToRemove, setIsConfirmationVisible]);

  const handleConfirm = useCallback(() => {
    if (fieldToRemove === null) {
      toggleNotification({
        type: 'warning',
        message: formatMessage(getTrad(`${tradPrefix}confirmation.error`)),
      });
    } else {
      onRemoveCustomField(fieldToRemove);
    }

    cleanup();
  }, [cleanup, fieldToRemove, getTradId, onRemoveCustomField, toggleNotification]);

  return (
    <>
      <ConfirmationDialog
        isVisible={confirmationVisible}
        header={formatMessage(getTrad(`${tradPrefix}confirmation.header`))}
        children={formatMessage(getTrad(`${tradPrefix}confirmation.message`))}
        labelConfirm={formatMessage(getTrad(`${tradPrefix}confirmation.confirm`))}
        iconConfirm={refreshIcon}
        mainIcon={refreshIcon}
        onConfirm={handleConfirm}
        onCancel={cleanup}
      />
      <Table
        width="100%"
        colCount={4}
        rowCount={data.length + 1}
        footer={
          <TFooter
            onClick={(e: React.FormEvent) => {
              e.preventDefault();
              onOpenModal(null);
            }}
            icon={plusIcon}
          >
            {formatMessage(getTrad(`${tradPrefix}footer`))}
          </TFooter>
        }
      >
        <Thead>
          <Tr>
            <Th width="20%">
              <Typography variant="sigma" textColor="neutral600">
                {formatMessage(getTrad(`${tradPrefix}header.name`))}
              </Typography>
            </Th>
            <Th width="60%">
              <Typography variant="sigma" textColor="neutral600">
                {formatMessage(getTrad(`${tradPrefix}header.label`))}
              </Typography>
            </Th>
            <Th width="15%">
              <Typography variant="sigma" textColor="neutral600">
                {formatMessage(getTrad(`${tradPrefix}header.type`))}
              </Typography>
            </Th>
            <Th width="5%">
              <Typography variant="sigma" textColor="neutral600">
                {formatMessage(getTrad(`${tradPrefix}header.required`))}
              </Typography>
            </Th>
            <Th>
              <VisuallyHidden />
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {customFields.map((customField) =>
            typeof customField !== 'string' ? (
              <Tr key={customField.name}>
                <Td width="20%">
                  <Typography fontWeight="semiBold" textColor="neutral800">
                    {customField.name}
                  </Typography>
                </Td>
                <Td width="60%">
                  <Typography textColor="neutral800">{customField.label}</Typography>
                </Td>
                <Td width="15%">
                  <Typography textColor="neutral800">{customField.type}</Typography>
                </Td>
                <Td width="5%">
                  <Tooltip
                    description={formatMessage(
                      getTrad(`${tradPrefix}${customField.required ? 'required' : 'notRequired'}`)
                    )}
                  >
                    <Typography textColor="neutral800">
                      {customField.required ? <Check /> : <Minus />}
                    </Typography>
                  </Tooltip>
                </Td>
                <Td>
                  <Flex width="100%" justifyContent="flex-end" alignItems="center">
                    <IconButtonGroup>
                      <IconButton
                        onClick={() => onToggleCustomField(customField)}
                        label={formatMessage(
                          getTrad(`${tradPrefix}${customField.enabled ? 'disable' : 'enable'}`)
                        )}
                        variant={customField.enabled ? 'success-light' : 'tertiary'}
                        children={customField.enabled ? <Eye /> : <EyeStriked />}
                        style={{ minWidth: 50 }}
                      />
                      <IconButton
                        onClick={() => onOpenModal(customField)}
                        label={formatMessage(getTrad(`${tradPrefix}edit`))}
                        children={<Pencil />}
                        style={{ minWidth: 50 }}
                      />
                      <IconButton
                        onClick={() => handleRemove(customField)}
                        label={formatMessage(getTrad(`${tradPrefix}remove`))}
                        children={<Trash />}
                        style={{ minWidth: 50 }}
                      />
                    </IconButtonGroup>
                  </Flex>
                </Td>
              </Tr>
            ) : null
          )}
        </Tbody>
      </Table>
    </>
  );
};

export default CustomFieldTable;
