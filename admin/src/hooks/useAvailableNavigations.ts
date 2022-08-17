//@ts-ignore
import { useQuery } from 'react-query';
import { get } from 'lodash';
import { getNavigationsQuery, getNavigations } from '../utils/repositories';
import useNavigationConfig from './useNavigationConfig';
import { Navigation } from '../../../types';

// TODO: Extract to another file and refactor
type ResponseLoading<T> = { isLoading: boolean} & T;
type ResponseError<T> = { isLoading: false, errors: Array<Error> } & T;
type ResponseSuccess<T> = { isLoading: false } & T
type QueryResponse<T extends object = {}> = ResponseLoading<T> | ResponseError<T> | ResponseSuccess<T>;

export const useAvailableNavigations = (): QueryResponse<{ availableNavigations: Navigation[] }> => {
  const {
    data: navigations,
    isLoading: isLoadingNavigations,
    error: errorNavigations,
  } = useQuery(getNavigationsQuery, getNavigations);
  const {
    data: config,
    isLoading: isLoadingConfig,
    error: errorConfig,
  } = useNavigationConfig();

  const errors = [errorConfig, errorNavigations].filter(n => !!n);
  const isLoading = isLoadingConfig || isLoadingNavigations;
  if (errors.length) {
    return { errors, isLoading: false, availableNavigations: [] }
  }

  if (isLoading) {
    return { isLoading, availableNavigations: [] };
  } else if (get(config, "i18nEnabled")) {
    return { isLoading,  availableNavigations: navigations.filter(({ localeCode }: Navigation) => localeCode === config.defaultLocale) };
  } else {
    return { isLoading, availableNavigations: navigations };
  }
}