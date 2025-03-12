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

  it('navigates to Taggit when "View in Taggit" button is clicked', async () => {
    const windowOpenSpy = jest
      .spyOn(window, 'open')
      .mockImplementation(() => null);
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
    await waitFor(() => expect(windowOpenSpy).toHaveBeenCalledTimes(1));
    expect(windowOpenSpy).toHaveBeenCalledWith(
      testDevConfiguration.taggitUrl,
      '_blank',
      'noreferrer noopener'
    );
    windowOpenSpy.mockRestore();
  });
});
