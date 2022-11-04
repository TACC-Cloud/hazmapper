import {Feature} from '../models/models';

const featureFixture = new Feature({
  id: 1,
  type: 'Feature',
  assets: [],
  properties: {},
  styles: {},
  geometry: {
      type: 'Point', coordinates: [0, 0]
  }
  });

export {featureFixture};
