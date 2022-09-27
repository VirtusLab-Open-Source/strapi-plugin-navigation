import React, { memo, useEffect, useMemo, useReducer, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useIntl } from 'react-intl';
import PropTypes from "prop-types";
import { useQueryClient } from 'react-query';
import { get } from "lodash";
import {
  request,
  LoadingIndicatorPage,
  useNotification,
  useAppInfos,
} from "@strapi/helper-plugin";
import DataManagerContext from "../../contexts/DataManagerContext";
import pluginId from "../../pluginId";
import init from "./init";
import { getTrad } from "../../translations";
import reducer, { initialState } from "./reducer";
import {
  SUBMIT_NAVIGATION,
  SUBMIT_NAVIGATION_SUCCEEDED,
  SUBMIT_NAVIGATION_ERROR,
  I18N_COPY_NAVIGATION,
  I18N_COPY_NAVIGATION_SUCCESS,
} from './actions';
import { prepareItemToViewPayload } from '../View/utils/parsers';
import { errorStatusResourceFor, resolvedResourceFor } from "../../utils";
import { NavigationsRepository } from "../../utils/repositories";

const i18nAwareItems = ({ items, config }) => 
  config.i18nEnabled ? items.filter(({ localeCode }) => localeCode === config.defaultLocale) : items;

const DataManagerProvider = ({ children }) => {
  const [reducerState, dispatch] = useReducer(reducer, initialState, init);
  const toggleNotification = useNotification();
  const { autoReload } = useAppInfos();
  const { formatMessage } = useIntl();
  const queryClient = useQueryClient();

  const {
    items,
    config,
    isLoadingForDataToBeSet,
    isLoadingForDetailsDataToBeSet,
    isLoadingForAdditionalDataToBeSet,
    isLoadingForSubmit,
    error,
    availableLocale,
  } = reducerState;
  const formatMessageRef = useRef();
  formatMessageRef.current = formatMessage;

  const getLayoutSettingRef = useRef();
  getLayoutSettingRef.current = (settingName) =>
    get({}, ["settings", settingName], "");

  const isInDevelopmentMode = autoReload;

  const abortController = new AbortController();
  const { signal } = abortController;

  const passedActiveItems = useMemo(() => {
    return i18nAwareItems({ config, items })
  }, [config, items]);

  useEffect(() => {
    if (!autoReload) {
      toggleNotification({
        type: 'info',
        message: { id: 'notification.info.autoreaload-disable' },
      });
    }
  }, [autoReload]);

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
       await queryClient.invalidateQueries([NavigationsRepository.getIndex()]);
       dispatch({
         type: SUBMIT_NAVIGATION_SUCCEEDED,
       });
       toggleNotification({
         type: 'success',
         message: getTrad('notification.navigation.submit'),
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
         message: getTrad('notification.error'),
       });
     }
  };

  const handleNavigationsDeletion = async (ids) => {
    await Promise.all(ids.map(handleNavigationDeletion));
    await queryClient.invalidateQueries(NavigationsRepository.getIndex());
  } 

  const handleNavigationDeletion = (id) => 
    request(`/${pluginId}/${id}`, {
      method: "DELETE",
      signal,
    });

  const slugify = (query) => 
    request(
      `/${pluginId}/slug?q=${query}`,
      { method: "GET", signal }
    );
  
  const isLoading = isLoadingForDataToBeSet || isLoadingForDetailsDataToBeSet;

  return (
    <DataManagerContext.Provider
      value={{
        items: passedActiveItems,
        isLoading,
        isLoadingForAdditionalDataToBeSet, 
        isLoadingForSubmit,
        handleSubmitNavigation,
        handleI18nCopy,
        isInDevelopmentMode,
        error,
        availableLocale,
        readNavigationItemFromLocale,
        handleNavigationsDeletion,
        slugify,
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
