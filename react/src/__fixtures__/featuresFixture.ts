import { Point } from 'geojson';
import { FeatureCollection, AssetType } from '@hazmapper/types';

export const featureCollection: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      id: 1,
      project_id: 80,
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-80.780375, 32.6185055555556],
      } as Point,
      properties: {},
      styles: {},
      assets: [
        {
          id: 2036568,
          path: '80/f7c2afa2-f184-40a7-80be-0874a7db755e.jpeg',
          uuid: 'f7c2afa2-f184-40a7-80be-0874a7db755e',
          asset_type: 'image' as AssetType,
          original_path: '/foo/image1.JPG',
          original_name: null,
          display_path: '/foo/image1.JPG',
        },
      ],
    },
    {
      id: 2,
      project_id: 80,
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-80.780375, 32.6185055555556],
      } as Point,
      properties: {},
      styles: {},
      assets: [
        {
          id: 2036569,
          path: '80/5a3e7513-2740-4c0f-944d-7b497ceff2ea.jpeg',
          uuid: '5a3e7513-2740-4c0f-944d-7b497ceff2ea',
          asset_type: 'image' as AssetType,
          original_path: '/foo/image2.JPG',
          original_name: null,
          display_path: '/foo/image2.JPG',
        },
      ],
    },
  ],
};

export const featureCollectionWithNestedPaths: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      id: 1,
      project_id: 1,
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] } as Point,
      properties: {},
      styles: {},
      assets: [
        {
          id: 1,
          display_path: 'folder1/file1.jpg',
          path: '',
          uuid: '',
          asset_type: 'image' as AssetType,
          original_path: '',
          original_name: null,
        },
      ],
    },
    {
      id: 2,
      project_id: 1,
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [0, 0] } as Point,
      properties: {},
      styles: {},
      assets: [
        {
          id: 2,
          display_path: 'folder1/subfolder/file2.rq',
          path: '',
          uuid: '',
          asset_type: 'questionnaire' as AssetType,
          original_path: '',
          original_name: null,
        },
      ],
    },
  ],
};
