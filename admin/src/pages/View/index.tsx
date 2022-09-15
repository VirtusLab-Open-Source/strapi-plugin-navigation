/*
 *
 * Navigation View
 *
 */
import React, { memo, useCallback, useMemo, useState } from 'react';

// @ts-ignore
import { Main } from '@strapi/design-system/Main';

// Components 
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
import { ResourceState } from '../../utils';
import { useActiveNavigation } from '../../hooks/useActiveNavigation';
import { useNavigationItemPopup } from '../../hooks/useNavigationItemPopup';
import { assertNotEmpty, Navigation, NavigationItem, NestedStructure } from '../../../../types';
import MainViewContent from './components/MainViewContent';
import { Id } from 'strapi-typed';
import { useContentTypeItems } from '../../hooks/useContentTypeItems';

type UsedContentTypeItem = { id: Id, __collectionUid: string, };
type PullUsedContentTypeItem = (items?: NestedStructure<{ relatedRef?: { id: Id, __collectionUid: string } }>[]) => UsedContentTypeItem[];

const View: React.FC = () => {
  // State hooks 
  const navigationConfig = useConfig();
  const activeNavigation = useActiveNavigation();
  const navigationItemPopup = useNavigationItemPopup();
  const contentTypeItems = useContentTypeItems();
  const {
    isLoading,
    isLoadingForSubmit,
    handleI18nCopy,
    error,
    availableLocale: allAvailableLocale,
    slugify,
  } = useDataManager();
  const [activeNavigationItem, setActiveNavigationItemState] = useState<NavigationItem | {}>({});
  const [structureChanged, setStructureChanged] = useState(false);

  // Memo hooks
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
    setActiveNavigationItemState(editedItem);
    navigationItemPopup.setNavigationItemPopupState(visible);
  }, [setActiveNavigationItemState, navigationItemPopup.setNavigationItemPopupState]);

  if (
    isLoading ||
    navigationConfig.state === ResourceState.LOADING ||
    activeNavigation.state === ResourceState.LOADING ||
    contentTypeItems.state === ResourceState.LOADING
  ) {
    return <LoadingView />;
  }
  if (error) {
    return <ErrorView error={error} />
  }
  if (navigationConfig.state === ResourceState.ERROR) {
    return <ErrorView error={navigationConfig.error} />
  }
  if (activeNavigation.state === ResourceState.ERROR) {
    // TODO: [@ltsNotMike] Find out why ts doesn't recognize activeNavigation.error as Error
    return <ErrorView error={activeNavigation.error as Error | null} />
  }
  if (contentTypeItems.state === ResourceState.ERROR) {
    // TODO: [@ltsNotMike] Find out why ts doesn't recognize activeNavigation.error as Error
    return <ErrorView error={contentTypeItems.error} />
  }
  if (activeNavigation.value.changedActiveNavigation === null) {
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
    assertNotEmpty(activeNavigation.value.changedActiveNavigation);
    const changedStructure: Navigation = {
      ...activeNavigation.value.changedActiveNavigation,
      items: transformItemToViewPayload(payload, activeNavigation.value.changedActiveNavigation?.items, navigationConfig.value),
    };
    activeNavigation.value.handleChangeNavigationData(changedStructure, true);
    setStructureChanged(true);
  };

  const onPopUpClose = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    changeNavigationItemPopupState(false);
  };

  const usedContentTypeItems = pullUsedContentTypeItem(activeNavigation.value.changedActiveNavigation?.items);
  return (
    <Main labelledBy="title" aria-busy={isLoadingForSubmit}>
      {/** @ts-ignore */}
      <MainViewContent
        availableLocale={availableLocale}
        config={navigationConfig.value}
        isLoadingForSubmit={false}
        setActiveNavigationItemState={setActiveNavigationItemState}
        setStructureChanged={setStructureChanged}
        structureChanged={structureChanged}
        handleSubmitNavigationItem={handleSubmitNavigationItem}
        {...activeNavigation.value}
      />
      {navigationItemPopup.isNavigationItemPopupOpened && <NavigationItemPopUp
        {...contentTypeItems.value}
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
