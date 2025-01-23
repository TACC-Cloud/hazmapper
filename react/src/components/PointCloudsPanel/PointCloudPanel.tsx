import React from 'react';
import { Button, Tooltip, List, Space, Flex } from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Project } from '@hazmapper/types';
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
  const { data: pointClouds } = usePointClouds({ projectId: project.id });

  const handleAddPointCloud = () => {
    console.log('Adding new point cloud');
  };

  const handleDelete = (id: number) => {
    console.log('Deleting point cloud:', id);
  };

  const handleAddFile = (id: number) => {
    console.log('Opening file browser for point cloud:', id);
  };

  const handleInfo = (id: number) => {
    console.log('Showing info for point cloud:', id);
  };

  return (
    <Flex vertical style={{ height: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAddPointCloud}>
          Add
        </Button>
      </div>

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
                <Button
                  size="small"
                  icon={<UploadOutlined />}
                  onClick={() => handleAddFile(pointCloud.id)}
                >
                  Add las/laz
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(pointCloud.id)}
                />
                <Tooltip title="View additional information">
                  <Button
                    size="small"
                    icon={<InfoCircleOutlined />}
                    onClick={() => handleInfo(pointCloud.id)}
                  />
                </Tooltip>
              </Space>
            </Flex>
          </List.Item>
        )}
      />
    </Flex>
  );
};

export default PointCloudPanel;
