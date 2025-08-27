import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import PointCloudCreateModal from './PointCloudCreateModal';
import {
  createSpyHandler,
  server,
  renderInTestWaitForQueries,
} from '@hazmapper/test/testUtil';
import { geoapi_project_point_clouds_create } from '@hazmapper/test/handlers';
import { pointCloudMock } from '@hazmapper/__fixtures__/pointCloudFixtures';
import '@testing-library/jest-dom';

describe('PointCloudCreateModal', () => {
  const mockOnClose = jest.fn();
  const projectId = pointCloudMock.project_id;

  it('renders the modal with correct title and description', async () => {
    const { getByText, getAllByRole } = await renderInTestWaitForQueries(
      <PointCloudCreateModal projectId={projectId} onClose={mockOnClose} />
    );

    expect(getByText('Create a Point Cloud')).toBeDefined();
    expect(
      getByText(
        /Point cloud data files \(e.g. las\/laz files\) can be added to a map asset./
      )
    ).toBeDefined();
    const textboxes = getAllByRole('textbox');
    expect(textboxes.length).toBe(2);
    expect(textboxes[0].getAttribute('name')).toBe('description');
    expect(textboxes[1].getAttribute('name')).toBe('conversion_parameters');
  });
  it('submits the form with correct data', async () => {
    // Create a spy handler for the create API endpoint
    const { handler, spy } = createSpyHandler(
      geoapi_project_point_clouds_create
    );
    server.use(handler);

    const { getAllByRole, getByText } = await renderInTestWaitForQueries(
      <PointCloudCreateModal projectId={projectId} onClose={mockOnClose} />
    );

    const submitButton = getByText('Submit').closest(
      'button'
    ) as HTMLButtonElement;

    const textboxes = getAllByRole('textbox');
    const [descriptionInput, paramsInput] = textboxes;

    fireEvent.change(descriptionInput, {
      target: { value: 'Test Point Cloud Description' },
    });
    fireEvent.change(paramsInput, { target: { value: '--test-param' } });

    // Wait for Submit button to be enabled before clicking
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(1);
      const spyCall = spy.mock.calls[0][0]; // First argument of the first call
      expect(spyCall.body).toEqual({
        description: 'Test Point Cloud Description',
        conversion_parameters: '--test-param',
      });
      expect(spyCall.params?.projectId).toBe('144');
    });

    // Check if the onClose function is called after submission
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
