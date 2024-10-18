import { UseQueryResult } from 'react-query';
import { ApiService, System } from '@hazmapper/types';
import { useGet } from '../../requests';

const useSystems = (): UseQueryResult<System[]> => {
  return useGet<System[]>({
    endpoint: '/v3/systems/?listType=ALL',
    key: ['systemsv3'],
    apiService: ApiService.Tapis,
    transform: (data) => data.result,
  });
};

export default useSystems;
