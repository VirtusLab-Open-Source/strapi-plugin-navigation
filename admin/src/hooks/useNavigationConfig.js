import { useQuery, useMutation, useQueryClient } from 'react-query';
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

  const handleSuccess = (type) => {
    queryClient.invalidateQueries('navigationConfig');
    toggleNotification({
      type: 'success',
      message: getTrad(`pages.settings.notification.${type}.success`),
    });
  };

  const submitMutation = useMutation(updateNavigationConfig, {
    onSuccess: () => handleSuccess('submit'),
    onError: () => handleError('submit'),
  });

  const restoreMutation = useMutation(restoreNavigationConfig, {
    onSuccess: () => handleSuccess('restore'),
    onError: () => handleError('restore'),
  });

  return { data, isLoading, submitMutation, restoreMutation, err };
};

export default useNavigationConfig;
