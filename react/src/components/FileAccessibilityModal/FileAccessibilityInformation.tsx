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
} from '@ant-design/icons';
import { Project } from '@hazmapper/types';
import {
  FileLocationStatusResponse,
  useFileLocationStatus,
  useStartFileLocationRefresh,
  FeatureAssetLocation,
  TileServerLocation,
} from '@hazmapper/hooks/';
import { DesignSafeFileLink, FeatureLink, LayerLink } from './FileLink';

const { Text } = Typography;

interface FileAccessibilityStatusSummaryProps {
  data: FileLocationStatusResponse;
  additionalText?: string;
}

const FileAccessibilityStatusSummary: React.FC<
  FileAccessibilityStatusSummaryProps
> = ({ data, additionalText = '' }) => {
  const allFiles = [...(data.featureAssets || []), ...(data.tileServers || [])];

  if (allFiles.length === 0) return null;

  const totalAssets = allFiles.length;
  const privateAssets = allFiles.filter(
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

      {/* Show note about unchecked items if any exist */}
      {(data.summary.features_without_assets > 0 ||
        data.summary.external_tile_servers > 0) && (
        <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
          Note:
          {data.summary.features_without_assets > 0 && (
            <>
              {' '}
              {data.summary.features_without_assets} geometry-only feature
              {data.summary.features_without_assets !== 1 ? 's' : ''}
            </>
          )}
          {data.summary.features_without_assets > 0 &&
            data.summary.external_tile_servers > 0 && <> and </>}
          {data.summary.external_tile_servers > 0 && (
            <>
              {' '}
              {data.summary.external_tile_servers} external tile layer
              {data.summary.external_tile_servers !== 1 ? 's' : ''}
            </>
          )}{' '}
          {data.summary.features_without_assets > 0 ||
          data.summary.external_tile_servers > 0
            ? 'are'
            : 'is'}{' '}
          not checked.
        </div>
      )}
    </div>
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

  const columns = [
    {
      title: 'Related To',
      key: 'related_to',
      width: 180,
      render: (
        _: unknown,
        record: FeatureAssetLocation | TileServerLocation
      ) => {
        if ('feature_id' in record && record.feature_id) {
          return (
            <FeatureLink
              featureId={record.feature_id}
              projectUuid={project.uuid}
            />
          );
        }
        if ('name' in record && record.name) {
          return (
            <LayerLink layerName={record.name} projectUuid={project.uuid} />
          );
        }
        return <Text type="secondary">Unknown</Text>;
      },
    },
    {
      title: 'Type',
      key: 'type',
      width: 90,
      render: (
        _: unknown,
        record: FeatureAssetLocation | TileServerLocation
      ) => {
        // Use asset_type for feature assets, "Layer" for tile servers
        const displayType =
          'asset_type' in record ? record.asset_type : 'Layer (GeoTIFF)';
        return <Tag>{displayType}</Tag>;
      },
    },
    {
      title: 'Original Path',
      key: 'original_path',
      width: 220,
      render: (
        _: unknown,
        record: FeatureAssetLocation | TileServerLocation
      ) => (
        <DesignSafeFileLink
          system={record.original_system}
          path={record.original_path}
        />
      ),
    },
    {
      title: 'Public Path',
      key: 'public_path',
      width: 220,
      render: (
        _: unknown,
        record: FeatureAssetLocation | TileServerLocation
      ) => {
        // Only show if actually on public system
        if (record.is_on_public_system !== true) {
          return (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              ─
            </Text>
          );
        }
        return (
          <DesignSafeFileLink
            system={record.current_system}
            path={record.current_path}
          />
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_on_public_system',
      key: 'is_on_public_system',
      width: 90,
      render: (
        isPublic: boolean | null,
        record: FeatureAssetLocation | TileServerLocation
      ) => {
        // Not yet checked
        if (!record.last_public_system_check) {
          return (
            <Tooltip title="File has not been checked yet">
              <Tag color="default">Unchecked</Tag>
            </Tooltip>
          );
        }

        // Checked but couldn't determine
        if (isPublic === null) {
          return (
            <Tooltip title="Status could not be determined">
              <Tag color="default">Unknown</Tag>
            </Tooltip>
          );
        }

        // Verified status
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
      key: 'last_public_system_check',
      width: 130,
      render: (date: string | null) => {
        if (!date) {
          return (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Never
            </Text>
          );
        }
        const dateObj = new Date(date);
        return (
          <Tooltip title={dateObj.toLocaleString()}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {dateObj.toLocaleDateString()}
            </Text>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Status Section */}
      {hasCheckButton && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {data?.check ? (
              <Space size="small">
                {isCheckRunning ? (
                  <>
                    <Tag
                      color="processing"
                      icon={<LoadingOutlined />}
                      style={{ margin: 0 }}
                    >
                      Checking...
                    </Tag>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Started {new Date(data.check.started_at).toLocaleString()}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Last checked:{' '}
                      {data.check.completed_at
                        ? new Date(data.check.completed_at).toLocaleString()
                        : 'N/A'}
                    </Text>
                  </>
                )}
              </Space>
            ) : (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                No checks have been run yet
              </Text>
            )}
          </div>

          <Button
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            loading={startRefresh.isPending || isCheckRunning}
            disabled={isCheckRunning}
          >
            {data?.check ? 'Re-check' : 'Check'}
          </Button>
        </div>
      )}

      {/* Info Alert */}
      <Alert
        message="About File Accessibility Checks"
        description={
          <>
            <p style={{ marginTop: 0, marginBottom: 8 }}>
              The file accessibility check determines whether all data imported
              to a map is publicly accessible. All data included in a map should
              be published before the map is made public.{' '}
              <a
                href="https://designsafe-ci.org/user-guide/tools/visualization/hazmapper/#collaboration-public"
                target="_blank"
                rel="noreferrer"
              >
                Learn more
              </a>
            </p>
            <p style={{ marginBottom: 4, fontWeight: 500 }}>
              The check performs the following actions:
            </p>
            <ul style={{ marginTop: 4, marginBottom: 0, paddingLeft: 20 }}>
              <li>
                Verifies the status of each data asset included on the map
              </li>
              <li>Updates public paths for already published data</li>
              <li>
                Displays results in the table below, sorted by Status (Public or
                Private)
              </li>
              <li>
                Reports which map features are not supported or not applicable
                to this check
              </li>
            </ul>
          </>
        }
        type="info"
        showIcon
        style={{ fontSize: '12px' }}
      />

      {/* File Assets and Tile Servers Table */}
      <div>
        <Text
          strong
          style={{
            fontSize: '14px',
            marginBottom: '8px',
            display: 'block',
          }}
        >
          Assets & Layers (
          {(data?.featureAssets?.length || 0) +
            (data?.tileServers?.length || 0)}
          )
        </Text>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={[
              ...(data?.featureAssets || []),
              ...(data?.tileServers || []),
            ]}
            columns={columns}
            rowKey="id"
            scroll={{ y: 400 }}
            pagination={false}
            locale={{ emptyText: 'No file assets or tile servers found' }}
            size="small"
          />
        )}
      </div>

      {/* Status Summary */}
      {data && (
        <FileAccessibilityStatusSummary
          data={data}
          additionalText={additionalText}
        />
      )}
    </Space>
  );
};
