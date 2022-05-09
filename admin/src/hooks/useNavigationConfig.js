import { useQuery, useQueryClient } from 'react-query';
import { useNotification } from '@strapi/helper-plugin';
import { fetchNavigationConfig, restartStrapi, restoreNavigationConfig, updateNavigationConfig } from '../utils/api';
import { getTrad } from '../translations';

const useNavigationConfig = () => {
  const queryClient = useQueryClient();
  const toggleNotification = useNotification();
  const { isLoading, data, error } = useQuery('navigationConfig', () =>
    fetchNavigationConfig(toggleNotification)
  );

  const handleError = (type) => {
    toggleNotification({
      type: 'warning',
      message: getTrad(`pages.settings.notification.${type}.error`),
    });
  };

  const handleSuccess = async (type) => {
    await queryClient.invalidateQueries('navigationConfig');
    toggleNotification({
      type: 'success',
      message: getTrad(`pages.settings.notification.${type}.success`),
    });
  };
  
  const submitMutation = async (...args) => {
    try {
      await updateNavigationConfig(...args);
      await handleSuccess('submit');
    } catch (e) {
      handleError('submit');
    }
  } 

  const restoreMutation = async (...args) => {
    try {
      await restoreNavigationConfig(...args);
      await handleSuccess('restore');
    } catch (e) {
      handleError('restore');
    }
  }

  const restartMutation = async (...args) => {
    try {
      await restartStrapi(...args);
      await handleSuccess('restart');
    } catch (e) {
      handleError('restart');
    }
  }

  return { data, isLoading, error, submitMutation, restoreMutation, restartMutation };
};

export default useNavigationConfig;
