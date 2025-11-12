import { UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { useGet, usePost } from '@hazmapper/requests';
import { ApiService } from '@hazmapper/types';

export interface StartFileLocationRefreshResponse {
  message: string;
  public_status_id: number;
  task_id: number | null;
}
interface FileAccessibilityBase {
  id: number;
  current_path: string | null;
  current_system: string | null;
  is_on_public_system: boolean | null;
  last_public_system_check: string | null;
}

export interface FeatureAssetLocation extends FileAccessibilityBase {
  feature_id: number;
  asset_type: string;
  original_path: string | null;
  original_system: string | null;
}

export interface TileServerLocation extends FileAccessibilityBase {
  name: string;
  type: string;
  original_path: string | null;
  original_system: string | null;
}

export interface FileLocationSummary {
  // Features breakdown
  total_features: number;
  features_with_assets: number;
  features_without_assets: number;

  // Tile servers breakdown
  total_tile_servers: number;
  internal_tile_servers: number;
  external_tile_servers: number;
}

export interface FileLocationStatusResponse {
  check: {
    started_at: string;
    completed_at: string | null;
    total_files: number;
    files_checked: number;
    files_failed: number;
  } | null;
  featureAssets: FeatureAssetLocation[];
  tileServers: TileServerLocation[];
  summary: FileLocationSummary;
}

export const FILE_LOCATION_STATUS_KEY = 'file-location-status';

/**
 * Hook to get file location status for all files in a project
 */
export const useFileLocationStatus = (
  projectId: number
): UseQueryResult<FileLocationStatusResponse> => {
  return useGet<FileLocationStatusResponse>({
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
