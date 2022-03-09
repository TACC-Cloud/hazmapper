import {CircleMarker, Path, circleMarker, divIcon, LatLng, Marker, marker} from 'leaflet';
import {Feature} from '../models/models';
import {MarkerStyle} from '../models/style';

interface MarkerIcon {
  color: string;
  name: string;
}

function createCircleMarker(feature: Feature, latlng: LatLng): CircleMarker {
  const options = {
    radius: 8,
    fillColor: '#d3d3d3',
    color: 'black',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.1
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

function createCustomImageMarker(latlng: LatLng, style: MarkerStyle): Marker {
  const divHtml = `<i style="color: ${style.color}" class="fas fa-camera-retro fa-2x"></i>`;
  const ico = divIcon({className: 'leaflet-fa-marker-icon', html: divHtml});
  return marker(latlng, {icon: ico});
}

function createCustomCollectionMarker(latlng: LatLng, style: MarkerStyle): Marker {
  const divHtml = `<i style="color: ${style.color}" class="fa fa-folder-open fa-2x"></i>`;
  const ico = divIcon({className: 'icon-marker', html: divHtml});
  return marker(latlng, {icon: ico});
}

function createCustomVideoMarker(latlng: LatLng, style: MarkerStyle): Marker {
  const divHtml = `<i style="color: ${style.color}" class="fas fa-video fa-2x"></i>`;
  const ico = divIcon({className: 'leaflet-fa-marker-icon', html: divHtml});
  return marker(latlng, {icon: ico});
}

function createCustomIconMarker(latlng: LatLng, style: MarkerStyle): Marker {
  const icon = style.faIcon;
  const color = style.color;
  const divHtml = `<i class="fas ${icon} fa-2x" style="color: ${color}"></i>`;
  const ico = divIcon({className: 'leaflet-fa-marker-icon', html: divHtml});
  return marker(latlng, {icon: ico, ...style});
}

function createCustomCircleMarker(latlng: LatLng, style: MarkerStyle): CircleMarker {
  return circleMarker(latlng, style);
}

export function createMarker(feature: Feature, latlng: LatLng): Marker | CircleMarker {
  if (feature.properties.style) {
    const style = feature.properties.style;
    if (style.faIcon) {
      return createCustomIconMarker(latlng, style);
    } else {
      if (feature.featureType() === 'image') {
        return createCustomImageMarker(latlng, style);
      } else if (feature.featureType() === 'collection') {
        return createCustomCollectionMarker(latlng, style);
      } else if (feature.featureType() === 'video') {
        return createCustomVideoMarker(latlng, style);
      } else {
        return createCustomCircleMarker(latlng, style);
      }
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
