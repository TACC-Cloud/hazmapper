import { FeatureCollection } from 'geojson';

export interface StreetviewAuthentication {
  google: boolean;
  mapillary: boolean;
}

export interface StreetviewTokens {
  google: string;
  mapillary: string;
}

export interface StreetviewUser {
  username: string;
}

export interface StreetviewUser {
  username: string;
}

export interface StreetviewRequest {
  token?: string;
  service?: string;
  service_user?: string;
}

export interface Streetview {
  id: number;
  user_id: number;
  token?: string;
  service?: string;
  service_user?: string;
  organizations?: Array<StreetviewOrganization>;
  instances?: Array<StreetviewInstance>;
}

export interface StreetviewOrganization {
  id?: number;
  streetview_id?: number;
  name?: string;
  key?: string;
}

export interface StreetviewInstance {
  id: number;
  streetview_id?: number;
  path?: string;
  system_id?: number;
  sequences?: Array<StreetviewSequence>;
}

export interface StreetviewSequence {
  id: number;
  streetview_instance_id?: number;
  start_date?: Date;
  end_date?: Date;
  bbox?: string;
  sequence_id?: string;
}
