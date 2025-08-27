// types/esri-metadata.ts

export interface SpatialReference {
  wkid: number;
  latestWkid?: number;
}

export interface LOD {
  level: number;
  resolution: number;
  scale: number;
}

/**
 * Minimal Esri TileInfo interface.
 * Only includes the LODs array which is used for zoom level extraction.
 *
 * NOTE: Complete extent responses may include additional properties.
 */
export interface TileInfoProperties {
  lods?: LOD[];
}

/**
 * Minimal Esri Extent interface.
 * Only includes properties used for bounds checking and coordinate conversion.
 *
 * NOTE: Complete extent responses may include additional properties.
 */
export interface ExtentProperties {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  spatialReference?: SpatialReference;
}

/**
 * Minimal Esri metadata interface for tiled map layers.
 * Only includes properties actually used in the component.
 *
 * NOTE: This is an incomplete type definition.
 */
export interface EsriMetadata {
  name?: string;

  // Service-specified tile availability limits (preferred over LOD range)
  minLOD?: number;
  maxLOD?: number;

  // Used for extracting zoom levels (LODs)
  tileInfo?: TileInfoProperties;

  // Used for fitting map bounds (preferring fullExtent over initialExtent)
  fullExtent?: ExtentProperties;
  initialExtent?: ExtentProperties;
}
