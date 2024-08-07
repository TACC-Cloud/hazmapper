import { Feature as GeoJSONFeature, GeoJsonProperties, Geometry, FeatureCollection as IFeatureCollection } from 'geojson';

// TODO: break these out into their own files

export interface IFileImportRequest {
  system_id: string;
  path: string;
}

export interface ITask {
  id: number;
  status: string;
  description: string;
}

export interface IPointCloud {
  id: number;
  description: string;
  conversion_parameters: string;
  feature_id?: number;
  task: ITask;
  project_id: number;
  files_info: string;
}

export class AssetFilters {
  // bbox has the following format: [sw_lng, sw_lat, ne_lng, ne_lat], the same as leaflet
  bbox: Array<number> = [];
  assetType = '';

  constructor(assetType?: string) {
    this.assetType = assetType;
  }

  toJson() {
    return {
      assetType: this.assetType,
      bbox: this.bbox,
    };
  }
}

export interface Project {
  description: string;
  id?: number;
  name: string;
  ds_id?: string;
  title?: string;
  uuid?: string;
  public?: boolean;
  system_file?: string;
  system_id?: string;
  system_path?: string;
  deletable?: boolean;
  deleting?: boolean;
  deletingFailed?: boolean;
  streetview_instances?: any;
}

export class Project implements Project {}

export interface ProjectRequest {
  name: string;
  description: string;
  public: boolean;
  system_file: string;
  system_id: string;
  system_path: string;
  watch_content: boolean;
  watch_users: boolean;
}

export class ProjectRequest implements ProjectRequest {}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  public?: boolean;
}

export class ProjectUpdateRequest implements ProjectUpdateRequest {}

export class AuthToken {
  token: string;
  expires: Date;
  /**
   *
   * @param token : String
   * @param expires: Date
   */
  constructor(token: string, expires?: Date) {
    this.token = token;
    this.expires = new Date(expires);
  }

  /** Creates an AuthToken instance from a token and an expiration time in seconds. */
  static fromExpiresIn(token: string, expires_in: number) {
    const expires = new Date(new Date().getTime() + expires_in * 1000);
    return new AuthToken(token, expires);
  }

  /**
   * Checks if the token is expired or not.
   * A 5 minute buffer is used to consider a token as expired slightly before its actual expiration time.
   * @returns True if the token is expired, false otherwise.
   */
  public isExpired(): boolean {
    const buffer = 300000; // 5 minutes in milliseconds
    if (this.expires) {
      // Subtract buffer from the expiration time and compare with the current time
      return new Date().getTime() > this.expires.getTime() - buffer;
    } else {
      // If expires is not set, consider the token as not expired
      return false; // TODO_V3 this affects the streetview token; should be confirmed or refactored.
    }
  }
}

export interface IFeatureAsset {
  id: number;
  path: string;
  uuid: string;
  feature_id: number;
  asset_type: string;
  display_path: string;
}

export class FeatureAsset implements IFeatureAsset {
  id: number;
  path: string;
  uuid: string;
  feature_id: number;
  asset_type: string;
  display_path: string | null;
}

interface FeatureStyles {
  [key: string]: string | number;
}

export interface Overlay {
  id: number;
  path: string;
  uuid: string;
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
  project_id: number;
  label: string;
  isActive?: boolean;
}

export interface QMSTile {
  name: string;
  type: string;
  url: string;
  desc: string;
  z_max: number;
  z_min: number;
  layers: string;
  params: string;
  format: string;
}

interface TileServerUI {
  opacity: number;
  isActive: boolean;
  zIndex?: number;
  showDescription?: boolean;
  showInput?: boolean;
}

interface TileServerOptions {
  // TMS options
  minZoom?: number;
  maxZoom?: number;
  maxNativeZoom?: number;

  // WMS options
  layers?: string;
  params?: string;
  format?: string;
}

export interface TileServer {
  name: string;
  id?: number;
  project_id?: number;
  type: string;
  url: string;
  attribution: string;

  tileOptions?: TileServerOptions;
  uiOptions?: TileServerUI;
}

interface AppGeoJSONFeature extends GeoJSONFeature {
  assets?: Array<IFeatureAsset>;
  styles?: FeatureStyles;
  project_id?: number;
  // featureType?(): String
}

export class FeatureCollection implements IFeatureCollection {
  features: Feature[];
  type: any;
}

export class Feature implements AppGeoJSONFeature {
  geometry: Geometry;
  properties: GeoJsonProperties;
  id?: string | number;
  type: any;
  assets?: Array<IFeatureAsset>;
  styles?: FeatureStyles;
  project_id?: number;

  constructor(f: AppGeoJSONFeature) {
    this.geometry = f.geometry;
    this.properties = f.properties;
    this.id = f.id;
    this.type = f.type;
    this.assets = f.assets;
    this.styles = f.styles;
    this.project_id = f.project_id;
  }

  featureType?(): string {
    if (this.assets && this.assets.length === 1) {
      return this.assets[0].asset_type;
    }

    if (this.assets && this.assets.length > 1) {
      return 'collection';
    }

    if (this.assets && !this.assets.length) {
      return this.geometry.type;
    }
  }
}

export interface DesignSafeProject {
  uuid: string;
  value: any;
}

export interface DesignSafeProjectCollection {
  result: DesignSafeProject[];
}
