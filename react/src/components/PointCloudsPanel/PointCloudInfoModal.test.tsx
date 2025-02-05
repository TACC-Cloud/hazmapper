import React from 'react';
import PointCloudInfoModal from './PointCloudInfoModal';
import { pointCloudMock } from '@hazmapper/__fixtures__/pointCloudFixtures';
import { renderInTest } from '@hazmapper/test/testUtil';

// Mock the onClose function
const mockOnClose = jest.fn();

describe('PointCloudInfoModal', () => {
  it('renders the modal with correct details', () => {
    const { getByText, getAllByText } = renderInTest(
      <PointCloudInfoModal pointCloud={pointCloudMock} onClose={mockOnClose} />
    );

    expect(getAllByText(pointCloudMock.description)).toBeDefined();
    expect(getByText(pointCloudMock.task.status)).toBeDefined();
    expect(getByText(pointCloudMock.files_info[0].name)).toBeDefined();

    const featureIdText = pointCloudMock.feature_id?.toString() || '';
    expect(getByText(featureIdText)).toBeDefined();
  });
});
