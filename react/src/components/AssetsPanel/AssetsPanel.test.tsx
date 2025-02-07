import React, { act } from 'react';
import { waitFor, screen, fireEvent } from '@testing-library/react';
import AssetsPanel from './AssetsPanel';
import { featureCollection } from '@hazmapper/__fixtures__/featuresFixture';
import { projectMock } from '@hazmapper/__fixtures__/projectFixtures';
import {
  createSpyHandler,
  server,
  renderInTest,
} from '@hazmapper/test/testUtil';
import { geoapi_project_features } from '@hazmapper/test/handlers';

// Mock FeatureFileTree component since it's a complex component and tested elswhere
jest.mock('@hazmapper/components/FeatureFileTree', () => {
  return function MockFeatureFileTree() {
    return <div data-testid="feature-file-tree">FeatureFileTree Component</div>;
  };
});

describe('AssetsPanel', () => {
  const defaultProps = {
    featureCollection,
    project: projectMock,
    isPublicView: false,
  };

  it('renders all main components', () => {
    const { getByText } = renderInTest(<AssetsPanel {...defaultProps} />);

    // Check for the presence of buttons
    expect(getByText('Import from DesignSafe')).toBeDefined();
    expect(getByText('Export to GeoJSON')).toBeDefined();
  });

  it('handles GeoJSON export correctly', async () => {
    // Mock the useFeatures hook for download scenario
    // Create a spy handler for the create API endpoint
    const { handler, spy } = createSpyHandler(geoapi_project_features);
    server.use(handler);

    renderInTest(<AssetsPanel {...defaultProps} />);

    // Click export button
    await act(async () => {
      fireEvent.click(screen.getByText('Export to GeoJSON'));
    });

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
