/*
 *
 * Navigation View
 *
 */

import React, { memo, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from "react-intl";
import { isEmpty, get } from "lodash";

// Design System
import { Main } from '@strapi/design-system/Main';
import { ContentLayout } from '@strapi/design-system/Layout';
import { Button } from '@strapi/design-system/Button';
import { Text } from '@strapi/design-system/Text';
import { LoadingIndicatorPage } from "@strapi/helper-plugin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHamburger } from "@fortawesome/free-solid-svg-icons";
import Plus from "@strapi/icons/Plus"

// Components 
import EmptyView from '../../components/EmptyView';
import NavigationHeader from './components/NavigationHeader';
import NavigationItemPopUp from "./components/NavigationItemPopup";

import useDataManager from "../../hooks/useDataManager";
import { getTrad, getTradId } from '../../translations';
import {
  transformItemToViewPayload,
  transformToRESTPayload,
  usedContentTypes,
  validateNavigationStructure,
} from './utils/parsers';


const View = () => {
  const {
    items: availableNavigations,
    activeItem: activeNavigation,
    changedActiveItem: changedActiveNavigation,
    config,
    navigationItemPopupOpened,
    isLoading,
    isLoadingForAdditionalDataToBeSet,
    isLoadingForSubmit,
    handleChangeNavigationItemPopupVisibility,
    handleChangeSelection,
    handleChangeNavigationData,
    handleResetNavigationData,
    handleSubmitNavigation,
    getContentTypeItems,
    error
  } = useDataManager();

  const [activeNavigationItem, setActiveNavigationItemState] = useState({});
  const { formatMessage } = useIntl();

  const structureHasErrors = !validateNavigationStructure((changedActiveNavigation || {}).items);
  const navigationSelectValue = get(activeNavigation, "id", null);
  const handleSave = () => isLoadingForSubmit || structureHasErrors
      ? null
      : handleSubmitNavigation(formatMessage, transformToRESTPayload(changedActiveNavigation, config));

  const changeNavigationItemPopupState = (visible, editedItem = {}) => {
    setActiveNavigationItemState(editedItem);
    handleChangeNavigationItemPopupVisibility(visible);
  };

  const addNewNavigationItem = (
    e,
    viewId = null,
    isMenuAllowedLevel = true,
    levelPath = '',
    parentAttachedToMenu = true,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    changeNavigationItemPopupState(true, {
      viewParentId: viewId,
      isMenuAllowedLevel,
      levelPath,
      parentAttachedToMenu,
    });
  };

  const usedContentTypesData = useMemo(
    () => changedActiveNavigation ? usedContentTypes(changedActiveNavigation.items) : [],
    [changedActiveNavigation],
  );

  const pullUsedContentTypeItem = (items = []) =>
  items.reduce((prev, curr) =>
      [...prev, curr.relatedRef ? {
        __collectionName: curr.relatedRef.__collectionName,
        id: curr.relatedRef.id
      } : undefined, ...pullUsedContentTypeItem(curr.items)].filter(item => item)
    , []);
  const usedContentTypeItems = pullUsedContentTypeItem((changedActiveNavigation || {}).items);
  const handleSubmitNavigationItem = (payload) => {
    const changedStructure = {
      ...changedActiveNavigation,
      items: transformItemToViewPayload(payload, changedActiveNavigation.items, config),
    };
    handleChangeNavigationData(changedStructure, true);
  };

  const onPopUpClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    changeNavigationItemPopupState(false);
  };
  
  return (
    <Main labelledBy="title" aria-busy={isLoadingForSubmit}>
      <NavigationHeader
        structureHasErrors={structureHasErrors}
        isLoadingForSubmit={isLoadingForSubmit}
        handleSubmitNavigationItem={handleSubmitNavigationItem}
        handleSave={handleSave}
      />
      <ContentLayout>
        {isLoading && <LoadingIndicatorPage />}
        {changedActiveNavigation && (
          <>
            {isEmpty(changedActiveNavigation.items || []) && (
              // FIXME: this does not look properly
              <EmptyView>
                <FontAwesomeIcon icon={faHamburger} size="4x" />
                <FormattedMessage id={getTradId('empty')}/>
                <Button
                  color="primary"
                  startIcon={<Plus />}
                  label={formatMessage(getTrad('empty.cta'))}
                  onClick={addNewNavigationItem}
                >{formatMessage(getTrad('empty.cta'))}</Button>
              </EmptyView>
            )}
            {!isEmpty(changedActiveNavigation.items || []) && <Text>To be migrated...</Text>}
          </>
        )}
      </ContentLayout>
      {navigationItemPopupOpened && <NavigationItemPopUp
        isLoading={isLoadingForAdditionalDataToBeSet}
        data={activeNavigationItem}
        config={config}
        usedContentTypesData={usedContentTypesData}
        usedContentTypeItems={usedContentTypeItems}
        getContentTypeItems={getContentTypeItems}
        onSubmit={handleSubmitNavigationItem}
        onClose={onPopUpClose}
      />}
    </Main>
  );
};

export default memo(View);
