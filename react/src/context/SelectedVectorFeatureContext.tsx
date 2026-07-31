import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

/**
 * A single geometry (segment/point/polygon) picked out of a PMTiles vector
 * asset when the user clicks it on the map.
 *
 * `properties` are the attribute values of that specific geometry (the
 * protomaps-leaflet picked feature's `props`), which is distinct from the
 * parent hazmapper Feature's own (usually empty) `properties`.
 */
interface SelectedVectorFeature {
  /** id of the parent hazmapper Feature the PMTiles asset belongs to. */
  featureId: number;
  /** Attribute values of the clicked geometry. */
  properties: Record<string, unknown>;
}

interface SelectedVectorFeatureContextType {
  selectedVectorFeature: SelectedVectorFeature | null;
  setSelectedVectorFeature: Dispatch<
    SetStateAction<SelectedVectorFeature | null>
  >;
}

export const SelectedVectorFeatureContext =
  createContext<SelectedVectorFeatureContextType | null>(null);

/**
 * Provider for the currently-clicked vector geometry's attributes.
 *
 * This is transient, click-scoped state (not persisted in the URL like the
 * selected feature id) so that clicking a segment of a PMTiles vector can show
 * that segment's attributes in the detail panel.
 *
 * TODO(vectorSubId): make the sub-selection deep-linkable / reload-safe like
 * `selectedFeature`, and enable highlighting the clicked geometry. Both need a
 * stable per-geometry id stamped at ingest (a clicked geometry has none today:
 * PMTiles geometries are split across tiles and simplified per zoom, and
 * tippecanoe doesn't emit a stable id unless the source carries one and we
 * preserve it). Until then this stays transient (lost on reload/share).
 */
export const SelectedVectorFeatureProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [selectedVectorFeature, setSelectedVectorFeature] =
    useState<SelectedVectorFeature | null>(null);

  return (
    <SelectedVectorFeatureContext.Provider
      value={{ selectedVectorFeature, setSelectedVectorFeature }}
    >
      {children}
    </SelectedVectorFeatureContext.Provider>
  );
};

/**
 * Access the currently-clicked vector geometry's attributes.
 *
 * Must be used within a {@link SelectedVectorFeatureProvider}.
 */
export const useSelectedVectorFeature = () => {
  const context = useContext(SelectedVectorFeatureContext);
  if (!context) {
    throw new Error(
      'useSelectedVectorFeature must be used within a SelectedVectorFeatureProvider'
    );
  }
  return context;
};

export { type SelectedVectorFeature };
