import {TileServer} from '../models/models';

export const defaultTileServers: ReadonlyArray<TileServer> = [
  {
    name: 'Roads',
    id: 0,
    type: 'tms',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 0,
    maxZoom: 19,

    zIndex: 0,
    opacity: 1,
    isActive: true,

    showDescription: false,
    showInput: false
  },
  {
    name: 'Satellite',
    id: 1,
    type: 'tms',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
    minZoom: 0,

    zIndex: 1,
    opacity: 1,
    isActive: false,

    showDescription: false,
    showInput: false
  }
] as const;

export const suggestedTileServers: ReadonlyArray<TileServer> = [] as const;
