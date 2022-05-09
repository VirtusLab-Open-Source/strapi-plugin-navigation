/**
 *
 * NavigationItemPopUp
 *
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { find } from 'lodash';

//Design System
import { ModalLayout } from '@strapi/design-system/ModalLayout';

import NavigationItemForm from '../NavigationItemForm';
import { extractRelatedItemLabel, isRelationCorrect, isRelationPublished } from '../../utils/parsers';
import { navigationItemType } from '../../utils/enums';
import { NavigationItemPopupHeader } from './NavigationItemPopupHeader';
import { getMessage } from '../../../../utils';

const NavigationItemPopUp = ({
  availableLocale,
  isOpen,
  isLoading,
  data,
  config = {},
  onSubmit,
  onClose,
  usedContentTypeItems,
  getContentTypeItems,
  usedContentTypesData,
  locale,
  readNavigationItemFromLocale,
}) => {
  const handleOnSubmit = (payload) => {
    onSubmit(payload);
  };

  const { related, relatedType } = data;
  const {
    availableAudience = [],
    additionalFields,
    contentTypes,
    contentTypeItems,
    contentTypesNameFields = {},
  } = config;


  const appendLabelPublicationStatus = (label = '', item = {}, isCollection = false) => {
    const appendix = isRelationPublished({
      relatedRef: item,
      type: item.isSingle ? navigationItemType.INTERNAL : item.type,
      isCollection,
    }) ? '' : `[${getMessage('notification.navigation.item.relation.status.draft')}] `.toUpperCase();
    return `${appendix}${label}`;
  };

  const relatedTypeItem = find(contentTypes, item => item.uid === relatedType);
  const prepareFormData = data => {
    const relatedItem = find(contentTypeItems, item => item.id === related);
    return {
      ...data,
      type: isRelationCorrect(data) ? data.type : undefined,
      related: related && isRelationCorrect(data) ? {
        value: related,
        label: appendLabelPublicationStatus(
          extractRelatedItemLabel({
            ...relatedItem,
            __collectionUid: relatedType,
          }, contentTypesNameFields, config),
          relatedItem,
        ),
      } : undefined,
      relatedType: relatedType && isRelationCorrect(data) ? {
        value: relatedType,
        label: appendLabelPublicationStatus(relatedTypeItem.label || relatedTypeItem.name, relatedTypeItem, true),
      } : undefined,
    };
  };
  const preparedData = useMemo(prepareFormData.bind(null, data), [data]);
  const hasViewId = !!data.viewId;

  return (
    <ModalLayout labelledBy="condition-modal-breadcrumbs" onClose={onClose} isOpen={isOpen}>
      <NavigationItemPopupHeader isNewItem={!hasViewId}/>
      <NavigationItemForm
        availableLocale={availableLocale}
        config={config}
        data={preparedData}
        isLoading={isLoading}
        additionalFields={additionalFields}
        contentTypesNameFields={contentTypesNameFields}
        availableAudience={availableAudience}
        contentTypes={contentTypes}
        contentTypeEntities={contentTypeItems}
        usedContentTypeEntities={usedContentTypeItems}
        getContentTypeEntities={getContentTypeItems}
        usedContentTypesData={usedContentTypesData}
        onSubmit={handleOnSubmit}
        onCancel={onClose}
        appendLabelPublicationStatus={appendLabelPublicationStatus}
        locale={locale}
        readNavigationItemFromLocale={readNavigationItemFromLocale}
      />
    </ModalLayout>

  );
};

NavigationItemPopUp.propTypes = {
  data: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  isOpen: PropTypes.bool,
  isLoading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  getContentTypeItems: PropTypes.func.isRequired,
  locale: PropTypes.string,
  readNavigationItemFromLocale: PropTypes.func.isRequired,
};

export default NavigationItemPopUp;
