import {
  Box,
  Button,
  DesignSystemProvider,
  Flex,
  SingleSelect,
  SingleSelectOption,
  Typography,
} from '@strapi/design-system';
import { Data } from '@strapi/strapi';
import { Layouts, Page, useRBAC } from '@strapi/strapi/admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { first, isEmpty } from 'lodash';
import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { usePluginTheme } from '@sensinum/strapi-utils';
import { ListPlus, Plus } from '@strapi/icons';
import { NavigationItemSchema, NavigationSchema } from '../../api/validators';
import { getTrad } from '../../translations';
import { ToBeFixed } from '../../types';
import pluginPermissions from '../../utils/permissions';
import { NavigationHeader } from './components';
import { ChangeLanguageDialog } from './components/ChangeLanguageDialog';
import { NavigationContentHeader } from './components/NavigationContentHeader';
import { NavigationItemFormSchema } from './components/NavigationItemForm';
import { List } from './components/NavigationItemList';
import NavigationItemPopUp from './components/NavigationItemPopup';
import { Search } from './components/Search';
import {
  appendViewId,
  useConfig,
  useCopyNavigationI18n,
  useI18nCopyNavigationItemsModal,
  useLocale,
  useNavigations,
  usePurgeNavigation,
  useResetContentTypes,
  useResetNavigations,
  useUpdateNavigation,
} from './hooks';
import {
  changeCollapseItemDeep,
  getPendingAction,
  mapServerNavigationItem,
  transformItemToViewPayload,
} from './utils';

const queryClient = new QueryClient();

interface MakeActionInput<T> {
  trigger(): void;
  cancel(): void;
  perform(input: T): void;
}

const makeAction = <T,>({ cancel, perform, trigger }: MakeActionInput<T>) => {
  const pointer: { value?: T } = {};

  return {
    perform: (next?: T) => {
      const value = next ?? pointer.value;

      if (value) {
        perform(value);
      }
    },
    trigger: (next: T) => {
      pointer.value = next;

      trigger();
    },
    cancel,
  };
};

