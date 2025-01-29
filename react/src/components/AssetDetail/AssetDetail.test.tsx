import React from 'react';
import { render, screen, act } from '@testing-library/react';
import AssetDetail from './AssetDetail';
import {
  mockImgFeature,
  mockPointFeature,
} from '@hazmapper/__fixtures__/featuresFixture';
import AssetGeometry from './AssetGeometry';
import AssetButton from './AssetButton';

jest.mock('@hazmapper/hooks', () => ({
  useFeatureSelection: jest.fn(),
  useAppConfiguration: jest.fn().mockReturnValue({
    geoapiUrl: 'https://example.com/geoapi',
  }),
}));

jest.mock('./AssetGeometry', () => {
  return function AssetGeometry() {
    return <div data-testid="asset-geometry">Geometry Details</div>;
  };
});
jest.mock('./AssetButton', () => {
  return function AssetButton() {
    return <div data-testid="asset-button">Asset Button</div>;
  };
});

describe('AssetDetail', () => {
  const AssetModalProps = {
    onClose: jest.fn(),
    selectedFeature: mockImgFeature,
    isPublicView: false,
    onQuestionnaireClick: jest.fn(),
  };

  it('renders all main components for image feature', async () => {
    const { getByText } = render(<AssetDetail {...AssetModalProps} />);
    const assetGeometry = screen.getByTestId('asset-geometry');
    const assetButton = screen.getByTestId('asset-button');
    await act(async () => {
      render(<AssetGeometry selectedFeature={mockImgFeature} />);
    });
    // Check for title, button, and tables
    expect(getByText('Photo 4.jpg')).toBeDefined();
    expect(assetButton).toBeDefined();
    expect(getByText('Metadata')).toBeDefined();
    expect(assetGeometry).toBeDefined();
  });

  it('renders all main components for point feature', async () => {
    const { getByText } = render(
      <AssetDetail {...AssetModalProps} selectedFeature={mockPointFeature} />
    );
    const assetGeometry = screen.getByTestId('asset-geometry');
    const assetButton = screen.getByTestId('asset-button');
    await act(async () => {
      render(<AssetGeometry selectedFeature={mockPointFeature} />);
    });

    // Check for standard components
    expect(getByText('Metadata')).toBeDefined();
    expect(assetGeometry).toBeDefined();

    // Check that message feature has no asset appears
    expect(getByText('This feature has no asset.')).toBeDefined();
    expect(assetButton).toBeDefined();
  });

  it('renders all main components for point feature public view', async () => {
    const { getByText, queryByText } = render(
      <AssetDetail
        {...AssetModalProps}
        selectedFeature={mockPointFeature}
        isPublicView={true}
      />
    );
    const assetGeometry = screen.getByTestId('asset-geometry');
    await act(async () => {
      render(<AssetGeometry selectedFeature={mockPointFeature} />);
    });

    // Check for standard components
    expect(getByText('Metadata')).toBeDefined();
    expect(assetGeometry).toBeDefined();

    // Verify some comopnents are not present in public view
    expect(queryByText('Add Asset from DesignSafe')).toBeNull();
  });
});
