import { featureCollection } from '@hazmapper/__fixtures__/featuresFixture';
import { getFeatureType } from '@hazmapper/types/feature';

describe('FeatureClass', () => {
  describe('featureType', () => {
    it('should return asset_type when there is exactly one asset', () => {
      const feature = featureCollection.features[0];
      expect(getFeatureType(feature)).toBe('image');
    });

    it('should return "collection" when there are multiple assets', () => {
      const feature = featureCollection.features[0];
      const feature2 = featureCollection.features[1];
      feature.assets.push(feature2.assets[0]);
      expect(getFeatureType(feature)).toBe('collection');
    });

    it('should return geometry type when there are no assets', () => {
      const feature = featureCollection.features[0];
      feature.assets = [];
      expect(getFeatureType(feature)).toBe('Point');
    });
  });
});
