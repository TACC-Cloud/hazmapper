import React from 'react';
import _ from 'lodash';
import * as turf from '@turf/turf';
import { Feature as TFeature } from 'geojson';
import { Feature, FeatureType } from '@hazmapper/types';
import styles from './AssetDetail.module.css';

interface AssetGeometryProps {
  selectedFeature: Feature;
}

const AssetGeometry: React.FC<AssetGeometryProps> = ({ selectedFeature }) => {
  if (!selectedFeature?.geometry) return null;

  const bbox = turf.bbox(selectedFeature.geometry);

  const geometryType = selectedFeature.geometry.type;

  return (
    <div className={styles.metadataTable}>
      {geometryType === FeatureType.Point && (
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
              <td>{bbox[1]}</td>
            </tr>
            <tr>
              <td>Longitude</td>
              <td>{bbox[0]}</td>
            </tr>
          </tbody>
        </table>
      )}
      {(geometryType === FeatureType.Polygon ||
        geometryType === FeatureType.MultiPolygon) && (
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
              <td>{turf.area(selectedFeature as TFeature).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      )}
      {(geometryType === FeatureType.LineString ||
        geometryType === FeatureType.MultiLineString) && (
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
              <td>
                {turf
                  .length(selectedFeature as TFeature, { units: 'meters' })
                  .toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      )}
      {/* Bounding box for non-point geometries */}
      {geometryType !== FeatureType.Point && (
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
              <td>{bbox[1]}</td>
              <td>{bbox[0]}</td>
            </tr>
            <tr>
              <td>Maximum</td>
              <td>{bbox[3]}</td>
              <td>{bbox[2]}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AssetGeometry;
