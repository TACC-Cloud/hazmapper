import { UseQueryResult } from '@tanstack/react-query';
import {
  DesignSafeProject,
  DesignSafeProjectCollection,
  DesignSafePublishedProjectDetail,
  DesignSafePublishedProjectCollection,
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
  // TODO: Replace high limit with proper paging to avoid arbitrary cap
  const query = useGet<DesignSafeProjectCollection>({
    endpoint: `/api/projects/v2/?offset=0&limit=5000`,
    key: ['designsafe-projectsv2'],
    apiService: ApiService.DesignSafe,
  });
  return query;
};

interface UseDesignSafePublishedProjectDetailParams {
  designSafeProjectPRJ: string | undefined;
  options?: object;
}

export const useDesignSafePublishedProjectDetail = ({
  designSafeProjectPRJ,
  options = {},
}: UseDesignSafePublishedProjectDetailParams): UseQueryResult<DesignSafePublishedProjectDetail> => {
  const query = useGet<DesignSafePublishedProjectDetail>({
    endpoint: `/api/publications/v2/${designSafeProjectPRJ}/`,
    key: ['designsafe-single-published-projectv2', designSafeProjectPRJ],
    options,
    apiService: ApiService.DesignSafe,
  });

  return query;
};

export const useDesignSafePublishedProjects =
  (): UseQueryResult<DesignSafePublishedProjectCollection> => {
    // TODO: Replace high limit with proper paging to avoid arbitrary cap
    const query = useGet<DesignSafePublishedProjectCollection>({
      endpoint: `/api/publications/v2?offset=0&limit=5000`,
      key: ['designsafe-published-projects-v2'],
      apiService: ApiService.DesignSafe,
    });

    return query;
  };
