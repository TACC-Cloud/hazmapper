import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AssetsPanel from './AssetsPanel';
import { featureCollection } from '@hazmapper/__fixtures__/featuresFixture';
import { useFeatures } from '@hazmapper/hooks';

jest.mock('@hazmapper/hooks', () => ({
  useFeatures: jest.fn(),
}));

// Mock FeatureFileTree component since it's a complex component and tested elswhere
jest.mock('@hazmapper/components/FeatureFileTree', () => {
  return function MockFeatureFileTree(props) {
    return <div data-testid="feature-file-tree">FeatureFileTree Component</div>;
  };
});

describe('AssetsPanel', () => {
  const defaultProps = {
    featureCollection,
    projectId: 1,
    isPublic: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementation for useFeatures which is used for downloading geojson
    (useFeatures as jest.Mock).mockReturnValue({
      isLoading: false,
      refetch: jest.fn(),
    });
  });

  it('renders all main components', () => {
    const { getByText } = render(<AssetsPanel {...defaultProps} />);

    // Check for the presence of buttons
    expect(getByText('Import from DesignSafe TODO/WG-387')).toBeDefined();
    expect(getByText('Export to GeoJSON')).toBeDefined();
  });

  it('handles GeoJSON export correctly', async () => {
    // Mock the useFeatures hook for download scenario
    const mockRefetch = jest.fn();
    (useFeatures as jest.Mock).mockReturnValue({
      isLoading: false,
      refetch: mockRefetch,
    });

    render(<AssetsPanel {...defaultProps} />);

    // Click export button
    await act(async () => {
      fireEvent.click(screen.getByText('Export to GeoJSON'));
    });
    // Verify refetch was called
    expect(mockRefetch).toHaveBeenCalled();
  });
});
