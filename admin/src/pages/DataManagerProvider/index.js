import React, { memo, useEffect, useMemo, useReducer, useRef } from "react";
import { useLocation, useRouteMatch } from "react-router-dom";
import { useIntl } from 'react-intl';
import PropTypes from "prop-types";
import { get, find, first, isEmpty } from "lodash";
import {
  request,
  LoadingIndicatorPage,
  useNotification,
  useAppInfos,
} from "@strapi/helper-plugin";
import DataManagerContext from "../../contexts/DataManagerContext";
import getTrad from "../../utils/getTrad";
import pluginId from "../../pluginId";
import init from "./init";
import reducer, { initialState } from "./reducer";
import {
  GET_NAVIGATION_DATA,
  GET_NAVIGATION_DATA_SUCCEEDED,
  GET_LIST_DATA,
  GET_LIST_DATA_SUCCEEDED,
  CHANGE_NAVIGATION_POPUP_VISIBILITY,
  CHANGE_NAVIGATION_ITEM_POPUP_VISIBILITY,
  RESET_NAVIGATION_DATA,
  CHANGE_NAVIGATION_DATA,
  GET_CONFIG,
  GET_CONFIG_SUCCEEDED,
  GET_CONTENT_TYPE_ITEMS_SUCCEEDED,
  GET_CONTENT_TYPE_ITEMS,
  SUBMIT_NAVIGATION,
  SUBMIT_NAVIGATION_SUCCEEDED,
  SUBMIT_NAVIGATION_ERROR,
  I18N_COPY_NAVIGATION,
  I18N_COPY_NAVIGATION_SUCCESS,
} from './actions';
import { prepareItemToViewPayload } from '../View/utils/parsers';
import { errorStatusResourceFor, resolvedResourceFor } from "../../utils";

const i18nAwareItems = ({ items, config }) => 
  config.i18nEnabled ? items.filter(({ localeCode }) => localeCode === config.defaultLocale) : items;

