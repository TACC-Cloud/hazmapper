import { UseQueryResult } from '@tanstack/react-query';
import { ApiService, System } from '@hazmapper/types';
import { useGet } from '../../requests';
import { useMemo } from 'react';

const useSystems = (): UseQueryResult<System[]> & {
  myDataSystem?: System;
  communityDataSystem?: System;
  publishedDataSystem?: System;
} => {
  const queryResult = useGet<System[]>({
    endpoint: '/v3/systems/?listType=ALL&limit=-1',
    key: ['systemsv3'],
    apiService: ApiService.Tapis,
    transform: (data) => data.result,
  });

  const systems = queryResult.data || [];

  const myDataSystem = useMemo(
    () => systems.find((system) => system.id === 'designsafe.storage.default'),
    [systems]
  );

  const communityDataSystem = useMemo(
    () =>
      systems.find((system) => system.id === 'designsafe.storage.community'),
    [systems]
  );

  const publishedDataSystem = useMemo(
    () =>
      systems.find((system) => system.id === 'designsafe.storage.published'),
    [systems]
  );

  return {
    ...queryResult,
    myDataSystem,
    communityDataSystem,
    publishedDataSystem,
  };
};

export default useSystems;
