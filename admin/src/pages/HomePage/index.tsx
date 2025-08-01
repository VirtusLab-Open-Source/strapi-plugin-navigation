import { DesignSystemProvider } from '@strapi/design-system';
import { Data } from '@strapi/strapi';
import { Layouts, Page, useNotification } from '@strapi/strapi/admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { first } from 'lodash';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { usePluginTheme } from '@sensinum/strapi-utils';
import { NavigationSchema } from '../../api/validators';
import { getTrad } from '../../translations';
import { NavigationHeader } from './components';
import { ChangeLanguageDialog } from './components/ChangeLanguageDialog';
import { NavigationContentHeader } from './components/NavigationContentHeader';
import { NavigationItemFormSchema } from './components/NavigationItemForm';
import { List } from './components/NavigationItemList';
import NavigationItemPopUp from './components/NavigationItemPopup';
import { Search } from './components/NavigationContentHeader/Search';
import {
  useConfig,
  useInvalidateQueries,
  useLocales,
  useNavigationItemPopup,
  useNavigations,
  usePurgeNavigation,
  useSearch,
  useSettingsPermissions,
  useUpdateNavigation,
} from './hooks';
import { getPendingAction, transformItemToViewPayload } from './utils';
import { ManageNavigationItems } from './components/NavigationContentHeader/ManageNavigationItems';
import { NavigationEmptyState } from './components/NavigationEmptyState';
import { appendViewId } from './utils/appendViewId';

const queryClient = new QueryClient();