const Inner = () => {
  const { formatMessage } = useIntl();

  const localeQuery = useLocale();

  const [recentNavigation, setRecentNavigation] = useState<{ documentId?: string; id?: Data.ID }>();
  const [currentNavigation, setCurrentNavigation] = useState<NavigationSchema>();

  const [activeNavigationItem, setActiveNavigationItemState] = useState<
    Partial<NavigationItemFormSchema> | undefined
  >();

  const [isItemPopupVisible, setIsItemPopupVisible] = useState(false);

  const [structureChanged, setStructureChanged] = useState(false);

  const [currentLocale, setCurrentLocale] = useState<string>();
  const [isChangeLanguageVisible, setIsChangeLanguageVisible] = useState(false);
  const changeCurrentLocaleAction = useMemo(() => makeAction<string>({
    perform: (next) => {
      setCurrentLocale(next);
      setIsChangeLanguageVisible(false);
      setStructureChanged(false);
    },
    trigger: () => setIsChangeLanguageVisible(true),
    cancel: () => setIsChangeLanguageVisible(false),
  }), [setCurrentLocale, setIsChangeLanguageVisible]);

  const viewPermissions = useMemo(
    () => ({
      access: pluginPermissions.access || pluginPermissions.update,
      update: pluginPermissions.update,
    }),
    []
  );

  const {
    isLoading: isLoadingForPermissions,
    allowedActions: { canUpdate, canAccess },
  } = useRBAC(viewPermissions);

  const navigationsQuery = useNavigations();

  const configQuery = useConfig();

  const purgeMutation = usePurgeNavigation();

  const pending = getPendingAction([navigationsQuery, { isPending: isLoadingForPermissions }]);

  const copyNavigationI18nMutation = useCopyNavigationI18n();

  const [{ value: searchValue, index: searchIndex }, setSearchValue] = useState({
    value: '',
    index: 0,
  });
  const isSearchEmpty = isEmpty(searchValue);
  const normalisedSearchValue = (searchValue || '').toLowerCase();

  const filteredListFactory = (
    items: Array<NavigationItemSchema>,
    doUse: (item: NavigationItemSchema) => boolean,
    activeIndex?: number
  ): NavigationItemSchema[] => {
    const filteredItems = items.reduce<Array<NavigationItemSchema>>((acc, item) => {
      const subItems = !!item.items?.length ? filteredListFactory(item.items ?? [], doUse) : [];

      if (doUse(item)) {
        return [item, ...subItems, ...acc];
      } else {
        return [...subItems, ...acc];
      }
    }, []);

    if (activeIndex !== undefined) {
      const index = activeIndex % filteredItems.length;

      return filteredItems.map((item, currentIndex) => {
        return index === currentIndex ? { ...item, isSearchActive: true } : item;
      });
    }

    return filteredItems;
  };

  const filteredList = !isSearchEmpty
    ? filteredListFactory(
        currentNavigation?.items.map((_) => ({ ..._ })) ?? [],
        (item) => (item?.title || '').toLowerCase().includes(normalisedSearchValue),
        normalisedSearchValue ? searchIndex : undefined
      )
    : [];

  const changeNavigationItemPopupState = useCallback(
    (visible: boolean, editedItem = {}) => {
      setActiveNavigationItemState(editedItem);

      setIsItemPopupVisible(visible);
    },
    [setIsItemPopupVisible]
  );

  const addNewNavigationItem = useCallback(
    (
      event: MouseEvent,
      viewParentId?: number,
      isMenuAllowedLevel = true,
      levelPath = '',
      parentAttachedToMenu = true,
      structureId = '0',
      maxOrder = 0
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
          viewId: undefined,
          order: maxOrder + 1,
        });
      }
    },
    [changeNavigationItemPopupState, canUpdate]
  );

  const availableLocale = useMemo(
    () =>
      (localeQuery.data
        ? [localeQuery.data.defaultLocale, ...localeQuery.data.restLocale]
        : []
      ).filter((locale) => locale !== currentLocale),
    [localeQuery.data, currentLocale]
  );

  const resetContentTypes = useResetContentTypes();
  const resetNavigations = useResetNavigations();

  const {
    i18nCopyItemsModal,
    i18nCopySourceLocale,
    setI18nCopyModalOpened,
    setI18nCopySourceLocale,
  } = useI18nCopyNavigationItemsModal(
    useCallback(
      (sourceLocale) => {
        const source = navigationsQuery.data?.find(
          ({ locale, documentId }) =>
            locale === sourceLocale && documentId === currentNavigation?.documentId
        );

        if (source) {
          if (source.documentId && currentNavigation?.documentId) {
            copyNavigationI18nMutation.mutate(
              {
                source: source.locale,
                target: currentNavigation.locale,
                documentId: source.documentId,
              },
              {
                onSuccess(res) {
                  copyNavigationI18nMutation.reset();
                  setCurrentNavigation({
                    ...res.data,
                    items: res.data.items.map(appendViewId),
                  });
                  resetContentTypes();
                  resetNavigations();
                },
              }
            );
          }
        }
      },
      [currentNavigation]
    )
  );

  const openI18nCopyModalOpened = useCallback(() => {
    i18nCopySourceLocale && setI18nCopyModalOpened(true);
  }, [setI18nCopyModalOpened, i18nCopySourceLocale]);

  const updateNavigationMutation = useUpdateNavigation((next) => {
    setCurrentNavigation({
      ...next,
      items: next.items.map(appendViewId),
    });

    setRecentNavigation({
      documentId: next.documentId,
      id: next.id,
    });

    setStructureChanged(false);
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
      changeNavigationItemPopupState(false);
    }
  };

  const handleItemReOrder = ({
    item,
    newOrder,
  }: {
    item: NavigationItemFormSchema;
    newOrder: number;
  }) => {
    handleSubmitNavigationItem({
      ...item,
      order: newOrder,
    });
  };

  const handleItemRemove = (item: NavigationItemSchema) => {
    handleSubmitNavigationItem(
      mapServerNavigationItem(
        {
          ...item,
          removed: true,
        },
        true
      )
    );
  };

  const handleItemRestore = (item: NavigationItemSchema) => {
    handleSubmitNavigationItem(
      mapServerNavigationItem(
        {
          ...item,
          removed: false,
        },
        true
      )
    );
  };

  const handleItemToggleCollapse = (item: NavigationItemSchema) => {
    handleSubmitNavigationItem(
      mapServerNavigationItem(
        {
          ...item,
          collapsed: !item.collapsed,
          updated: true,
          isSearchActive: false,
        },
        true
      )
    );
  };

  const handleItemEdit = ({
    item,
    levelPath = '',
    parentAttachedToMenu = true,
  }: {
    item: NavigationItemFormSchema;
    levelPath?: string;
    parentAttachedToMenu?: boolean;
  }) => {
    changeNavigationItemPopupState(true, {
      ...item,
      levelPath,
      parentAttachedToMenu,
    });
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

      setIsItemPopupVisible(false);
    }
  };

  const listItems = isSearchEmpty ? (currentNavigation?.items ?? []) : filteredList;

  const handleExpandAll = useCallback(() => {
    if (currentNavigation) {
      setCurrentNavigation({
        ...currentNavigation,
        items: currentNavigation.items.map((item) => changeCollapseItemDeep(item, false)),
      });
    }
  }, [setCurrentNavigation, currentNavigation, changeCollapseItemDeep]);

  const handleCollapseAll = useCallback(() => {
    if (currentNavigation) {
      setCurrentNavigation({
        ...currentNavigation,
        items: currentNavigation.items.map((item) => changeCollapseItemDeep(item, true)),
      });
    }
  }, [setCurrentNavigation, currentNavigation, changeCollapseItemDeep]);

  const endActions = [
    {
      onClick: handleExpandAll,
      type: 'submit',
      variant: 'tertiary',
      tradId: 'header.action.expandAll',
      margin: '8px',
    },
    {
      onClick: handleCollapseAll,
      type: 'submit',
      variant: 'tertiary',
      tradId: 'header.action.collapseAll',
      margin: '8px',
    },
  ] as Array<ToBeFixed>;

  if (canUpdate) {
    endActions.push({
      onClick: addNewNavigationItem as ToBeFixed,
      type: 'submit',
      variant: 'primary',
      tradId: 'header.action.newItem',
      startIcon: <Plus />,
      margin: '8px',
    });
  }

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

  useEffect(() => {
    if (!currentLocale && localeQuery.data?.defaultLocale) {
      setCurrentLocale(localeQuery.data?.defaultLocale);
      setStructureChanged(false);
    }
  }, [navigationsQuery.data]);

  if (!navigationsQuery.data || !localeQuery.data || !!pending) {
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
          locale={localeQuery.data}
          structureHasChanged={structureChanged}
          isSaving={updateNavigationMutation.isPending}
          permissions={{ canUpdate }}
          currentLocale={currentLocale}
        />

        <Layouts.Content>
          <NavigationContentHeader
            startActions={<Search value={searchValue} setValue={setSearchValue} />}
            endActions={endActions.map(({ tradId, margin, ...item }, i) => (
              <Box marginLeft={margin} key={i}>
                <Button {...item}> {formatMessage(getTrad(tradId))} </Button>
              </Box>
            ))}
          />
          {!currentNavigation?.items.length ? (
            <Flex direction="column" minHeight="400px" justifyContent="center">
              <Box padding={4}>
                <Typography variant="beta" textColor="neutral600">
                  {formatMessage(getTrad('empty.description'))}
                </Typography>
              </Box>
              {canUpdate && (
                <Button
                  variant="secondary"
                  startIcon={<ListPlus />}
                  label={formatMessage(getTrad('empty.cta'))}
                  onClick={addNewNavigationItem}
                >
                  {formatMessage(getTrad('empty.cta'))}
                </Button>
              )}
              {canUpdate && availableLocale.length ? (
                <Flex direction="column" justifyContent="center">
                  <Box paddingTop={3} paddingBottom={3}>
                    <Typography variant="beta" textColor="neutral600">
                      {formatMessage(getTrad('view.i18n.fill.cta.header'))}
                    </Typography>
                  </Box>
                  <Flex direction="row" justifyContent="center" alignItems="center">
                    <Box paddingLeft={1} paddingRight={1}>
                      <SingleSelect
                        onChange={setI18nCopySourceLocale}
                        value={i18nCopySourceLocale}
                        size="S"
                      >
                        {availableLocale.map((locale) => (
                          <SingleSelectOption key={locale} value={locale}>
                            {formatMessage(getTrad('view.i18n.fill.option'), { locale })}
                          </SingleSelectOption>
                        ))}
                      </SingleSelect>
                    </Box>
                    <Box paddingLeft={1} paddingRight={1}>
                      <Button
                        variant="tertiary"
                        onClick={openI18nCopyModalOpened}
                        disabled={!i18nCopySourceLocale}
                        size="S"
                      >
                        {formatMessage(getTrad('view.i18n.fill.cta.button'))}
                      </Button>
                    </Box>
                  </Flex>
                </Flex>
              ) : null}
            </Flex>
          ) : (
            <List
              items={listItems}
              onItemLevelAdd={addNewNavigationItem}
              onItemRemove={handleItemRemove}
              onItemEdit={handleItemEdit}
              onItemRestore={handleItemRestore}
              onItemReOrder={handleItemReOrder}
              onItemToggleCollapse={handleItemToggleCollapse}
              displayFlat={!isSearchEmpty}
              isParentAttachedToMenu
              permissions={{ canUpdate, canAccess }}
              structurePrefix=""
              locale={currentLocale ?? ''}
            />
          )}

          {isItemPopupVisible && currentLocale && currentNavigation && (
            <NavigationItemPopUp
              availableLocale={availableLocale}
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

          {isChangeLanguageVisible ? (
            <ChangeLanguageDialog
              onCancel={() => changeCurrentLocaleAction.cancel()}
              onConfirm={() => changeCurrentLocaleAction.perform()}
            />
          ) : null}

          {canUpdate && i18nCopyItemsModal}
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
