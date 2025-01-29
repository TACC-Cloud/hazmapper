import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import PointCloudPanel from './PointCloudPanel';
import {
  renderInTest,
  createSpyHandler,
  server,
} from '@hazmapper/test/testUtil';
import { projectMock } from '@hazmapper/__fixtures__/projectFixtures';
import { pointCloudMock } from '@hazmapper/__fixtures__/pointCloudFixtures';
import { geoapi_project_point_clouds_delete } from '@hazmapper/test/handlers';

describe('PointCloudPanel', () => {
  it('renders point cloud list and related buttons', async () => {
    const { getByText, getAllByTestId } = renderInTest(
      <PointCloudPanel project={projectMock} />
    );

    await waitFor(() => {
      expect(getByText(pointCloudMock.description)).toBeDefined();
      expect(getAllByTestId(/delete-point-cloud/)).toHaveLength(1);
    });
  });

  it('calls delete when delete button is clicked', async () => {
    const { handler, spy } = createSpyHandler(
      geoapi_project_point_clouds_delete
    );
    server.use(handler);

    const { getAllByTestId } = renderInTest(
      <PointCloudPanel project={projectMock} />
    );

    await waitFor(() => {
      expect(getAllByTestId(/delete-point-cloud/)).toBeDefined();
    });

    const deleteButtons = getAllByTestId(/delete-point-cloud/);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
