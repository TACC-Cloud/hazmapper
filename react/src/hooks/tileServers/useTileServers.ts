import { UseQueryResult } from 'react-query';
import { useGet } from '../../requests';
import { TileServerLayer } from '../../types';

interface UseTileServerParams {
  projectId?: number;
  isPublic: boolean;
  options: object;
}

export const useTileServers = ({
  projectId,
  isPublic,
  options,
}: UseTileServerParams): UseQueryResult<TileServerLayer[]> => {
  const tileServersRoute = isPublic ? 'public-projects' : 'projects';
  const endpoint = `/${tileServersRoute}/${projectId}/tile-servers/`;

  const query = useGet<TileServerLayer[]>({
    endpoint,
    key: ['tile-servers', { projectId, isPublic }],
    options,
  });

  if (!projectId) {
    return {
      ...query,
      status: 'error',
      error: new Error('Unknown project'),
      data: undefined,
      isLoading: false,
    } as UseQueryResult<TileServerLayer[]>;
  }

  return query;
};
