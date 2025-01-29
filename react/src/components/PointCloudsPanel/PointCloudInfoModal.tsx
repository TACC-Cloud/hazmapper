import React from 'react';
import { Modal, List, Typography } from 'antd';
import { PointCloud } from '@hazmapper/types';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
const { Text } = Typography;

interface PointCloudInfoModalProps {
  pointCloud: PointCloud;
  onClose: () => void;
}

interface DetailItem {
  label: string;
  content: React.ReactNode;
}

const PointCloudInfoModal: React.FC<PointCloudInfoModalProps> = ({
  onClose,
  pointCloud,
}) => {
  const [searchParams] = useSearchParams();

  const getFeatureLink = (featureId: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('panel', 'Assets');
    params.set('selectedFeature', featureId.toString());
    return `?${params.toString()}`;
  };

  // Build base details array
  const baseDetails: DetailItem[] = [
    {
      label: 'Description',
      content: <Text type="secondary">{pointCloud?.description || ''}</Text>,
    },
    {
      label: 'Conversion Parameters',
      content: (
        <Text type="secondary">
          {pointCloud?.conversion_parameters || '---------------------'}
        </Text>
      ),
    },
    {
      label: 'Feature Id',
      content: pointCloud?.feature_id ? (
        <RouterLink to={getFeatureLink(pointCloud.feature_id)}>
          {pointCloud.feature_id}
        </RouterLink>
      ) : (
        <Text type="secondary">---------------------</Text>
      ),
    },
    {
      label: 'Processing Status',
      content: (
        <Text type="secondary">
          {pointCloud?.task?.status || '---------------------'}
        </Text>
      ),
    },
  ];

  // Add file entries if they exist
  const fileDetails: DetailItem[] = pointCloud?.files_info?.length
    ? pointCloud.files_info.map((file) => ({
        label: 'File',
        content: <Text type="secondary">{file.name}</Text>,
      }))
    : [
        {
          label: 'Files',
          content: <Text type="secondary" italic>{`No Files`}</Text>,
        },
      ];

  const details = [...baseDetails, ...fileDetails];

  return (
    <Modal
      title={pointCloud.description}
      open
      onCancel={onClose}
      footer={null}
      width={600}
      zIndex={
        2000 /* TODO define somewhere to be reusable in different modals */
      }
    >
      <List
        dataSource={details}
        split={false}
        renderItem={(item) => (
          <List.Item>
            <Text strong>{item.label}</Text>
            {item.content}
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default PointCloudInfoModal;
