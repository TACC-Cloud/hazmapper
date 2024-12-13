import { useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useCurrentFeatures } from '.';
import { Feature, FeatureCollection } from '@hazmapper/types';

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
  const currentFeatures = useCurrentFeatures();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const selectedFeatureId = searchParams.get(SELECTED_FEATURE_PARAM)
    ? Number(searchParams.get(SELECTED_FEATURE_PARAM))
    : null;

  const selectedFeature = currentFeatures.data
    ? findFeatureById(currentFeatures.data, selectedFeatureId)
    : null;

  const setSelectedFeatureId = useCallback(
    (featureId: number) => {
      const newSearchParams = new URLSearchParams(searchParams);

      if (selectedFeatureId === Number(featureId)) {
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
    [navigate, location.pathname, searchParams, selectedFeatureId]
  );

  return {
    selectedFeatureId,
    selectedFeature,
    setSelectedFeatureId,
  };
}
