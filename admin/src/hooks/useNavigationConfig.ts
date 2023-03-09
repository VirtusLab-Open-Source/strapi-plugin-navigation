//@ts-ignore
import { useQuery, useQueryClient } from 'react-query';
//@ts-ignore
import { useNotification } from '@strapi/helper-plugin';
import { fetchNavigationConfig, getMessage, restartStrapi, restoreNavigationConfig, updateNavigationConfig } from '../utils';
import { ToBeFixed } from '../../../types';

const useNavigationConfig = () => {
  const queryClient = useQueryClient();
  const toggleNotification = useNotification();
  const { isLoading, data, error } = useQuery('navigationConfig', () =>
    fetchNavigationConfig()
  );

  const handleError = (type: string) => {
    toggleNotification({
      type: 'warning',
      message: getMessage(`pages.settings.notification.${type}.error`),
    });
  };

  const handleSuccess = async (type: string) => {
    await queryClient.invalidateQueries('navigationConfig');
    toggleNotification({
      type: 'success',
      message: getMessage(`pages.settings.notification.${type}.success`),
    });
  };
  
  const submitMutation = async (...args: ToBeFixed) => {
    try {
      await updateNavigationConfig(args);
      await handleSuccess('submit');
    } catch (e) {
      handleError('submit');
    }
  } 

  const restoreMutation = async () => {
    try {
      await restoreNavigationConfig();
      await handleSuccess('restore');
    } catch (e) {
      handleError('restore');
    }
  }

  const restartMutation = async () => {
    try {
      await restartStrapi();
      await handleSuccess('restart');
    } catch (e) {
      handleError('restart');
    }
  }

  return { data, isLoading, error, submitMutation, restoreMutation, restartMutation };
};

export default useNavigationConfig;
