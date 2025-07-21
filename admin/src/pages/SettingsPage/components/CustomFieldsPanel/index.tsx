import { useIntl } from 'react-intl';
import { useState } from 'react';

import { Box, Typography } from '@strapi/design-system';

import { BOX_DEFAULT_PROPS } from '../../common';
import { getTrad } from '../../../../translations';
import CustomFieldTable from './CustomFieldTable';
import CustomFieldModal from './CustomFieldModal';
import { NavigationItemCustomField } from '../../../../schemas';
import { useSettingsContext } from '../../context';

export const CustomFieldsPanel = () => {
  const { formatMessage } = useIntl();

  const {
    values: { additionalFields },
    setFormValueItem,
  } = useSettingsContext();

  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState<boolean>(false);
  const [customFieldSelected, setCustomFieldSelected] = useState<NavigationItemCustomField | null>(
    null
  );

  const handleOpenCustomFieldModal = (field: NavigationItemCustomField | null) => {
    setCustomFieldSelected(field);
    setIsCustomFieldModalOpen(true);
  };

  const handleRemoveCustomField = (field: NavigationItemCustomField) => {
    const filteredFields = additionalFields.filter((f) =>
      typeof f !== 'string' ? f.name !== field.name : true
    );

    setFormValueItem('additionalFields', filteredFields);

    setCustomFieldSelected(null);
    setIsCustomFieldModalOpen(false);
  };

  const handleToggleCustomField = (current: NavigationItemCustomField) => {
    const next = { ...current, enabled: !current.enabled };

    const nextAdditionalFields = additionalFields.map((field) =>
      typeof field !== 'string' && current.name === field.name ? next : field
    );

    setFormValueItem('additionalFields', nextAdditionalFields);
  };

  const handleSubmitCustomField = (next: NavigationItemCustomField) => {
    const hasFieldAlready = !!additionalFields.find((field) =>
      typeof field !== 'string' ? field.name === next.name : false
    );
    const nextAdditionalFields = hasFieldAlready
      ? additionalFields.map((field) =>
          typeof field !== 'string' && next.name === field.name ? next : field
        )
      : [...additionalFields, next];

    setFormValueItem('additionalFields', nextAdditionalFields);

    setCustomFieldSelected(null);
    setIsCustomFieldModalOpen(false);
  };

  return (
    <Box {...BOX_DEFAULT_PROPS} width="100%">
      <Typography variant="delta" as="h2">
        {formatMessage(getTrad('pages.settings.customFields.title'))}
      </Typography>
      <Box padding={1} />
      <CustomFieldTable
        data={additionalFields}
        onOpenModal={handleOpenCustomFieldModal}
        onRemoveCustomField={handleRemoveCustomField}
        onToggleCustomField={handleToggleCustomField}
      />
      {isCustomFieldModalOpen && (
        <CustomFieldModal
          onClose={() => setIsCustomFieldModalOpen(false)}
          onSubmit={handleSubmitCustomField}
          isOpen={isCustomFieldModalOpen}
          data={customFieldSelected}
        />
      )}
    </Box>
  );
};
