import { useEffect } from 'react';
import { useInvalidateLocale, useInvalidateNavigations } from '.';

export const useInvalidateQueries = () => {
  const invalidateLocaleQuery = useInvalidateLocale();
  const invalidateNavigationsQuery = useInvalidateNavigations();

  useEffect(() => {
    invalidateLocaleQuery();
    invalidateNavigationsQuery();
  }, []);
};
