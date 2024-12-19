import { UseQueryResult } from 'react-query';
import { useGet } from '../../requests';
import { ApiService, File } from '../../types';

interface UseFilesParams {
  system: string;
  path: string;
  offset: string;
  limit: string;
  enabled?: boolean;
}

export const useFiles = ({
  system,
  path,
  offset,
  limit,
  enabled = true,
}: UseFilesParams): UseQueryResult<File[]> => {
  const query = useGet<File[]>({
    endpoint: `/v3/files/ops/${system}/${path}?offset=${offset}&limit=${limit}`,
    key: ['files'],
    apiService: ApiService.Tapis,
    transform: (data) => data.result,
    options: {
      enabled,
    },
  });
  return query;
};
