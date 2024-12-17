import React from 'react';
import { render } from '@testing-library/react';
import AssetDetail from './AssetDetail';
import { mockImgFeature } from '@hazmapper/__fixtures__/featuresFixture';

jest.mock('@hazmapper/hooks', () => ({
  useFeatureSelection: jest.fn(),
  useAppConfiguration: jest.fn().mockReturnValue({
    geoapiUrl: 'https://example.com/geoapi',
  }),
}));

// Mock AssetDetail component since it's a complex component and tested elswhere
jest.mock('@hazmapper/components/AssetDetail', () => {
  return function AssetDetail() {
    return <div data-testid="asset-detail">Asset Detail Component</div>;
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
    // Check for title, button, and tables
    expect(getByText('Photo 4.jpg')).toBeDefined();
    expect(getByText('Download')).toBeDefined();
    expect(getByText('Metadata')).toBeDefined();
    expect(getByText('Geometry')).toBeDefined();
  });
});
