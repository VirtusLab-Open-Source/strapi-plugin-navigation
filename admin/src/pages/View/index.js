/*
 *
 * Navigation View
 *
 */

import React, { memo, useMemo, useState } from 'react';
import { useIntl } from "react-intl";
import { isEmpty, get } from "lodash";

// Design System
import { Main } from '@strapi/design-system/Main';
import { ContentLayout } from '@strapi/design-system/Layout';
import { Button } from '@strapi/design-system/Button';
import { LoadingIndicatorPage } from "@strapi/helper-plugin";
import { EmptyStateLayout } from '@strapi/design-system/EmptyStateLayout';
import EmptyDocuments from '@strapi/icons/EmptyDocuments';
import Plus from "@strapi/icons/Plus";

// Components 
import NavigationHeader from './components/NavigationHeader';
import NavigationItemPopUp from "./components/NavigationItemPopup";
import List from '../../components/NavigationItemList';
import useDataManager from "../../hooks/useDataManager";
import { getTrad } from '../../translations';
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
        __collectionUid: curr.relatedRef.__collectionUid,
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

  const handleItemRemove = (item) => {
    handleSubmitNavigationItem({
      ...item,
      removed: true,
    });
  }

  const handleItemRestore = (item) => {
    handleSubmitNavigationItem({
      ...item,
      removed: false,
    });
  };

  const handleItemEdit = (
    item,
    levelPath = '',
    parentAttachedToMenu = true,
  ) => {
    changeNavigationItemPopupState(true, {
      ...item,
      levelPath,
      parentAttachedToMenu,
    });
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
        addNewNavigationItem={addNewNavigationItem}
        handleSave={handleSave}
      />
      <ContentLayout>
        {isLoading && <LoadingIndicatorPage />}
        {changedActiveNavigation && (
          <>
            {isEmpty(changedActiveNavigation.items || []) && (
              <EmptyStateLayout
                action={
                  <Button
                    variant='secondary'
                    startIcon={<Plus />}
                    label={formatMessage(getTrad('empty.cta'))}
                    onClick={addNewNavigationItem}
                  >
                    {formatMessage(getTrad('empty.cta'))}
                  </Button>
                }
                icon={<EmptyDocuments width='10rem' />}
                content={formatMessage(getTrad('empty'))}
              />
            )}
            {
              !isEmpty(changedActiveNavigation.items || [])
              && <List
                items={changedActiveNavigation.items || []}
                onItemLevelAdd={addNewNavigationItem}
                onItemRemove={handleItemRemove}
                onItemEdit={handleItemEdit}
                onItemRestore={handleItemRestore}
                root
                error={error}
                allowedLevels={config.allowedLevels}
                contentTypes={config.contentTypes}
                isParentAttachedToMenu={true}
                contentTypesNameFields={config.contentTypesNameFields}
              />
            }
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
