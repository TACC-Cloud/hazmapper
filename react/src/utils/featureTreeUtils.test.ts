import { featureCollectionToFileNodeArray } from './featureTreeUtils';
import {
  featureCollectionWithNestedPaths,
  featureCollectionWithDuplicateImages,
} from '@hazmapper/__fixtures__/featuresFixture';

describe('featureTreeUtils', () => {
  describe('featureCollectionToFileNodeArray', () => {
    it('should convert a feature collection to a tree structure', () => {
      const mockFeatureCollection = featureCollectionWithNestedPaths;

      const result = featureCollectionToFileNodeArray(mockFeatureCollection);

      expect(result).toHaveLength(1); // One root node (folder1)
      expect(result[0].name).toBe('folder1');
      expect(result[0].isDirectory).toBeTruthy();

      // folder1/ contents
      expect(result[0].children).toHaveLength(2); // file1.jpg and subfolder
      //file1.jpg
      expect(result[0].children?.[0].name).toBe('file1.jpg');
      expect(result[0].children?.[0].featureType).toBe('image');
      expect(result[0].children?.[0].nodeId).toBe('1');
      expect(result[0].children?.[0].isDirectory).toBeFalsy();
      // subfolder
      expect(result[0].children?.[1].name).toBe('subfolder');
      expect(result[0].children?.[1].isDirectory).toBeTruthy();

      // folder1/subfolder/ contents
      expect(result[0].children?.[1].children?.[0].isDirectory).toBeFalsy();
      expect(result[0].children?.[1].children?.[0].name).toBe('file2.rq');
      expect(result[0].children?.[1].children?.[0].featureType).toBe(
        'questionnaire'
      );
      expect(result[0].children?.[1].children?.[0].nodeId).toBe('2');
    });

    it('should convert handle duplicate paths in tree structure', () => {
      const mockFeatureCollection = featureCollectionWithDuplicateImages;

      const result = featureCollectionToFileNodeArray(mockFeatureCollection);

      /*
       * Directory layout:
       * ├── folder1
       * │   ├── image1.JPG
       * │   └── image2.JPG
       * ├── image1.JPG
       * └── image2.JPG
       * */

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('folder1');
      expect(result[1].name).toBe('image1.JPG');
      expect(result[2].name).toBe('image1.JPG');

      // folder1 contents
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children?.[0].name).toBe('image1.JPG');
      expect(result[0].children?.[1].name).toBe('image1.JPG');
    });
  });
});
