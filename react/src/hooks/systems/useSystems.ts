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
  publishedDataSystem?: TTapisSystem;
};

type propsType = {
  suspense?: boolean;
  prefetch?: boolean;
};

const defaultProps: propsType = {
  prefetch: false,
};

export const useGetSystems = ({
  prefetch,
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

        const publishedDataSystem = systems.find(
          (system) => system.id === 'designsafe.storage.published'
        );

        return {
          systems,
          myDataSystem,
          communityDataSystem,
          publishedDataSystem,
        };
      },
    },
  });

  return queryResult;
};

export default useGetSystems;
