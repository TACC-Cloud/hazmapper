import React from 'react';
import { render } from '@testing-library/react';
import GeometryAsset from './AssetGeometry';
import * as turf from '@turf/turf';
import { mockImgFeature } from '@hazmapper/__fixtures__/featuresFixture';

jest.mock('@turf/turf', () => ({
  ...jest.requireActual('@turf/turf'),
  area: jest.fn(() => 1234.56),
  length: jest.fn(() => 5678.90),
  bbox: jest.fn(() => [10, 20, 30, 40]),
}));

jest.mock('@hazmapper/hooks', () => ({
    useFeatureSelection: jest.fn(),
  }));

describe('AssetGeometry', () => {
  const GeometryAssetProps = {
    selectedFeature: mockImgFeature,
  };

    it('renders geometry for point on an image', () => {
        const {getByText} = render(<GeometryAsset selectedFeature={{ ...mockImgFeature }} />);
        expect(getByText('Geometry: Point')).toBeDefined();
        expect(getByText("Latitude")).toBeDefined();
        expect(getByText("Longitude")).toBeDefined();
      });
    });