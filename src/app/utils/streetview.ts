import { LatLng } from 'leaflet';

export const streetviewAssetStyles = {
  instance: {
    sequence: {
      default: {
        fill: false,
        weight: 10,
        color: '#004aff',
        opacity: 0.7
      },
      select: {
        fill: false,
        weight: 10,
        color: '#ee3a89',
        opacity: 1
      },
      hover: {
        fill: false,
        weight: 10,
        color: '#ee3a89',
        opacity: 0.7
      }
    },
    image: {
      default: {
        fill: false,
        weight: 1,
        color: '#ee3a89',
        opacity: 0.7
      },
      select: {
        fill: false,
        weight: 1,
        color: '#004aff',
        opacity: 1
      },
      hover: {
        fill: false,
        weight: 1,
        color: '#004aff',
        opacity: 0.7
      }
    }
  },
  sequence: {
    default: {
      fill: false,
      weight: 10,
      color: '#05cb63',
      opacity: 0.6
    },
    select: {
      fill: false,
      weight: 12,
      color: '#cb5905',
      opacity: 1
    },
    hover: {
      fill: false,
      weight: 12,
      color: '#f37916',
      opacity: 0.8
    }
  },
  feature: {
    default: {
      fill: false,
      weight: 10,
      color: '#22C7FF',
      opacity: 0.6
    },
    select: {
      fill: false,
      weight: 12,
      color: '#22C7FF',
      opacity: 1
    },
    hover: {
      fill: false,
      weight: 12,
      color: '#22C7FF',
      opacity: 0.8
    }
  },
  image: {
    default: {
      fill: false,
      weight: 1,
      color: '#00bcff',
      opacity: 0.9
    },
    select: {
      fill: false,
      weight: 1,
      color: '#ffffff',
      opacity: 1
    },
    hover: {
      fill: false,
      weight: 1,
      color: '#ffffff',
      opacity: 0.8
    }
  }
};

export function getFeatureSequenceGeometry(feature: any) {
  const geometry = feature.geometry;
  const [coordinates] = geometry.coordinates;
  const [lat, lng] = coordinates;
  const latlng = new LatLng(lat, lng);
  return latlng;
}

export function getFeatureSequenceId(feature: any) {
  const [featureAsset] = feature.assets;
  const displayPath = featureAsset.display_path;
  const sequenceId = displayPath.split("/").pop();
  return sequenceId;
}

export function getFeatureSequencePath(feature: any) {
  const [featureAsset] = feature.assets;
  return featureAsset.path;
}
