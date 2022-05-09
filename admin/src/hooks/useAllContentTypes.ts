//@ts-ignore
import { useQuery } from 'react-query';
//@ts-ignore
import { useNotification } from '@strapi/helper-plugin';
import { fetchAllContentTypes } from '../utils/api';

const useAllContentTypes = () => {
  const { isLoading, data, error } = useQuery('contentTypes', () =>
    fetchAllContentTypes()
  );
  return { data, isLoading, error };
};

export default useAllContentTypes;