const Inner = () => {
  const { formatMessage } = useIntl();

  const navigationsQuery = useNavigations();
  const configQuery = useConfig();
  const purgeMutation = usePurgeNavigation();

  const { toggleNotification } = useNotification();

  const [recentNavigation, setRecentNavigation] = useState<{ documentId?: string; id?: Data.ID }>();
  const [currentNavigation, setCurrentNavigation] = useState<NavigationSchema>();
  const [structureChanged, setStructureChanged] = useState(false);

  const { canAccess, canUpdate, isLoadingForPermissions } = useSettingsPermissions();

  const {
    localeData,
    currentLocale,
    isChangeLanguageVisible,
    changeCurrentLocaleAction,
    availableLocales,
  } = useLocales(navigationsQuery.data, setStructureChanged);

  const { searchValue, setSearchValue, isSearchEmpty, filteredList } = useSearch(currentNavigation);

  const {
    activeNavigationItem,
    addNewNavigationItem,
    editNavigationItem,
    closeNavigationItemPopup,
    isItemPopupVisible,
  } = useNavigationItemPopup(canUpdate);

  const pending = getPendingAction([navigationsQuery, { isPending: isLoadingForPermissions }]);

  const updateNavigationMutation = useUpdateNavigation({
    onError: (error: any) => {
      toggleNotification({
        type: 'danger',
        message: formatMessage(getTrad('notification.navigation.update.error')),
      });

      try {
        console.error(error);
        console.log(error.response.data.error);
      } catch (e) {}
    },
    onSuccess: (next) => {
      setCurrentNavigation({
        ...next,
        items: next.items.map(appendViewId),
      });

      setRecentNavigation({
        documentId: next.documentId,
        id: next.id,
      });

      setStructureChanged(false);
    },
  });

  const submit = () => {
    if (currentNavigation) {
      updateNavigationMutation.mutate(currentNavigation);
    }
  };

  const onPopUpClose = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Using Strapi design system select components inside a modal causes
    // extraneous close events to be fired. It is most likely related to how
    // the select component handles onOutsideClick events. In those situations
    // the event target element is the root HTML element.
    // This is a workaround to prevent the modal from closing in those cases.
    if ((e.target as any).tagName !== 'HTML') {
      closeNavigationItemPopup();
    }
  };

  const handleSubmitNavigationItem = (payload: NavigationItemFormSchema) => {
    if (currentNavigation && configQuery.data) {
      const items = transformItemToViewPayload(
        payload,
        currentNavigation?.items ?? [],
        configQuery.data
      );

      setCurrentNavigation({
        ...currentNavigation,
        items,
      });

      setStructureChanged(true);

      closeNavigationItemPopup();
    }
  };

  const listItems = isSearchEmpty ? (currentNavigation?.items ?? []) : filteredList;

  useEffect(() => {
    if (!currentNavigation && navigationsQuery.data?.[0]) {
      let navigation;
      if (recentNavigation?.documentId) {
        navigation = navigationsQuery.data.find(
          (nav) => nav.documentId === recentNavigation.documentId && nav.id === recentNavigation.id
        );
      }

      setRecentNavigation(undefined);
      setCurrentNavigation(navigation ? navigation : first(navigationsQuery.data));
    }
  }, [navigationsQuery.data, currentNavigation]);

  useEffect(() => {
    if (currentNavigation && currentLocale !== currentNavigation.locale) {
      setRecentNavigation(undefined);

      const nextNavigation = navigationsQuery.data?.find(
        (navigation) =>
          navigation.documentId === currentNavigation.documentId &&
          navigation.locale === currentLocale
      );

      if (
        nextNavigation &&
        nextNavigation.documentId === currentNavigation.documentId &&
        nextNavigation.locale !== currentNavigation.locale
      ) {
        setCurrentNavigation(nextNavigation);
      }
    }
  }, [currentNavigation, currentLocale, navigationsQuery.data]);

  useInvalidateQueries();

  if (!navigationsQuery.data || !localeData || !!pending) {
    return <Page.Loading />;
  }

  return (
    <Layouts.Root>
      <Page.Title children={formatMessage(getTrad('header.title', 'UI Navigation'))} />
      <Page.Main>
        <NavigationHeader
          availableNavigations={navigationsQuery.data}
          activeNavigation={currentNavigation}
          handleCachePurge={() => purgeMutation.mutate(undefined)}
          handleChangeSelection={setCurrentNavigation}
          handleLocalizationSelection={
            structureChanged ? changeCurrentLocaleAction.trigger : changeCurrentLocaleAction.perform
          }
          handleSave={submit}
          locale={localeData}
          structureHasChanged={structureChanged}
          isSaving={updateNavigationMutation.isPending}
          permissions={{ canUpdate }}
          currentLocale={currentLocale}
        />

        <Layouts.Content>
          <NavigationContentHeader
            startActions={<Search value={searchValue} setValue={setSearchValue} />}
            endActions={
              <ManageNavigationItems
                currentNavigation={currentNavigation}
                setCurrentNavigation={setCurrentNavigation}
                canUpdate={canUpdate}
                addNewNavigationItem={addNewNavigationItem}
              />
            }
          />
          {!currentNavigation?.items.length ? (
            <NavigationEmptyState
              canUpdate={canUpdate}
              addNewNavigationItem={addNewNavigationItem}
              availableLocale={availableLocales}
              availableNavigations={navigationsQuery.data}
              currentNavigation={currentNavigation}
              setCurrentNavigation={setCurrentNavigation}
            />
          ) : (
            <List
              items={listItems}
              onItemLevelAdd={addNewNavigationItem}
              onItemEdit={editNavigationItem}
              onItemSubmit={handleSubmitNavigationItem}
              displayFlat={!isSearchEmpty}
              isParentAttachedToMenu
              permissions={{ canUpdate, canAccess }}
              structurePrefix=""
              locale={currentLocale ?? ''}
            />
          )}

          {isItemPopupVisible && currentLocale && currentNavigation && (
            <NavigationItemPopUp
              availableLocale={availableLocales}
              currentItem={activeNavigationItem}
              onSubmit={handleSubmitNavigationItem}
              onClose={onPopUpClose}
              locale={currentLocale}
              permissions={{ canUpdate }}
              isOpen={isItemPopupVisible}
              isLoading={isLoadingForPermissions}
              currentNavigation={currentNavigation}
            />
          )}

          {isChangeLanguageVisible && (
            <ChangeLanguageDialog
              onCancel={() => changeCurrentLocaleAction.cancel()}
              onConfirm={() => changeCurrentLocaleAction.perform()}
            />
          )}
        </Layouts.Content>
      </Page.Main>
    </Layouts.Root>
  );
};

export default function HomePage() {
  const theme = usePluginTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <DesignSystemProvider theme={theme}>
        <Inner />
      </DesignSystemProvider>
    </QueryClientProvider>
  );
}

export { HomePage };
