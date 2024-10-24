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
export abstract class Feature {
  /**
   * The unique identifier of the feature.
   */
  abstract id: number;
  /**
   * The identifier of the project that the feature belongs to.
   */
  abstract project_id: number;
  /**
   * The type of the GeoJSON object, which should always be `"Feature"`.
   */
  abstract type: string;
  /**
   * The geometry of the feature, represented as a GeoJSON Point object with coordinates in longitude and latitude.
   */
  abstract geometry: Geometry;
  /**
   * Additional properties associated with the feature, represented as a generic object.
   */
  abstract properties: GeoJsonProperties;
  /**
   * Additional styles associated with the feature, represented as a generic object.
   */
  abstract styles: any;
  /**
   * An array of assets associated with the feature, represented as an array of objects with `id`, `path`, `uuid`, `asset_type`, `original_path`, `original_name`, and `display_path` properties.
   */
  abstract assets: Asset[];

  /**
   * Returns the type of the feature based on its assets and geometry.
   */
  featureType(): FeatureType {
    if (this.assets.length === 1) {
      /* If there is only one asset, returns the type of that asset (i.e. "image", "video", "point_cloud", or "streetview".)*/
      return this.assets[0].asset_type;
    } else if (this.assets.length > 1) {
      /* multiple assets */
      return 'collection';
    } else {
      /* else we rely on geojson geometry type */
      return this.geometry.type;
    }
  }
}

export class FeatureClass extends Feature {
  constructor(
    public id: number,
    public project_id: number,
    public type: string,
    public geometry: Geometry,
    public properties: any,
    public styles: any,
    public assets: Asset[]
  ) {
    super();
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
