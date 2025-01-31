import React from 'react';
import { fireEvent, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import FeatureFileTree from './FeatureFileTree';
import { server, renderInTest } from '@hazmapper/test/testUtil';
import { featureCollection } from '@hazmapper/__fixtures__/featuresFixture';
import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';

jest.mock('react-resize-detector', () => ({
  useResizeDetector: () => ({
    height: 500,
    ref: jest.fn(),
  }),
}));

describe('FeatureFileTree', () => {
  const defaultTreeProps = {
    featureCollection: featureCollection,
    isPublicView: false,
    projectId: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders feature list correctly', async () => {
    let rendered;
    await act(async () => {
      rendered = renderInTest(<FeatureFileTree {...defaultTreeProps} />);
    });

    const { getByText } = rendered;
    expect(getByText('foo')).toBeDefined();
    expect(getByText('image1.JPG')).toBeDefined();
    expect(getByText('image2.JPG')).toBeDefined();
  });

  it('handles feature deletion for non-public projects', async () => {
    const featureId = 1;
    let wasDeleted = false;

    server.use(
      http.delete(
        `${testDevConfiguration.geoapiUrl}/projects/${defaultTreeProps.projectId}/features/${featureId}/`,
        () => {
          wasDeleted = true;
          return HttpResponse.json({}, { status: 200 });
        }
      )
    );

    let rendered;
    await act(async () => {
      rendered = renderInTest(
        <FeatureFileTree {...defaultTreeProps} />,
        `/?selectedFeature=${featureId}`
      );
    });

    // Find and click delete button (as featured is selected)
    const { getByTestId } = rendered;
    const deleteButton = getByTestId('delete-feature-button');
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(wasDeleted).toBeTruthy();
    });
  });

  it('does not show delete button for public projects', async () => {
    let rendered;
    await act(async () => {
      rendered = renderInTest(
        <FeatureFileTree {...defaultTreeProps} isPublicView={true} />,
        '/?selectedFeature=1'
      );
    });

    // Verify delete button is not present
    const { queryByTestId } = rendered;
    const deleteButton = queryByTestId('delete-feature-button');
    expect(deleteButton).toBeNull();
  });

  it('does not show delete button when no feature is selected', async () => {
    let rendered;
    await act(async () => {
      rendered = renderInTest(
        <FeatureFileTree {...defaultTreeProps} isPublicView={false} />
      );
    });

    // Verify delete button is not present
    const { queryByTestId } = rendered;
    const deleteButton = queryByTestId('delete-feature-button');
    expect(deleteButton).toBeNull();
  });
});
