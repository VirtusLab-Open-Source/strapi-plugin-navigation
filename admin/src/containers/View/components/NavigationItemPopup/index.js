/**
 *
 * NavigationItemPopUp
 *
 */

import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { HeaderModal, HeaderModalTitle } from 'strapi-helper-plugin';
import { find } from 'lodash';
import NavigationItemForm from '../NavigationItemForm';
import { extractRelatedItemLabel, isRelationCorrect, isRelationPublished } from '../../utils/parsers';
import { MediumPopup } from './MediumPopup';
import { navigationItemType } from '../../utils/enums';
import { getTrad, getTradId } from '../../../../translations';

const NavigationItemPopUp = ({
  isOpen,
  isLoading,
  data,
  config = {},
  onSubmit,
  onClose,
  usedContentTypeItems,
  getContentTypeItems,
  usedContentTypesData,
}) => {
  const { formatMessage } = useIntl();

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
    }) ? '' : `[${formatMessage(getTrad('notification.navigation.item.relation.status.draft'))}] `.toUpperCase();
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
            __collectionName: relatedType,
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

  return (
    <MediumPopup isOpen={isOpen} onToggle={onClose}>
      <HeaderModal>
        <section>
          <HeaderModalTitle>
            <FormattedMessage id={getTradId('popup.item.header')} />
          </HeaderModalTitle>
        </section>
      </HeaderModal>
      <NavigationItemForm
        data={prepareFormData(data)}
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
        appendLabelPublicationStatus={appendLabelPublicationStatus}
      />
    </MediumPopup>
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
};

export default NavigationItemPopUp;
