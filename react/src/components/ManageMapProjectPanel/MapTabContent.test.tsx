import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderInTest } from '@hazmapper/test/testUtil';
import { projectMock } from '@hazmapper/__fixtures__/projectFixtures';
import { testDevConfiguration } from '@hazmapper/__fixtures__/appConfigurationFixture';
import MapTabContent from './MapTabContent';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('MapTabContent', () => {
  const mockOnProjectUpdate = jest.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
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

  it('navigates to Taggit when "View in Taggit" button is clicked', async () => {
    renderInTest(
      <MapTabContent
        project={projectMock}
        onProjectUpdate={mockOnProjectUpdate}
        isPending={false}
      />
    );

    const taggitButton = screen.getByTestId('taggit-button');
    fireEvent.click(taggitButton);

    await waitFor(() => {
      // Taggit will read from local storage
      expect(localStorage.getItem('testLastProject')).toBe(
        JSON.stringify(projectMock)
      );
    });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalledWith(testDevConfiguration.taggitUrl);
  });
});
