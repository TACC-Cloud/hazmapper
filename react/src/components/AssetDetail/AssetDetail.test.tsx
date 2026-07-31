import React, { useEffect } from 'react';
import { render, screen, act } from '@testing-library/react';
import { renderInTest, testQueryClient } from '@hazmapper/test/testUtil';
import AssetDetail from './AssetDetail';
import {
  mockImgFeature,
  mockPointFeature,
  mockVectorFeature,
} from '@hazmapper/__fixtures__/featuresFixture';
import { useSelectedVectorFeature } from '@hazmapper/context/SelectedVectorFeatureContext';
import AssetGeometry from './AssetGeometry';

/**
 * Test helper that seeds the clicked-vector-segment context (as a map click
 * would) so AssetDetail can render that segment's attributes.
 */
const SeedSelectedVectorFeature: React.FC<{
  featureId: number;
  properties: Record<string, unknown>;
}> = ({ featureId, properties }) => {
  const { setSelectedVectorFeature } = useSelectedVectorFeature();
  useEffect(() => {
    setSelectedVectorFeature({ featureId, properties });
  }, [featureId, properties, setSelectedVectorFeature]);
  return null;
};

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

  it('prompts to click the map for a vector feature with no clicked segment', () => {
    const { getByText, queryByText } = renderInTest(
      <AssetDetail {...AssetModalProps} selectedFeature={mockVectorFeature} />
    );

    // Vector features replace the "Metadata" table with the clicked segment's
    // attributes; before a click there is nothing to show.
    expect(getByText('Selected feature')).toBeDefined();
    expect(
      getByText('Click a feature on the map to see its attributes.')
    ).toBeDefined();
    expect(queryByText('Metadata')).toBeNull();
  });

  it('shows a no-attributes message when the clicked segment has no properties', async () => {
    const { findByText, queryByText } = renderInTest(
      <>
        <SeedSelectedVectorFeature
          featureId={mockVectorFeature.id}
          properties={{}}
        />
        <AssetDetail {...AssetModalProps} selectedFeature={mockVectorFeature} />
      </>
    );

    // A geometry was clicked but carries no attributes
    expect(await findByText('This feature has no attributes.')).toBeDefined();
    expect(
      queryByText('Click a feature on the map to see its attributes.')
    ).toBeNull();
  });

  it('renders the clicked segment attributes for a vector feature', async () => {
    const { findByText, getByText } = renderInTest(
      <>
        <SeedSelectedVectorFeature
          featureId={mockVectorFeature.id}
          properties={{ name: 'Main St', length_m: 412 }}
        />
        <AssetDetail {...AssetModalProps} selectedFeature={mockVectorFeature} />
      </>
    );

    // Attribute keys are humanized via _.startCase and values shown as-is.
    expect(await findByText('Main St')).toBeDefined();
    expect(getByText('Length M')).toBeDefined();
    expect(getByText('412')).toBeDefined();
    expect(getByText('Selected feature')).toBeDefined();
  });
});
