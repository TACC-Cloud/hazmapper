import { UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { useGet, usePost } from '@hazmapper/requests';
import { ApiService } from '@hazmapper/types';

// Types based on your Pydantic models
export interface FileLocationCheck {
  id: number;
  project_id: number;
  started_at: string;
  completed_at: string | null;
  task: {
    id: number;
    status: string;
    description: string;
    project_id: number;
    latest_message: string | null;
    created: string;
    updated: string;
  } | null;
}

export interface StartFileLocationRefreshResponse {
  message: string;
  public_status_id: number;
  task_id: number | null;
}

export interface FeatureAssetLocation {
  id: number;
  feature_id: number;
  asset_type: string;
  original_system: string | null;
  original_path: string | null;
  current_system: string | null;
  current_path: string | null;
  is_on_public_system: boolean | null;
  display_path: string | null;
}

export interface ProjectFileLocationSummary {
  project_id: number;
  check: FileLocationCheck | null;
  files: FeatureAssetLocation[];
}

export const FILE_LOCATION_STATUS_KEY = 'file-location-status';

/**
 * Hook to get file location status for all files in a project
 */
export const useFileLocationStatus = (
  projectId: number
): UseQueryResult<ProjectFileLocationSummary> => {
  return useGet<ProjectFileLocationSummary>({
    endpoint: `/projects/${projectId}/file-location-status/files`,
    key: [FILE_LOCATION_STATUS_KEY, projectId],
    apiService: ApiService.Geoapi,
  });
};

/**
 * Hook to start a file location status refresh for a project
 */
export const useStartFileLocationRefresh = (projectId: number) => {
  const queryClient = useQueryClient();
  const endpoint = `/projects/${projectId}/file-location-status/`;

  return usePost<void, StartFileLocationRefreshResponse>({
    endpoint,
    apiService: ApiService.Geoapi,
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [FILE_LOCATION_STATUS_KEY, projectId],
        });
      },
    },
  });
};
