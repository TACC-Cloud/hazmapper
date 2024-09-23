import { featureCollectionToFileNodeArray } from './featureTreeUtils';
import { FeatureCollection } from '../types';

describe('featureTreeUtils', () => {
  describe('featureCollectionToFileNodeArray', () => {
    it('should convert a feature collection to a tree structure', () => {
      const mockFeatureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            id: 1,
            project_id: 1,
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {},
            styles: {},
            assets: [
              {
                id: 1,
                display_path: 'folder1/file1.txt',
                path: '',
                uuid: '',
                asset_type: '',
                original_path: '',
                original_name: null,
              },
            ],
          },
          {
            id: 2,
            project_id: 1,
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {},
            styles: {},
            assets: [
              {
                id: 2,
                display_path: 'folder1/subfolder/file2.txt',
                path: '',
                uuid: '',
                asset_type: '',
                original_path: '',
                original_name: null,
              },
            ],
          },
        ],
      };

      const result = featureCollectionToFileNodeArray(mockFeatureCollection);

      expect(result).toHaveLength(1); // One root node (folder1)
      expect(result[0].name).toBe('folder1');

      // folder1/ contents
      expect(result[0].children).toHaveLength(2); // file1.txt and subfolder
      expect(result[0].children?.[0].name).toBe('file1.txt');
      expect(result[0].children?.[1].name).toBe('subfolder');

      // folder1/subfolder/ contents
      expect(result[0].children?.[1].children?.[0].isDirectory);
      expect(result[0].children?.[1].children?.[0].name).toBe('file2.txt');
      expect(result[0].children?.[1].children?.[0].isDirectory);
    });

    // Add more test cases as needed
  });
});
