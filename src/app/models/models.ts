import {Feature as GeoJSONFeature,
  GeoJsonProperties,
  Geometry,
  FeatureCollection as IFeatureCollection } from 'geojson';


// TODO: break these out into their own files

export class AssetFilters {

  // bbox has the following format: [sw_lng, sw_lat, ne_lng, ne_lat], the same as leaflet
  bbox: Array<number> = [];
  assetType: Set<string> = new Set<string>();

  updateAssetTypes(assetType: string) {
    this.assetType.has(assetType) ? this.assetType.delete(assetType) : this.assetType.add(assetType);
  }

  updateBBox(bbox: Array<number>): void {
    this.bbox = bbox;
  }

  toJson() {
    return {
      assetType: [...this.assetType],
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
  constructor(token: string, expires: Date) {
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
    return new Date().getTime() > this.expires.getTime();
  }
}


export interface FeatureAsset {
  id: number;
  path: string;
  uuid: string;
  feature_id: number;
  asset_type: string;
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
}

interface AppGeoJSONFeature extends GeoJSONFeature {
  assets?: Array<FeatureAsset>;
  styles?: FeatureStyles;
  featureSource?: string;
  featureType?(): string;
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
  assets?: Array<FeatureAsset>;
  styles?: FeatureStyles;

  constructor(f: AppGeoJSONFeature) {
    this.geometry = f.geometry;
    this.properties = f.properties;
    this.id = f.id;
    this.type = f.type;
    this.assets = f.assets;
    this.styles = f.styles;
  }



  featureType(): string {
    if (this.assets &&
        this.assets.length === 1) {
      return this.assets[0].asset_type;
    }

    if (this.assets &&
        this.assets.length > 1) {
      return 'collection';
    }

    if (!this.assets.length) {
      return this.geometry.type;
    }



  }
}
