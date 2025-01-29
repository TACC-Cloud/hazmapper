interface DeletePointCloudButtonProps {
  projectId: number;
  pointCloudId: number;
}

import React from 'react';
import { Button } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';

import { PointCloud } from '@hazmapper/types';
import { useDeletePointCloud, useImportPointCloudFile } from '@hazmapper/hooks';

interface UploadPointCloudButtonProps {
  pointCloud: PointCloud;
}

export const UploadPointCloudButton: React.FC<UploadPointCloudButtonProps> = ({
  pointCloud,
}) => {
  const { mutate: addPointCloudFile } = useImportPointCloudFile({
    projectId: pointCloud.project_id,
    pointCloudId: pointCloud.id,
  });

  const handleAddFile = () => {
    console.log('TODO: Opening file browser for point cloud:', pointCloud.id);
    addPointCloudFile({
      files: [
        {
          system: 'project-4072868216578445806-242ac117-0001-012',
          path: 'point_clouds_good/red-rocks.laz',
        },
      ],
    });
  };
  return (
    <Button
      data-testid={`upload-point-cloud-${pointCloud.id}`}
      size="small"
      icon={<UploadOutlined />}
      onClick={() => handleAddFile()}
    >
      Add las/laz
    </Button>
  );
};

export const DeletePointCloudButton: React.FC<DeletePointCloudButtonProps> = ({
  projectId,
  pointCloudId,
}) => {
  const { mutate: deletePointCloud, isPending } = useDeletePointCloud();

  const handleDelete = () => {
    deletePointCloud({ projectId, pointCloudId });
  };

  return (
    <Button
      data-testid={`delete-point-cloud-${pointCloudId}`}
      size="small"
      danger
      icon={<DeleteOutlined />}
      onClick={handleDelete}
      loading={isPending}
    />
  );
};
