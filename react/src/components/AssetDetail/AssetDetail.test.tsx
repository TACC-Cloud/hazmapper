import React from 'react';
import { render, screen } from '@testing-library/react';
import AssetDetail from './AssetDetail';
import { mockImgFeature } from '@hazmapper/__fixtures__/featuresFixture';

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

describe('AssetDetail', () => {
  const AssetModalProps = {
    onClose: jest.fn(),
    selectedFeature: mockImgFeature,
    isPublicView: false,
  };

  it('renders all main components', () => {
    const { getByText } = render(<AssetDetail {...AssetModalProps} />);
    const assetGeometry = screen.getByTestId('asset-geometry');
    // Check for title, button, and tables
    expect(getByText('Photo 4.jpg')).toBeDefined();
    expect(getByText('Download')).toBeDefined();
    expect(getByText('Metadata')).toBeDefined();
    expect(assetGeometry).toBeDefined();
  });
});
