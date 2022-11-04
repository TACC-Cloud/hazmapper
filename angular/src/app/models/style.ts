import {PathOptions, MarkerOptions} from 'leaflet';

export interface MarkerStyle extends PathOptions, MarkerOptions {
  faIcon?: string;
  radius?: number;
}