const DataManagerProvider = ({ children }) => {
  const [reducerState, dispatch] = useReducer(reducer, initialState, init);
  const toggleNotification = useNotification();
  const { autoReload } = useAppInfos();
  const { formatMessage } = useIntl();

  const {
    items,
    config,
    activeItem,
    initialData,
    changedActiveItem,
    navigationPopupOpened,
    navigationItemPopupOpened,
    isLoading,
    isLoadingForDataToBeSet,
    isLoadingForDetailsDataToBeSet,
    isLoadingForAdditionalDataToBeSet,
    isLoadingForSubmit,
    error,
    availableLocale,
  } = reducerState;
  const { pathname } = useLocation();
  const formatMessageRef = useRef();
  formatMessageRef.current = formatMessage;

  const getLayoutSettingRef = useRef();
  getLayoutSettingRef.current = (settingName) =>
    get({}, ["settings", settingName], "");

  const isInDevelopmentMode = autoReload;

  const abortController = new AbortController();
  const { signal } = abortController;
  const getDataRef = useRef();

  const menuViewMatch = useRouteMatch(`/plugins/${pluginId}/:id`);
  const activeId = get(menuViewMatch, "params.id", null);
  const passedActiveItems = useMemo(() => {
    return i18nAwareItems({ config, items })
  }, [config, items]);

  const getNavigation = async (id, navigationConfig) => {
    try {
      if (activeId || id) {
        dispatch({
          type: GET_NAVIGATION_DATA,
        });

        const activeItem = await request(`/${pluginId}/${activeId || id}`, {
          method: "GET",
          signal,
        });

        dispatch({
          type: GET_NAVIGATION_DATA_SUCCEEDED,
          activeItem: {
            ...activeItem,
            items: prepareItemToViewPayload({
              config: navigationConfig,
              items: activeItem.items,
            }),
          },
        });
      }
    } catch (err) {
      console.error({ err });
      toggleNotification({
        type: 'warning',
        message: { id: getTrad('notification.error') },
      });
    }
  };

  getDataRef.current = async (id) => {
    try {
      dispatch({
        type: GET_CONFIG,
      });
      const config = await request(`/${pluginId}/config`, {
        method: "GET",
        signal,
      });
      dispatch({
        type: GET_CONFIG_SUCCEEDED,
        config,
      });

      dispatch({
        type: GET_LIST_DATA,
      });
      const items = await request(`/${pluginId}`, {
        method: "GET",
        signal,
      });

      dispatch({
        type: GET_LIST_DATA_SUCCEEDED,
        items,
      });

      if (id || !isEmpty(items)) {
        await getNavigation(id || first(i18nAwareItems({ items, config })).id, config);
      }
    } catch (err) {
      console.error({ err });
      toggleNotification({
        type: 'warning',
        message: { id: getTrad('notification.error') },
      });
    }
  };

  useEffect(() => {
    getDataRef.current();
  }, []);

  useEffect(() => {
    // We need to set the modifiedData after the data has been retrieved
    // and also on pathname change
    if (!isLoading) {
      getNavigation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, pathname]);

  useEffect(() => {
    if (!autoReload) {
      toggleNotification({
        type: 'info',
        message: { id: getTrad('notification.info.autoreaload-disable') },
      });
    }
  }, [autoReload]);

  const getContentTypeItems = async ({ modelUID, query, locale }) => {
    dispatch({
      type: GET_CONTENT_TYPE_ITEMS,
    });
    const url =`/navigation/content-type-items/${modelUID}`;
    const queryParams = new URLSearchParams();
    queryParams.append('_publicationState', 'preview');
    if (query) {
      queryParams.append('_q', query);
    }
    if (locale) {
      queryParams.append('localeCode', locale);
    }

    const contentTypeItems = await request(`${url}?${queryParams.toString()}`, {
      method: "GET",
      signal,
    });

    const fetchedContentType = find(config.contentTypes, ct => ct.uid === modelUID);
    const isArray = Array.isArray(contentTypeItems);
    dispatch({
      type: GET_CONTENT_TYPE_ITEMS_SUCCEEDED,
      contentTypeItems: (isArray ? contentTypeItems : [contentTypeItems]).map(item => ({
        ...item,
        __collectionUid: get(fetchedContentType, 'collectionUid', modelUID),
      })),
    });
  };

  const handleChangeSelection = (id) => {
    getNavigation(id, config);
  };

  const handleLocalizationSelection = (id) => {
    getNavigation(id, config);
  };

  const handleI18nCopy = async (sourceId, targetId) => {
    dispatch({
      type: I18N_COPY_NAVIGATION
    });

    const url = `/navigation/i18n/copy/${sourceId}/${targetId}`;

    await request(url, {
      method: "PUT",
      signal,
    });

    dispatch({
      type: I18N_COPY_NAVIGATION_SUCCESS,
    });

    handleChangeSelection(targetId);
  };

  const readNavigationItemFromLocale = async ({ locale, structureId }) => {
    try {
      const source = changedActiveItem.localizations?.find((navigation) => navigation.locale === locale);

      if (!source) {
        return errorStatusResourceFor(['popup.item.form.i18n.locale.error.unavailable']);
      }

      const url = `/navigation/i18n/item/read/${source.id}/${changedActiveItem.id}?path=${structureId}`;

      return resolvedResourceFor(await request(url, {
        method: "GET",
        signal,
      }));
    } catch (error) {
      let messageKey;

      if (error instanceof Error) {
        messageKey = get(error, 'response.payload.error.details.messageKey');
      }

      return errorStatusResourceFor([messageKey ?? 'popup.item.form.i18n.locale.error.generic']);
    }
  };

  const handleChangeNavigationPopupVisibility = (visible) => {
    dispatch({
      type: CHANGE_NAVIGATION_POPUP_VISIBILITY,
      navigationPopupOpened: visible,
    });
  };

  const handleChangeNavigationItemPopupVisibility = (visible) => {
    dispatch({
      type: CHANGE_NAVIGATION_ITEM_POPUP_VISIBILITY,
      navigationItemPopupOpened: visible,
    });
  };

  const handleChangeNavigationData = (payload, forceClosePopups) => {
    dispatch({
      type: CHANGE_NAVIGATION_DATA,
      changedActiveItem: payload,
      forceClosePopups,
    });
  };

  const handleResetNavigationData = () => {
    dispatch({
      type: RESET_NAVIGATION_DATA,
      activeItem,
    });
  };

  const handleSubmitNavigation = async (formatMessage, payload = {}) => {
     try {
       dispatch({
         type: SUBMIT_NAVIGATION,
       });

       const nagivationId = payload.id ? `/${payload.id}` : "";
       const method = payload.id ? "PUT" : "POST";
       const navigation = await request(`/${pluginId}${nagivationId}`, {
         method,
         signal,
         body: payload,
       });
       dispatch({
         type: SUBMIT_NAVIGATION_SUCCEEDED,
         navigation: {
          ...navigation,
          items: prepareItemToViewPayload({
            config,
            items: navigation.items,
          }),
         },
       });
       toggleNotification({
         type: 'success',
         message: { id: getTrad('notification.navigation.submit') },
       });
     } catch (err) {
       dispatch({
         type: SUBMIT_NAVIGATION_ERROR,
         error: err.response.payload.data
       });
       console.error({ err: err.response });

       if (err.response.payload.data && err.response.payload.data.errorTitles) {
         return toggleNotification({
           type: 'warning',
           message: {
             id: formatMessage(
               getTrad('notification.navigation.error'),
               { ...err.response.payload.data, errorTitles: err.response.payload.data.errorTitles.join(' and ') },
             )
           },
         });
       }
       toggleNotification({
         type: 'warning',
         message: { id: getTrad('notification.error') },
       });
     }
  };

  return (
    <DataManagerContext.Provider
      value={{
        items: passedActiveItems,
        activeItem,
        initialData,
        changedActiveItem,
        config,
        navigationPopupOpened,
        navigationItemPopupOpened,
        isLoading:
          isLoading ||
          isLoadingForDataToBeSet ||
          isLoadingForDetailsDataToBeSet,
        isLoadingForAdditionalDataToBeSet,
        isLoadingForSubmit,
        handleChangeNavigationPopupVisibility,
        handleChangeNavigationItemPopupVisibility,
        handleChangeSelection,
        handleLocalizationSelection,
        handleChangeNavigationData,
        handleResetNavigationData,
        handleSubmitNavigation,
        handleI18nCopy,
        getContentTypeItems,
        isInDevelopmentMode,
        error,
        availableLocale,
        readNavigationItemFromLocale,
      }}
    >
      {isLoading ? <LoadingIndicatorPage /> : children}
    </DataManagerContext.Provider>
  );
};

DataManagerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default memo(DataManagerProvider);
