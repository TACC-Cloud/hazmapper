import { parseEsriMetadata } from './esriTileMetaData';
import type { EsriMetadata } from '@hazmapper/types/esri';
import { esriTileServerMetadata } from '@hazmapper/__fixtures__/esriTileServierFixtures';

describe('parseEsriMetadata', () => {
  test('returns zoomLevels and bounds when LODs and extent exist', () => {
    const result = parseEsriMetadata(
      esriTileServerMetadata,
      'https://example.com/MapServer'
    );

    expect(result.zoomLevels).toEqual({
      minNativeZoom: 12,
      maxNativeZoom: 22,
    });
    expect(result.bounds!.toBBoxString()).toEqual(
      '-121.5816952786329,39.774885163173295,-121.58009606208665,39.776622200094344'
    );
  });

  test('returns zoomLevels but no bounds when extent is missing', () => {
    // Arrange: metadata has LODs but no extent
    const metadata: EsriMetadata = {
      name: 'No Bounds Layer',
      tileInfo: {
        lods: [
          { level: 10, resolution: 1, scale: 1 },
          { level: 20, resolution: 0.25, scale: 0.5 },
        ],
      },
      // fullExtent: undefined
      // initialExtent: undefined
    };

    const result = parseEsriMetadata(metadata, 'https://example.com/MapServer');

    // Assert
    expect(result.zoomLevels).toEqual({
      minNativeZoom: 10,
      maxNativeZoom: 20,
    });
    expect(result.bounds).toBeUndefined();
  });

  test('missing LOD info (and no minLOD/maxLOD) → no zoomLevels, no bounds', () => {
    // Arrange: metadata has neither minLOD/maxLOD nor tileInfo.lods
    const metadata: EsriMetadata = {
      name: 'No Zoom Info Layer',
      // tileInfo: undefined
      // minLOD/maxLOD: undefined
      // no extents
    };

    const result = parseEsriMetadata(metadata, 'https://example.com/MapServer');

    expect(result.zoomLevels).toEqual({});
    expect(result.bounds).toBeUndefined();
  });
});
