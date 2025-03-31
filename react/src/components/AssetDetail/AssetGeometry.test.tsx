import React from 'react';
import { render } from '@testing-library/react';
import AssetGeometry from './AssetGeometry';
import {
  mockImgFeature,
  mockLineFeature,
  mockPolygonFeature,
} from '@hazmapper/__fixtures__/featuresFixture';

jest.mock('@hazmapper/hooks', () => ({
  useFeatureSelection: jest.fn(),
}));

describe('AssetGeometry', () => {
  it('renders geometry for point on an image', () => {
    const { getByText, queryByText } = render(
      <AssetGeometry selectedFeature={mockImgFeature} />
    );
    expect(getByText('Geometry: Point')).toBeDefined();
    expect(getByText('Latitude')).toBeDefined();
    expect(getByText('Latitude').nextElementSibling?.textContent).toBe(
      '30.389785554'
    );
    expect(getByText('Longitude')).toBeDefined();
    expect(getByText('Longitude').nextElementSibling?.textContent).toBe(
      '-97.726075437'
    );
    expect(queryByText('Bounding Box')).toBeNull();
  });

  it('renders line feature with length', () => {
    const { getByText } = render(
      <AssetGeometry selectedFeature={mockLineFeature} />
    );
    expect(getByText('Geometry: Line String')).toBeDefined();
    expect(getByText('Length (m)')).toBeDefined();
    expect(getByText('Length (m)').nextElementSibling?.textContent).toBe(
      '120.42'
    );
    expect(getByText('Bounding Box')).toBeDefined();
  });

  it('renders polygon feature with area', () => {
    const { getByText } = render(
      <AssetGeometry selectedFeature={mockPolygonFeature} />
    );
    expect(getByText('Geometry: Polygon')).toBeDefined();
    expect(getByText('Area (m²)')).toBeDefined();
    expect(getByText('Area (m²)').nextElementSibling?.textContent).toBe(
      '4917.50'
    );
    expect(getByText('Bounding Box')).toBeDefined();
  });
});
