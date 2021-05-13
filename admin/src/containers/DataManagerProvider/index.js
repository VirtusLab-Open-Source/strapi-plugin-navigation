import React, { memo, useEffect, useReducer, useRef } from "react";
import PropTypes from "prop-types";
import { get, find, first, isEmpty } from "lodash";
import {
  request,
  LoadingIndicatorPage,
  useGlobalContext,
} from "strapi-helper-plugin";
import { useLocation, useRouteMatch } from "react-router-dom";
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
} from './actions';
import { prepareItemToViewPayload } from '../View/utils/parsers';
import { getTradId } from "../../translations";

const DataManagerProvider = ({ children }) => {
  const [reducerState, dispatch] = useReducer(reducer, initialState, init);
  const {
    autoReload,
    emitEvent,
    currentEnvironment,
    formatMessage,
  } = useGlobalContext();
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
    error
  } = reducerState.toJS();
  const { pathname } = useLocation();

  const formatMessageRef = useRef();
  formatMessageRef.current = formatMessage;

  const getLayoutSettingRef = useRef();
  getLayoutSettingRef.current = (settingName) =>
    get({}, ["settings", settingName], "");

  const isInDevelopmentMode =
    currentEnvironment === "development" && autoReload;

  const abortController = new AbortController();
  const { signal } = abortController;
  const getDataRef = useRef();

  const menuViewMatch = useRouteMatch(`/plugins/${pluginId}/:id`);
  const activeId = get(menuViewMatch, "params.id", null);

  const getNavigation = async (id, cfg) => {
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
            items: prepareItemToViewPayload(activeItem.items, null, cfg),
          },
        });
      }
    } catch (err) {
      // please don't do this, because js stringify a error and that error is not readable in dev tool
      console.error(err);
      strapi.notification.error("notification.error");
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
        await getNavigation(id || first(items).id, config);
      }
    } catch (err) {
      console.error({ err });
      strapi.notification.error("notification.error");
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
    if (currentEnvironment === "development" && !autoReload) {
      strapi.notification.info(
        formatMessageRef.current({
          id: getTrad("notification.info.autoreaload-disable"),
        }),
      );
    }
  }, [autoReload, currentEnvironment]);

  const getContentTypeItems = async ({type, query}, plugin = "") => {
    dispatch({
      type: GET_CONTENT_TYPE_ITEMS,
    });
    const url = plugin ? `/${plugin}/${type}` : `/${type}`;

    const queryParams = new URLSearchParams();
    queryParams.append('_publicationState', 'preview');
    if (query) {
      queryParams.append('_q', query);
    }

    const contentTypeItems = await request(`${url}?${queryParams.toString()}`, {
      method: "GET",
      signal,
    });

    const fetchedContentType = find(config.contentTypes, ct => ct.endpoint === type);

    const isArray = Array.isArray(contentTypeItems);
    dispatch({
      type: GET_CONTENT_TYPE_ITEMS_SUCCEEDED,
      contentTypeItems: (isArray ? contentTypeItems : [contentTypeItems]).map(item => ({
        ...item,
        __collectionName: get(fetchedContentType, 'collectionName', type),
      })),
    });
  };

  const handleChangeSelection = (id) => {
    getNavigation(id, config);
  };

  const handleChangeNavigationPopupVisibility = (visible) => {
    emitEvent("willChangeNavigationPopupVisibility");
    dispatch({
      type: CHANGE_NAVIGATION_POPUP_VISIBILITY,
      navigationPopupOpened: visible,
    });
    emitEvent("didChangeNavigationPopupVisibility");
    emitEvent(`navigationPopup${visible ? "Visible" : "Hidden"}`);
  };

  const handleChangeNavigationItemPopupVisibility = (visible) => {
    emitEvent("willChangeNavigationItemPopupVisibility");
    dispatch({
      type: CHANGE_NAVIGATION_ITEM_POPUP_VISIBILITY,
      navigationItemPopupOpened: visible,
    });
    emitEvent("didChangeNavigationItemPopupVisibility");
    emitEvent(`navigationItemPopup${visible ? "Visible" : "Hidden"}`);
  };

  const handleChangeNavigationData = (payload, forceClosePopups) => {
    emitEvent("willChangeNavigationData");
    dispatch({
      type: CHANGE_NAVIGATION_DATA,
      changedActiveItem: payload,
      forceClosePopups,
    });
    emitEvent("didChangeNavigationData");
  };

  const handleResetNavigationData = () => {
    emitEvent("willResetNavigationChanges");
    dispatch({ 
      type: RESET_NAVIGATION_DATA,
      activeItem,
    });
    emitEvent("didResetNavigationChanges");
  };

  const handleSubmitNavigation = async (formatMessage, payload = {}) => {
    try {
      emitEvent("willSubmitNavigation");
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
          items: prepareItemToViewPayload(navigation.items, null, config),
        },
      });
      emitEvent("didSubmitNavigation");

      strapi.notification.success(getTradId('notification.navigation.submit'));
    } catch (err) {
      dispatch({
        type: SUBMIT_NAVIGATION_ERROR,
        error: err.response.payload.data
      });
      console.error({ err: err.response });
      emitEvent('didNotSubmitNavigation');
      if (err.response.payload.data && err.response.payload.data.errorTitles) {
        return strapi.notification.error(
          formatMessage(
            getTrad('notification.navigation.error'),
            { ...err.response.payload.data, errorTitles: err.response.payload.data.errorTitles.join(' and ') },
          ),
        );
      }
      strapi.notification.error('notification.error');
    }
  };

  return (
    <DataManagerContext.Provider
      value={{
        items,
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
        handleChangeNavigationData,
        handleResetNavigationData,
        handleSubmitNavigation,
        getContentTypeItems,
        isInDevelopmentMode,
        error,
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
