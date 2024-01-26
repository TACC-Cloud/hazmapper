import { UseQueryResult } from 'react-query';
import { ApiService, System } from '../../types';
import { useGet } from '../../requests';

const useSystems = (): UseQueryResult<System[]> => {
  return useGet<System[]>({
    endpoint: '/systems/v2?type=STORAGE',
    key: ['systemsv2'],
    apiService: ApiService.DesignSafe,
    transform: (data) => data.result,
  });
};

export default useSystems;
