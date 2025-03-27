import { useGet } from '@hazmapper/requests';
import { StreetviewSequence } from '@hazmapper/types';
import { UseQueryResult } from '@tanstack/react-query';

interface UseStreetviewSequenceParams {
  projectId: number;
  featureId: number;
  options?: object;
}

export const useStreetviewSequence = ({
  projectId,
  featureId,
  options = {},
}: UseStreetviewSequenceParams): UseQueryResult<StreetviewSequence> => {
  const endpoint = `/projects/${projectId}/streetview/${featureId}/`;

  const query = useGet<StreetviewSequence>({
    endpoint,
    key: [
      'streetviewsequence',
      {
        projectId,
        featureId,
      },
    ],
    options,
  });
  return query;
};
