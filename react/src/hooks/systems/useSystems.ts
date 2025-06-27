import { UseQueryResult } from '@tanstack/react-query';
import { ApiService, TTapisSystem } from '@hazmapper/types';
import { useGet } from '../../requests';

type TUseGetSystemsResponse = {
  result: TTapisSystem[];
  status: string;
};

export type TransformedGetSystemsResponse = {
  systems: TTapisSystem[];
  myDataSystem?: TTapisSystem;
  communityDataSystem?: TTapisSystem;
};

type propsType = {
  prefetch?: boolean;
  enabled?: boolean;
};

const defaultProps: propsType = {
  prefetch: false,
  enabled: true,
};

export const useGetSystems = ({
  prefetch,
  enabled,
}: propsType = defaultProps): UseQueryResult<TransformedGetSystemsResponse> => {
  const queryResult = useGet<
    TUseGetSystemsResponse,
    TransformedGetSystemsResponse
  >({
    endpoint: '/v3/systems/?listType=ALL&limit=-1',
    key: ['getSystems'],
    apiService: ApiService.Tapis,
    prefetch,
    options: {
      enabled,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 60, // 1 hr stale time
      select: (data) => {
        const systems = data.result;
        const myDataSystem = systems.find(
          (system) => system.id === 'designsafe.storage.default'
        );

        const communityDataSystem = systems.find(
          (system) => system.id === 'designsafe.storage.community'
        );

        return {
          systems,
          myDataSystem,
          communityDataSystem,
        };
      },
    },
  });

  return queryResult;
};

export default useGetSystems;
