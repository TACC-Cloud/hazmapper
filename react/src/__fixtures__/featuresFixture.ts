import { Point } from 'geojson';
import { FeatureCollection, AssetType, Feature } from '@hazmapper/types';

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

export const featureCollectionWithDuplicateImages: FeatureCollection = {
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
          id: 2036562,
          path: '80/f7c2afa2-f184-40a7-80be-0874a7db755e.jpeg',
          uuid: 'f7c2afa2-f184-40a7-80be-0874a7db755e',
          asset_type: 'image' as AssetType,
          original_path: '/image1.JPG',
          original_name: null,
          display_path: '/image1.JPG',
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
          id: 2036568,
          path: '80/f7c2afa2-f184-40a7-80be-0874a7db755e.jpeg',
          uuid: 'f7c2afa2-f184-40a7-80be-0874a7db755e',
          asset_type: 'image' as AssetType,
          original_path: '/image1.JPG',
          original_name: null,
          display_path: '/image1.JPG',
        },
      ],
    },
    {
      id: 3,
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
          original_path: '/folder1/image1.JPG',
          original_name: null,
          display_path: '/folder1/image1.JPG',
        },
      ],
    },
    {
      id: 4,
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
          original_path: '/folder1/image1.JPG',
          original_name: null,
          display_path: '/folder1/image1.JPG',
        },
      ],
    },
  ],
};

export const mockImgFeature: Feature = {
  id: 10000,
  project_id: 100,
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [-97.726075437, 30.389785554],
  },
  properties: {
    path: '/test/test/Photo 4.jpg',
    title: 'Photo 4',
    units: '',
    format: 'jpg',
    system: 'project-11111-242ac11c-0001-012',
    _author: 'Test',
    basePath: '/test/test',
    data_type: 'image',
    _timestamp: 1558449670.0902429,
    misc_notes: '',
    description: 'Words',
    geoid_model: '',
    geolocation: [
      {
        course: -1,
        altitude: 236.7534637451172,
        latitude: 30.38978555407587,
        longitude: -97.72607543696425,
      },
    ],
    coord_system: '',
    geodetic_datum: '',
    vertical_datum: '',
    instrument_type: 'other',
    _test_asset_uuid: '0007766-226F-4A04-93ED-EC769630D372',
    coord_ref_system: '',
    data_hazard_type: 'other',
    coord_system_epoch: '',
    referenced_data_links: [],
    geodetic_datum_realization: '',
    _test_parent_collection_uuid: 'DB66DAEA-2B36-4D20-83C1-K9876C0',
    instrument_manufacturer_and_model: '',
  },
  styles: {},
  assets: [
    {
      id: 1412157,
      path: '925/test-86cc-4ae2-8820-f30353b6c714.jpeg',
      uuid: 'test-86cc-4ae2-8820-f30353b6c714',
      asset_type: 'image',
      original_path: 'project-test-242ac11c-0001-012/test/test/Photo 4.jpg',
      original_name: null,
      display_path: 'project-test-242ac11c-0001-012/test/test/Photo 4.jpg',
    },
  ],
};
export const mockPointFeature: Feature = {
  id: 100001,
  project_id: 100,
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [173.043228, -42.619206],
  },
  properties: {
    name: 'IMG_0198.JPG',
    color: '#ff0000',
    label: 'IMG_0198.JPG',
    opacity: 1,
    fillColor: '#ff0000',
    description:
      '<img src="https://test.com"/>\n<html xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:msxsl="urn:schemas-microsoft-com:xslt">\nOblique dextral fault scarp along pre-existing fold(?) scarp\n<head>\n\n<META http-equiv="Content-Type" content="text/html">\n\n<meta http-equiv="content-type" content="text/html; charset=UTF-8">\n\n</head>\n\n<body style="margin:0px 0px 0px 0px;overflow:auto;background:#FFFFFF;">\n\n<table style="font-family:Arial,Verdana,Times;font-size:12px;text-align:left;width:100%;border-collapse:collapse;padding:3px 3px 3px 3px">\n\n<tr style="text-align:center;font-weight:bold;background:#9CBCE2">\n\n<td>IMG_0198.JPG</td>\n\n</tr>\n\n<tr bgcolor="#9CBCE2">\n\n<td>\n\n<table style="font-family:Arial,Verdana,Times;font-size:12px;text-align:left;width:100%;border-spacing:0px; padding:3px 3px 3px 3px"></table>\n\n</td>\n\n</tr>\n\n<tr>\n\n<td>\n\n<table style="font-family:Arial,Verdana,Times;font-size:12px;text-align:left;width:100%;border-spacing:0px; padding:3px 3px 3px 3px">\n\n<tr>\n\n<td>Path</td>\n\n<td>E:\\EH717\\New_Zealand\\112116\\11_21_2016\\Stahl\\TS06\\IMG_0198.JPG</td>\n\n</tr>\n\n<tr bgcolor="#D4E4F3">\n\n<td>Name</td>\n\n<td>IMG_0198.JPG</td>\n\n</tr>\n\n<tr>\n\n<td>DateTime</td>\n\n<td>2016:11:21 16:12:23</td>\n\n</tr>\n\n<tr bgcolor="#D4E4F3">\n\n<td>Direction</td>\n\n<td>247.482353</td>\n\n</tr>\n\n</table>\n\n</td>\n\n</tr>\n\n</table>\n\n</body>\n\n</html>',
  },
  styles: null,
  assets: [],
};

export const mockVideoFeature: Feature = {
  id: 100002,
  project_id: 100,
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [-97.725663, 30.390238],
  },
  properties: {},
  styles: null,
  assets: [
    {
      id: 60933,
      path: '1027/935152cc-dba1-4cb6-9efd-82036a6446ac.mp4',
      uuid: '935152cc-dba1-4cb6-9efd-82036a6446ac',
      asset_type: 'video',
      original_path: '/test/test/Video 1.mov',
      original_name: null,
      display_path: '/test/test/Video 1.mov',
    },
  ],
};

export const mockQuestionnaireFeature: Feature = {
  id: 2466139,
  project_id: 94,
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [-122.306436952, 47.653046488],
  },
  properties: {
    _hazmapper: {
      questionnaire: {
        assets: [
          {
            filename: 'Q11-Photo-001.jpg',
            coordinates: [-122.30645555555556, 47.65306388888889],
          },
          {
            filename: 'Q12-Photo-001.jpg',
            coordinates: [-122.30648611111111, 47.65299722222222],
          },
          {
            filename: 'Q13-Photo-001.jpg',
            coordinates: [-122.3064611111111, 47.652975],
          },
        ],
      },
    },
  },
  styles: {},
  assets: [
    {
      id: 2037094,
      path: '94/816c47f4-b34d-4a30-b0d8-e92b11ba100c',
      uuid: '816c47f4-b34d-4a30-b0d8-e92b11ba100c',
      asset_type: 'questionnaire',
      original_path:
        'project-3891343857756007955-242ac117-0001-012/RApp/asif27/Home/GNSS Base Station Setup (Copy 1) 1690582474191.rqa/GNSS Base Station Setup (Copy 1) 1690582474191.rq',
      original_name: null,
      display_path:
        'project-3891343857756007955-242ac117-0001-012/RApp/asif27/Home/GNSS Base Station Setup (Copy 1) 1690582474191.rqa/GNSS Base Station Setup (Copy 1) 1690582474191.rq',
    },
  ],
};
