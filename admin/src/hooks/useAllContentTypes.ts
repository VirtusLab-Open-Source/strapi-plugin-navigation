//@ts-ignore
import { useQuery } from 'react-query';
//@ts-ignore
import { useNotification } from '@strapi/helper-plugin';
import { fetchAllContentTypes } from '../utils/api';

const useAllContentTypes = () => {
  const toggleNotification = useNotification();
  const { isLoading, data, error} = useQuery('contentTypes', () =>
    fetchAllContentTypes(toggleNotification)
  );
  return { data, isLoading, err: error };
};

export default useAllContentTypes;
