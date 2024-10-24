import { Point } from 'geojson';
import { FeatureCollection, FeatureClass, AssetType } from '@hazmapper/types';

const rawFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      id: 2053334,
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
          original_path: '/nathanf/image1.JPG',
          original_name: null,
          display_path: '/nathanf/image1.JPG',
        },
      ],
    },
    {
      id: 2053335,
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
          original_path: '/nathanf/image1.JPG',
          original_name: null,
          display_path: '/nathanf/image1.JPG',
        },
      ],
    },
  ],
};

export const featureCollection: FeatureCollection = {
  type: rawFeatureCollection.type,
  features: rawFeatureCollection.features.map(
    (f) =>
      new FeatureClass(
        f.id,
        f.project_id,
        f.type,
        f.geometry,
        f.properties,
        f.styles,
        f.assets
      )
  ),
};

export const rawFeatureCollectionWithNestedPaths = {
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

export const featureCollectionWithNestedPaths: FeatureCollection = {
  type: rawFeatureCollectionWithNestedPaths.type,
  features: rawFeatureCollectionWithNestedPaths.features.map(
    (f) =>
      new FeatureClass(
        f.id,
        f.project_id,
        f.type,
        f.geometry,
        f.properties,
        f.styles,
        f.assets
      )
  ),
};
