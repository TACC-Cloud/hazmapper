import {Feature as GeoJSONFeature,
  GeoJsonProperties,
  Geometry,
  FeatureCollection as IFeatureCollection } from 'geojson';


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

  toJson() {
    return {
      assetType: this.assetType,
      bbox: this.bbox
    };
  }

}


export interface Project {
  description: string;
  id?: number;
  name: string;
  uuid?: string;
}

export class Project implements Project {

}

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

  static fromExpiresIn(token: string, expires_in: number) {
    const expires = new Date(new Date().getTime() + expires_in * 1000);
    return new AuthToken(token, expires);
  }

  /**
   * Checks if the token is expired or not
   */
  public isExpired(): boolean {
    if (this.expires) {
      return new Date().getTime() > this.expires.getTime();
    } else {
      return false;
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
    if (this.assets &&
        this.assets.length === 1) {
      return this.assets[0].asset_type;
    }

    if (this.assets &&
        this.assets.length > 1) {
      return 'collection';
    }

    if (this.assets &&
      !this.assets.length) {
      return this.geometry.type;
    }



  }
}

export interface DesignSafeProject {
  uuid: string;
  value: any;
}

export interface DesignSafeProjectCollection {
  projects: DesignSafeProject[];
}
