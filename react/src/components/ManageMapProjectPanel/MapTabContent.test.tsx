import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderInTest } from '@hazmapper/test/testUtil';
import { projectMock } from '@hazmapper/__fixtures__/projectFixtures';
import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';
import MapTabContent from './MapTabContent';

describe('MapTabContent', () => {
  const mockOnProjectUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders project details correctly', () => {
    renderInTest(
      <MapTabContent
        project={projectMock}
        onProjectUpdate={mockOnProjectUpdate}
        isPending={false}
      />
    );

    expect(screen.getByText('Name:')).toBeDefined();
    expect(screen.getByText(projectMock.name)).toBeDefined();

    expect(screen.getByText('Description:')).toBeDefined();
    expect(screen.getByText(projectMock.description)).toBeDefined();
  });
});
