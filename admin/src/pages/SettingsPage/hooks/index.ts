import { zodResolver } from '@hookform/resolvers/zod';
import { getFetchClient } from '@strapi/strapi/admin';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getApiClient } from '../../../api';
import { ConfigSchema, configSchema } from '../../../schemas';
import { resolveGlobalLikeId } from '../utils';

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

  return useMutation({
    mutationFn: () => apiClient.restart(),
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
            debugger;
            return resolveGlobalLikeId(uid);
          }),
        },
      });
    },
  });
};

export type UiFormSchema = z.infer<typeof uiFormSchema>;

export const uiFormSchema = configSchema.omit({ contentTypesNameFields: true }).extend({
  audienceFieldChecked: z.boolean(),
  contentTypesNameFields: z
    .object({
      key: z.string(),
      fields: z.string().array(),
    })
    .array(),
  contentTypesPopulate: z
    .object({
      key: z.string(),
      fields: z.string().array(),
    })
    .array(),
  pathDefaultFields: z
    .object({
      key: z.string(),
      fields: z.string().array(),
    })
    .array(),
});

export const useSettingsForm = (config?: ConfigSchema) => {
  const form = useForm({
    resolver: zodResolver(uiFormSchema),
    values: config
      ? {
          ...config,
          additionalFields: config.additionalFields.filter((field) => typeof field !== 'string'),
          audienceFieldChecked: config.additionalFields.includes('audience'),
          contentTypesNameFields: Object.entries(config.contentTypesNameFields).map(
            ([key, fields]) => ({
              key,
              fields,
            })
          ),
          contentTypesPopulate: Object.entries(config.contentTypesPopulate).map(
            ([key, fields]) => ({
              key,
              fields,
            })
          ),
          pathDefaultFields: Object.entries(config.pathDefaultFields).map(([key, fields]) => ({
            key,
            fields,
          })),
        }
      : undefined,
  });

  return { form };
};
