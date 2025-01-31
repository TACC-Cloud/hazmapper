import { GeoJsonProperties, Geometry } from 'geojson';

// Create the constant object for AssetType
export const AssetType = {
  Image: 'image',
  Video: 'video',
  Questionnaire: 'questionnaire',
  PointCloud: 'point_cloud',
  Streetview: 'streetview',
} as const;

export type AssetType = (typeof AssetType)[keyof typeof AssetType];

export type GeoJSONGeometryType = Geometry['type'];

// Define all possible geometry types from GeoJSON
const createGeoJSONTypes = () => {
  const types: Record<GeoJSONGeometryType, GeoJSONGeometryType> = {
    Point: 'Point',
    MultiPoint: 'MultiPoint',
    LineString: 'LineString',
    MultiLineString: 'MultiLineString',
    Polygon: 'Polygon',
    MultiPolygon: 'MultiPolygon',
    GeometryCollection: 'GeometryCollection',
  };
  return types;
};

export const FeatureType = {
  // GeoJSON types
  ...createGeoJSONTypes(),

  // Asset types
  ...AssetType,

  // Collection type (i.e., more than 1 asset;
  // not used/created in frontend but possible to create using Geoapi)
  Collection: 'collection',
} as const;

export type FeatureType = (typeof FeatureType)[keyof typeof FeatureType];

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
 * A GeoAPI Feature extends a GeoJSON Feature with some additions.
 *
 * From GeoJSON standard (https://geojson.org/):
 * • type
 * • geometry
 * * properties
 *
 * Additons for GeoAPI/hazmapper:
 * • id
 * • project_id
 * • styles
 * • assets
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
    /* If there is only one asset, returns the type of that asset (i.e. AssetType: "image", "video", "point_cloud", or "streetview".)*/
    return feature.assets[0].asset_type;
  } else if (feature.assets.length > 1) {
    /* multiple assets */
    return FeatureType.Collection;
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
export interface QuestionnaireAsset {
  filename: string;
  coordinates: any;
  path: string;
  previewPath: string;
}
export interface IFileImportRequest {
  system_id: string;
  path: string;
}
