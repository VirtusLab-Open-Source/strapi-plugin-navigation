/*
 *
 * Navigation View
 *
 */
import React, { memo, useCallback, useMemo, useState } from 'react';

// @ts-ignore
import { Main } from '@strapi/design-system/Main';
import NavigationItemPopUp from "./components/NavigationItemPopup";
import { useI18nCopyNavigationItemsModal } from '../../hooks/useI18nCopyNavigationItemsModal';
import useDataManager from "../../hooks/useDataManager";
import {
  transformItemToViewPayload,
  usedContentTypes,
} from './utils/parsers';
import useConfig from '../../hooks/useConfig';
import LoadingView from '../../components/LoadingView';
import ErrorView from '../../components/ErrorView';
import { getMessage, ResourceState } from '../../utils';
import { useActiveNavigation } from '../../hooks/useActiveNavigation';
import { useNavigationItemPopup } from '../../hooks/useNavigationItemPopup';
import { Navigation, NavigationItem, NestedStructure } from '../../../../types';
import MainViewContent from './components/MainViewContent';
import { Id } from 'strapi-typed';
import { useContentTypeItems } from '../../hooks/useContentTypeItems';

type UsedContentTypeItem = { id: Id, __collectionUid: string, };
type PullUsedContentTypeItem = (items?: NestedStructure<{ relatedRef?: { id: Id, __collectionUid: string } }>[]) => UsedContentTypeItem[];

const View: React.FC = () => {
  const navigationConfig = useConfig();
  const activeNavigation = useActiveNavigation();
  const { openPopup, closePopup, isPopupOpen } = useNavigationItemPopup();
  const contentTypeItems = useContentTypeItems();
  const {
    isLoadingForSubmit,
    handleI18nCopy,
    error,
    availableLocale: allAvailableLocale,
    slugify,
  } = useDataManager();

  const [activeNavigationItem, setActiveNavigationItem] = useState<NavigationItem | {}>({});
  const [structureChanged, setStructureChanged] = useState(false);

  const availableLocale = useMemo(() =>
    activeNavigation.state === ResourceState.RESOLVED
      ? allAvailableLocale.filter((locale: string) => locale !== activeNavigation.value.changedActiveNavigation?.localeCode)
      : [],
    [activeNavigation.state, allAvailableLocale]
  );

  const usedContentTypesData = useMemo(() =>
    activeNavigation.state === ResourceState.RESOLVED && activeNavigation.value.changedActiveNavigation
      ? usedContentTypes(activeNavigation.value.changedActiveNavigation.items)
      : [],
    [activeNavigation.state],
  );

  const { i18nCopyItemsModal } = useI18nCopyNavigationItemsModal(
    useCallback((sourceLocale) => {
      if (activeNavigation.state !== ResourceState.RESOLVED) return;

      const source = activeNavigation.value.activeNavigation?.localizations?.find(({ localeCode }) => localeCode === sourceLocale);

      if (source) {
        handleI18nCopy(source.id, activeNavigation.value.activeNavigation?.id);
      }
    }, [activeNavigation, handleI18nCopy])
  );

  const changeNavigationItemPopupState = useCallback((visible: boolean, editedItem: NavigationItem | {} = {}) => {
    setActiveNavigationItem(editedItem);
    visible ? openPopup() : closePopup();
  }, [setActiveNavigationItem, openPopup, closePopup]);

  if (
    navigationConfig.state === ResourceState.LOADING ||
    activeNavigation.state === ResourceState.LOADING ||
    contentTypeItems.state === ResourceState.LOADING
  ) {
    return <LoadingView />;
  }
  if (
    error ||
    navigationConfig.state == ResourceState.ERROR ||
    activeNavigation.state === ResourceState.ERROR ||
    contentTypeItems.state === ResourceState.ERROR
  ) {
    return <ErrorView error={getMessage('notification.error')} />;
  }

  const { value: { changedActiveNavigation } } = activeNavigation;
  if (changedActiveNavigation === null) {
    return <LoadingView />;
  }

  const pullUsedContentTypeItem: PullUsedContentTypeItem = (items = []): UsedContentTypeItem[] =>
    items.reduce((prev, curr) =>
      [...prev, curr.relatedRef ? {
        __collectionUid: curr.relatedRef.__collectionUid,
        id: curr.relatedRef.id
      } : undefined, ...pullUsedContentTypeItem(curr.items)].filter(item => item) as UsedContentTypeItem[]
      , [] as UsedContentTypeItem[]);

  const handleSubmitNavigationItem = (payload: NavigationItem) => {
    const changedStructure: Navigation = {
      ...changedActiveNavigation,
      items: transformItemToViewPayload(payload, changedActiveNavigation?.items, navigationConfig.value, contentTypeItems.value.contentTypeItems),
    };

    activeNavigation.value.handleChangeNavigationData(changedStructure, true);
    setStructureChanged(true);
  };

  const onPopUpClose = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    changeNavigationItemPopupState(false);
  };

  const usedContentTypeItems = pullUsedContentTypeItem(changedActiveNavigation?.items);
  return (
    <Main labelledBy="title" aria-busy={isLoadingForSubmit}>
      <MainViewContent
        availableLocale={availableLocale}
        config={navigationConfig.value}
        isLoadingForSubmit={false}
        setActiveNavigationItemState={setActiveNavigationItem}
        setStructureChanged={setStructureChanged}
        structureChanged={structureChanged}
        handleSubmitNavigationItem={handleSubmitNavigationItem}
        {...activeNavigation.value}
        changedActiveNavigation={changedActiveNavigation}
        changeNavigationItemPopupState={changeNavigationItemPopupState}
      />
      {isPopupOpen && <NavigationItemPopUp
        {...contentTypeItems.value}
        activeItem={activeNavigation.value.activeNavigation}
        availableLocale={availableLocale}
        data={activeNavigationItem}
        usedContentTypesData={usedContentTypesData}
        usedContentTypeItems={usedContentTypeItems}
        onSubmit={handleSubmitNavigationItem}
        onClose={onPopUpClose}
        config={navigationConfig.value}
        slugify={slugify}
      />}
      {i18nCopyItemsModal}
    </Main>
  );
};

export default memo(View);
