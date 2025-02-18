import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { renderInTest, testQueryClient } from '@hazmapper/test/testUtil';
import AssetDetail from './AssetDetail';
import {
  mockImgFeature,
  mockPointFeature,
} from '@hazmapper/__fixtures__/featuresFixture';
import AssetGeometry from './AssetGeometry';

jest.mock('./AssetGeometry', () => {
  return function AssetGeometry() {
    return <div data-testid="asset-geometry">Geometry Details</div>;
  };
});
describe('AssetDetail', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    testQueryClient.clear();
  });
  const AssetModalProps = {
    onClose: jest.fn(),
    selectedFeature: mockImgFeature,
    isPublicView: false,
    onQuestionnaireClick: jest.fn(),
  };

  it('renders all main components for image feature', async () => {
    const { getByText } = renderInTest(<AssetDetail {...AssetModalProps} />);
    const assetGeometry = screen.getByTestId('asset-geometry');
    await act(async () => {
      render(<AssetGeometry selectedFeature={mockImgFeature} />);
    });
    // Check for title, button, and tables
    expect(getByText('Photo 4.jpg')).toBeDefined();
    expect(getByText('Metadata')).toBeDefined();
    expect(assetGeometry).toBeDefined();
  });

  it('renders all main components for point feature', async () => {
    const { getByText } = renderInTest(
      <AssetDetail {...AssetModalProps} selectedFeature={mockPointFeature} />
    );
    const assetGeometry = screen.getByTestId('asset-geometry');
    await act(async () => {
      render(<AssetGeometry selectedFeature={mockPointFeature} />);
    });

    // Check for standard components
    expect(getByText('Metadata')).toBeDefined();
    expect(assetGeometry).toBeDefined();

    // Check that message feature has no asset appears
    expect(getByText('This feature has no asset.')).toBeDefined();
  });

  it('renders all main components for point feature public view', async () => {
    const { getByText, queryByText } = renderInTest(
      <AssetDetail
        {...AssetModalProps}
        selectedFeature={mockPointFeature}
        isPublicView={true}
      />
    );
    const assetGeometry = screen.getByTestId('asset-geometry');
    await act(async () => {
      renderInTest(<AssetGeometry selectedFeature={mockPointFeature} />);
    });

    // Check for standard components
    expect(getByText('Metadata')).toBeDefined();
    expect(assetGeometry).toBeDefined();

    // Verify some comopnents are not present in public view
    expect(queryByText('Add Asset from DesignSafe')).toBeNull();
  });
});
