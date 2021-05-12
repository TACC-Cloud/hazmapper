import { FeatureCollection } from 'geojson';

// TODO: Get correct api
export type GoogleUser = any;

export interface StreetviewAuthentication {
  google: boolean;
  mapillary: boolean;
};

export interface StreetviewTokens {
  google: string;
  mapillary: string;
};

export interface StreetviewUser {
  username: string;
};

export interface Streetview {
  id: number;
  user_id: number;
  path?: string;
  system_id?: number;
  sequences?: Array<StreetviewSequence>;
};

export interface StreetviewSequence {
  id: number;
  streetview_id: number;
  service: string;
  start_date?: Date;
  end_date?: Date;
  bbox?: string;
  sequence_key?: string;
};

export interface MapillaryUser {
  avatar: string;
  created_at: Date;
  email: string;
  key: string;
  username: string;
};

export interface MapillaryImageSearchCallback {
  (data: FeatureCollection): void;
};
