export interface StreetviewOrganization {
  id?: number;
  streetview_id?: number;
  name?: string;
  slug?: string;
  key?: string;
}

export interface StreetviewSequence {
  id: number;
  streetview_instance_id?: number;
  start_date?: Date;
  end_date?: Date;
  bbox?: string;
  sequence_id?: string;
  organization_id?: string;
}

export interface StreetviewInstance {
  id: number;
  streetview_id?: number;
  path?: string;
  system_id?: number;
  sequences?: Array<StreetviewSequence>;
}

export interface StreetviewServiceUserConnection {
  id: number;
  user_id: number;
  token?: string;
  token_expires_at?: string;
  service?: string;
  service_user?: string;
  organizations?: Array<StreetviewOrganization>;
  instances?: Array<StreetviewInstance>;
}

export type MapillaryUserConnection = StreetviewServiceUserConnection;
