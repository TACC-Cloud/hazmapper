interface DeletePointCloudButtonProps {
  projectId: number;
  pointCloudId: number;
}

import React, { useState } from 'react';
import { Button } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';

import { PointCloud, TapisFilePath } from '@hazmapper/types';
import FileBrowserModal from '../FileBrowserModal/FileBrowserModal';
import { useDeletePointCloud, useImportPointCloudFile } from '@hazmapper/hooks';
import { IMPORTABLE_POINT_CLOUD_TYPES } from '@hazmapper/utils/fileUtils';

interface UploadPointCloudButtonProps {
  pointCloud: PointCloud;
}

export const UploadPointCloudButton: React.FC<UploadPointCloudButtonProps> = ({
  pointCloud,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { mutate: addPointCloudFile } = useImportPointCloudFile({
    projectId: pointCloud.project_id,
    pointCloudId: pointCloud.id,
  });

  const handleFileImport = (files: TapisFilePath[]) => {
    addPointCloudFile({ files });
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        data-testid={`upload-point-cloud-${pointCloud.id}`}
        size="small"
        icon={<UploadOutlined />}
        onClick={() => setIsModalOpen(true)}
      >
        Add las/laz
      </Button>
      {isModalOpen && (
        <FileBrowserModal
          isOpen={isModalOpen}
          toggle={() => setIsModalOpen(false)}
          onImported={handleFileImport}
          allowedFileExtensions={IMPORTABLE_POINT_CLOUD_TYPES}
        />
      )}
    </>
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
