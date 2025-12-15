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
  WarningOutlined,
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

interface AnalysisSummaryProps {
  data: FileLocationStatusResponse;
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ data }) => {
  const allFiles = [...(data.featureAssets || []), ...(data.tileServers || [])];

  if (allFiles.length === 0) return null;

  const privateAssets = allFiles.filter(
    (file) =>
      file.is_on_public_system === false || file.is_on_public_system === null
  ).length;

  // Define statusMessage based on privateAssets count
  const statusMessage =
    privateAssets > 0 ? (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WarningOutlined style={{ color: '#faad14' }} />
          <span>There are {privateAssets} asset(s) that are Private.</span>
        </div>
        <div style={{ marginTop: '8px', marginLeft: '24px' }}>
          To resolve the identified asset issue(s), please see the documentation{' '}
          <a
            href="https://designsafe-ci.org/user-guide/tools/visualization/hazmapper/#collaboration-public"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
          .
        </div>
      </div>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CheckCircleOutlined style={{ color: '#52c41a' }} />
        <span>All included map assets are Public.</span>
      </div>
    );

  return (
    <div>
      <Text strong>Analysis Summary:</Text>
      <Text>{statusMessage}</Text>

      {/* Show note about unchecked items if any exist */}
      {(data.summary.features_without_assets > 0 ||
        data.summary.external_tile_servers > 0) && (
        <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
          Note:
          {data.summary.features_without_assets > 0 && (
            <> geometry-only features </>
          )}
          {data.summary.features_without_assets > 0 &&
            data.summary.external_tile_servers > 0 && <>and</>}
          {data.summary.external_tile_servers > 0 && (
            <> external tile layers </>
          )}
          are not checked.
        </div>
      )}
    </div>
  );
};

interface FileAccessibilityInformationProps {
  project: Project;
  hasCheckButton?: boolean;
}

export const FileAccessibilityInformation: React.FC<
  FileAccessibilityInformationProps
> = ({ project, hasCheckButton = false }) => {
  const startRefresh = useStartFileLocationRefresh(project.id);
  const handleRefresh = () => {
    startRefresh.mutate();
  };
  const { data, isLoading, refetch } = useFileLocationStatus(project.id);

  const isCheckRunning = Boolean(
    data?.check && data.check.started_at && !data.check.completed_at
  );

  // Auto-run check on mount if never run before
  React.useEffect(() => {
    if (!isLoading && !data?.check && !startRefresh.isPending) {
      startRefresh.mutate();
    }
  }, [startRefresh, data?.check, isLoading]);

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

  // Helper function to determine sort priority
  const getStatusPriority = (
    record: FeatureAssetLocation | TileServerLocation
  ): number => {
    // Not checked yet - highest priority
    if (!record.last_public_system_check) return 1;

    // Unknown - needs investigation
    if (record.is_on_public_system === null) return 2;

    // Private - needs to be fixed
    if (record.is_on_public_system === false) return 3;

    // Public - all good, lowest priority
    return 4;
  };

  // Combine and sort data
  const sortedTableData = React.useMemo(() => {
    return [...(data?.featureAssets || []), ...(data?.tileServers || [])].sort(
      (a, b) => getStatusPriority(a) - getStatusPriority(b)
    );
  }, [data?.featureAssets, data?.tileServers]);

  const columns = [
    {
      title: 'Related To',
      key: 'related_to',
      width: 190,
      render: (
        _: unknown,
        record: FeatureAssetLocation | TileServerLocation
      ) => {
        if ('feature_id' in record && record.feature_id) {
          return (
            <FeatureLink
              featureId={record.feature_id}
              featureAssetType={record.asset_type}
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
      title: 'Original Path',
      key: 'original_path',
      render: (
        _: unknown,
        record: FeatureAssetLocation | TileServerLocation
      ) => (
        <DesignSafeFileLink
          system={record.original_system}
          path={record.original_path}
          designSafeProjectId={record.designsafe_project_id}
        />
      ),
    },
    {
      title: 'Public Path',
      key: 'public_path',
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
            designSafeProjectId={record.designsafe_project_id}
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

        // Verified status
        // Note: isPublic could be false or null. If null,
        // we don't even have enough info to check, so we have to list
        // as private
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
      width: 90,
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
          Assets & Layers ({sortedTableData.length})
        </Text>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={sortedTableData}
            columns={columns}
            rowKey="id"
            scroll={{ y: 220 }}
            pagination={false}
            locale={{ emptyText: 'No file assets or tile servers found' }}
            size="small"
          />
        )}
      </div>

      {/* Status Summary */}
      {data && data.check?.completed_at && <AnalysisSummary data={data} />}
    </Space>
  );
};
