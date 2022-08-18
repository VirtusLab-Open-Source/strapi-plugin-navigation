//@ts-ignore
import { useQuery } from 'react-query';
import { get, isNil } from 'lodash';
import { getNavigationsQuery, getNavigations } from '../utils/repositories';
import useNavigationConfig from './useNavigationConfig';
import { assertNotEmpty, Navigation, QueryResponse } from '../../../types';

export const useAvailableNavigations = (): QueryResponse<{ availableNavigations: Navigation[] }> => {
  const {
    data: navigations,
    isLoading: isLoadingNavigations,
    error: errorNavigations,
  } = useQuery(getNavigationsQuery, getNavigations);
  const {
    navigationConfig,
    isLoading: isLoadingConfig,
    error: errorConfig,
  } = useNavigationConfig();

  const error = errorConfig || errorNavigations as Error | null;
  const isLoading = isLoadingConfig || isLoadingNavigations;
  if (isNil(error)) {
    assertNotEmpty(error);
    return { error, isLoading: false, availableNavigations: [] }
  }

  if (isLoading) {
    return { isLoading, availableNavigations: [], error: null};
  } else if (get(navigationConfig, "i18nEnabled")) {
    return { isLoading,  availableNavigations: navigations.filter(({ localeCode }: Navigation) => localeCode === navigationConfig.defaultLocale), error: null};
  } else {
    return { isLoading, availableNavigations: navigations, error: null};
  }
}