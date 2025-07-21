import { getFetchClient } from '@strapi/strapi/admin';
import { useMutation, useQuery } from '@tanstack/react-query';

import { getApiClient } from '../../../api';
import { resolveGlobalLikeId } from '../utils';
import { UiFormSchema } from '../schemas';

export const useConfig = () => {
  // TODO: Resolve useQuery issues to use useFetchClient
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useQuery({
    queryKey: apiClient.readSettingsConfigIndex(),
    queryFn() {
      return apiClient.readSettingsConfig();
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useRestart = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  const healthCheck = useQuery({
    queryKey: apiClient.healthCheckIndex(),
    queryFn: () => apiClient.healthCheck(),
    retry: true,
    retryDelay: 1000 * 5,
    enabled: false,
  });

  return useMutation({
    mutationFn: () => {
      return apiClient.restart().then(() => healthCheck.refetch());
    },
  });
};

export const useRestoreConfig = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useMutation({
    mutationFn: () => apiClient.restoreConfig(),
  });
};

export const useContentTypes = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useQuery({
    queryKey: apiClient.readContentTypeIndex(),
    queryFn: () => apiClient.readContentType(),
    staleTime: Infinity,
  });
};

export const useSaveConfig = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useMutation({
    mutationFn(data: UiFormSchema) {
      return apiClient.updateConfig({
        ...data,
        contentTypesNameFields: Object.fromEntries(
          data.contentTypesNameFields.map(({ key, fields }) => [key, fields])
        ),
        contentTypesPopulate: Object.fromEntries(
          data.contentTypesPopulate.map(({ key, fields }) => [key, fields])
        ),
        pathDefaultFields: Object.fromEntries(
          data.pathDefaultFields.map(({ key, fields }) => [key, fields])
        ),
        additionalFields: data.audienceFieldChecked
          ? [...data.additionalFields, 'audience']
          : data.additionalFields,
        gql: {
          navigationItemRelated: data.contentTypes.map((uid: string) => {
            return resolveGlobalLikeId(uid);
          }),
        },
      });
    },
  });
};
