import { getFetchClient } from '@strapi/strapi/admin';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { getApiClient } from '../../../api';
import { NavigationItemSchema, NavigationSchema } from '../../../api/validators';
import { Effect } from '../../../types';
import { ConfirmEffect, I18nCopyNavigationItemsModal } from '../components/I18nCopyNavigationItems';

export const useLocale = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useQuery({
    queryKey: apiClient.readLocaleIndex(),
    queryFn: apiClient.readLocale,
    staleTime: Infinity,
  });
};

export interface UseContentTypeItemsInput {
  uid: string;
  locale?: string;
  query?: string;
}

export const useContentTypeItems = (input: UseContentTypeItemsInput) => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useQuery({
    queryKey: apiClient.readContentTypeItemsIndex(input),
    queryFn: () => apiClient.readContentTypeItems(input),
    staleTime: 1000 * 60 * 3,
    enabled: !!input.uid,
  });
};

export const useContentTypes = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useQuery({
    queryKey: apiClient.readContentTypeIndex(),
    queryFn: () => apiClient.readContentType(),
    staleTime: 1000 * 60 * 3,
  });
};

export const useNavigations = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useQuery({
    queryKey: apiClient.readAllIndex(),
    queryFn() {
      return apiClient.readAll().then((navigations) =>
        navigations.map(
          (navigation): NavigationSchema => ({
            ...navigation,
            items: navigation.items.map(appendViewId),
          })
        )
      );
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useHardReset = () => {
  const client = useQueryClient();
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useCallback(() => {
    client.invalidateQueries({
      queryKey: apiClient.getIndexPrefix(),
    });
  }, [client, fetch, apiClient]);
};

export const useDeleteNavigations = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useMutation({
    mutationFn(documentIds: Array<string>) {
      return Promise.all(documentIds.map(apiClient.delete));
    },
  });
};

export const useCopyNavigationItemI18n = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useMutation({
    mutationFn: apiClient.copyNavigationItemLocale,
  });
};

export const useCopyNavigationI18n = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);
  // TODO: nicer cache update
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.copyNavigationLocale,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: apiClient.readAllIndex(),
      });
    },
  });
};

export const useCreateNavigation = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);
  // TODO: nicer cache update
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.create,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: apiClient.readAllIndex(),
      });
    },
  });
};

export const useUpdateNavigation = (onSuccess?: Effect<void>) => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);
  // TODO: nicer cache update
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiClient.update,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: apiClient.readAllIndex(),
      });
      onSuccess?.();
    },
  });
};

export const usePurgeNavigation = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useMutation({
    mutationFn(documentIds?: Array<string>): Promise<unknown> {
      if (!documentIds?.length) {
        return apiClient.purge({});
      }

      return Promise.all(documentIds.map((documentId) => apiClient.purge({ documentId, withLangVersions: true })));
    },
  });
};

export const useConfig = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useQuery({
    queryKey: apiClient.readConfigIndex(),
    queryFn: apiClient.readConfig,
  });
};

export const useI18nCopyNavigationItemsModal = (onConfirm: ConfirmEffect) => {
  const [isOpened, setIsOpened] = useState(false);
  const [sourceLocale, setSourceLocale] = useState<string | undefined>(undefined);
  const onCancel = useCallback(() => {
    setIsOpened(false);
  }, [setIsOpened]);
  const onConfirmWithModalClose = useCallback(() => {
    if (!sourceLocale) {
      return;
    }

    onConfirm(sourceLocale);
    setIsOpened(false);
  }, [onConfirm, sourceLocale]);

  const modal = useMemo(
    () =>
      isOpened ? (
        <I18nCopyNavigationItemsModal onConfirm={onConfirmWithModalClose} onCancel={onCancel} />
      ) : null,
    [isOpened, onConfirmWithModalClose, onCancel]
  );

  return useMemo(
    () => ({
      setI18nCopyModalOpened: setIsOpened,
      setI18nCopySourceLocale: setSourceLocale,
      i18nCopyItemsModal: modal,
      i18nCopySourceLocale: sourceLocale,
    }),
    [setSourceLocale, setIsOpened, modal, sourceLocale]
  );
};

const appendViewId = (item: NavigationItemSchema): NavigationItemSchema => {
  return {
    ...item,
    viewId: Math.floor(Math.random() * 1520000),
    items: item.items?.map(appendViewId),
  };
};
