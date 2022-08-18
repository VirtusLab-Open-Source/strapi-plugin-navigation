// @ts-ignore
import { useQuery, useQueryClient } from 'react-query';
// @ts-ignore
import { useNotification } from '@strapi/helper-plugin';
import { getTrad } from '../translations';
import { Effect, NavigationPluginConfig, QueryResponse, VoidEffect } from '../../../types';
import { restartStrapi } from '../utils';
import {
  getNavigationConfig,
  getNavigationConfigQuery,
  restoreNavigationConfig,
  updateNavigationConfig,
} from '../utils/repositories';
import { I18NConfigFields } from '../../../server/i18n';

type MutationType = "submit" | "restore" | "restart";
type NavigationConfigResponse = {
  navigationConfig: NavigationPluginConfig & I18NConfigFields;
  submitConfig: Effect<NavigationPluginConfig>;
  restoreConfig: VoidEffect;
  restartStrapi: VoidEffect;
} 

const useNavigationConfig = (): QueryResponse<NavigationConfigResponse> => {
  const queryClient = useQueryClient();
  const toggleNotification = useNotification();
  const {
    data: navigationConfig,
    error,
    isLoading,
  } = useQuery(getNavigationConfigQuery, getNavigationConfig);

  const handleError = (type: MutationType) => {
    toggleNotification({
      type: 'warning',
      message: getTrad(`pages.settings.notification.${type}.error`),
    });
  };

  const handleSuccess = async (type: MutationType) => {
    await queryClient.invalidateQueries('navigationConfig');
    toggleNotification({
      type: 'success',
      message: getTrad(`pages.settings.notification.${type}.success`),
    });
  };
  
  const submitConfig = async (body: NavigationPluginConfig) => {
    try {
      await updateNavigationConfig(body);
      await handleSuccess('submit');
    } catch (e) {
      handleError('submit');
    }
  } 

  const restoreConfig = async () => {
    try {
      await restoreNavigationConfig();
      await handleSuccess('restore');
    } catch (e) {
      handleError('restore');
    }
  }

  const restartStrapiMutation = async () => {
    try {
      await restartStrapi();
      await handleSuccess('restart');
    } catch (e) {
      handleError('restart');
    }
  }

  return {
    navigationConfig,
    isLoading,
    error,
    submitConfig,
    restoreConfig,
    restartStrapi: restartStrapiMutation,
  };
};

export default useNavigationConfig;
