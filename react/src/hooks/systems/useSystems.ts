import { UseQueryResult } from 'react-query';
import { ApiService, System } from '../../types';
import { useGet } from '../../requests';

const useSystems = (): UseQueryResult<System[]> => {
  const query = useGet<{ result: System[] }>({
    endpoint: '/systems/v2?type=STORAGE',
    key: ['systemsv2'],
    apiService: ApiService.DesignSafe,
  });

  const systems = query.data?.result || [];

  return { ...query, data: systems } as UseQueryResult<System[]>;
};

export default useSystems;
