import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import { TileServerLayer, FeatureCollection } from '../../types';
import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { LatLngTuple, MarkerCluster } from 'leaflet';
import 'leaflet.markercluster';

import 'leaflet/dist/leaflet.css';

/* TODO: review if best approach is to style map with .leaflet-container */
/* TODO: consider createTileLayerComponent
/* TODO: support layers with type 'arcgis' and 'wms' (WMSTileLayer) https://jira.tacc.utexas.edu/browse/WG-6 */

const startingCenterPosition: LatLngTuple = [40, -80];
const maxFitToBoundsZoom = 18;
const maxBounds: L.LatLngBoundsExpression = [
  [-90, -180], // Southwest coordinates
  [90, 180], // Northeast coordinates
];

interface LeafletMapProps {
  /**
   * Tile servers used as base layers of map
   */
  baseLayers: TileServerLayer[];

  /**
   * Features of map
   */
  featureCollection: FeatureCollection;
}

const ClusterMarkerIcon = (childCount: number) => {
  return L.divIcon({
    html: `<div><b>${childCount}</b></div>`,
    className: 'marker-cluster',
  });
};

const FitBoundsOnInitialLoad = ({
  featureCollection,
}: {
  featureCollection: FeatureCollection;
}) => {
  const map = useMap();

  useEffect(() => {
    if (featureCollection.features.length) {
      const bbox = turf.bbox(featureCollection);
      const southWest: [number, number] = [bbox[1], bbox[0]];
      const northEast: [number, number] = [bbox[3], bbox[2]];
      map.fitBounds([southWest, northEast], { maxZoom: maxFitToBoundsZoom });
    }
  }, [map, featureCollection]);

  return null;
};

/**
 * A component that displays a leaflet map of hazmapper data
 *
 * Note this is not called Map as causes an issue with react-leaflet
 */
const LeafletMap: React.FC<LeafletMapProps> = ({
  baseLayers,
  featureCollection,
}) => {
  const activeBaseLayers = baseLayers.filter(
    (layer) => layer.uiOptions.isActive
  );

  const pointGeometryFeatures = featureCollection.features.filter(
    (f) => f.geometry.type === 'Point'
  );

  return (
    <MapContainer
      center={startingCenterPosition}
      zoom={3}
      style={{ width: '100%', height: '100%' }}
      minZoom={2} // 2 typically prevents zooming out to far to see multiple earths
      maxBounds={maxBounds}
    >
      {activeBaseLayers.map((layer) => (
        <TileLayer
          key={layer.id}
          url={layer.url}
          attribution={layer.attribution}
          zIndex={layer.uiOptions.zIndex}
          opacity={layer.uiOptions.opacity}
        />
      ))}
      <MarkerClusterGroup
        iconCreateFunction={(cluster: MarkerCluster) =>
          ClusterMarkerIcon(cluster.getChildCount())
        }
      >
        {pointGeometryFeatures.map((f) => {
          const geometry = f.geometry as GeoJSON.Point;

          return (
            <Marker
              key={f.id}
              position={[geometry.coordinates[1], geometry.coordinates[0]]}
            >
              <Popup>{f.id}</Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
      <FitBoundsOnInitialLoad featureCollection={featureCollection} />
    </MapContainer>
  );
};

export default LeafletMap;
