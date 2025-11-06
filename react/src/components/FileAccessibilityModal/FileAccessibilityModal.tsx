import React from 'react';
import {
  Modal,
  Button,
  Table,
  Tag,
  Spin,
  Typography,
  Space,
  Alert,
} from 'antd';
import {
  LoadingOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Project } from '@hazmapper/types';
import {
  useAppConfiguration,
  useFileLocationStatus,
  useStartFileLocationRefresh,
  FeatureAssetLocation,
} from '@hazmapper/hooks/';

const { Text } = Typography;

interface FileAccessibilityModalProps {
  project: Project;
  open: boolean;
  onClose: () => void;
}

export const FileAccessibilityModal: React.FC<FileAccessibilityModalProps> = ({
  project,
  open,
  onClose,
}) => {
  const { designsafePortalUrl } = useAppConfiguration();

  const { data, isLoading, refetch } = useFileLocationStatus(project.id);

  const startRefresh = useStartFileLocationRefresh(project.id);

  const handleRefresh = () => {
    startRefresh.mutate();
  };
  const isCheckRunning = Boolean(
    data?.check && data.check.started_at && !data.check.completed_at
  );

  // Poll for updates while check is running
  // TODO: Replace with WebSocket connection for real-time updates
  React.useEffect(() => {
    if (isCheckRunning && open) {
      const interval = setInterval(() => {
        refetch();
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isCheckRunning, open, refetch]);

  const getFeatureUrl = (featureId: number): string => {
    return `/project/${project.uuid}/?panel=Assets&selectedFeature=${featureId}`;
  };

  const getDesignSafeUrl = (
    system: string | null,
    path: string | null
  ): string | null => {
    if (!system || !path) return null;
    if (system.startsWith('project-')) {
      const projectUUid = system.split('project-')[1]; // get UUID for DS project system (i.e. project-uuid)
      return `${designsafePortalUrl}/data/browser/projects/${projectUUid}${path}`;
    } else {
      return `${designsafePortalUrl}/data/browser/tapis/${system}${path}`;
    }
  };

  const columns = [
    {
      title: 'Related Feature',
      dataIndex: 'feature_id',
      key: 'feature_id',
      width: 120,
      render: (featureId: number) => {
        const url = getFeatureUrl(featureId);
        return (
          <a href={url} target="_blank" rel="noreferrer">
            Feature {featureId}
          </a>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'asset_type',
      key: 'asset_type',
      width: 100,
      render: (type: string) => {
        return <Tag>{type}</Tag>;
      },
    },
    {
      title: 'Original Path',
      key: 'original_path',
      width: 250,
      render: (_: unknown, record: FeatureAssetLocation) => {
        const hasPath = Boolean(record.original_system && record.original_path);
        const pathText = hasPath
          ? `${record.original_system}${record.original_path}`
          : 'N/A';
        return (
          <Text code style={{ fontSize: '11px' }}>
            {pathText}
          </Text>
        );
      },
    },
    {
      title: 'Current Path',
      key: 'current_path',
      width: 250,
      render: (_: unknown, record: FeatureAssetLocation) => {
        const hasPath = Boolean(record.current_system && record.current_path);
        if (!hasPath) {
          return <Text type="secondary">N/A</Text>;
        }
        const dsUrl = getDesignSafeUrl(
          record.current_system,
          record.current_path
        );
        const pathText = `${record.current_system}${record.current_path}`;
        return (
          <Space direction="vertical" size={0}>
            <Text code style={{ fontSize: '11px' }}>
              {pathText}
            </Text>
            {dsUrl && (
              <a href={dsUrl} target="_blank" rel="noreferrer">
                View in DesignSafe
              </a>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_on_public_system',
      key: 'is_on_public_system',
      width: 100,
      render: (isPublic: boolean | null) => {
        if (isPublic === null) {
          return <Tag color="default">Unknown</Tag>;
        }
        return isPublic ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Public
          </Tag>
        ) : (
          <Tag color="warning">Private</Tag>
        );
      },
    },
    {
      title: 'Last Checked',
      dataIndex: 'last_public_system_check',
      key: 'ast_public_system_check',
      width: 150,
      render: (date: string | null) => {
        const dateText = date ? new Date(date).toLocaleString() : 'Never';
        return <Text type="secondary">{dateText}</Text>;
      },
    },
  ];

  return (
    <Modal
      title={`File Accessibility - ${project.name}`}
      open={open}
      onCancel={onClose}
      width={1200}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Status Section */}
        <div>
          {data?.check ? (
            <Space direction="vertical" size="small">
              <Text strong>Last Check Status:</Text>
              <Space>
                {isCheckRunning ? (
                  <>
                    <Tag color="processing" icon={<LoadingOutlined />}>
                      Running
                    </Tag>
                    <Text type="secondary">
                      Started:{' '}
                      {new Date(data.check.started_at).toLocaleString()}
                    </Text>
                  </>
                ) : (
                  <>
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Completed
                    </Tag>
                    <Text type="secondary">
                      Completed:{' '}
                      {data.check.completed_at
                        ? new Date(data.check.completed_at).toLocaleString()
                        : 'N/A'}
                    </Text>
                  </>
                )}
              </Space>
            </Space>
          ) : (
            <Text type="secondary">No checks have been run yet.</Text>
          )}
        </div>

        {/* Action Section */}
        <div>
          <Button
            type="primary"
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            loading={startRefresh.isPending || isCheckRunning}
            disabled={isCheckRunning}
          >
            {data?.check ? 'Re-check' : 'Check'} File Accessibility
          </Button>
        </div>

        {/* Info Alert */}
        <Alert
          message="About File Accessibility Checks"
          description="This will run a task to check file accessibility (i.e. if users are able to access published files). Ideally all data on a map should be published so that users can access the original data from DesignSafe. This task checks that while updating any paths to the public data."
          type="info"
          showIcon
        />

        {/* File Assets Table */}
        <div>
          <Text
            strong
            style={{
              fontSize: '16px',
              marginBottom: '12px',
              display: 'block',
            }}
          >
            File Assets
          </Text>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table
              dataSource={data?.files || []}
              columns={columns}
              rowKey="id"
              scroll={{ y: 400 }}
              pagination={false}
              locale={{ emptyText: 'No file assets found' }}
              size="small"
            />
          )}
        </div>
      </Space>
    </Modal>
  );
};
