import { useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useCurrentFeatures } from '.';
import { Feature, FeatureCollection } from '@hazmapper/types';
import { useAppConfiguration } from '../environment';

const SELECTED_FEATURE_PARAM = 'selectedFeature';

interface UseFeatureSelectionReturn {
  selectedFeatureId: number | null;
  selectedFeature: Feature | null;
  setSelectedFeatureId: (featureId: number) => void;
}

const findFeatureById = (
  featureCollection: FeatureCollection,
  selectedFeatureId: number | null
): Feature | null => {
  if (selectedFeatureId === null) return null;

  return (
    featureCollection.features.find(
      (feature) => feature.id === selectedFeatureId
    ) || null
  );
};

/**
 * A custom hook that manages feature selection state through URL search parameters.
 *
 * This hook provides functionality to:
 * - Get the currently selected feature ID from URL parameters
 * - Get the corresponding Feature object for the selected ID ( *if* it is in the current filtered feature response )
 * - Set/unset the selected feature ID in the URL
 *
 * */
export function useFeatureSelection(): UseFeatureSelectionReturn {
  const { data: currentFeatures } = useCurrentFeatures();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get the selected feature ID from the URL
  const selectedFeatureId = searchParams.get(SELECTED_FEATURE_PARAM)
    ? Number(searchParams.get(SELECTED_FEATURE_PARAM))
    : null;

  // Store the selectedFeatureId in a ref to prevent re-creating setSelectedFeatureId unnecessarily
  const selectedFeatureIdRef = useRef(selectedFeatureId);

  useEffect(() => {
    selectedFeatureIdRef.current = selectedFeatureId;
  }, [selectedFeatureId]);

  const selectedFeature = useMemo(() => {
    return currentFeatures
      ? findFeatureById(currentFeatures, selectedFeatureId)
      : null;
  }, [currentFeatures, selectedFeatureId]);

  const setSelectedFeatureId = useCallback(
    (featureId: number) => {
      const newSearchParams = new URLSearchParams(searchParams);

      if (selectedFeatureIdRef.current === Number(featureId)) {
        newSearchParams.delete(SELECTED_FEATURE_PARAM);
      } else {
        newSearchParams.set(SELECTED_FEATURE_PARAM, String(featureId));
      }

      navigate(
        {
          pathname: location.pathname,
          search: newSearchParams.toString(),
        },
        { replace: true }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, location.pathname] // No searchParams/selectedFeatureId to avoid rerender;  use refs instead
  );

  return {
    selectedFeatureId,
    selectedFeature,
    setSelectedFeatureId,
  };
}
/**
 * Hook to get the feature asset source path
 * @param feature - The feature for which to get the source path
 * @returns A function to get the feature asset source path with an optional additional path
 */

export const useFeatureAssetSourcePath = (feature: Feature) => {
  const config = useAppConfiguration();
  return useCallback(
    (optionalPath: string | null = null): string => {
      const baseFeatureSource = `${config.geoapiUrl}/assets/${feature.assets[0].path}`;
      return optionalPath
        ? baseFeatureSource + optionalPath
        : baseFeatureSource;
    },
    [config.geoapiUrl, feature]
  );
};

/**
 * Hook to fetch the feature asset source using React Query
 * @param feature - The feature for which to get the source
 * @param optionalPath - Optional path to append to the source path
 * @returns React Query result with data, loading and error states
 */
export const useFeatureAssetSource = (
  feature: Feature,
  path: string | null = null
) => {
  const getFeatureAssetSourcePath = useFeatureAssetSourcePath(feature);

  return useQuery({
    queryKey: ['featureAsset', feature.id, path],
    queryFn: async () => {
      const featureSourcePath = getFeatureAssetSourcePath(path);
      const response = await fetch(featureSourcePath, {
        headers: { 'content-type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });
};
