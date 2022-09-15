import React, { useCallback, useMemo, useState } from 'react';
import { isEmpty } from 'lodash';
import { Id } from 'strapi-typed';

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
import { EmptyDocuments as EmptyDocumentsIcon } from '@strapi/icons';

import { Effect, Navigation, NavigationConfig, NavigationItem, NavigationItemEntity, NavigationItemViewPartial, NestedStructure, ToBeFixed } from '../../../../../../types';
import List from '../../../../components/NavigationItemList';
import Search from '../../../../components/Search';
import NavigationContentHeader from '../../components/NavigationContentHeader';
import { plusIcon } from '../../../../components/icons';
import { getMessage } from '../../../../utils';
import { useNavigationItemPopup } from '../../../../hooks/useNavigationItemPopup';
import { transformToRESTPayload, validateNavigationStructure } from '../../utils/parsers';
import useDataManager from '../../../../hooks/useDataManager';
import { useIntl } from 'react-intl';
import NavigationHeader from '../NavigationHeader';
import { useI18nCopyNavigationItemsModal } from '../../../../hooks/useI18nCopyNavigationItemsModal';

interface IProps {
  // TODO: [@ltsNotMike] Sort this props after all are added;
  activeNavigation: Navigation;
  availableLocale: string[];
  changedActiveNavigation: Navigation;
  config: NavigationConfig;
  handleChangeNavigationData: (payload: Navigation, forceClosePopups?: boolean) => void;
  handleChangeSelection: Effect<Id>;
  isLoadingForSubmit: boolean;
  setActiveNavigationItemState: Effect<Partial<NestedStructure<NavigationItemEntity<ToBeFixed>>>>;
  setStructureChanged: Effect<boolean>;
  structureChanged: boolean;
  handleSubmitNavigationItem: Effect<NavigationItem>;
}

type ChangeNavigationItemPopupState = (
  visible: boolean,
  editedItem: {
    viewParentId: string | null;
    isMenuAllowedLevel: boolean;
    levelPath: string;
    parentAttachedToMenu: boolean;
    structureId: string;
  }
) => void

type ChangeCollapseItemDeep = (
  item: NestedStructure<NavigationItemEntity<ToBeFixed>>,
  isCollapsed: boolean,
) => NestedStructure<NavigationItemEntity<ToBeFixed>> & Partial<{ collapsed: boolean, updated: boolean }>


const filteredListFactory = (
  items: NestedStructure<NavigationItemEntity<ToBeFixed>>[],
  doUse: (i: NestedStructure<NavigationItemEntity<ToBeFixed>>) => boolean,
) => items.reduce((acc, item) => {
  const subItems: NestedStructure<NavigationItemEntity<ToBeFixed>>[] = !isEmpty(item.items) ? filteredListFactory(item.items, doUse) : [];
  if (doUse(item))
    return [item, ...subItems, ...acc];
  else
    return [...subItems, ...acc];
}, [] as NestedStructure<NavigationItemEntity<ToBeFixed>>[]);

