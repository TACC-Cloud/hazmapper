import React from 'react';
import { fireEvent, waitFor, act, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import FeatureFileTree from './FeatureFileTree';
import {
  server,
  renderInTestWaitForQueries,
  WithUseFeaturesComponent,
} from '@hazmapper/test/testUtil';
import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';

jest.mock('react-resize-detector', () => ({
  useResizeDetector: () => ({
    height: 500,
    ref: jest.fn(),
  }),
}));

describe('FeatureFileTree', () => {
  const defaultTreeProps = {
    isPublicView: false,
    projectId: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders feature list correctly', async () => {
    await renderInTestWaitForQueries(
      <WithUseFeaturesComponent>
        <FeatureFileTree {...defaultTreeProps} />
      </WithUseFeaturesComponent>
    );

    expect(screen.getByText('foo')).toBeDefined();
    expect(screen.getByText('image1.JPG')).toBeDefined();
    expect(screen.getByText('image2.JPG')).toBeDefined();
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

    await renderInTestWaitForQueries(
      <WithUseFeaturesComponent>
        <FeatureFileTree {...defaultTreeProps} />
      </WithUseFeaturesComponent>,
      `/?selectedFeature=${featureId}`
    );

    // Find and click delete button (as featured is selected)
    const deleteButton = screen.getByTestId('delete-feature-button');
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(wasDeleted).toBeTruthy();
    });
  });

  it('does not show delete button for public projects', async () => {
    await renderInTestWaitForQueries(
      <WithUseFeaturesComponent>
        <FeatureFileTree {...defaultTreeProps} isPublicView={true} />
      </WithUseFeaturesComponent>
    );

    // Verify delete button is not present
    const deleteButton = screen.queryByTestId('delete-feature-button');
    expect(deleteButton).toBeNull();
  });

  it('does not show delete button when no feature is selected', async () => {
    await renderInTestWaitForQueries(
      <WithUseFeaturesComponent>
        <FeatureFileTree {...defaultTreeProps} isPublicView={false} />
      </WithUseFeaturesComponent>
    );

    // Verify delete button is not present
    const deleteButton = screen.queryByTestId('delete-feature-button');
    expect(deleteButton).toBeNull();
  });
});
