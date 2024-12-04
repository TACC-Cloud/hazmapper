import { useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

const SELECTED_FEATURE_PARAM = 'selectedFeature';

interface UseFeatureSelectionReturn {
  selectedFeatureId: number | null;
  setSelectedFeatureId: (featureId: number) => void;
}

export function useFeatureSelection(): UseFeatureSelectionReturn {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const selectedFeatureId = searchParams.get(SELECTED_FEATURE_PARAM)
    ? Number(searchParams.get(SELECTED_FEATURE_PARAM))
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
    setSelectedFeatureId,
  };
}