const changeCollapseItemDeep: ChangeCollapseItemDeep = (item, isCollapsed) => {
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

const MainViewContent: React.FC<IProps> = ({
  availableLocale,
  activeNavigation,
  changedActiveNavigation,
  config,
  isLoadingForSubmit, // TODO: [@ltsNotMike] We don't have that state in here
  handleChangeNavigationData,
  setStructureChanged,
  structureChanged,
  setActiveNavigationItemState,
  handleChangeSelection,
  handleSubmitNavigationItem,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const { handleSubmitNavigation, handleI18nCopy } = useDataManager();
  const { setNavigationItemPopupState } = useNavigationItemPopup();
  const { formatMessage } = useIntl();
  const { i18nCopySourceLocale, setI18nCopyModalOpened, setI18nCopySourceLocale } = useI18nCopyNavigationItemsModal(
    useCallback((sourceLocale) => {
      const source = activeNavigation?.localizations?.find(({ localeCode }) => localeCode === sourceLocale);

      if (source) {
        handleI18nCopy(source.id, activeNavigation?.id);
      }
    }, [activeNavigation, handleI18nCopy])
  );

  const changeNavigationItemPopupState: ChangeNavigationItemPopupState = (visible, editedItem) => {
    // TODO: [@ltsNotMike] Fix typing
    // @ts-ignore
    setActiveNavigationItemState(editedItem);
    setNavigationItemPopupState(visible);
  };

  const structureHasErrors = useMemo(() =>
    !validateNavigationStructure((changedActiveNavigation || {}).items),
    [validateNavigationStructure, changedActiveNavigation]
  );

  const addNewNavigationItem = useCallback((
    event: React.BaseSyntheticEvent,
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

  const handleCollapseAll = useCallback(() => {
    handleChangeNavigationData({
      ...changedActiveNavigation,
      items: changedActiveNavigation.items?.map(item => changeCollapseItemDeep(item, true))
    }, true);
    setStructureChanged(true);
  }, [changedActiveNavigation, handleChangeNavigationData, setStructureChanged]);

  const handleExpandAll = useCallback(() => {
    handleChangeNavigationData({
      ...changedActiveNavigation,
      items: changedActiveNavigation.items?.map(item => changeCollapseItemDeep(item, false))
    }, true);
    setStructureChanged(true);
  }, [changedActiveNavigation, handleChangeNavigationData, setStructureChanged]);

  const handleChangeNavigationSelection = useCallback((id: Id) => {
    handleChangeSelection(id);
    setSearchValue('');
  }, [setSearchValue, handleChangeSelection]);

  const handleSave = useCallback(() =>
    isLoadingForSubmit || structureHasErrors
      ? null
      : handleSubmitNavigation(formatMessage, transformToRESTPayload(changedActiveNavigation, config))
    , [isLoadingForSubmit, structureHasErrors, handleSubmitNavigation, formatMessage, changedActiveNavigation]);

  const handleItemRemove = useCallback((item: NavigationItem) => {
    handleSubmitNavigationItem({
      ...item,
      removed: true,
    });
  }, [handleSubmitNavigationItem]);

  const handleItemRestore = useCallback((item: NavigationItem) => {
    handleSubmitNavigationItem({
      ...item,
      removed: false,
    });
  }, [handleSubmitNavigationItem]); 

  const handleItemReOrder = useCallback((item: NavigationItem, newOrder: number) => {
    handleSubmitNavigationItem({
      ...item,
      order: newOrder,
    })
  }, [handleSubmitNavigationItem]);

  const handleItemEdit = useCallback((
    item: NavigationItem & NavigationItemViewPartial,
    levelPath: string = '',
    parentAttachedToMenu: boolean = true,
  ) => {
    changeNavigationItemPopupState(true, {
      ...item,
      levelPath,
      parentAttachedToMenu,
    });
  }, [changeNavigationItemPopupState]);

  const handleItemToggleCollapse = useCallback((item: NavigationItem) => {
    handleSubmitNavigationItem({
      ...item,
      collapsed: !item.collapsed,
      updated: true,
    });
  }, [handleSubmitNavigationItem]);

  const openI18nCopyModalOpened = useCallback(() => {
    i18nCopySourceLocale && setI18nCopyModalOpened(true)
  }, [setI18nCopyModalOpened, i18nCopySourceLocale]);

  const isSearchEmpty = useMemo(() =>
    isEmpty(searchValue),
    [searchValue]
  );

  const filteredList = useMemo(
    () => !isSearchEmpty ? filteredListFactory(changedActiveNavigation?.items || [], (item) => item?.title.includes(searchValue)) : [],
    [searchValue, changedActiveNavigation]
  );

  const endActions = useMemo(() => [
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
      startIcon: plusIcon,
      disabled: isLoadingForSubmit,
      type: "submit",
      variant: "default",
      tradId: 'header.action.newItem',
      margin: '16px',
    },
  ], [isLoadingForSubmit, handleExpandAll, handleCollapseAll, addNewNavigationItem]);

  return (
    <>
      <NavigationHeader
        structureHasErrors={structureHasErrors}
        structureHasChanged={structureChanged}
        handleChangeSelection={handleChangeNavigationSelection}
        handleSave={handleSave}
        config={config}
      />
      <ContentLayout>
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
                  startIcon={plusIcon}
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
                            {availableLocale.map(locale => <Option key={locale} value={locale}>
                              {getMessage({ id: 'view.i18n.fill.option', props: { locale } })}
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
                root
                isParentAttachedToMenu
                config={config}
              />
            }
          </>
        )}
      </ContentLayout>
    </>
  );
}

export default MainViewContent;