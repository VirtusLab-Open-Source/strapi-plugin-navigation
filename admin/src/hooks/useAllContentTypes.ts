//@ts-ignore
import { useQuery } from 'react-query';
import { fetchAllContentTypes } from '../utils';

const useAllContentTypes = () => {
  const { isLoading, data, error } = useQuery('contentTypes', () =>
    fetchAllContentTypes()
  );
  return { data, isLoading, error };
};

export default useAllContentTypes;
