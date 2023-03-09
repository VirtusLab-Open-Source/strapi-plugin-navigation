/*
 *
 * Navigation View
 *
 */

import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { isEmpty } from "lodash";

// Design System
// @ts-ignore
import { Main } from '@strapi/design-system/Main';
// @ts-ignore
import { Flex } from '@strapi/design-system/Flex';
// @ts-ignore
import { ContentLayout } from '@strapi/design-system/Layout';
// @ts-ignore
import { Typography } from '@strapi/design-system/Typography';
// @ts-ignore
import { Box } from '@strapi/design-system/Box';
// @ts-ignore
import { Icon } from '@strapi/design-system/Icon';
// @ts-ignore
import { Button } from '@strapi/design-system/Button';
// @ts-ignore
import { Select, Option } from '@strapi/design-system/Select';
// @ts-ignore
import { Grid, GridItem } from "@strapi/design-system/Grid";
// @ts-ignore
import { LoadingIndicatorPage, useNotification } from "@strapi/helper-plugin";
// @ts-ignore
import EmptyDocumentsIcon from '@strapi/icons/EmptyDocuments';
// @ts-ignore
import PlusIcon from "@strapi/icons/Plus";

// Components 
import List from '../../components/NavigationItemList';
import NavigationContentHeader from './components/NavigationContentHeader';
import NavigationHeader from './components/NavigationHeader';
import NavigationItemPopUp from "./components/NavigationItemPopup";
import { useI18nCopyNavigationItemsModal } from '../../hooks/useI18nCopyNavigationItemsModal';
import Search from '../../components/Search';
import useDataManager from "../../hooks/useDataManager";
import {
  transformItemToViewPayload,
  transformToRESTPayload,
  usedContentTypes,
  validateNavigationStructure,
} from './utils/parsers';
import { getMessage } from '../../utils';
import { I18nLocale, Navigation, ToBeFixed } from '../../../../types';

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
    handleSubmitNavigation,
    handleLocalizationSelection,
    handleI18nCopy,
    getContentTypeItems,
    error,
    availableLocale: allAvailableLocale,
    readNavigationItemFromLocale,
    slugify,
  } = useDataManager();
  const availableLocale = useMemo(
    () => allAvailableLocale.filter((locale: I18nLocale) => locale !== changedActiveNavigation?.localeCode),
    [changedActiveNavigation, allAvailableLocale]
  );
  const { i18nCopyItemsModal, i18nCopySourceLocale, setI18nCopyModalOpened, setI18nCopySourceLocale } = useI18nCopyNavigationItemsModal(
    useCallback((sourceLocale) => {
      const source = activeNavigation?.localizations?.find(({ localeCode }: { localeCode: string}) => localeCode === sourceLocale);

      if (source) {
        handleI18nCopy(source.id, activeNavigation?.id);
      }
    }, [activeNavigation, handleI18nCopy])
  );
  const openI18nCopyModalOpened = useCallback(() => { i18nCopySourceLocale && setI18nCopyModalOpened(true) }, [setI18nCopyModalOpened, i18nCopySourceLocale]);

  const [activeNavigationItem, setActiveNavigationItemState] = useState({});

  const [searchValue, setSearchValue] = useState('');
  const [structureChanged, setStructureChanged] = useState(false);
  const isSearchEmpty = isEmpty(searchValue);
  const normalisedSearchValue = (searchValue || '').toLowerCase();

  const structureHasErrors = !validateNavigationStructure((changedActiveNavigation || {}).items);
  
  useEffect(() => structureHasErrors && toggleNotification({
    type: 'warning',
    message: getMessage('notification.error.item.relation'),
  }), [structureHasErrors]);

  const handleSave = () => isLoadingForSubmit || structureHasErrors
    ? null
    : handleSubmitNavigation(transformToRESTPayload(changedActiveNavigation, config));

  const changeNavigationItemPopupState = (visible: boolean, editedItem: ToBeFixed = {}) => {
    setActiveNavigationItemState(editedItem);
    handleChangeNavigationItemPopupVisibility(visible);
  };

  const addNewNavigationItem = useCallback((
    event: ToBeFixed,
    viewParentId = null,
    isMenuAllowedLevel = true,
    levelPath = '',
    parentAttachedToMenu = true,
    structureId = "0",
  ) => {
    event.preventDefault();
    event.stopPropagation();
    changeNavigationItemPopupState(true, {
      viewParentId,
      isMenuAllowedLevel,
      levelPath,
      parentAttachedToMenu,
      structureId,
    });
  }, [changeNavigationItemPopupState]);

  const usedContentTypesData = useMemo(
    () => changedActiveNavigation ? usedContentTypes(changedActiveNavigation.items) : [],
    [changedActiveNavigation],
  );

  const pullUsedContentTypeItem = (items: ToBeFixed = []) =>
    items.reduce((prev: ToBeFixed, curr: ToBeFixed) =>
      [...prev, curr.relatedRef ? {
        __collectionUid: curr.relatedRef.__collectionUid,
        id: curr.relatedRef.id
      } : undefined, ...pullUsedContentTypeItem(curr.items)].filter(item => item)
      , []);
  const usedContentTypeItems = pullUsedContentTypeItem(changedActiveNavigation?.items);
  const handleSubmitNavigationItem = (payload: Navigation) => {
    const changedStructure = {
      ...changedActiveNavigation,
      items: transformItemToViewPayload(payload, changedActiveNavigation.items, config),
    };
    handleChangeNavigationData(changedStructure, true);
    setStructureChanged(true);
  };

  const filteredListFactory = (items: ToBeFixed, doUse: Function) => items.reduce((acc: ToBeFixed, item: ToBeFixed) => {
    const subItems = !isEmpty(item.items) ? filteredListFactory(item.items, doUse) : [];
    if (doUse(item))
      return [item, ...subItems, ...acc];
    else
      return [...subItems, ...acc];
  }, []);
  const filteredList = !isSearchEmpty ? filteredListFactory(changedActiveNavigation.items, (item: ToBeFixed) => (item?.title || '').toLowerCase().includes(normalisedSearchValue)) : [];

  const changeCollapseItemDeep = (item: ToBeFixed, isCollapsed: boolean) => {
    if (item.collapsed !== isCollapsed) {
      return {
        ...item,
        collapsed: isCollapsed,
        updated: true,
        items: item.items?.map((el: ToBeFixed) => changeCollapseItemDeep(el, isCollapsed))
      }
    }
    return {
      ...item,
      items: item.items?.map((el: ToBeFixed) => changeCollapseItemDeep(el, isCollapsed))
    }
  }

  const handleCollapseAll = () => {
    handleChangeNavigationData({
      ...changedActiveNavigation,
      items: changedActiveNavigation.items.map((item: ToBeFixed) => changeCollapseItemDeep(item, true))
    }, true);
    setStructureChanged(true);
  }

  const handleExpandAll = () => {
    handleChangeNavigationData({
      ...changedActiveNavigation,
      items: changedActiveNavigation.items.map((item: ToBeFixed) => changeCollapseItemDeep(item, false))
    }, true);
    setStructureChanged(true);
  }

  const handleItemReOrder = (item: ToBeFixed, newOrder: number) => {
    handleSubmitNavigationItem({
      ...item,
      order: newOrder,
    })
  }

  const handleItemRemove = (item: ToBeFixed) => {
    handleSubmitNavigationItem({
      ...item,
      removed: true,
    });
  }

  const handleItemRestore = (item: ToBeFixed) => {
    handleSubmitNavigationItem({
      ...item,
      removed: false,
    });
  };

  const handleItemToggleCollapse = (item: ToBeFixed) => {
    handleSubmitNavigationItem({
      ...item,
      collapsed: !item.collapsed,
      updated: true,
    });
  }

  const handleItemEdit = (
    item: ToBeFixed,
    levelPath = '',
    parentAttachedToMenu = true,
  ) => {
    changeNavigationItemPopupState(true, {
      ...item,
      levelPath,
      parentAttachedToMenu,
    });
  };

  const onPopUpClose = (e: ToBeFixed) => {
    e?.preventDefault();
    e?.stopPropagation();
    changeNavigationItemPopupState(false);
  };

  const handleChangeNavigationSelection = (...args: ToBeFixed) => {
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
      variant: "default",
      tradId: 'header.action.newItem',
      margin: '16px',
    },
  ];

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
      />
      <ContentLayout>
        {isLoading && <LoadingIndicatorPage />}
        {changedActiveNavigation && (
          <>
            <NavigationContentHeader
              startActions={<Search value={searchValue} setValue={setSearchValue} />}
              endActions={endActions.map(({ tradId, margin, ...item }, i) =>
                <Box marginLeft={margin} key={i}>
                  <Button {...item}> {getMessage(tradId)} </Button>
                </Box>
              )}
            />
            {isEmpty(changedActiveNavigation.items || []) && (
              <Flex direction="column" minHeight="400px" justifyContent="center">
                <Icon as={EmptyDocumentsIcon} width="160px" height="88px" color="" />
                <Box padding={4}>
                  <Typography variant="beta" textColor="neutral600">{getMessage('empty')}</Typography>
                </Box>
                <Button
                  variant='secondary'
                  startIcon={<PlusIcon />}
                  label={getMessage('empty.cta')}
                  onClick={addNewNavigationItem}
                >
                  {getMessage('empty.cta')}
                </Button>
                {
                  config.i18nEnabled && availableLocale.length ? (
                    <Flex direction="column" justifyContent="center">
                      <Box paddingTop={3} paddingBottom={3}>
                        <Typography variant="beta" textColor="neutral600">{getMessage('view.i18n.fill.cta')}</Typography>
                      </Box>
                      <Flex direction="row" justifyContent="center" alignItems="center">
                        <Box paddingLeft={1} paddingRight={1}>
                          <Select onChange={setI18nCopySourceLocale} value={i18nCopySourceLocale} size="S">
                            {availableLocale.map((locale: I18nLocale) => <Option key={locale} value={locale}>
                              {getMessage({
                                id: 'view.i18n.fill.option',
                                props: { locale }
                              })}
                            </Option>)}
                          </Select>
                        </Box>
                        <Box paddingLeft={1} paddingRight={1}>
                          <Button variant="tertiary" onClick={openI18nCopyModalOpened} disabled={!i18nCopySourceLocale} size="S">
                            {getMessage('view.i18n.fill.cta.button')}
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
      />}
      {i18nCopyItemsModal}
    </Main>
  );
};

export default memo(View);
