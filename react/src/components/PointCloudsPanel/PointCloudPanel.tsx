import React, { useRef, useState, useEffect } from 'react';
import { Button, Flex, Layout, Spin } from 'antd';
import { FixedSizeList as VirtualList } from 'react-window';
import { useResizeDetector } from 'react-resize-detector';
import { PlusOutlined } from '@ant-design/icons';
import PointCloudInfoModal from './PointCloudInfoModal';
import PointCloudCreateModal from './PointCloudCreateModal';
import { PointCloudPanelListItem } from './PointCloudPanelListItem';

import { Project, PointCloud } from '@hazmapper/types';
import { usePointClouds } from '@hazmapper/hooks';

const { Header, Content } = Layout;

interface Props {
  /**
   * active project
   */
  project: Project;
}

const PointCloudPanel: React.FC<Props> = ({ project }) => {
  const { ref: scrollContainerRef, height: listHeight } = useResizeDetector();
  const [pointCloudInfoModal, setPointCloudInfoModal] =
    useState<PointCloud | null>(null);
  const [pointCloudCreateModal, setPointCloudCreateModal] =
    useState<boolean>(false);
  const { data: pointClouds, isLoading } = usePointClouds({
    projectId: project.id,
  });

  // Add state for dynamic item height, and when to show list and reference for measuring
  const [itemHeight, setItemHeight] = useState<number>(120);
  const [isListReady, setIsListReady] = useState<boolean>(false);
  const sampleItemRef = useRef<HTMLDivElement>(null);

  // Measure height when data is available
  useEffect(() => {
    if (pointClouds && pointClouds.length > 0) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        if (sampleItemRef.current) {
          const height = sampleItemRef.current.getBoundingClientRect().height;
          setItemHeight(Math.ceil(height));
          setIsListReady(true);
        } else {
          // Fallback if measurement fails
          setIsListReady(true);
        }
      }, 0);
    }
  }, [pointClouds]);

  const isPointCloudInfoModalOpen = !!pointCloudInfoModal;

  return (
    <Flex vertical style={{ height: '100%' }} flex={1}>
      <Layout style={{ height: '100%', flex: 1 }}>
        <Flex justify="center" align="center">
          <Header>
            <Button
              type="default"
              icon={<PlusOutlined />}
              title="Add point cloud"
              size="middle"
              onClick={() => setPointCloudCreateModal(true)}
            >
              Add Point Cloud
            </Button>
          </Header>
        </Flex>
        <Content style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {isLoading && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Spin />
            </div>
          )}
          {!isLoading && pointClouds && pointClouds.length > 0 && (
            <div
              ref={scrollContainerRef}
              style={{
                flex: 1,
                overflow: 'auto',
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                overflowX: 'hidden',
              }}
            >
              {/* Hidden sample item for measurement */}
              {!isListReady && (
                <div
                  ref={sampleItemRef}
                  style={{
                    position: 'absolute',
                    visibility: 'hidden',
                    padding: 8,
                    width: '100%',
                  }}
                >
                  <PointCloudPanelListItem
                    pointCloud={pointClouds[0]}
                    onViewInfo={setPointCloudInfoModal}
                  />
                </div>
              )}

              {/* Only show list once measurement is complete */}
              {isListReady && (
                <VirtualList
                  height={listHeight || 300}
                  itemCount={pointClouds.length}
                  itemSize={itemHeight}
                  width="100%"
                >
                  {({ index, style }) => {
                    const pointCloud = pointClouds[index];
                    return (
                      <div
                        style={{
                          ...style,
                          padding: 8,
                          borderBottom: '1px solid #f0f0f0',
                        }}
                        key={pointCloud.id}
                      >
                        <PointCloudPanelListItem
                          pointCloud={pointCloud}
                          onViewInfo={setPointCloudInfoModal}
                        />
                      </div>
                    );
                  }}
                </VirtualList>
              )}
            </div>
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
        </Content>
      </Layout>
    </Flex>
  );
};

export default PointCloudPanel;
