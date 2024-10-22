import { GeoJsonProperties, Geometry } from 'geojson';

/**
 * Asset of a feature
 */
export interface Asset {
  id: number;
  path: string;
  uuid: string;
  /**
   * The type of asset, such as "image", "video", "point_cloud", or "streetview".
   */
  asset_type: string;
  original_path: string;
  original_name: string | null;
  display_path: string;
}

/**
 * Geoapi feature which is a GeoJSON Feature object with additional `id`, `project_id`, `properties`, `styles`, and `assets` properties.
 */
export interface Feature {
  /**
   * The unique identifier of the feature.
   */
  id: number;
  /**
   * The identifier of the project that the feature belongs to.
   */
  project_id: number;
  /**
   * The type of the GeoJSON object, which should always be `"Feature"`.
   */
  type: string;
  /**
   * The geometry of the feature, represented as a GeoJSON Point object with coordinates in longitude and latitude.
   */
  geometry: Geometry;
  /**
   * Additional properties associated with the feature, represented as a generic object.
   */
  properties: GeoJsonProperties;
  /**
   * Additional styles associated with the feature, represented as a generic object.
   */
  styles: any;
  /**
   * An array of assets associated with the feature, represented as an array of objects with `id`, `path`, `uuid`, `asset_type`, `original_path`, `original_name`, and `display_path` properties.
   */
  assets: Asset[];
}

export class FeatureClass implements Feature {
  constructor(
    public id: number,
    public project_id: number,
    public type: string,
    public geometry: Geometry,
    public properties: any,
    public styles: any,
    public assets: Asset[]
  ) {}

  /**
   * Returns the type of the feature based on its assets and geometry.
   * If there are no assets, returns the type of the feature's geometry.
   * If there is only one asset, returns the type of that asset (i.e. "image", "video", "point_cloud", or "streetview".)
   * If there are multiple assets, returns "collection".
   * If there are no assets or geometry, returns "unknown".
   *
   * @returns The type of the feature as a string.
   */
  featureType(): string {
    if (this.assets.length === 1) {
      return this.assets[0].asset_type;
    } else if (this.assets.length > 1) {
      return 'collection';
    } else {
      return this.geometry.type;
    }
  }
}

/**
 * Collection of features in Geoapi is a GeoJSON FeatureCollection object that contains an array of Feature objects.
 */
export interface FeatureCollection {
  /**
   * The type of the GeoJSON object, which should always be `"FeatureCollection"`.
   */
  type: string;
  /**
   * An array of Feature objects.
   */
  features: Feature[];
}

/**
 *  Features/file abstraction for feature file tree representation
 */
export interface FeatureFileNode {
  nodeId: string /* feature id if feature; path if directory node */;
  name: string;
  isDirectory: boolean;
  children?: FeatureFileNode[];
}
