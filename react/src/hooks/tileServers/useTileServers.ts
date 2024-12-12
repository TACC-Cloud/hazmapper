import { UseQueryResult } from 'react-query';
import { useGet } from '../../requests';
import { TileServerLayer } from '@hazmapper/types';

interface UseTileServerParams {
  projectId?: number;
  isPublicView: boolean;
  options?: object;
}

export const useTileServers = ({
  projectId,
  isPublicView,
  options = {},
}: UseTileServerParams): UseQueryResult<TileServerLayer[]> => {
  const tileServersRoute = isPublicView ? 'public-projects' : 'projects';
  const endpoint = `/${tileServersRoute}/${projectId}/tile-servers/`;

  const query = useGet<TileServerLayer[]>({
    endpoint,
    key: ['tile-servers', { projectId, isPublicView }],
    options,
  });

  return query;
};
