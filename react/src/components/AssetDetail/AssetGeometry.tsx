import React from 'react';
import _ from 'lodash';
import * as turf from '@turf/turf';
import { Feature } from '@hazmapper/types';

interface GeometryAssetProps {
  selectedFeature: Feature;
}

const GeometryAsset: React.FC<GeometryAssetProps> = ({ selectedFeature }) => {
  if (!selectedFeature?.geometry) return null;

  const bbox =
    selectedFeature.geometry.type !== 'Point'
      ? turf.bbox(selectedFeature)
      : null;

  return (
    <>
      {selectedFeature.geometry.type === 'Point' && (
        <table>
          <thead>
            <tr>
              <th className="text-center" colSpan={2}>
                Geometry: {_.startCase(selectedFeature.geometry.type)}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Latitude</td>
              <td>{selectedFeature.geometry.coordinates[0]}</td>
            </tr>
            <tr>
              <td>Longitude</td>
              <td>{selectedFeature.geometry.coordinates[1]}</td>
            </tr>
          </tbody>
        </table>
      )}
      {(selectedFeature.geometry.type === 'Polygon' ||
        selectedFeature.geometry.type === 'MultiPolygon') && (
        <table>
          <thead>
            <tr>
              <th className="text-center" colSpan={2}>
                Geometry: {_.startCase(selectedFeature.geometry.type)}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Area (m²)</td>
              <td>{turf.area(selectedFeature as turf.Feature).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      )}
      {(selectedFeature.geometry.type === 'LineString' ||
        selectedFeature.geometry.type === 'MultiLineString') && (
        <table>
          <thead>
            <tr>
              <th className="text-center" colSpan={2}>
                Geometry: {_.startCase(selectedFeature.geometry.type)}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Length (m)</td>
              <td>{turf.length(selectedFeature as turf.Feature).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      )}
      {selectedFeature.geometry.type !== 'Point' && bbox && (
        <table>
          <thead>
            {selectedFeature.geometry.type === 'GeometryCollection' && (
              <tr>
                <th className="text-center" colSpan={2}>
                  Geometry: {_.startCase(selectedFeature.geometry.type)}
                </th>
              </tr>
            )}
            <tr>
              <th colSpan={3} className="text-center">
                Bounding Box
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td></td>
              <td>Latitude</td>
              <td>Longitude</td>
            </tr>
            <tr>
              <td>Minimum</td>
              <td>{turf.bbox(selectedFeature.geometry)[0]}</td>
              <td>{turf.bbox(selectedFeature.geometry)[1]}</td>
            </tr>
            <tr>
              <td>Maximum</td>
              <td>{turf.bbox(selectedFeature.geometry)[2]}</td>
              <td>{turf.bbox(selectedFeature.geometry)[3]}</td>
            </tr>
          </tbody>
        </table>
      )}
    </>
  );
};

export default GeometryAsset;
