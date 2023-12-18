import { CircleMarker, Path, circleMarker, divIcon, LatLng, Marker, MarkerOptions, marker, icon, geoJSON } from 'leaflet';
import { Feature } from '../models/models';
import { MarkerStyle } from '../models/style';

interface MarkerIcon {
  color: string;
  name: string;
}

// Needed to add feature to marker options (for click events)
declare module 'leaflet' {
  interface MarkerOptions {
    feature?: Feature;
  }
}

function createCircleMarker(feature: Feature, latlng: LatLng): CircleMarker {
  const options = {
    radius: 8,
    fillColor: '#d3d3d3',
    color: 'black',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
  };
  return circleMarker(latlng, options);
}

function createImageMarker(feature: Feature, latlng: LatLng): Marker {
  const divHtml = '<i class="fas fa-camera-retro fa-2x light-blue"></i>';
  const ico = divIcon({ className: 'leaflet-fa-marker-icon', html: divHtml });
  return marker(latlng, { icon: ico });
}

function createCollectionMarker(feature: Feature, latlng: LatLng): Marker {
  const divHtml = '<i class="fa fa-folder-open fa-2x light-blue"></i>';
  const ico = divIcon({ className: 'icon-marker', html: divHtml });
  return marker(latlng, { icon: ico });
}

function createVideoMarker(feature: Feature, latlng: LatLng): Marker {
  const divHtml = '<i class="fas fa-video fa-2x light-blue"></i>';
  const ico = divIcon({ className: 'leaflet-fa-marker-icon', html: divHtml });
  return marker(latlng, { icon: ico });
}

function createCustomIconMarker(latlng: LatLng, style: MarkerStyle): Marker {
  const faIcon = style.faIcon;
  const color = style.color;
  const divHtml = `<i class="fas ${faIcon} fa-2x" style="color: ${color}"></i>`;
  const ico = divIcon({ className: 'leaflet-fa-marker-icon', html: divHtml });
  return marker(latlng, { icon: ico, ...style });
}

function createQuestionnaireMarker(feature: Feature, latlng: LatLng): Marker {
  const divHtml = '<i class="fas fa-clipboard-list fa-2x light-blue"></i>';
  const ico = divIcon({ className: 'leaflet-fa-marker-icon', html: divHtml });
  return marker(latlng, { icon: ico });
}

function createCustomCircleMarker(latlng: LatLng, style: MarkerStyle): CircleMarker {
  return circleMarker(latlng, style);
}

function createPointCloudMarker(feature: Feature, latlng: LatLng): Marker {
  const divHtml = '<i class="fab fa-mixcloud fa-2x light-blue"></i>';
  const customIcon = divIcon({
    className: 'leaflet-fa-marker-icon',
    html: divHtml,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
  // Adding feature data to options prop of marker to statisfy TS type errors
  return marker(latlng, {
    icon: customIcon,
    feature, // shorthand
  });
}

// Used to find the top-left corner of our point-clouds to help with overlapping
export function calculateMarkerPosition(geoJsonPolygon): LatLng {
  const layer = geoJSON(geoJsonPolygon); // Convert GeoJSON Polygon to Leaflet Layer
  const bounds = layer.getBounds();
  return new LatLng(bounds.getNorth(), bounds.getWest()); // Top-left corner
}

export function createMarker(feature: Feature, latlng: LatLng): Marker | CircleMarker {
  if (feature.featureType() === 'point_cloud') {
    return createPointCloudMarker(feature, latlng);
  } else if (feature.properties.style) {
    const style = feature.properties.style;
    if (style.faIcon) {
      return createCustomIconMarker(latlng, style);
    } else {
      return createCustomCircleMarker(latlng, style);
    }
  } else {
    if (feature.featureType() === 'image') {
      return createImageMarker(feature, latlng);
    } else if (feature.featureType() === 'collection') {
      return createCollectionMarker(feature, latlng);
    } else if (feature.featureType() === 'video') {
      return createVideoMarker(feature, latlng);
    } else if (feature.featureType() === 'questionnaire') {
      return createQuestionnaireMarker(feature, latlng);
    } else {
      return createCircleMarker(feature, latlng);
    }
  }
}
