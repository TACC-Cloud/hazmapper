import {CircleMarker, MarkerOptions, circleMarker, divIcon, LatLng, Marker, marker} from 'leaflet';
import {Feature, MarkerConfig, Path, MarkerIcon} from '../models/models';

function createCircleMarker(feature: Feature, latlng: LatLng): CircleMarker {
  const options = {
    radius: 8,
    fillColor: '#d3d3d3',
    color: 'black',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };
  return circleMarker( latlng, options );
}

function createImageMarker(feature: Feature, latlng: LatLng): Marker {
  const divHtml = '<i class="fas fa-camera-retro fa-2x light-blue"></i>';
  const ico = divIcon({className: 'leaflet-fa-marker-icon', html: divHtml});
  return marker(latlng, {icon: ico});
}

function createCollectionMarker(feature: Feature, latlng: LatLng): Marker {
  const divHtml = '<i class="fa fa-folder-open fa-2x light-blue"></i>';
  const ico = divIcon({className: 'icon-marker', html: divHtml});
  return marker(latlng, {icon: ico});
}

function createVideoMarker(feature: Feature, latlng: LatLng): Marker {
  const divHtml = '<i class="fas fa-video fa-2x light-blue"></i>';
  const ico = divIcon({className: 'leaflet-fa-marker-icon', html: divHtml});
  return marker(latlng, {icon: ico});
}

export function createMarker(feature: Feature, latlng: LatLng): Path {
  if (feature.properties.customMarker) {
    if (feature.properties.customMarker === 'icon') {
      return createCustomIconMarker(feature, latlng);
    } else { // 'styled'
      return createCustomCircleMarker(latlng, feature.styles as MarkerOptions);
    }
  } else {
    if (feature.featureType() === 'image') {
      return createImageMarker(feature, latlng);
    } else if (feature.featureType() === 'collection') {
      return createCollectionMarker(feature, latlng);
    } else if (feature.featureType() === 'video') {
      return createVideoMarker(feature, latlng);
    } else {
      return createCircleMarker(feature, latlng);
    }
  }
}

function createCustomIconMarker(feature: Feature, latlng: LatLng): Marker {
  const icon = feature.properties.icon as MarkerIcon;
  const divHtml = `<i class="fas ${icon.name} fa-2x" style="color: ${icon.color}"></i>`;
  const ico = divIcon({className: 'leaflet-fa-marker-icon', html: divHtml});
  return marker(latlng, {icon: ico, ...feature.styles});
}

function createCustomCircleMarker(latlng: LatLng, options: MarkerOptions): CircleMarker {
  return circleMarker(latlng, options);
}
