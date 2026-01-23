import { Modal } from '@strapi/design-system';
import { FC } from 'react';
import { useIntl } from 'react-intl';

import { NavigationSchema, StrapiContentTypeItemSchema } from '../../../../api/validators';
import { getTrad } from '../../../../translations';
import { Effect } from '../../../../types';
import { isRelationPublished } from '../../utils';
import {
  NavigationItemForm,
  type NavigationItemFormSchema,
  type SubmitEffect,
} from '../NavigationItemForm';
import { NavigationItemPopupHeader } from './NavigationItemPopupHeader';

interface Props {
  currentItem?: Partial<NavigationItemFormSchema>;
  isOpen: boolean;
  isLoading: boolean;
  onSubmit: SubmitEffect;
  onClose: Effect<any>;
  availableLocale: Array<string>;
  locale: string;
  permissions?: { canUpdate?: boolean };
  currentNavigation: Pick<NavigationSchema, 'id' | 'documentId' | 'locale'>;
}

const NavigationItemPopUp: FC<Props> = ({
  availableLocale,
  isOpen,
  isLoading,
  currentItem = {},
  onSubmit,
  onClose,
  locale,
  permissions,
  currentNavigation,
}) => {
  const { formatMessage } = useIntl();

  const handleOnSubmit = (payload: NavigationItemFormSchema) => {
    onSubmit(payload);
  };

  const appendLabelPublicationStatus = (
    label: string,
    item: StrapiContentTypeItemSchema,
    isCollection: boolean
  ) => {
    const appendix = isRelationPublished({
      relatedRef: item,
      type: item.isSingle ? 'INTERNAL' : item.type,
      isCollection,
    })
      ? ''
      : `[${formatMessage(getTrad('notification.navigation.item.relation.status.draft'))}] `.toUpperCase();

    return `${appendix}${label}`;
  };

  const hasViewId = !!currentItem.viewId;

  return (
    <Modal.Root
      labelledBy="condition-modal-breadcrumbs"
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) {
          onClose({
            preventDefault() {},
            stopPropagation() {},
            target: {},
          });
        }
      }}
      open={isOpen}
    >
      <Modal.Content>
        <NavigationItemPopupHeader isNewItem={!hasViewId} canUpdate={permissions?.canUpdate} />
        <NavigationItemForm
          availableLocale={availableLocale}
          current={currentItem}
          isLoading={isLoading}
          onSubmit={handleOnSubmit}
          onCancel={onClose}
          appendLabelPublicationStatus={appendLabelPublicationStatus}
          locale={locale}
          permissions={permissions}
          currentNavigation={currentNavigation}
        />
      </Modal.Content>
    </Modal.Root>
  );
};

export default NavigationItemPopUp;
