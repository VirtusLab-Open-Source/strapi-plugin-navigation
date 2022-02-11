import { useQuery, useQueryClient } from 'react-query';
import { useNotification } from '@strapi/helper-plugin';
import { fetchNavigationConfig, restoreNavigationConfig, updateNavigationConfig } from '../utils/api';
import { getTrad } from '../translations';

const useNavigationConfig = () => {
  const queryClient = useQueryClient();
  const toggleNotification = useNotification();
  const { isLoading, data, err } = useQuery('navigationConfig', () =>
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

  return { data, isLoading, submitMutation, restoreMutation, err };
};

export default useNavigationConfig;
