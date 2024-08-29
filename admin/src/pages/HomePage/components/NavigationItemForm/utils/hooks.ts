import { getFetchClient } from '@strapi/strapi/admin';
import { useMutation } from '@tanstack/react-query';

import { getApiClient } from '../../../../../api';

export const useSlug = () => {
  const fetch = getFetchClient();
  const apiClient = getApiClient(fetch);

  return useMutation({
    mutationFn(query: string) {
      return apiClient.slugify(query);
    },
  });
};
