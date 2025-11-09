import React from 'react';
import {
  Button,
  Table,
  Tag,
  Spin,
  Typography,
  Space,
  Alert,
  Tooltip,
} from 'antd';
import {
  LoadingOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { Project } from '@hazmapper/types';
import {
  useAppConfiguration,
  useFileLocationStatus,
  useStartFileLocationRefresh,
  FeatureAssetLocation,
} from '@hazmapper/hooks/';

const { Text } = Typography;

interface FileAccessibilityStatusSummaryProps {
  files: FeatureAssetLocation[];
  additionalText?: string;
}

const FileAccessibilityStatusSummary: React.FC<
  FileAccessibilityStatusSummaryProps
> = ({ files, additionalText = '' }) => {
  if (!files || files.length === 0) return null;

  const totalAssets = files.length;
  const privateAssets = files.filter(
    (file) =>
      file.is_on_public_system === false || file.is_on_public_system === null
  ).length;

  const statusMessage =
    privateAssets === 0
      ? `All ${totalAssets} map asset${totalAssets !== 1 ? 's are' : ' is'} Public.`
      : `There ${privateAssets === 1 ? 'is' : 'are'} ${privateAssets} Private asset${privateAssets !== 1 ? 's' : ''} included in this map.`;

  return (
    <div style={{ textAlign: 'right', marginTop: '16px' }}>
      <Text strong>
        {statusMessage}
        {additionalText && <> {additionalText}</>}
      </Text>
    </div>
  );
};

const DesignSafeFileLink: React.FC<{
  system: string | null;
  path: string | null;
}> = ({ system, path }) => {
  const { designsafePortalUrl } = useAppConfiguration();

  const hasPath = Boolean(system && path);

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

  if (!hasPath) {
    return (
      <Text code style={{ fontSize: '11px' }}>
        N/A
      </Text>
    );
  }

  const dsUrl = getDesignSafeUrl(system, path);
  const pathText = `${system}${path}`;

  return (
    <Space size={4}>
      <Text code style={{ fontSize: '11px' }}>
        {pathText}
      </Text>
      {dsUrl && (
        <Tooltip title="Open in DesignSafe">
          <a href={dsUrl} target="_blank" rel="noreferrer">
            <LinkOutlined style={{ fontSize: '12px' }} />
          </a>
        </Tooltip>
      )}
    </Space>
  );
};

interface FileAccessibilityInformationProps {
  project: Project;
  hasCheckButton?: boolean;
  additionalText?: string;
}

export const FileAccessibilityInformation: React.FC<
  FileAccessibilityInformationProps
> = ({ project, hasCheckButton = false, additionalText = '' }) => {
  const startRefresh = useStartFileLocationRefresh(project.id);
  const handleRefresh = () => {
    startRefresh.mutate();
  };
  const { data, isLoading, refetch } = useFileLocationStatus(project.id);

  const isCheckRunning = Boolean(
    data?.check && data.check.started_at && !data.check.completed_at
  );

  // Poll for updates while check is running
  // TODO: Replace with WebSocket connection for real-time updates
  React.useEffect(() => {
    if (isCheckRunning) {
      const interval = setInterval(() => {
        refetch();
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isCheckRunning, refetch]);

  const getFeatureUrl = (featureId: number): string => {
    return `/project/${project.uuid}/?panel=Assets&selectedFeature=${featureId}`;
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
      render: (_: unknown, record: FeatureAssetLocation) => (
        <DesignSafeFileLink
          system={record.original_system}
          path={record.original_path}
        />
      ),
    },
    {
      title: 'Current Path',
      key: 'current_path',
      width: 250,
      render: (_: unknown, record: FeatureAssetLocation) => (
        <DesignSafeFileLink
          system={record.current_system}
          path={record.current_path}
        />
      ),
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
                    Started: {new Date(data.check.started_at).toLocaleString()}
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
      {hasCheckButton && (
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
      )}
      {/* Info Alert */}
      <Alert
        message="About File Accessibility Checks"
        description={
          <>
            The file accessibility check takes the following actions:
            <ul style={{ marginTop: 8, marginBottom: 0 }}>
              <li>
                It verifies the status of each data asset included on the map.
              </li>
              <li>
                It updates any public paths associated with already published
                data.
              </li>
              <li>
                It displays the results of the check in the table below, sorted
                by Status (Public if the data is published, Private if it is
                not).
              </li>
              <li>
                For asset types that we do not verify, we identify their status
                as Not Yet Supported.
              </li>
            </ul>
          </>
        }
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
      {/* Status Summary */}
      <FileAccessibilityStatusSummary
        files={data?.files || []}
        additionalText={additionalText}
      />
    </Space>
  );
};
