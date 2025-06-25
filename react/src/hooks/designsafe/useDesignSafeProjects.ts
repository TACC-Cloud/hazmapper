import { UseQueryResult } from '@tanstack/react-query';
import {
  DesignSafeProject,
  DesignSafeProjectCollection,
  ApiService,
} from '@hazmapper/types';
import { useGet } from '@hazmapper/requests';

interface UseDesignSafeProjectParams {
  designSafeProjectUUID: string;
  options?: object;
}

export const useDesignSafeProject = ({
  designSafeProjectUUID,
  options = {},
}: UseDesignSafeProjectParams): UseQueryResult<
  DesignSafeProject | undefined
> => {
  const query = useGet<DesignSafeProject>({
    endpoint: `/api/projects/v2/${designSafeProjectUUID}/`,
    key: ['designsafe-single-projectv2', designSafeProjectUUID],
    options,
    apiService: ApiService.DesignSafe,
    transform: (data) => data.baseProject,
  });
  return query;
};

export const useDesignSafeProjects = (): UseQueryResult<
  DesignSafeProjectCollection | undefined
> => {
  // TODO add offset and a high limit (as default is 100 for this endpoint)
  const query = useGet<DesignSafeProjectCollection>({
    endpoint: `/api/projects/v2/`,
    key: ['designsafe-projectsv2'],
    apiService: ApiService.DesignSafe,
  });
  return query;
};
