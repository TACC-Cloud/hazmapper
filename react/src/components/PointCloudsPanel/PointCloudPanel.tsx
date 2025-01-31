import React, { useState } from 'react';
import { Button, Tooltip, List, Space, Flex } from 'antd';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import PointCloudInfoModal from './PointCloudInfoModal';
import PointCloudCreateModal from './PointCloudCreateModal';
import {
  DeletePointCloudButton,
  UploadPointCloudButton,
} from './PointCloudPanelButtons';

import { Project, PointCloud } from '@hazmapper/types';
import { usePointClouds } from '@hazmapper/hooks';

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
  const [pointCloudCreateModal, setPointCloudCreateModal] =
    useState<boolean>(false);
  const { data: pointClouds } = usePointClouds({ projectId: project.id });

  const isPointCloudInfoModalOpen = !!pointCloudInfoModal;

  return (
    <Flex vertical style={{ height: '100%' }}>
      <Flex justify="flex-end" style={{ marginBottom: 16 }}>
        <Button
          type="default"
          icon={<PlusOutlined />}
          title="Add point cloud"
          size="middle"
          onClick={() => setPointCloudCreateModal(true)}
        />
      </Flex>
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
      {isPointCloudInfoModalOpen && (
        <PointCloudInfoModal
          onClose={() => setPointCloudInfoModal(null)}
          pointCloud={pointCloudInfoModal}
        />
      )}
      {pointCloudCreateModal && (
        <PointCloudCreateModal
          projectId={project.id}
          onClose={() => setPointCloudCreateModal(false)}
        />
      )}
    </Flex>
  );
};

export default PointCloudPanel;
