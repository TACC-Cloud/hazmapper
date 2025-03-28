import { useGet } from '@hazmapper/requests';
import { ApiService, StreetviewSequence } from '@hazmapper/types';
import { useMapillaryToken } from '@hazmapper/context/MapillaryTokenProvider';
import { UseQueryResult } from '@tanstack/react-query';
import { useContext } from 'react';
import { MapillaryViewerContext } from '@hazmapper/context/MapillaryViewerContextProvider';

/**
 * Custom hook for accessing and manipulating MapillaryViewer state.
 */
export const useMapillaryViewer = () => {
  const context = useContext(MapillaryViewerContext);
  if (!context)
    throw new Error(
      'useMapillaryViewer must be used within a MapillaryViewerProvider'
    );
  return context;
};

interface UseMapillaryImageIdParams {
  sequenceId: string | undefined;
}

/* Ask mapillary for a first image id from sequence number
 *
 *  See https://www.mapillary.com/developer/api-documentation#sequence
 *
 */
export const useMapillaryFirstImageId = ({
  sequenceId,
}: UseMapillaryImageIdParams): UseQueryResult<StreetviewSequence> => {
  const { accessToken: mapillaryAuthToken } = useMapillaryToken();
  const params = { sequence_id: String(sequenceId) };
  const endpoint = `/image_ids/`;

  const query = useGet<StreetviewSequence>({
    endpoint,
    key: [
      'mapillary_wsequence_of_image_ids',
      {
        sequenceId,
      },
    ],
    apiService: ApiService.Mapillary,
    params,
    transform: (data) => data?.data?.[0]?.id, // just get the first one
    options: {
      enabled: !!mapillaryAuthToken, // only fetch when authed
    },
  });
  return query;
};
