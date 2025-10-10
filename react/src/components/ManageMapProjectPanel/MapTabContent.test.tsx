import { screen } from '@testing-library/react';
import { renderInTestWaitForQueries } from '@hazmapper/test/testUtil';
import { projectMock } from '@hazmapper/__fixtures__/projectFixtures';
import MapTabContent from './MapTabContent';

describe('MapTabContent', () => {
  const mockOnProjectUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders project details correctly', async () => {
    await renderInTestWaitForQueries(
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
