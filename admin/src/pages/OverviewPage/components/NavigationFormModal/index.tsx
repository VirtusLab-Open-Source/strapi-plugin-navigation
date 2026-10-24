import { Button, Modal } from '@strapi/design-system';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import { getTrad } from '../../../../translations';
import { Effect, VoidEffect } from '../../../../types';
import { Navigation } from '../../types';
import { Form } from '../NavigationForm';

interface Props {
  navigation: Partial<Navigation>;
  alreadyUsedNames: Array<string>;
  isLoading?: boolean;
  onClose: VoidEffect;
  onSubmit: Effect<Partial<Navigation>>;
}

export const NavigationFormModal = ({
  navigation,
  alreadyUsedNames,
  isLoading,
  onClose,
  onSubmit,
}: Props) => {
  const { formatMessage } = useIntl();

  const [current, setCurrent] = useState(navigation);
  const [isDisabled, setIsDisabled] = useState(false);

  const isEdit = !!navigation.documentId;

  const handleChange = ({ disabled, ...updated }: Partial<Navigation> & { disabled?: boolean }) => {
    setCurrent(updated);
    setIsDisabled(!!disabled);
  };

  return (
    <Modal.Root
      open
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>
            {isEdit
              ? formatMessage(getTrad('popup.navigation.manage.header.EDIT'), {
                  name: navigation.name,
                })
              : formatMessage(getTrad('popup.navigation.manage.header.CREATE'))}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            navigation={navigation}
            onChange={handleChange}
            isLoading={isLoading}
            alreadyUsedNames={alreadyUsedNames}
          />
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close>
            <Button variant="tertiary" disabled={isLoading}>
              {formatMessage(getTrad('popup.navigation.manage.button.cancel'))}
            </Button>
          </Modal.Close>
          <Button onClick={() => onSubmit(current)} disabled={isLoading || isDisabled}>
            {formatMessage(getTrad('popup.navigation.manage.button.save'))}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
