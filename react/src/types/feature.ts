import { GeoJsonProperties, Geometry } from 'geojson';

// Define asset types from GeoApi
export type AssetType =
  | 'image'
  | 'video'
  | 'questionnaire'
  | 'point_cloud'
  | 'streetview';

// Define all possible geometry types from GeoJSON (e.g.  "Point", "MultiPoint", "Polygon" etc)
export type GeoJSONGeometryType = Geometry['type'];

// Combined feature type that includes all possibilities for a feature
export type FeatureType = AssetType | GeoJSONGeometryType | 'collection';

export type FeatureTypeNullable = FeatureType | undefined;

/**
 * Asset of a feature
 */
export interface Asset {
  id: number;
  path: string;
  uuid: string;
  asset_type: AssetType;
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

/**
 * Returns the type of the feature based on its assets and geometry.
 */
export function getFeatureType(feature: Feature): FeatureType {
  if (feature.assets.length === 1) {
    /* If there is only one asset, returns the type of that asset (i.e. "image", "video", "point_cloud", or "streetview".)*/
    return feature.assets[0].asset_type;
  } else if (feature.assets.length > 1) {
    /* multiple assets */
    return 'collection';
  } else {
    /* else we rely on geojson geometry type */
    return feature.geometry.type;
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
  featureType: FeatureTypeNullable;
  children?: FeatureFileNode[];
}
