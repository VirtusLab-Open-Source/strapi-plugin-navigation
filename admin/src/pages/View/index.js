/*
 *
 * Navigation View
 *
 */

import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
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
import { Select, Option } from '@strapi/design-system/Select';
// @ts-ignore
import { Grid, GridItem } from "@strapi/design-system/Grid";
import { LoadingIndicatorPage, useNotification, useRBAC } from "@strapi/helper-plugin";
import EmptyDocumentsIcon from '@strapi/icons/EmptyDocuments';
import PlusIcon from "@strapi/icons/Plus";

import pluginPermissions from '../../permissions';

// Components 
import List from '../../components/NavigationItemList';
import NavigationContentHeader from './components/NavigationContentHeader';
import NavigationHeader from './components/NavigationHeader';
import NavigationItemPopUp from "./components/NavigationItemPopup";
import { useI18nCopyNavigationItemsModal } from '../../hooks/useI18nCopyNavigationItemsModal';
import Search from '../../components/Search';
import useDataManager from "../../hooks/useDataManager";
import { getTrad } from '../../translations';
import {
  transformItemToViewPayload,
  transformToRESTPayload,
  usedContentTypes,
  validateNavigationStructure,
} from './utils/parsers';
import NoAcccessPage from '../NoAccessPage';

const View = () => {
  const toggleNotification = useNotification();
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
    handleLocalizationSelection,
    handleI18nCopy,
    getContentTypeItems,
    error,
    availableLocale: allAvailableLocale,
    readNavigationItemFromLocale,
    slugify,
    permissions,
  } = useDataManager();

  const { canAccess, canUpdate } = permissions;

  const availableLocale = useMemo(
    () => allAvailableLocale.filter(locale => locale !== changedActiveNavigation?.localeCode),
    [changedActiveNavigation, allAvailableLocale]
  );
  const { i18nCopyItemsModal, i18nCopySourceLocale, setI18nCopyModalOpened, setI18nCopySourceLocale } = useI18nCopyNavigationItemsModal(
    useCallback((sourceLocale) => {
      const source = activeNavigation?.localizations?.find(({ localeCode }) => localeCode === sourceLocale);

      if (source) {
        handleI18nCopy(source.id, activeNavigation?.id);
      }
    }, [activeNavigation, handleI18nCopy])
  );
  const openI18nCopyModalOpened = useCallback(() => { i18nCopySourceLocale && setI18nCopyModalOpened(true) }, [setI18nCopyModalOpened, i18nCopySourceLocale]);

  const [activeNavigationItem, setActiveNavigationItemState] = useState({});
  const { formatMessage } = useIntl();

  const [searchValue, setSearchValue] = useState('');
  const [structureChanged, setStructureChanged] = useState(false);
  const isSearchEmpty = isEmpty(searchValue);
  const normalisedSearchValue = (searchValue || '').toLowerCase();

  const structureHasErrors = !validateNavigationStructure((changedActiveNavigation || {}).items);
  
  useEffect(() => {
    if(structureHasErrors) {
      toggleNotification({
        type: 'warning',
        message: getTrad('notification.error.item.relation'),
      });
    }
  }, [structureHasErrors]);

  const navigationSelectValue = get(activeNavigation, "id", null);
  const handleSave = () => isLoadingForSubmit || structureHasErrors
    ? null
    : handleSubmitNavigation(formatMessage, transformToRESTPayload(changedActiveNavigation, config));

  const changeNavigationItemPopupState = (visible, editedItem = {}) => {
    setActiveNavigationItemState(editedItem);
    handleChangeNavigationItemPopupVisibility(visible);
  };

  const addNewNavigationItem = useCallback((
    event,
    viewParentId = null,
    isMenuAllowedLevel = true,
    levelPath = '',
    parentAttachedToMenu = true,
    structureId = "0",
  ) => {
    if (canUpdate) {
      event.preventDefault();
      event.stopPropagation();
      changeNavigationItemPopupState(true, {
        viewParentId,
        isMenuAllowedLevel,
        levelPath,
        parentAttachedToMenu,
        structureId,
      });
    }
  }, [changeNavigationItemPopupState]);

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
  const usedContentTypeItems = pullUsedContentTypeItem(changedActiveNavigation?.items);
  const handleSubmitNavigationItem = (payload) => {
    const changedStructure = {
      ...changedActiveNavigation,
      items: transformItemToViewPayload(payload, changedActiveNavigation.items, config),
    };
    handleChangeNavigationData(changedStructure, true);
    setStructureChanged(true);
  };

  const filteredListFactory = (items, doUse) => items.reduce((acc, item) => {
    const subItems = !isEmpty(item.items) ? filteredListFactory(item.items, doUse) : [];
    if (doUse(item))
      return [item, ...subItems, ...acc];
    else
      return [...subItems, ...acc];
  }, []);
  const filteredList = !isSearchEmpty ? filteredListFactory(changedActiveNavigation.items, (item) => (item?.title || '').toLowerCase().includes(normalisedSearchValue)) : [];

  const changeCollapseItemDeep = (item, isCollapsed) => {
    if (item.collapsed !== isCollapsed) {
      return {
        ...item,
        collapsed: isCollapsed,
        updated: true,
        items: item.items?.map(el => changeCollapseItemDeep(el, isCollapsed))
      }
    }
    return {
      ...item,
      items: item.items?.map(el => changeCollapseItemDeep(el, isCollapsed))
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
    
    // Using Strapi design system select components inside a modal causes
    // extraneous close events to be fired. It is most likely related to how
    // the select component handles onOutsideClick events. In those situations
    // the event target element is the root HTML element.
    // This is a workaround to prevent the modal from closing in those cases.
    if (e.target.tagName !== 'HTML') {
      changeNavigationItemPopupState(false);
    }
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
  ];
  if (canUpdate) {
    endActions.push({
      onClick: addNewNavigationItem,
      startIcon: <PlusIcon />,
      disabled: isLoadingForSubmit,
      type: "submit",
      variant: "default",
      tradId: 'header.action.newItem',
      margin: '16px',
    });
  }

  return (
    <Main labelledBy="title" aria-busy={isLoadingForSubmit}>
      <NavigationHeader
        structureHasErrors={structureHasErrors}
        structureHasChanged={structureChanged}
        availableNavigations={availableNavigations}
        activeNavigation={activeNavigation}
        handleChangeSelection={handleChangeNavigationSelection}
        handleSave={handleSave}
        handleLocalizationSelection={handleLocalizationSelection}
        config={config}
        permissions={{
          canAccess, canUpdate
        }}
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
                {canUpdate && (<Button
                  variant='secondary'
                  startIcon={<PlusIcon />}
                  label={formatMessage(getTrad('empty.cta'))}
                  onClick={addNewNavigationItem}
                >
                  {formatMessage(getTrad('empty.cta'))}
                </Button>)}
                {
                  canUpdate && config.i18nEnabled && availableLocale.length ? (
                    <Flex direction="column" justifyContent="center">
                      <Box paddingTop={3} paddingBottom={3}>
                        <Typography variant="beta" textColor="neutral600">{formatMessage(getTrad('view.i18n.fill.cta'))}</Typography>
                      </Box>
                      <Flex direction="row" justifyContent="center" alignItems="center">
                        <Box paddingLeft={1} paddingRight={1}>
                          <Select onChange={setI18nCopySourceLocale} value={i18nCopySourceLocale} size="S">
                            {availableLocale.map(locale => <Option key={locale} value={locale}>
                              {formatMessage(getTrad('view.i18n.fill.option'), { locale })}
                            </Option>)}
                          </Select>
                        </Box>
                        <Box paddingLeft={1} paddingRight={1}>
                          <Button variant="tertiary" onClick={openI18nCopyModalOpened} disabled={!i18nCopySourceLocale} size="S">
                            {formatMessage(getTrad('view.i18n.fill.cta.button'))}
                          </Button>
                        </Box>
                      </Flex>
                    </Flex>
                  ) : null
                }
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
                permissions={permissions}
              />
            }
          </>
        )}
      </ContentLayout>
      {navigationItemPopupOpened && <NavigationItemPopUp
        availableLocale={availableLocale}
        isLoading={isLoadingForAdditionalDataToBeSet}
        data={activeNavigationItem}
        config={config}
        usedContentTypesData={usedContentTypesData}
        usedContentTypeItems={usedContentTypeItems}
        getContentTypeItems={getContentTypeItems}
        onSubmit={handleSubmitNavigationItem}
        onClose={onPopUpClose}
        locale={activeNavigation.localeCode}
        readNavigationItemFromLocale={readNavigationItemFromLocale}
        slugify={slugify}
        permissions={permissions}
      />}
      {canUpdate && i18nCopyItemsModal}
    </Main>
  );
};

export default memo(View);
