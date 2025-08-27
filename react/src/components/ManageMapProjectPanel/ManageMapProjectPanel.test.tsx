import React from 'react';
import { within, screen, fireEvent } from '@testing-library/react';
import ManageMapProjectPanel from './ManageMapProjectPanel';
import { projectMock } from '@hazmapper/__fixtures__/projectFixtures';
import {
  renderInTestWaitForQueries,
  testQueryClient,
} from '@hazmapper/test/testUtil';

describe('ManageMapProjectPanel', () => {
  const defaultProps = {
    project: projectMock,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    testQueryClient.clear();
  });

  it('renders the default Map tab content initially', async () => {
    await renderInTestWaitForQueries(
      <ManageMapProjectPanel {...defaultProps} />
    );

    // Get the active tab container
    const activeTab = screen.getByRole('tabpanel', { hidden: false });

    // Ensure the active tab contains "Map Details"
    expect(within(activeTab).getByText(/Map Details/i)).toBeDefined();

    // Ensure other tab content is NOT present in the active tab
    expect(within(activeTab).queryByText(/Members/i)).toBeNull();
    expect(within(activeTab).queryByText(/Public Access/i)).toBeNull();
    expect(within(activeTab).queryByText(/Save Location/i)).toBeNull();
  });

  it('switches between tabs correctly', async () => {
    await renderInTestWaitForQueries(
      <ManageMapProjectPanel {...defaultProps} />
    );

    // Click "Members" tab
    fireEvent.click(screen.getByRole('tab', { name: 'Members' }));

    // Get the newly active tab container
    const activeTab = screen.getByRole('tabpanel', { hidden: false });

    // Ensure the "Members" tab content is now visible
    expect(within(activeTab).getByText(/Members/i)).toBeDefined();

    // Ensure the previous tab content is NOT present in the active tab
    expect(within(activeTab).queryByText(/Map Details/i)).toBeNull();
  });
});
