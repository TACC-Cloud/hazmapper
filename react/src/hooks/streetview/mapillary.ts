import { useCallback, useContext } from 'react';
import { useGet } from '@hazmapper/requests';
import { ApiService } from '@hazmapper/types';
import { useMapillaryToken } from '@hazmapper/context/MapillaryTokenProvider';
import { useAppConfiguration } from '@hazmapper/hooks';
import { UseQueryResult } from '@tanstack/react-query';
import { MapillaryViewerContext } from '@hazmapper/context/MapillaryViewerContextProvider';
import { LatLngBounds } from 'leaflet';

/**
 * Custom hook for accessing and manipulating MapillaryViewer state.
 *
 *   See MapillaryViewerProvider and MapillaryViewerContext for more details
 *
 *   See useMapillaryViewerMoveToNearestPoint
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
  lat: number | undefined;
  lng: number | undefined;
}

/* Ask mapillary for a first image id from sequence number that is closes to nearest point
 *
 *  See https://www.mapillary.com/developer/api-documentation#image
 *
 *  Note, enable is false so only fetching manually
 *
 */
const useMapillaryFirstImageIdNearestPoint = ({
  sequenceId,
  lat,
  lng,
}: UseMapillaryImageIdParams): UseQueryResult<string> => {
  const isValid = !!(sequenceId && lat != null && lng != null);

  if (!isValid) {
    // Return a dummy query result — this avoids the request
    return {
      data: undefined,
      refetch: () => Promise.resolve({} as any),
      isFetching: false,
      isSuccess: false,
      isError: false,
      error: null,
    } as UseQueryResult<string>;
  }

  const params = {
    sequence_id: String(sequenceId),
    close_to: `${lng},${lat}`, // Format: longitude,latitude
    limit: '1', // Only need the closest image
    fields: 'id', // Only requesting the ID
  };
  const endpoint = `/images/`;

  const query = useGet<string>({
    endpoint,
    key: [
      'mapillary_nearest_image_id_to_point',
      {
        sequenceId,
        lat,
        lng,
      },
    ],
    apiService: ApiService.Mapillary,
    params,
    transform: (data) => data?.data?.[0]?.id, // just get the first (and only) one
    options: {
      enabled: false, // only fetch manually
      refetchOnWindowFocus: false,
    },
  });
  return query;
};

interface FetchNearestImageParams {
  mapillaryApiUrl: string;
  accessToken: string;
  sequenceId: string;
  bbox: LatLngBounds;
}

/**
 * Fetch the nearest image ID in a sequence to a lat/lng using Mapillary API.
 * This is a plain async function — not a hook.
 */
const _fetchNearestMapillaryImageId = async ({
  mapillaryApiUrl,
  accessToken,
  sequenceId,
  bbox,
}: FetchNearestImageParams): Promise<string | null> => {
  // convert to box format of mapillary (i.e. minLon, minLat, maxLon, maxLat)
  const bboxParam = [
    bbox.getWest(),
    bbox.getSouth(),
    bbox.getEast(),
    bbox.getNorth(),
  ].join(',');

  const params = new URLSearchParams({
    sequence_id: sequenceId,
    bbox: bboxParam,
    limit: '1',
    fields: 'id',
  });

  const res = await fetch(`${mapillaryApiUrl}/images/?${params}`, {
    headers: {
      Authorization: `OAuth ${accessToken}`,
    },
  });

  if (!res.ok) {
    console.error('Mapillary image fetch failed', res.status);
    return null;
  }

  const data = await res.json();
  return data?.data?.[0]?.id ?? null;
};

/**
 * Hook that returns an action to move the Mapillary viewer
 * to the image closest to a given position within a specific sequence.
 *
 * @returns moveToImageNearThisPosition - A function to trigger viewer movement.
 */
export const useMapillaryViewerMoveToNearestPoint = () => {
  const config = useAppConfiguration();
  const { accessToken } = useMapillaryToken();
  const { sequenceId: currentSequenceId, setImageId } = useMapillaryViewer();
  const mapillaryApiUrl = config.mapillary.apiUrl;
  /**
   * Try to move the Mapillary viewer to the image nearest the given position
   * within the specified sequence.
   *
   * @returns true if the move was initiated; false if blocked by auth, viewer state, or sequence mismatch
   */
  const moveToImageNearThisPosition = useCallback(
    async (bbox: LatLngBounds, sequenceId: string): Promise<boolean> => {
      if (!accessToken) return false;
      if (sequenceId !== currentSequenceId) return false;

      const imageId = await _fetchNearestMapillaryImageId({
        mapillaryApiUrl,
        accessToken,
        sequenceId,
        bbox,
      });

      if (imageId) {
        setImageId((prev) => (prev === imageId ? prev : imageId));
        return true;
      }

      return false;
    },
    [accessToken, currentSequenceId, mapillaryApiUrl, setImageId]
  );

  return { moveToImageNearThisPosition };
};
