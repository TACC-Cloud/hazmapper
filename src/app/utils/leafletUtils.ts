import {CircleMarker, Path, circleMarker, divIcon, LatLng, Marker, marker} from 'leaflet';
import {Feature} from '../models/models';
import {MarkerStyle} from '../models/style';
import { assetStyles } from 'src/app/constants/styles';

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

export function setMarkerStyle(layer: any, active: boolean) {
  // const custom = layer.feature.properties.customStyle;
  const custom = layer.feature.properties.style;
  const featureType = layer.feature.featureType();
  let icon = null;
  if (featureType === 'Point' && custom && custom.faIcon) {
    icon = custom.faIcon;
  } else {
    if (featureType === 'video') {
      icon = 'fa-video';
    } else if (featureType === 'image') {
      icon = 'fa-camera-retro'
    }
  }

  const color = active
    ? assetStyles.active.color
    : (custom
      ? custom.color
      : assetStyles.default.color);

  if (icon) {
    const divHtml = `<i style="color: ${color}" class="fas ${icon} fa-2x"></i>`;
    layer.setIcon(divIcon({
      html: divHtml,
      className: 'leaflet-fa-marker-icon'
    }));
  } else {
    layer.setStyle({fillColor: color, color});
  }
}

export function createMarker(feature: Feature, latlng: LatLng): Marker | CircleMarker {
  if (feature.properties.style || feature.properties.defaultStyle) {
    const style = feature.properties.style
      ? feature.properties.style
      : feature.properties.defaultStyle;
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
