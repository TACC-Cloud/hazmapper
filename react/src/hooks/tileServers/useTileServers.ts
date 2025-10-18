import { UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { useGet, useDelete, usePost, usePut } from '@hazmapper/requests';
import { TileServerLayer } from '@hazmapper/types';

interface UseGetTileServerParams {
  projectId?: number;
  isPublicView: boolean;
  options?: object;
}

interface UsePostTileServerParams {
  projectId: number;
}

export const KEY_USE_TILE_SERVERS = 'useGetTileServers';

export interface UseDeleteTileServerParams {
  projectId: number;
  tileLayerId: number;
}

export const useGetTileServers = ({
  projectId,
  isPublicView,
  options = {
    staleTime: 1000 * 60 * 5, // 5 minute stale time
    refetchOnMount: false,
  },
}: UseGetTileServerParams): UseQueryResult<TileServerLayer[]> => {
  const endpoint = `/projects/${projectId}/tile-servers/`;

  const query = useGet<TileServerLayer[]>({
    endpoint,
    key: [KEY_USE_TILE_SERVERS, { projectId, isPublicView }],
    options,
  });

  return query;
};

export const usePutTileServer = ({ projectId }: UsePostTileServerParams) => {
  const queryClient = useQueryClient();
  return usePut<TileServerLayer[], TileServerLayer[]>({
    endpoint: `/projects/${projectId}/tile-servers/`,
    options: {
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: [KEY_USE_TILE_SERVERS],
        }),
    },
  });
};

export const usePostTileServer = ({ projectId }: UsePostTileServerParams) => {
  return usePost<Omit<TileServerLayer, 'id'>, TileServerLayer>({
    endpoint: `/projects/${projectId}/tile-servers/`,
  });
};

export const useDeleteTileServer = ({
  projectId,
  tileLayerId,
}: UseDeleteTileServerParams) => {
  const queryClient = useQueryClient();
  return useDelete<void, void>({
    endpoint: `/projects/${projectId}/tile-servers/${tileLayerId}/`,
    options: {
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: [KEY_USE_TILE_SERVERS],
        }),
    },
  });
};
