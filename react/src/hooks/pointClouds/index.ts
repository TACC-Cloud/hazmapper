import { UseQueryResult, useQueryClient } from '@tanstack/react-query';

import {
  ApiService,
  PointCloud,
  PointCloudRequest,
  TapisFilePath,
  GeoapiMessageAcceptedResponse,
} from '@hazmapper/types';
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
  const queryClient = useQueryClient();

  const endpoint = `/projects/${projectId}/point-cloud/`;

  return usePost<PointCloudRequest, PointCloud>({
    endpoint,
    apiService: ApiService.Geoapi,
    options: {
      onSuccess: () => {
        // invalidate *any* point cloud listing query
        queryClient.invalidateQueries({ queryKey: [KEY_USE_POINT_CLOUDS] });
      },
    },
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

/*
mportPointCloudFileFromTapis(projectId: number, pointCloudId: number, files: Array<RemoteFile>): void {
    const tmp = files.map((f) => ({ system: f.system, path: f.path }));
    const payload = {
      files: tmp,
    };
    this.http.post(this.envService.apiUrl + `/projects/${projectId}/point-cloud/${pointCloudId}/import/`, payload).subscribe(
      (resp) => {},
      (error) => {
      */

type pointCloudParams = {
  projectId: number;
  pointCloudId: number;
};

type ImportPointCloudRequestType = {
  files: TapisFilePath[];
};

export const useImportPointCloudFile = ({
  projectId,
  pointCloudId,
}: pointCloudParams) => {
  const queryClient = useQueryClient();

  return usePost<ImportPointCloudRequestType, GeoapiMessageAcceptedResponse>({
    endpoint: `/projects/${projectId}/point-cloud/${pointCloudId}/import/`,
    options: {
      onSuccess: () => {
        // invalidate *any* point cloud listing query
        queryClient.invalidateQueries({ queryKey: [KEY_USE_POINT_CLOUDS] });
      },
    },
  });
};
