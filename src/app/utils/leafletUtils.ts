import {CircleMarker, circleMarker, divIcon, LatLng, Marker, marker} from "leaflet";
import {Feature} from "../models/models";



function createCircleMarker (feature: Feature, latlng: LatLng): CircleMarker {
  let options = {
    radius: 8,
    fillColor: "#d3d3d3",
    color: "black",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };
  return circleMarker( latlng, options );
}

function createImageMarker (feature: Feature, latlng: LatLng): Marker {
  let asset = feature.assets[0];
  // let divHtml = `<a href="${asset.path}.jpeg" target="_blank"> <img src="${asset.path}.thumb.jpeg" width="50px" height="50px"></a>`;
  let divHtml = `<img src="/api/${asset.path}.thumb.jpeg" width="50px" height="50px">`;

  let ico = divIcon({className: 'img-marker', html: divHtml});
  return marker(latlng, {icon: ico});
}

function createCollectionMarker (feature: Feature, latlng: LatLng) : Marker {
  let divHtml = '<i class="fa fa-folder-open"></i>';
  let ico = divIcon({className: 'icon-marker', html: divHtml});
  return marker(latlng, {icon: ico});
}


export function createMarker(feature: Feature, latlng: LatLng) : Marker {
  let marker;
  if (feature.featureType() == 'image') {
    marker = createImageMarker(feature, latlng);
  } else if (feature.featureType() == 'collection'){
    marker =  createCollectionMarker(feature, latlng);
  }
  else {
    marker = createCircleMarker(feature, latlng)
  }
  return marker;

}
