import {TileServer} from '../models/models';

export const defaultTileServers: ReadonlyArray<TileServer> = [
  {
    name: 'Roads',
    type: 'tms',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    uiOptions: {
      opacity: 1,
      isActive: true,
      showDescription: false,
      showInput: false
    },
    tileOptions: {
      minZoom: 0,
      maxZoom: 19
    },
  },
  {
    name: 'Satellite',
    type: 'tms',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    uiOptions: {
      opacity: 1,
      isActive: true,
      showDescription: false,
      showInput: false
    },
    tileOptions: {
      minZoom: 0,
      maxZoom: 19
    },
  }
] as const;

export const suggestedTileServers: ReadonlyArray<TileServer> = [] as const;
