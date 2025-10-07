import { TileServerLayer } from '@hazmapper/types';

const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

export const resolveTileUrl = (layer: TileServerLayer, geoapiUrl: string) => {
  // If it's a COG, construct TiTiler URL
  if (layer.kind === 'cog') {
    const fileUrl = layer.internal ? `file://${layer.url}` : layer.url;

    const encodedUrl = encodeURIComponent(fileUrl);

    return `${geoapiUrl}/tiles/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodedUrl}`;
  }

  // For other internal layers, prefix with geoapiUrl
  if (layer.internal) {
    // Note: not currently supported; only supporting internal cog at moment
    return joinUrl(geoapiUrl, layer.url);
  }

  return layer.url;
};
