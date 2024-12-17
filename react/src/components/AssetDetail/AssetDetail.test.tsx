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
