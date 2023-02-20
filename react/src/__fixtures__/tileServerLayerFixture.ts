export const tileServerLayers = [
  {
    id: 134,
    name: 'Roads',
    type: 'tms',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tileOptions: {
      maxZoom: 24,
      minZoom: 0,
      maxNativeZoom: 19,
    },
    uiOptions: {
      zIndex: 0,
      opacity: '0.8',
      isActive: true,
      showInput: false,
      showDescription: true,
    },
  },
  {
    id: 133,
    name: 'Satellite',
    type: 'tms',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    tileOptions: {
      maxZoom: 24,
      minZoom: 0,
      maxNativeZoom: 19,
    },
    uiOptions: {
      zIndex: 1,
      opacity: .5,
      isActive: true,
      showInput: false,
      showDescription: false,
    },
  },
];
