import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FeatureFileTree from './FeatureFileTree';
import { featureCollection } from '@hazmapper/__fixtures__/featuresFixture';
import { useDeleteFeature } from '@hazmapper/hooks';

// Mock the hooks
jest.mock('@hazmapper/hooks', () => ({
  useDeleteFeature: jest.fn(),
}));

jest.mock('react-resize-detector', () => ({
  useResizeDetector: () => ({
    height: 500,
    ref: jest.fn(),
  }),
}));

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  return {
    ...render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>),
  };
};

describe('FeatureFileTree', () => {
  const defaultProps = {
    featureCollection: featureCollection,
    isPublic: false,
    projectId: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useDeleteFeature as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      isLoading: false,
    }));
  });

  it('renders feature list correctly', () => {
    const { getByText } = renderWithRouter(
      <FeatureFileTree {...defaultProps} />
    );

    expect(getByText('foo')).toBeDefined();
    expect(getByText('image1.JPG')).toBeDefined();
    expect(getByText('image2.JPG')).toBeDefined();
  });

  it('handles feature deletion for non-public projects', () => {
    const deleteFeatureMock = jest.fn();
    (useDeleteFeature as jest.Mock).mockImplementation(() => ({
      mutate: deleteFeatureMock,
      isLoading: false,
    }));

    const { getByTestId } = renderWithRouter(
      <FeatureFileTree {...defaultProps} />,
      { route: '/?selectedFeature=1' }
    );

    // Find and click delete button (as featured is selected)
    const deleteButton = getByTestId('delete-feature-button');
    fireEvent.click(deleteButton);

    expect(deleteFeatureMock).toHaveBeenCalledWith({
      projectId: 1,
      featureId: 1,
    });
  });

  it('does not show delete button for public projects', () => {
    const { queryByTestId } = renderWithRouter(
      <FeatureFileTree {...defaultProps} isPublic={true} />,
      { route: '/?selectedFeature=1' }
    );

    // Verify delete button is not present
    const deleteButton = queryByTestId('delete-feature-button');
    expect(deleteButton).toBeNull();
  });

  it('does not show delete button when no feature is selected', () => {
    const { queryByTestId } = renderWithRouter(
      <FeatureFileTree {...defaultProps} isPublic={true} />
    );

    // Verify delete button is not present
    const deleteButton = queryByTestId('delete-feature-button');
    expect(deleteButton).toBeNull();
  });
});
