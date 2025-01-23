import { UseQueryResult, useQueryClient } from '@tanstack/react-query';

import { ApiService, PointCloud, PointCloudRequest } from '@hazmapper/types';
import { useGet, useDelete, usePost } from '@hazmapper/requests';

export const KEY_USE_POINT_CLOUDS = 'activePointClouds';

interface UsePointCloudParams {
  projectId: number;
  options?: object;
}

export const usePointClouds = ({
  projectId,
  options = {},
}: UsePointCloudParams): UseQueryResult<PointCloud[]> => {
  const endpoint = `/projects/${projectId}/point-cloud/`;

  const query = useGet<PointCloud[]>({
    endpoint,
    key: [
      KEY_USE_POINT_CLOUDS,
      {
        projectId,
      },
    ],
    options,
  });
  return query;
};

interface UsePostCreatePointCloudParams {
  projectId: number;
}

export const useCreatePointCloud = ({
  projectId,
}: UsePostCreatePointCloudParams) => {
  const endpoint = `/projects/${projectId}/point-clouds/`;

  return usePost<PointCloudRequest, PointCloud>({
    endpoint,
    apiService: ApiService.Geoapi,
  });
};

type DeletePointCloudParams = {
  projectId: number;
  pointCloudId: number;
};

export function useDeletePointCloud() {
  const queryClient = useQueryClient();

  return useDelete<void, DeletePointCloudParams>({
    endpoint: ({ projectId, pointCloudId }) =>
      `/projects/${projectId}/point-cloud/${pointCloudId}/`,
    options: {
      onSuccess: () => {
        // invalidate *any* point cloud listing query
        queryClient.invalidateQueries({ queryKey: [KEY_USE_POINT_CLOUDS] });
      },
    },
  });
}
