import React, { act } from 'react';
import { waitFor, screen, fireEvent } from '@testing-library/react';
import AssetsPanel from './AssetsPanel';
import { featureCollection } from '@hazmapper/__fixtures__/featuresFixture';
import { projectMock } from '@hazmapper/__fixtures__/projectFixtures';
import {
  renderInTest,
  WithUseFeatureManager,
  renderInTestWaitForQueries,
} from '@hazmapper/test/testUtil';
import '@testing-library/jest-dom';

// Mock FeatureFileTree component since it's a complex component and tested elswhere
jest.mock('@hazmapper/components/FeatureFileTree', () => {
  return function MockFeatureFileTree() {
    return <div data-testid="feature-file-tree">FeatureFileTree Component</div>;
  };
});

describe('AssetsPanel', () => {
  const defaultProps = {
    project: projectMock,
    isPublicView: false,
  };

  beforeEach(() => {
    // Mock the link click to prevent actual navigation
    HTMLAnchorElement.prototype.click = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders all main components', () => {
    const { getByText } = renderInTest(<AssetsPanel {...defaultProps} />);

    // Check for the presence of buttons
    expect(getByText('Import from DesignSafe')).toBeDefined();
    expect(getByText('Export to GeoJSON')).toBeDefined();
  });

  it('test export-to-geojson button', async () => {
    // Spy on URL.createObjectURL to capture the blob
    const createObjectURLSpy = jest.spyOn(URL, 'createObjectURL');

    await renderInTestWaitForQueries(
      <WithUseFeatureManager>
        <AssetsPanel {...defaultProps} />
      </WithUseFeatureManager>
    );

    const exportButton = screen
      .getByText('Export to GeoJSON')
      .closest('button') as HTMLButtonElement;

    // Wait for Export button to be enabled before clicking
    await waitFor(() => {
      expect(exportButton).not.toBeDisabled();
    });

    // Click export button
    await act(async () => {
      fireEvent.click(screen.getByText('Export to GeoJSON'));
    });

    await waitFor(() => {
      expect(createObjectURLSpy).toHaveBeenCalled();
    });

    // Verify the geojson blob was created with correct content
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('application/json');
    const content = JSON.parse(await blob.text());
    expect(content).toEqual(featureCollection);
  });
});
