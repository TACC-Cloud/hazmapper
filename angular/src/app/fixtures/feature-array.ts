import { Feature, FeatureAsset } from '../models/models';

const fa1 = new FeatureAsset();
fa1.display_path = '/f1.txt';
const fa2 = new FeatureAsset();
fa2.display_path = 'a/f2.txt';
const fa3 = new FeatureAsset();
fa3.display_path = 'a/b/f3.txt';
const fa4 = new FeatureAsset();
fa4.display_path = 'a/b/f4.txt';

const featureArray = [
  new Feature({
    geometry: null,
    properties: {},
    type: 'Feature',
    assets: [fa1],
  }),
  new Feature({
    geometry: null,
    properties: {},
    type: 'Feature',
    assets: [fa2],
  }),
  new Feature({
    geometry: null,
    properties: {},
    type: 'Feature',
    assets: [fa3],
  }),
  new Feature({
    geometry: null,
    properties: {},
    type: 'Feature',
    assets: [fa4],
  }),
];

export { featureArray };
