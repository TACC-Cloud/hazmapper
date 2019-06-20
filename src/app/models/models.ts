import {Feature as GeoJSONFeature,
  GeoJsonProperties,
  Geometry,
  FeatureCollection as IFeatureCollection } from "geojson";

export class AuthToken {
  token : string;
  expires:  Date;

  /**
   *
   * @param token : String
   * @param expires : Number
   */
  constructor(token: string, expires: number) {
    this.token = token;
    this.expires = new Date(new Date().getTime() + expires * 1000)
  }

  static fromJSON(token: string, expires: string) {
    // let expires : Date = new Date(expires);
  }

  /**
   * Checks if the token is expired or not
   */
  public isExpired() : boolean {
    return new Date().getTime() < this.expires.getTime();
  }
}


export class User {

}


export interface FeatureAsset {
  id: number
  path: string
  uuid: string
  feature_id: number
  asset_type: string
}

interface FeatureStyles {
  [key: string]: string | number
}

export interface Project {
  description: string
  id: number
  name: string
  uuid: string
}

export interface Overlay {
  id: number
  path: string
  uuid: string
  minLon: number
  minLat: number
  maxLon: number
  maxLat: number
  project_id: number
  label: string
}

interface AppGeoJSONFeature extends GeoJSONFeature {
  assets?: Array<FeatureAsset>
  styles?: FeatureStyles
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



  featureType?(): String {
    if (this.assets &&
        this.assets.length == 1) {
      return this.assets[0].asset_type
    }

    if (this.assets &&
        this.assets.length > 1) {
      return 'collection'
    }

    if (!this.assets.length) {
      return this.geometry.type;
    }



  }
}
