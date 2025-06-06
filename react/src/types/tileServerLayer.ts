import { WMSParams } from 'leaflet';

/**
 * Represents a tile server layer, with its metadata and options.
 */
export interface TileServerLayer {
  /** The unique identifier of the layer. */
  id: number;
  /** The name of the layer. */
  name: string;
  /** The type of the layer. */
  type: string;
  /** The URL template of the layer. */
  url: string;
  /** The attribution text of the layer. */
  attribution: string;
  /** The tile options of the layer. */
  tileOptions: {
    /** The maximum zoom level of the layer. */
    maxZoom?: number;
    /** The minimum zoom level of the layer. */
    minZoom?: number;
    /** The maximum native zoom level of the layer. */
    maxNativeZoom?: number;
    /** The format of the layer. */
    format?: string;
    /** Comma-separated list of layers. */
    layers?: string;
    /** The params for the layer. */
    params?: WMSParams;
  };
  /** The user interface (UI) options of the layer. */
  uiOptions: {
    /** The z-index of the layer. */
    zIndex: number;
    /** The opacity of the layer. */
    opacity: number;
    /** Whether the layer is active or not. */
    isActive: boolean;
    /** Whether to show an input for the layer or not. */
    showInput?: boolean;
    /** Whether to show the description of the layer or not. Note: handles if opacity ui is shown */
    showDescription?: boolean;
  };
}

export type TLayerOptionsFormData = {
  tileLayers: {
    layer: TileServerLayer;
  }[];
};
