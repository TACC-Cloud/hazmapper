import React, { useState } from 'react';
import { Button, Tooltip, List, Space, Flex } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import PointCloudInfoModal from './PointCloudInfoModal';
import {
  DeletePointCloudButton,
  UploadPointCloudButton,
} from './PointCloudPanelButtons';

import { Project, PointCloud } from '@hazmapper/types';
import { usePointClouds, useCreatePointCloud } from '@hazmapper/hooks';

interface Props {
  /**
   * active project
   */
  project: Project;
}
/*
 * A tree of feature files that correspond to the map's features
 */
const PointCloudPanel: React.FC<Props> = ({ project }) => {
  const [pointCloudInfoModal, setPointCloudInfoModal] =
    useState<PointCloud | null>(null);
  const { data: pointClouds } = usePointClouds({ projectId: project.id });

  const projectId = project.id;
  const { mutate: createPointCloud } = useCreatePointCloud({ projectId });

  const handleAddPointCloud = () => {
    console.log('Adding new point cloud');
    const dummyPointCloud = {
      description: 'Red Rocks',
      conversion_parameters: '',
    };
    createPointCloud(dummyPointCloud);
  };

  const isPointCloudModalOpen = !!pointCloudInfoModal;

  return (
    <Flex vertical style={{ height: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAddPointCloud}>
          Add
        </Button>
      </div>
      {pointClouds && pointClouds.length > 0 && (
        <List
          style={{
            flex: 1,
            overflow: 'auto',
            border: '1px solid #d9d9d9',
            borderRadius: 8,
            overflowX: 'hidden',
          }}
          dataSource={pointClouds}
          renderItem={(pointCloud) => (
            <List.Item
              key={pointCloud.id}
              style={{
                padding: '8px',
              }}
            >
              <Flex vertical gap="small" style={{ width: '100%' }}>
                <Tooltip title={pointCloud.description}>
                  <div
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {pointCloud.description}
                  </div>
                </Tooltip>

                <Space wrap>
                  <UploadPointCloudButton pointCloud={pointCloud} />
                  <DeletePointCloudButton
                    projectId={pointCloud.project_id}
                    pointCloudId={pointCloud.id}
                  />
                  <Tooltip title="View additional information">
                    <Button
                      size="small"
                      icon={<InfoCircleOutlined />}
                      onClick={() => setPointCloudInfoModal(pointCloud)}
                    />
                  </Tooltip>
                </Space>
              </Flex>
            </List.Item>
          )}
        />
      )}
      {isPointCloudModalOpen && (
        <PointCloudInfoModal
          onClose={() => setPointCloudInfoModal(null)}
          pointCloud={pointCloudInfoModal}
        />
      )}
    </Flex>
  );
};

export default PointCloudPanel;
