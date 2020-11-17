/**
 *
 * NavigationItemPopUp
 *
 */

import React from "react";
import { FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import { HeaderModal, HeaderModalTitle } from "strapi-helper-plugin";
import { find } from "lodash";
import NavigationItemForm from "../NavigationItemForm";
import pluginId from "../../../../pluginId";
import { extractRelatedItemLabel } from "../../utils/parsers";
import { MediumPopup } from "./MediumPopup";

const NavigationItemPopUp = ({
  isOpen,
  isLoading,
  data,
  config = {},
  onSubmit,
  onClose,
  usedContentTypeItems,
  getContentTypeItems,
}) => {
  const handleOnSubmit = (payload) => {
    onSubmit(payload);
  };

  const { related, relatedType } = data;
  const { availableAudience = [], additionalFields, contentTypes, contentTypeItems, contentTypesNameFields = {} } = config;

  const prepareFormData = data => ({
    ...data,
    related: related ? { 
      value: related, 
      label: extractRelatedItemLabel({
        ...find(contentTypeItems, item => item.id === related, {}),
        __collectionName: relatedType,
      }, contentTypesNameFields),
    } : undefined,
    relatedType: relatedType ? { 
      value: relatedType, 
      label: find(contentTypes, item => item.collectionName === relatedType, {}).label
    } : undefined,
  });

  return (
    <MediumPopup isOpen={isOpen} onToggle={onClose}>
      <HeaderModal>
        <section>
          <HeaderModalTitle>
            <FormattedMessage id={`${pluginId}.popup.item.header`} />
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
        onSubmit={handleOnSubmit}
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
