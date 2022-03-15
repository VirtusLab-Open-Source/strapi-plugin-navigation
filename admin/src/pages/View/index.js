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
import { Flex } from '@strapi/design-system/Flex';
import { ContentLayout } from '@strapi/design-system/Layout';
import { Typography } from '@strapi/design-system/Typography';
import { Box } from '@strapi/design-system/Box';
import { Icon } from '@strapi/design-system/Icon';
import { Button } from '@strapi/design-system/Button';
import { LoadingIndicatorPage } from "@strapi/helper-plugin";
import EmptyDocumentsIcon from '@strapi/icons/EmptyDocuments';
import PlusIcon from "@strapi/icons/Plus";

// Components 
import List from '../../components/NavigationItemList';
import NavigationContentHeader from './components/NavigationContentHeader';
import NavigationHeader from './components/NavigationHeader';
import NavigationItemPopUp from "./components/NavigationItemPopup";
import Search from '../../components/Search';
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

  const [searchValue, setSearchValue] = useState('');
  const [structureChanged, setStructureChanged] = useState(false);
  const isSearchEmpty = isEmpty(searchValue);

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
    setStructureChanged(true);
  };

  const filteredListFactory = (items, filterFunction) => items.reduce((acc, item) => {
    const subItems = !isEmpty(item.items) ? filteredListFactory(item.items, filterFunction) : [];
    if (filterFunction(item))
      return [item, ...subItems, ...acc];
    else
      return [...subItems, ...acc];
  }, []);
  const filteredList = !isSearchEmpty ? filteredListFactory(changedActiveNavigation.items, (item) => item?.title.includes(searchValue)) : [];

  const changeCollapseItemDeep = (item, collapse) => {
    if (item.collapsed !== collapse) {
      return {
        ...item,
        collapsed: collapse,
        updated: true,
        items: item.items?.map(el => changeCollapseItemDeep(el, collapse))
      }
    }
    return {
      ...item,
      items: item.items?.map(el => changeCollapseItemDeep(el, collapse))
    }
  }

  const handleCollapseAll = () => {
    handleChangeNavigationData({
      ...changedActiveNavigation,
      items: changedActiveNavigation.items.map(item => changeCollapseItemDeep(item, true))
    }, true);
    setStructureChanged(true);
  }

  const handleExpandAll = () => {
    handleChangeNavigationData({
      ...changedActiveNavigation,
      items: changedActiveNavigation.items.map(item => changeCollapseItemDeep(item, false))
    }, true);
    setStructureChanged(true);
  }

  const handleItemReOrder = (item, newOrder) => {
    handleSubmitNavigationItem({
      ...item,
      order: newOrder,
    })
  }

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

  const handleItemToggleCollapse = (item) => {
    handleSubmitNavigationItem({
      ...item,
      collapsed: !item.collapsed,
      updated: true,
    });
  }

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

  const handleChangeNavigationSelection = (...args) => {
    handleChangeSelection(...args);
    setSearchValue('');
  }

  const endActions = [
    {
      onClick: handleExpandAll,
      disabled: isLoadingForSubmit,
      type: "submit",
      variant: 'tertiary',
      tradId: 'header.action.expandAll',
      margin: '8px',
    },
    {
      onClick: handleCollapseAll,
      disabled: isLoadingForSubmit,
      type: "submit",
      variant: 'tertiary',
      tradId: 'header.action.collapseAll',
      margin: '8px',
    },
    {
      onClick: addNewNavigationItem,
      startIcon: <PlusIcon />,
      disabled: isLoadingForSubmit,
      type: "submit",
      tradId: 'header.action.newItem',
      margin: '16px',
    },
  ]

  return (
    <Main labelledBy="title" aria-busy={isLoadingForSubmit}>
      <NavigationHeader
        structureHasErrors={structureHasErrors}
        structureHasChanged={structureChanged}
        availableNavigations={availableNavigations}
        activeNavigation={activeNavigation}
        handleChangeSelection={handleChangeNavigationSelection}
        handleSave={handleSave}
      />
      <ContentLayout>
        {isLoading && <LoadingIndicatorPage />}
        {changedActiveNavigation && (
          <>
            <NavigationContentHeader
              startActions={<Search value={searchValue} setValue={setSearchValue} />}
              endActions={endActions.map(({ tradId, margin, ...item }, i) =>
                <Box marginLeft={margin} key={i}>
                  <Button {...item}> {formatMessage(getTrad(tradId))} </Button>
                </Box>
              )}
            />
            {isEmpty(changedActiveNavigation.items || []) && (
              <Flex direction="column" minHeight="400px" justifyContent="center">
                <Icon as={EmptyDocumentsIcon} width="160px" height="88px" color="" />
                <Box padding={4}>
                  <Typography variant="beta" textColor="neutral600">{formatMessage(getTrad('empty'))}</Typography>
                </Box>
                <Button
                  variant='secondary'
                  startIcon={<PlusIcon />}
                  label={formatMessage(getTrad('empty.cta'))}
                  onClick={addNewNavigationItem}
                >
                  {formatMessage(getTrad('empty.cta'))}
                </Button>
              </Flex>
            )}
            {
              !isEmpty(changedActiveNavigation.items || [])
              && <List
                items={isSearchEmpty ? changedActiveNavigation.items || [] : filteredList}
                onItemLevelAdd={addNewNavigationItem}
                onItemRemove={handleItemRemove}
                onItemEdit={handleItemEdit}
                onItemRestore={handleItemRestore}
                onItemReOrder={handleItemReOrder}
                onItemToggleCollapse={handleItemToggleCollapse}
                displayFlat={!isSearchEmpty}
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
