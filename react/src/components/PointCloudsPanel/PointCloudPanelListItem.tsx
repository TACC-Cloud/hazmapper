import React from 'react';
import { Button, Tooltip, Space, Flex } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  UploadPointCloudButton,
  DeletePointCloudButton,
} from './PointCloudPanelButtons';
import { PointCloud } from '@hazmapper/types';

export interface PointCloudPanelListItemProps {
  pointCloud: PointCloud;
  onViewInfo: (pointCloud: PointCloud) => void;
}

export const PointCloudPanelListItem: React.FC<
  PointCloudPanelListItemProps
> = ({ pointCloud, onViewInfo }) => {
  return (
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
            onClick={() => onViewInfo(pointCloud)}
          />
        </Tooltip>
      </Space>
    </Flex>
  );
};
