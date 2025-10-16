import { TileServerLayer } from '@hazmapper/types';

const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

export const resolveTileUrl = (layer: TileServerLayer, geoapiUrl: string) => {
  // If it's a COG, construct TiTiler URL
  if (layer.internal && layer.kind === 'cog') {
    const fileUrl = `file://${layer.url}`;
    const encodedUrl = encodeURIComponent(fileUrl);

    // Build base URL
    let tileUrl = `${geoapiUrl}/tiles/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodedUrl}`;

    // Append renderOptions if they exist
    if (layer.uiOptions.renderOptions) {
      const renderParams = new URLSearchParams(
        layer.uiOptions.renderOptions as Record<string, string>
      );
      tileUrl += `&${renderParams.toString()}`;
    }

    return tileUrl;
  }

  // For other internal layers, prefix with geoapiUrl
  if (layer.internal) {
    // Note: not currently supported; only supporting internal cog at moment
    return joinUrl(geoapiUrl, layer.url);
  }

  if (layer.url.includes('{ext}')) {
    return layer.url.replace('{ext}', 'png'); //default to png
  }

  return layer.url;
};
