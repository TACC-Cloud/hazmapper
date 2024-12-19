import L, { MarkerCluster } from 'leaflet';
import { getFeatureType, FeatureType } from '@hazmapper/types';
import { featureTypeToIcon } from '@hazmapper/utils/featureIconUtil';
import styles from './Map.module.css';

const defaultConfig = {
  // Regular marker settings
  size: 36, // Regular marker size (36x36px)
  iconSize: 20, // Icon size within regular marker (20x20px)
  fillColor: 'var(--global-color-accent--normal)',
  backgroundColor: '#ffffff',
  borderWidth: 2,
  borderColor: '#ffffff',

  // Cluster marker settings
  clusterSize: 36,
  clusterBorderWidth: 3,
  clusterFontSize: 14,
};

const _createCircleMarker = (customStyle = {}) => {
  const style = {
    radius: 8,
    fillColor: defaultConfig.fillColor,
    strokeColor: defaultConfig.borderColor,
    strokeWidth: defaultConfig.borderWidth,
    opacity: 1,
    fillOpacity: 0.8,
    ...customStyle,
  };

  const padding = style.strokeWidth;
  const totalSize = style.radius * 2 + padding * 2;
  const center = totalSize / 2;

  return L.divIcon({
    html: `
        <svg height="${totalSize}" width="${totalSize}">
          <circle 
            cx="${center}"
            cy="${center}"
            r="${style.radius}"
            fill="${style.fillColor}"
            fill-opacity="${style.fillOpacity}"
            stroke="${style.strokeColor}"
            stroke-width="${style.strokeWidth}"
            stroke-opacity="${style.opacity}"
          />
        </svg>
      `,
    className: styles.marker,
    iconSize: [totalSize, totalSize],
    iconAnchor: [center, center],
  });
};

const _createIconMarker = (
  iconClass,
  customStyle: {
    color?: string;
    backgroundColor?: string;
    size?: number;
    iconSize?: number;
  } = {}
) => {
  const style = {
    color: customStyle.color ?? defaultConfig.fillColor,
    backgroundColor:
      customStyle.backgroundColor ?? defaultConfig.backgroundColor,
    size: customStyle.size ?? defaultConfig.size,
    iconSize: customStyle.iconSize ?? defaultConfig.iconSize,
  };

  return L.divIcon({
    html: `
        <div class="${styles.markerContainer}" style="
          background-color: ${style.backgroundColor};
          width: ${style.size}px;
          height: ${style.size}px;
          border: ${defaultConfig.borderWidth}px solid ${defaultConfig.borderColor};
        ">
          <i class="fas ${iconClass}" style="
            color: ${style.color};
            font-size: ${style.iconSize}px;
          "></i>
        </div>
      `,
    className: styles.marker,
    iconSize: [style.size, style.size],
    iconAnchor: [style.size / 2, style.size / 2],
  });
};

const _createFeatureTypeMarker = (featureType) => {
  const icon = featureTypeToIcon(featureType);
  const iconPath = icon.icon[4];
  const viewBoxWidth = icon.icon[0];
  const viewBoxHeight = icon.icon[1];

  return L.divIcon({
    html: `
        <div class="${styles.markerContainer}" style="
          background-color: ${defaultConfig.backgroundColor};
          width: ${defaultConfig.size}px;
          height: ${defaultConfig.size}px;
          border: ${defaultConfig.borderWidth}px solid ${defaultConfig.borderColor};
        ">
          <svg
            viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}"
            style="width: ${defaultConfig.iconSize}px; height: ${defaultConfig.iconSize}px;"
          >
            <path 
              d="${iconPath}"
              fill="${defaultConfig.fillColor}"
            />
          </svg>
        </div>
      `,
    className: styles.marker,
    iconSize: [defaultConfig.size, defaultConfig.size],
    iconAnchor: [defaultConfig.size / 2, defaultConfig.size / 2],
  });
};

/**
 * Creates a marker based on feature type
 */
export const createClusterIcon = (cluster: MarkerCluster) => {
  return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: styles.markerCluster,
    iconSize: L.point(
      defaultConfig.clusterSize,
      defaultConfig.clusterSize,
      true
    ),
  });
};

/**
 * Creates the appropriate marker icon based on feature and its properties
 *
 * Decision flow:
 * 1. If feature has custom style:
 *    - With FA icon -> Use Font Awesome marker
 *    - Without FA icon -> Use circle marker with custom style
 * 2. If feature is Point type -> Use default circle marker
 * 3. Otherwise -> Use feature type specific marker (i.e. appropriate fa icon)
 *
 */
export const createMarkerIcon = (feature) => {
  const customStyle = feature.properties?.style;
  if (customStyle) {
    if (customStyle.faIcon) {
      return _createIconMarker(customStyle.faIcon, customStyle);
    }
    return _createCircleMarker(customStyle);
  }

  const featureType = getFeatureType(feature);
  if (featureType === FeatureType.Point) {
    return _createCircleMarker();
  }

  return _createFeatureTypeMarker(featureType);
};
